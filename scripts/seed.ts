/**
 * Populates WorkBridge with a realistic, multi-city demo dataset: employers
 * and job seekers across four Nigerian cities, jobs in every JobStatus,
 * applications spanning every ApplicationStatus with interviews, messages
 * and reviews attached where the real flows would have created them.
 *
 * Safe to re-run: identity rows (users, companies, jobs, locations, skills)
 * are looked up or upserted by their natural key, and history rows
 * (status events, interviews, conversations, notifications) are only
 * created the first time an application is seeded, not on every re-run.
 *
 * Existing hand-tested data (Northbridge Tech, Aso Rock Logistics, the
 * amaka.test@example.com job seeker, etc.) is left untouched - this only
 * adds alongside it.
 *
 * Run with: npm run seed
 */
import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient } from "../src/generated/prisma/client";
import type {
  UserRole,
  JobStatus,
  ApplicationStatus,
  NotificationType,
  EmploymentType,
  WorkArrangement,
  ExperienceLevel,
  CurrentEmploymentStatus,
  Availability,
  SkillLevel,
  InterviewType,
  InterviewStatus,
} from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { calculateMatch, buildCandidateMatchInput, buildJobMatchInput } from "../src/lib/matching";
import { slugify } from "../src/lib/utils";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const SEED_PASSWORD = "Password123!";
let passwordHash: string;

const STATUS_NOTES: Record<ApplicationStatus, string> = {
  APPLIED: "Applied.",
  VIEWED: "Viewed by employer.",
  SHORTLISTED: "Shortlisted by employer.",
  INTERVIEW: "Moved to interview stage.",
  OFFER: "Offer extended.",
  HIRED: "Marked as hired.",
  REJECTED: "Application rejected.",
  WITHDRAWN: "Withdrawn by applicant.",
};

const STATUS_NOTIFICATIONS: Partial<Record<ApplicationStatus, { type: NotificationType; title: (t: string) => string }>> = {
  VIEWED: { type: "APPLICATION_VIEWED", title: (t) => `Your application for ${t} was viewed` },
  SHORTLISTED: { type: "APPLICATION_SHORTLISTED", title: (t) => `You were shortlisted for ${t}` },
  OFFER: { type: "OFFER_RECEIVED", title: (t) => `You received an offer for ${t}` },
  HIRED: { type: "APPLICATION_HIRED", title: (t) => `You were hired for ${t}!` },
  REJECTED: { type: "APPLICATION_REJECTED", title: (t) => `Update on your application for ${t}` },
};

// Full progression a status implies, so a seeded HIRED application still gets
// the same event/notification trail a real one would have accumulated.
const STATUS_PROGRESSION: Record<ApplicationStatus, ApplicationStatus[]> = {
  APPLIED: ["APPLIED"],
  VIEWED: ["APPLIED", "VIEWED"],
  SHORTLISTED: ["APPLIED", "VIEWED", "SHORTLISTED"],
  INTERVIEW: ["APPLIED", "VIEWED", "SHORTLISTED", "INTERVIEW"],
  OFFER: ["APPLIED", "VIEWED", "SHORTLISTED", "INTERVIEW", "OFFER"],
  HIRED: ["APPLIED", "VIEWED", "SHORTLISTED", "INTERVIEW", "OFFER", "HIRED"],
  REJECTED: ["APPLIED", "VIEWED", "REJECTED"],
  WITHDRAWN: ["APPLIED", "WITHDRAWN"],
};

function daysAgo(n: number) {
  return new Date(Date.now() - n * 24 * 60 * 60 * 1000);
}
function daysFromNow(n: number) {
  return new Date(Date.now() + n * 24 * 60 * 60 * 1000);
}

async function notify(userId: string, type: NotificationType, title: string, opts?: { body?: string; link?: string }) {
  await prisma.notification.create({ data: { userId, type, title, body: opts?.body, link: opts?.link } });
}

// Postgres allows multiple NULLs in a unique column, so a compound-unique
// lookup can't be trusted when area is null - find-or-create instead, same
// as the app's own findOrCreateLocation().
async function upsertLocation(country: string, state: string, city: string, area: string | null = null) {
  const existing = await prisma.location.findFirst({ where: { country, state, city, area } });
  if (existing) return existing;
  return prisma.location.create({ data: { country, state, city, area } });
}

async function upsertSkill(name: string) {
  return prisma.skill.upsert({ where: { name }, update: {}, create: { name } });
}

async function categoryByName(name: string) {
  return prisma.jobCategory.findUniqueOrThrow({ where: { name } });
}

async function upsertUser(email: string, role: UserRole) {
  return prisma.user.upsert({
    where: { email },
    update: {},
    create: { email, passwordHash, role, emailVerified: true },
  });
}

async function findOrCreateCompany(input: {
  name: string;
  industry: string;
  locationId: string;
  description: string;
  employeeCount: string;
  yearEstablished: number;
  verificationStatus: "VERIFIED" | "PENDING" | "NOT_VERIFIED";
}) {
  const existing = await prisma.company.findFirst({ where: { name: input.name } });
  if (existing) return existing;

  const company = await prisma.company.create({
    data: {
      name: input.name,
      industry: input.industry,
      locationId: input.locationId,
      description: input.description,
      employeeCount: input.employeeCount,
      yearEstablished: input.yearEstablished,
      verificationStatus: input.verificationStatus === "PENDING" ? "PENDING" : input.verificationStatus,
      verifiedAt: input.verificationStatus === "VERIFIED" ? new Date() : null,
    },
  });

  if (input.verificationStatus === "PENDING") {
    await prisma.verification.create({
      data: { companyId: company.id, status: "PENDING", submittedAt: daysAgo(2) },
    });
  } else if (input.verificationStatus === "VERIFIED") {
    await prisma.verification.create({
      data: {
        companyId: company.id,
        status: "VERIFIED",
        submittedAt: daysAgo(20),
        reviewedAt: daysAgo(18),
      },
    });
  }

  return company;
}

async function upsertJob(input: {
  title: string;
  company: { id: string; name: string };
  postedById: string;
  categoryId: string;
  locationId: string;
  city: string;
  description: string;
  responsibilities: string;
  requirements: string;
  salaryMin: number;
  salaryMax: number;
  employmentType: EmploymentType;
  workArrangement: WorkArrangement;
  experienceLevel: ExperienceLevel;
  status: JobStatus;
  rejectionReason?: string;
  skillNames: string[];
}) {
  const slug = slugify(`${input.title}-${input.city}`);
  const existing = await prisma.job.findUnique({ where: { slug } });
  if (existing) return existing;

  const job = await prisma.job.create({
    data: {
      title: input.title,
      slug,
      companyId: input.company.id,
      postedById: input.postedById,
      categoryId: input.categoryId,
      locationId: input.locationId,
      description: input.description,
      responsibilities: input.responsibilities,
      requirements: input.requirements,
      salaryMin: input.salaryMin,
      salaryMax: input.salaryMax,
      employmentType: input.employmentType,
      workArrangement: input.workArrangement,
      experienceLevel: input.experienceLevel,
      status: input.status,
      rejectionReason: input.rejectionReason ?? null,
      publishedAt: input.status === "PUBLISHED" ? daysAgo(10) : null,
      createdAt: daysAgo(12),
    },
  });

  for (const name of input.skillNames) {
    const skill = await upsertSkill(name);
    await prisma.jobSkill.upsert({
      where: { jobId_skillId: { jobId: job.id, skillId: skill.id } },
      update: {},
      create: { jobId: job.id, skillId: skill.id },
    });
  }

  return job;
}

type JobSeekerInput = {
  email: string;
  fullName: string;
  professionalTitle: string;
  aboutMe: string;
  yearsOfExperience: number;
  currentEmploymentStatus: CurrentEmploymentStatus;
  locationId: string;
  skills: { name: string; level: SkillLevel }[];
  experience: { jobTitle: string; company: string; startDate: Date; endDate: Date | null; isCurrent: boolean };
  education: { institution: string; qualification: string; field: string; startDate: Date; endDate: Date };
  preference: {
    desiredJobTitle: string;
    minSalary: number;
    maxSalary: number;
    employmentType: EmploymentType;
    workArrangement: WorkArrangement;
    availability: Availability;
  };
};

async function seedJobSeeker(input: JobSeekerInput) {
  const user = await upsertUser(input.email, "JOB_SEEKER");

  const profile = await prisma.jobSeekerProfile.upsert({
    where: { userId: user.id },
    update: {},
    create: {
      userId: user.id,
      fullName: input.fullName,
      professionalTitle: input.professionalTitle,
      aboutMe: input.aboutMe,
      yearsOfExperience: input.yearsOfExperience,
      currentEmploymentStatus: input.currentEmploymentStatus,
      locationId: input.locationId,
    },
  });

  for (const s of input.skills) {
    const skill = await upsertSkill(s.name);
    await prisma.jobSeekerSkill.upsert({
      where: { jobSeekerProfileId_skillId: { jobSeekerProfileId: profile.id, skillId: skill.id } },
      update: {},
      create: { jobSeekerProfileId: profile.id, skillId: skill.id, level: s.level },
    });
  }

  const existingExperience = await prisma.experience.count({ where: { jobSeekerProfileId: profile.id } });
  if (existingExperience === 0) {
    await prisma.experience.create({ data: { jobSeekerProfileId: profile.id, ...input.experience } });
  }

  const existingEducation = await prisma.education.count({ where: { jobSeekerProfileId: profile.id } });
  if (existingEducation === 0) {
    await prisma.education.create({ data: { jobSeekerProfileId: profile.id, ...input.education } });
  }

  await prisma.jobPreference.upsert({
    where: { jobSeekerProfileId: profile.id },
    update: {},
    create: {
      jobSeekerProfileId: profile.id,
      locationId: input.locationId,
      desiredJobTitle: input.preference.desiredJobTitle,
      minSalary: input.preference.minSalary,
      maxSalary: input.preference.maxSalary,
      employmentType: input.preference.employmentType,
      workArrangement: input.preference.workArrangement,
      availability: input.preference.availability,
    },
  });

  return { user, profile };
}

async function seedApplication(input: {
  job: Awaited<ReturnType<typeof upsertJob>>;
  jobSeeker: { user: { id: string }; profile: { id: string } };
  status: ApplicationStatus;
  withInterview?: { type: InterviewType; status: InterviewStatus; scheduledAt: Date };
  withConversationMessages?: { fromEmployerFirst: boolean; bodies: string[] };
  withReview?: { rating: number; comment: string };
}) {
  const existing = await prisma.application.findUnique({
    where: { jobId_jobSeekerProfileId: { jobId: input.job.id, jobSeekerProfileId: input.jobSeeker.profile.id } },
  });
  if (existing) return existing;

  const [profile, job] = await Promise.all([
    prisma.jobSeekerProfile.findUniqueOrThrow({
      where: { id: input.jobSeeker.profile.id },
      include: { skills: { include: { skill: true } }, location: true, preference: { include: { location: true } } },
    }),
    prisma.job.findUniqueOrThrow({
      where: { id: input.job.id },
      include: { skills: { include: { skill: true } }, location: true },
    }),
  ]);
  const { score, explanation } = calculateMatch(buildCandidateMatchInput(profile), buildJobMatchInput(job));

  const progression = STATUS_PROGRESSION[input.status];
  const application = await prisma.application.create({
    data: {
      jobId: input.job.id,
      jobSeekerProfileId: input.jobSeeker.profile.id,
      status: input.status,
      matchScore: score,
      matchExplanation: explanation,
      appliedAt: daysAgo(9),
      statusEvents: { create: progression.map((s) => ({ status: s, note: STATUS_NOTES[s] })) },
    },
  });

  await notify(input.jobSeeker.user.id, "APPLICATION_SUBMITTED", `You applied to ${job.title}`, {
    body: `Your application to ${job.title} was submitted successfully.`,
    link: `/dashboard/applications/${application.id}`,
  });
  await notify(job.postedById, "NEW_APPLICATION", `New applicant for ${job.title}`, {
    body: `${profile.fullName} applied to ${job.title}.`,
    link: `/employer/jobs/${job.id}/applicants/${application.id}`,
  });

  for (const status of progression.slice(1)) {
    const config = STATUS_NOTIFICATIONS[status];
    if (!config) continue;
    await notify(input.jobSeeker.user.id, config.type, config.title(job.title), {
      link: `/dashboard/applications/${application.id}`,
    });
  }

  if (input.withInterview) {
    await prisma.interview.create({
      data: {
        applicationId: application.id,
        scheduledById: job.postedById,
        type: input.withInterview.type,
        scheduledAt: input.withInterview.scheduledAt,
        status: input.withInterview.status,
      },
    });
    await notify(input.jobSeeker.user.id, "INTERVIEW_SCHEDULED", `Interview scheduled for ${job.title}`, {
      link: `/dashboard/applications/${application.id}`,
    });
    if (input.withInterview.status === "ACCEPTED") {
      await notify(job.postedById, "INTERVIEW_RESPONSE", `Interview response for ${job.title}`, {
        body: `${profile.fullName} accepted the interview.`,
        link: `/employer/jobs/${job.id}/applicants/${application.id}`,
      });
    }
  }

  if (input.withConversationMessages) {
    const conversation = await prisma.conversation.create({
      data: {
        applicationId: application.id,
        jobSeekerUserId: input.jobSeeker.user.id,
        employerUserId: job.postedById,
        lastMessageAt: daysAgo(1),
      },
    });
    const { fromEmployerFirst, bodies } = input.withConversationMessages;
    for (let i = 0; i < bodies.length; i++) {
      const senderId = (i % 2 === 0) === fromEmployerFirst ? job.postedById : input.jobSeeker.user.id;
      const recipientId = senderId === job.postedById ? input.jobSeeker.user.id : job.postedById;
      await prisma.message.create({
        data: { conversationId: conversation.id, senderId, body: bodies[i], createdAt: daysAgo(3 - i) },
      });
      await notify(recipientId, "NEW_MESSAGE", "New message", {
        body: bodies[i].length > 140 ? `${bodies[i].slice(0, 140)}...` : bodies[i],
        link: `${senderId === job.postedById ? "/dashboard/messages" : "/employer/messages"}/${conversation.id}`,
      });
    }
  }

  if (input.withReview) {
    await prisma.review.create({
      data: {
        reviewerId: input.jobSeeker.user.id,
        revieweeId: job.postedById,
        applicationId: application.id,
        rating: input.withReview.rating,
        comment: input.withReview.comment,
        status: "APPROVED",
      },
    });
  }

  return application;
}

async function main() {
  passwordHash = await bcrypt.hash(SEED_PASSWORD, 12);

  console.log("Seeding locations...");
  const abuja = await upsertLocation("Nigeria", "FCT", "Abuja");
  const lagos = await upsertLocation("Nigeria", "Lagos", "Lagos");
  const portHarcourt = await upsertLocation("Nigeria", "Rivers", "Port Harcourt");
  const kano = await upsertLocation("Nigeria", "Kano", "Kano");

  console.log("Looking up existing companies...");
  const northbridge = await prisma.company.findFirstOrThrow({ where: { name: "Northbridge Tech" } });
  const asoRock = await prisma.company.findFirstOrThrow({ where: { name: "Aso Rock Logistics" } });

  console.log("Seeding new companies...");
  const lagosFintech = await findOrCreateCompany({
    name: "Lagos Fintech Hub",
    industry: "Financial Technology",
    locationId: lagos.id,
    description: "A digital payments and lending platform serving small businesses across West Africa.",
    employeeCount: "51-200",
    yearEstablished: 2018,
    verificationStatus: "VERIFIED",
  });
  const sahelRetail = await findOrCreateCompany({
    name: "Sahel Retail Group",
    industry: "Retail",
    locationId: kano.id,
    description: "A regional supermarket and household goods retailer with stores across northern Nigeria.",
    employeeCount: "201-500",
    yearEstablished: 2009,
    verificationStatus: "PENDING",
  });
  const deltaCreek = await findOrCreateCompany({
    name: "Delta Creek Oil Services",
    industry: "Oil & Gas",
    locationId: portHarcourt.id,
    description: "Field services and equipment maintenance for oil and gas operators in the Niger Delta.",
    employeeCount: "201-500",
    yearEstablished: 2001,
    verificationStatus: "NOT_VERIFIED",
  });
  const greenHarvest = await findOrCreateCompany({
    name: "Green Harvest Agro",
    industry: "Agriculture",
    locationId: abuja.id,
    description: "A commercial farm and agro-processing business supplying grain and produce nationwide.",
    employeeCount: "51-200",
    yearEstablished: 2014,
    verificationStatus: "VERIFIED",
  });
  const bridgeMedia = await findOrCreateCompany({
    name: "Bridge Media Studios",
    industry: "Media & Design",
    locationId: lagos.id,
    description: "A creative studio producing brand design and digital content for consumer brands.",
    employeeCount: "11-50",
    yearEstablished: 2020,
    verificationStatus: "PENDING",
  });

  console.log("Seeding employer recruiters...");
  const northbridgeRecruiter = await prisma.employerProfile.findFirstOrThrow({ where: { companyId: northbridge.id } });
  const asoRockRecruiter = await prisma.employerProfile.findFirstOrThrow({ where: { companyId: asoRock.id } });

  async function seedRecruiter(email: string, fullName: string, jobTitle: string, companyId: string) {
    const user = await upsertUser(email, "EMPLOYER");
    const profile = await prisma.employerProfile.upsert({
      where: { userId: user.id },
      update: {},
      create: { userId: user.id, fullName, jobTitle, companyId },
    });
    return { user, profile };
  }

  const lagosFintechRecruiter = await seedRecruiter(
    "funke.adebayo@lagosfintechhub.example.com",
    "Funke Adebayo",
    "Talent Acquisition Lead",
    lagosFintech.id
  );
  const sahelRetailRecruiter = await seedRecruiter(
    "ibrahim.yusuf@sahelretail.example.com",
    "Ibrahim Yusuf",
    "HR Manager",
    sahelRetail.id
  );
  const deltaCreekRecruiter = await seedRecruiter(
    "ngozi.wachukwu@deltacreek.example.com",
    "Ngozi Wachukwu",
    "People & Culture Officer",
    deltaCreek.id
  );
  const greenHarvestRecruiter = await seedRecruiter(
    "emeka.nnadi@greenharvest.example.com",
    "Emeka Nnadi",
    "Recruitment Officer",
    greenHarvest.id
  );
  const bridgeMediaRecruiter = await seedRecruiter(
    "zainab.lawal@bridgemedia.example.com",
    "Zainab Lawal",
    "Studio Manager",
    bridgeMedia.id
  );

  console.log("Seeding jobs...");
  const backendEngineer = await upsertJob({
    title: "Backend Engineer",
    company: northbridge,
    postedById: northbridgeRecruiter.userId,
    categoryId: (await categoryByName("IT & Software Development")).id,
    locationId: abuja.id,
    city: "Abuja",
    description: "Build and maintain the APIs powering our core platform.",
    responsibilities: "Design REST APIs. Own database schema changes. Pair with the frontend team.",
    requirements: "3+ years with Node.js and SQL databases.",
    salaryMin: 450000,
    salaryMax: 650000,
    employmentType: "FULL_TIME",
    workArrangement: "HYBRID",
    experienceLevel: "MID",
    status: "PUBLISHED",
    skillNames: ["Node.js", "SQL", "JavaScript"],
  });
  await upsertJob({
    title: "Data Analyst",
    company: northbridge,
    postedById: northbridgeRecruiter.userId,
    categoryId: (await categoryByName("IT & Software Development")).id,
    locationId: abuja.id,
    city: "Abuja",
    description: "Draft role for an internal analytics hire - not yet submitted for review.",
    responsibilities: "Build dashboards and reporting for the product team.",
    requirements: "Experience with SQL and data visualization tools.",
    salaryMin: 300000,
    salaryMax: 420000,
    employmentType: "FULL_TIME",
    workArrangement: "ON_SITE",
    experienceLevel: "ENTRY",
    status: "DRAFT",
    skillNames: ["SQL", "Data Analysis"],
  });

  const fleetSupervisor = await upsertJob({
    title: "Fleet Operations Supervisor",
    company: asoRock,
    postedById: asoRockRecruiter.userId,
    categoryId: (await categoryByName("Logistics & Supply Chain")).id,
    locationId: abuja.id,
    city: "Abuja",
    description: "Coordinate daily dispatch and routing for our delivery fleet.",
    responsibilities: "Schedule drivers, track deliveries, resolve routing issues.",
    requirements: "2+ years in logistics or fleet coordination.",
    salaryMin: 280000,
    salaryMax: 380000,
    employmentType: "FULL_TIME",
    workArrangement: "ON_SITE",
    experienceLevel: "MID",
    status: "PUBLISHED",
    skillNames: ["Logistics Coordination", "Supply Chain Management"],
  });
  await upsertJob({
    title: "Warehouse Assistant",
    company: asoRock,
    postedById: asoRockRecruiter.userId,
    categoryId: (await categoryByName("Logistics & Supply Chain")).id,
    locationId: abuja.id,
    city: "Abuja",
    description: "Support inbound and outbound warehouse operations.",
    responsibilities: "Receive stock, pick and pack orders, maintain inventory accuracy.",
    requirements: "Prior warehouse experience preferred.",
    salaryMin: 150000,
    salaryMax: 200000,
    employmentType: "FULL_TIME",
    workArrangement: "ON_SITE",
    experienceLevel: "ENTRY",
    status: "PENDING_REVIEW",
    skillNames: ["Warehouse Management"],
  });

  const financialAnalyst = await upsertJob({
    title: "Financial Analyst",
    company: lagosFintech,
    postedById: lagosFintechRecruiter.user.id,
    categoryId: (await categoryByName("Finance & Accounting")).id,
    locationId: lagos.id,
    city: "Lagos",
    description: "Analyze transaction data and build forecasting models for our lending product.",
    responsibilities: "Build financial models, monitor portfolio performance, report to leadership.",
    requirements: "3+ years in financial analysis, strong Excel skills.",
    salaryMin: 500000,
    salaryMax: 750000,
    employmentType: "FULL_TIME",
    workArrangement: "HYBRID",
    experienceLevel: "MID",
    status: "PUBLISHED",
    skillNames: ["Excel", "Data Analysis", "Accounting"],
  });
  await upsertJob({
    title: "Product Manager - Payments",
    company: lagosFintech,
    postedById: lagosFintechRecruiter.user.id,
    categoryId: (await categoryByName("IT & Software Development")).id,
    locationId: lagos.id,
    city: "Lagos",
    description: "Own the roadmap for our merchant payments product line.",
    responsibilities: "Define product requirements, work with engineering, analyze usage data.",
    requirements: "5+ years in product management, fintech experience a plus.",
    salaryMin: 800000,
    salaryMax: 1100000,
    employmentType: "FULL_TIME",
    workArrangement: "HYBRID",
    experienceLevel: "SENIOR",
    status: "PENDING_REVIEW",
    skillNames: ["Project Management", "Agile"],
  });
  await upsertJob({
    title: "Junior Software Engineer",
    company: lagosFintech,
    postedById: lagosFintechRecruiter.user.id,
    categoryId: (await categoryByName("IT & Software Development")).id,
    locationId: lagos.id,
    city: "Lagos",
    description: "Entry-level engineering role - resubmit expected after fixing listing issues.",
    responsibilities: "Ship small features under senior engineer guidance.",
    requirements: "Some experience with JavaScript.",
    salaryMin: 250000,
    salaryMax: 350000,
    employmentType: "FULL_TIME",
    workArrangement: "ON_SITE",
    experienceLevel: "ENTRY",
    status: "REJECTED",
    rejectionReason: "Salary range is below our minimum wage policy for this experience level - please revise and resubmit.",
    skillNames: ["JavaScript"],
  });

  const retailStoreManager = await upsertJob({
    title: "Retail Store Manager",
    company: sahelRetail,
    postedById: sahelRetailRecruiter.user.id,
    categoryId: (await categoryByName("Retail")).id,
    locationId: kano.id,
    city: "Kano",
    description: "Manage day-to-day operations for one of our flagship stores.",
    responsibilities: "Oversee staff scheduling, inventory, and customer service standards.",
    requirements: "5+ years retail experience, 2+ years in a supervisory role.",
    salaryMin: 220000,
    salaryMax: 300000,
    employmentType: "FULL_TIME",
    workArrangement: "ON_SITE",
    experienceLevel: "SENIOR",
    status: "PUBLISHED",
    skillNames: ["Sales", "Project Management", "Communication"],
  });
  const salesAssociate = await upsertJob({
    title: "Sales Associate",
    company: sahelRetail,
    postedById: sahelRetailRecruiter.user.id,
    categoryId: (await categoryByName("Retail")).id,
    locationId: kano.id,
    city: "Kano",
    description: "Front-of-store sales support across our home goods department.",
    responsibilities: "Assist customers, process transactions, maintain shelf displays.",
    requirements: "Friendly, reliable, willing to learn.",
    salaryMin: 100000,
    salaryMax: 140000,
    employmentType: "FULL_TIME",
    workArrangement: "ON_SITE",
    experienceLevel: "ENTRY",
    status: "PUBLISHED",
    skillNames: ["Sales", "Customer Service"],
  });

  const fieldSafetyOfficer = await upsertJob({
    title: "Field Safety Officer",
    company: deltaCreek,
    postedById: deltaCreekRecruiter.user.id,
    categoryId: (await categoryByName("Engineering")).id,
    locationId: portHarcourt.id,
    city: "Port Harcourt",
    description: "Ensure HSE compliance across our field operations sites.",
    responsibilities: "Conduct site safety audits, lead toolbox talks, investigate incidents.",
    requirements: "HSE certification, 3+ years in an oil & gas field role.",
    salaryMin: 400000,
    salaryMax: 550000,
    employmentType: "FULL_TIME",
    workArrangement: "ON_SITE",
    experienceLevel: "MID",
    status: "PUBLISHED",
    skillNames: ["Civil Engineering", "Project Management"],
  });
  await upsertJob({
    title: "Mechanical Technician",
    company: deltaCreek,
    postedById: deltaCreekRecruiter.user.id,
    categoryId: (await categoryByName("Engineering")).id,
    locationId: portHarcourt.id,
    city: "Port Harcourt",
    description: "Maintenance role for field equipment - now closed after the position was filled internally.",
    responsibilities: "Inspect and repair field machinery.",
    requirements: "Trade certification in mechanical maintenance.",
    salaryMin: 280000,
    salaryMax: 380000,
    employmentType: "FULL_TIME",
    workArrangement: "ON_SITE",
    experienceLevel: "MID",
    status: "CLOSED",
    skillNames: ["Electrical Wiring", "AutoCAD"],
  });

  const farmOperationsManager = await upsertJob({
    title: "Farm Operations Manager",
    company: greenHarvest,
    postedById: greenHarvestRecruiter.user.id,
    categoryId: (await categoryByName("Agriculture")).id,
    locationId: abuja.id,
    city: "Abuja",
    description: "Oversee planting, harvest and logistics scheduling across our farm sites.",
    responsibilities: "Plan planting cycles, coordinate logistics, manage field supervisors.",
    requirements: "5+ years in agricultural operations or supply chain management.",
    salaryMin: 350000,
    salaryMax: 480000,
    employmentType: "FULL_TIME",
    workArrangement: "ON_SITE",
    experienceLevel: "SENIOR",
    status: "PUBLISHED",
    skillNames: ["Supply Chain Management", "Logistics Coordination", "Project Management"],
  });
  await upsertJob({
    title: "Agronomist",
    company: greenHarvest,
    postedById: greenHarvestRecruiter.user.id,
    categoryId: (await categoryByName("Agriculture")).id,
    locationId: abuja.id,
    city: "Abuja",
    description: "Advise on crop health and soil management across our farm sites.",
    responsibilities: "Monitor crop health, recommend treatments, run soil tests.",
    requirements: "Degree in agronomy or related field.",
    salaryMin: 300000,
    salaryMax: 400000,
    employmentType: "FULL_TIME",
    workArrangement: "ON_SITE",
    experienceLevel: "MID",
    status: "PENDING_REVIEW",
    skillNames: ["Data Analysis"],
  });

  const graphicDesigner = await upsertJob({
    title: "Graphic Designer",
    company: bridgeMedia,
    postedById: bridgeMediaRecruiter.user.id,
    categoryId: (await categoryByName("Media & Design")).id,
    locationId: lagos.id,
    city: "Lagos",
    description: "Design brand assets and social content for our client portfolio.",
    responsibilities: "Produce social graphics, brand decks, and campaign assets.",
    requirements: "Portfolio required, strong Adobe Photoshop skills.",
    salaryMin: 220000,
    salaryMax: 320000,
    employmentType: "FULL_TIME",
    workArrangement: "HYBRID",
    experienceLevel: "ENTRY",
    status: "PUBLISHED",
    skillNames: ["Adobe Photoshop", "Graphic Design"],
  });
  const contentStrategist = await upsertJob({
    title: "Content Strategist",
    company: bridgeMedia,
    postedById: bridgeMediaRecruiter.user.id,
    categoryId: (await categoryByName("Media & Design")).id,
    locationId: lagos.id,
    city: "Lagos",
    description: "Plan and write content across client social and web channels.",
    responsibilities: "Build content calendars, write copy, track engagement metrics.",
    requirements: "2+ years in content or social media strategy.",
    salaryMin: 280000,
    salaryMax: 380000,
    employmentType: "FULL_TIME",
    workArrangement: "REMOTE",
    experienceLevel: "MID",
    status: "PUBLISHED",
    skillNames: ["Content Writing", "SEO", "Digital Marketing"],
  });

  console.log("Seeding job seekers...");
  const adaEze = await seedJobSeeker({
    email: "ada.eze@example.com",
    fullName: "Ada Eze",
    professionalTitle: "Frontend Developer",
    aboutMe: "Frontend developer who enjoys building clean, accessible interfaces.",
    yearsOfExperience: 3,
    currentEmploymentStatus: "EMPLOYED",
    locationId: abuja.id,
    skills: [
      { name: "React", level: "ADVANCED" },
      { name: "TypeScript", level: "ADVANCED" },
      { name: "JavaScript", level: "EXPERT" },
      { name: "Communication", level: "INTERMEDIATE" },
    ],
    experience: {
      jobTitle: "Frontend Developer",
      company: "Coderina Digital",
      startDate: new Date("2022-03-01"),
      endDate: null,
      isCurrent: true,
    },
    education: {
      institution: "University of Abuja",
      qualification: "B.Sc. Computer Science",
      field: "Computer Science",
      startDate: new Date("2015-09-01"),
      endDate: new Date("2019-07-01"),
    },
    preference: {
      desiredJobTitle: "Frontend Developer",
      minSalary: 400000,
      maxSalary: 600000,
      employmentType: "FULL_TIME",
      workArrangement: "HYBRID",
      availability: "TWO_WEEKS",
    },
  });

  const bolaMartins = await seedJobSeeker({
    email: "bola.martins@example.com",
    fullName: "Bola Martins",
    professionalTitle: "Backend Engineer",
    aboutMe: "Backend engineer focused on reliable APIs and clean data models.",
    yearsOfExperience: 5,
    currentEmploymentStatus: "UNEMPLOYED",
    locationId: abuja.id,
    skills: [
      { name: "Node.js", level: "EXPERT" },
      { name: "SQL", level: "ADVANCED" },
      { name: "Python", level: "INTERMEDIATE" },
      { name: "Java", level: "INTERMEDIATE" },
    ],
    experience: {
      jobTitle: "Software Engineer",
      company: "Zenith Systems",
      startDate: new Date("2019-01-01"),
      endDate: new Date("2024-06-01"),
      isCurrent: false,
    },
    education: {
      institution: "Ahmadu Bello University",
      qualification: "B.Sc. Computer Engineering",
      field: "Computer Engineering",
      startDate: new Date("2012-09-01"),
      endDate: new Date("2017-07-01"),
    },
    preference: {
      desiredJobTitle: "Backend Engineer",
      minSalary: 450000,
      maxSalary: 700000,
      employmentType: "FULL_TIME",
      workArrangement: "HYBRID",
      availability: "IMMEDIATE",
    },
  });

  const chiamakaObi = await seedJobSeeker({
    email: "chiamaka.obi@example.com",
    fullName: "Chiamaka Obi",
    professionalTitle: "Customer Service Representative",
    aboutMe: "Customer-focused professional with a track record of high satisfaction scores.",
    yearsOfExperience: 2,
    currentEmploymentStatus: "EMPLOYED",
    locationId: abuja.id,
    skills: [
      { name: "Customer Service", level: "ADVANCED" },
      { name: "Communication", level: "ADVANCED" },
      { name: "Customer Support", level: "INTERMEDIATE" },
    ],
    experience: {
      jobTitle: "Customer Service Representative",
      company: "Quickserve Retail",
      startDate: new Date("2022-08-01"),
      endDate: null,
      isCurrent: true,
    },
    education: {
      institution: "University of Abuja",
      qualification: "B.Sc. Business Administration",
      field: "Business Administration",
      startDate: new Date("2016-09-01"),
      endDate: new Date("2020-07-01"),
    },
    preference: {
      desiredJobTitle: "Customer Success Manager",
      minSalary: 200000,
      maxSalary: 300000,
      employmentType: "FULL_TIME",
      workArrangement: "ON_SITE",
      availability: "ONE_MONTH",
    },
  });

  const danielOkonkwo = await seedJobSeeker({
    email: "daniel.okonkwo@example.com",
    fullName: "Daniel Okonkwo",
    professionalTitle: "Financial Analyst",
    aboutMe: "Finance professional with a focus on forecasting and portfolio reporting.",
    yearsOfExperience: 4,
    currentEmploymentStatus: "EMPLOYED",
    locationId: lagos.id,
    skills: [
      { name: "Accounting", level: "ADVANCED" },
      { name: "Excel", level: "EXPERT" },
      { name: "Data Analysis", level: "ADVANCED" },
      { name: "QuickBooks", level: "INTERMEDIATE" },
    ],
    experience: {
      jobTitle: "Financial Analyst",
      company: "Meridian Capital",
      startDate: new Date("2021-02-01"),
      endDate: null,
      isCurrent: true,
    },
    education: {
      institution: "University of Lagos",
      qualification: "B.Sc. Accounting",
      field: "Accounting",
      startDate: new Date("2014-09-01"),
      endDate: new Date("2018-07-01"),
    },
    preference: {
      desiredJobTitle: "Financial Analyst",
      minSalary: 500000,
      maxSalary: 750000,
      employmentType: "FULL_TIME",
      workArrangement: "HYBRID",
      availability: "ONE_MONTH",
    },
  });

  const efeIghodalo = await seedJobSeeker({
    email: "efe.ighodalo@example.com",
    fullName: "Efe Ighodalo",
    professionalTitle: "Product Manager",
    aboutMe: "Product manager with experience shipping consumer fintech features.",
    yearsOfExperience: 6,
    currentEmploymentStatus: "UNEMPLOYED",
    locationId: lagos.id,
    skills: [
      { name: "Project Management", level: "EXPERT" },
      { name: "Agile", level: "ADVANCED" },
      { name: "Communication", level: "ADVANCED" },
    ],
    experience: {
      jobTitle: "Product Manager",
      company: "Paystack Rivals Inc.",
      startDate: new Date("2018-04-01"),
      endDate: new Date("2024-11-01"),
      isCurrent: false,
    },
    education: {
      institution: "Covenant University",
      qualification: "B.Sc. Economics",
      field: "Economics",
      startDate: new Date("2011-09-01"),
      endDate: new Date("2015-07-01"),
    },
    preference: {
      desiredJobTitle: "Product Manager",
      minSalary: 700000,
      maxSalary: 1000000,
      employmentType: "FULL_TIME",
      workArrangement: "HYBRID",
      availability: "IMMEDIATE",
    },
  });

  const fatimaBello = await seedJobSeeker({
    email: "fatima.bello@example.com",
    fullName: "Fatima Bello",
    professionalTitle: "Sales Associate",
    aboutMe: "Enthusiastic and reliable, looking for my first full-time sales role.",
    yearsOfExperience: 1,
    currentEmploymentStatus: "STUDENT",
    locationId: kano.id,
    skills: [
      { name: "Sales", level: "BEGINNER" },
      { name: "Customer Service", level: "INTERMEDIATE" },
      { name: "Negotiation", level: "BEGINNER" },
    ],
    experience: {
      jobTitle: "Sales Intern",
      company: "Kano Textiles Ltd",
      startDate: new Date("2023-06-01"),
      endDate: new Date("2023-12-01"),
      isCurrent: false,
    },
    education: {
      institution: "Bayero University Kano",
      qualification: "B.Sc. Business Administration",
      field: "Business Administration",
      startDate: new Date("2020-09-01"),
      endDate: new Date("2024-07-01"),
    },
    preference: {
      desiredJobTitle: "Sales Associate",
      minSalary: 100000,
      maxSalary: 150000,
      employmentType: "FULL_TIME",
      workArrangement: "ON_SITE",
      availability: "IMMEDIATE",
    },
  });

  const graceUdo = await seedJobSeeker({
    email: "grace.udo@example.com",
    fullName: "Grace Udo",
    professionalTitle: "Retail Store Manager",
    aboutMe: "Retail operations manager with a track record of improving store performance.",
    yearsOfExperience: 7,
    currentEmploymentStatus: "EMPLOYED",
    locationId: kano.id,
    skills: [
      { name: "Sales", level: "EXPERT" },
      { name: "Project Management", level: "ADVANCED" },
      { name: "Communication", level: "ADVANCED" },
    ],
    experience: {
      jobTitle: "Assistant Store Manager",
      company: "Northern Mart",
      startDate: new Date("2017-05-01"),
      endDate: null,
      isCurrent: true,
    },
    education: {
      institution: "Bayero University Kano",
      qualification: "B.Sc. Business Administration",
      field: "Business Administration",
      startDate: new Date("2010-09-01"),
      endDate: new Date("2014-07-01"),
    },
    preference: {
      desiredJobTitle: "Retail Store Manager",
      minSalary: 220000,
      maxSalary: 300000,
      employmentType: "FULL_TIME",
      workArrangement: "ON_SITE",
      availability: "ONE_MONTH",
    },
  });

  const hassanMusa = await seedJobSeeker({
    email: "hassan.musa@example.com",
    fullName: "Hassan Musa",
    professionalTitle: "Field Safety Officer",
    aboutMe: "HSE professional experienced in field operations for energy sector employers.",
    yearsOfExperience: 4,
    currentEmploymentStatus: "EMPLOYED",
    locationId: portHarcourt.id,
    skills: [
      { name: "Civil Engineering", level: "INTERMEDIATE" },
      { name: "Project Management", level: "INTERMEDIATE" },
    ],
    experience: {
      jobTitle: "HSE Officer",
      company: "Rivers Energy Services",
      startDate: new Date("2020-01-01"),
      endDate: null,
      isCurrent: true,
    },
    education: {
      institution: "Rivers State University",
      qualification: "B.Eng. Civil Engineering",
      field: "Civil Engineering",
      startDate: new Date("2013-09-01"),
      endDate: new Date("2018-07-01"),
    },
    preference: {
      desiredJobTitle: "Field Safety Officer",
      minSalary: 400000,
      maxSalary: 550000,
      employmentType: "FULL_TIME",
      workArrangement: "ON_SITE",
      availability: "ONE_MONTH",
    },
  });

  const ifeomaChukwu = await seedJobSeeker({
    email: "ifeoma.chukwu@example.com",
    fullName: "Ifeoma Chukwu",
    professionalTitle: "Mechanical Technician",
    aboutMe: "Mechanical technician with hands-on field equipment maintenance experience.",
    yearsOfExperience: 3,
    currentEmploymentStatus: "FREELANCER",
    locationId: portHarcourt.id,
    skills: [
      { name: "Electrical Wiring", level: "INTERMEDIATE" },
      { name: "AutoCAD", level: "BEGINNER" },
    ],
    experience: {
      jobTitle: "Maintenance Technician",
      company: "Independent Contractor",
      startDate: new Date("2021-01-01"),
      endDate: null,
      isCurrent: true,
    },
    education: {
      institution: "Port Harcourt Polytechnic",
      qualification: "OND Mechanical Engineering",
      field: "Mechanical Engineering",
      startDate: new Date("2016-09-01"),
      endDate: new Date("2018-07-01"),
    },
    preference: {
      desiredJobTitle: "Mechanical Technician",
      minSalary: 250000,
      maxSalary: 350000,
      employmentType: "CONTRACT",
      workArrangement: "ON_SITE",
      availability: "IMMEDIATE",
    },
  });

  const josephAdeyemi = await seedJobSeeker({
    email: "joseph.adeyemi@example.com",
    fullName: "Joseph Adeyemi",
    professionalTitle: "Farm Operations Manager",
    aboutMe: "Agribusiness operations manager experienced in planting-cycle and logistics planning.",
    yearsOfExperience: 5,
    currentEmploymentStatus: "EMPLOYED",
    locationId: abuja.id,
    skills: [
      { name: "Supply Chain Management", level: "ADVANCED" },
      { name: "Logistics Coordination", level: "ADVANCED" },
      { name: "Project Management", level: "INTERMEDIATE" },
    ],
    experience: {
      jobTitle: "Operations Supervisor",
      company: "Plateau Farms Ltd",
      startDate: new Date("2019-03-01"),
      endDate: new Date("2024-09-01"),
      isCurrent: false,
    },
    education: {
      institution: "Federal University of Agriculture, Abeokuta",
      qualification: "B.Sc. Agricultural Economics",
      field: "Agricultural Economics",
      startDate: new Date("2012-09-01"),
      endDate: new Date("2016-07-01"),
    },
    preference: {
      desiredJobTitle: "Farm Operations Manager",
      minSalary: 350000,
      maxSalary: 480000,
      employmentType: "FULL_TIME",
      workArrangement: "ON_SITE",
      availability: "TWO_WEEKS",
    },
  });

  const kemiAlabi = await seedJobSeeker({
    email: "kemi.alabi@example.com",
    fullName: "Kemi Alabi",
    professionalTitle: "Graphic Designer",
    aboutMe: "Freelance graphic designer with a portfolio spanning branding and social content.",
    yearsOfExperience: 2,
    currentEmploymentStatus: "FREELANCER",
    locationId: lagos.id,
    skills: [
      { name: "Adobe Photoshop", level: "ADVANCED" },
      { name: "Graphic Design", level: "ADVANCED" },
      { name: "Content Writing", level: "BEGINNER" },
    ],
    experience: {
      jobTitle: "Freelance Graphic Designer",
      company: "Self-employed",
      startDate: new Date("2022-01-01"),
      endDate: null,
      isCurrent: true,
    },
    education: {
      institution: "Yaba College of Technology",
      qualification: "HND Graphic Design",
      field: "Graphic Design",
      startDate: new Date("2018-09-01"),
      endDate: new Date("2021-07-01"),
    },
    preference: {
      desiredJobTitle: "Graphic Designer",
      minSalary: 220000,
      maxSalary: 320000,
      employmentType: "FULL_TIME",
      workArrangement: "HYBRID",
      availability: "IMMEDIATE",
    },
  });

  const lawalSuleiman = await seedJobSeeker({
    email: "lawal.suleiman@example.com",
    fullName: "Lawal Suleiman",
    professionalTitle: "Content Strategist",
    aboutMe: "Content strategist who has grown organic social reach for consumer brands.",
    yearsOfExperience: 3,
    currentEmploymentStatus: "UNEMPLOYED",
    locationId: lagos.id,
    skills: [
      { name: "Content Writing", level: "ADVANCED" },
      { name: "SEO", level: "INTERMEDIATE" },
      { name: "Digital Marketing", level: "INTERMEDIATE" },
    ],
    experience: {
      jobTitle: "Content Strategist",
      company: "Naija Brands Agency",
      startDate: new Date("2021-06-01"),
      endDate: new Date("2025-01-01"),
      isCurrent: false,
    },
    education: {
      institution: "University of Lagos",
      qualification: "B.A. Mass Communication",
      field: "Mass Communication",
      startDate: new Date("2015-09-01"),
      endDate: new Date("2019-07-01"),
    },
    preference: {
      desiredJobTitle: "Content Strategist",
      minSalary: 280000,
      maxSalary: 380000,
      employmentType: "FULL_TIME",
      workArrangement: "REMOTE",
      availability: "TWO_WEEKS",
    },
  });

  console.log("Seeding applications, interviews, messages and reviews...");
  await seedApplication({
    job: (await prisma.job.findUniqueOrThrow({ where: { slug: "frontend-developer-abuja" } })),
    jobSeeker: adaEze,
    status: "HIRED",
    withInterview: { type: "VIDEO", status: "COMPLETED", scheduledAt: daysAgo(4) },
    withConversationMessages: {
      fromEmployerFirst: true,
      bodies: [
        "Hi Ada, thanks for applying - congratulations, we'd like to offer you the role!",
        "Thank you so much, I'm thrilled to accept!",
        "Great, our HR team will be in touch with the paperwork this week.",
      ],
    },
    withReview: { rating: 5, comment: "Great hands-on frontend skills and a smooth, professional interview process." },
  });

  await seedApplication({
    job: backendEngineer,
    jobSeeker: bolaMartins,
    status: "INTERVIEW",
    withInterview: { type: "PHONE", status: "PROPOSED", scheduledAt: daysFromNow(3) },
    withConversationMessages: {
      fromEmployerFirst: true,
      bodies: ["Hi Bola, we'd like to schedule a phone interview - does Thursday at 10am work for you?"],
    },
  });

  await seedApplication({
    job: (await prisma.job.findUniqueOrThrow({ where: { slug: "customer-success-manager-abuja" } })),
    jobSeeker: chiamakaObi,
    status: "SHORTLISTED",
  });

  await seedApplication({ job: financialAnalyst, jobSeeker: danielOkonkwo, status: "VIEWED" });
  await seedApplication({ job: financialAnalyst, jobSeeker: efeIghodalo, status: "APPLIED" });
  await seedApplication({ job: salesAssociate, jobSeeker: fatimaBello, status: "APPLIED" });
  await seedApplication({ job: retailStoreManager, jobSeeker: graceUdo, status: "SHORTLISTED" });

  await seedApplication({
    job: fieldSafetyOfficer,
    jobSeeker: hassanMusa,
    status: "REJECTED",
  });
  await seedApplication({ job: fieldSafetyOfficer, jobSeeker: ifeomaChukwu, status: "WITHDRAWN" });

  await seedApplication({
    job: farmOperationsManager,
    jobSeeker: josephAdeyemi,
    status: "HIRED",
    withInterview: { type: "IN_PERSON", status: "COMPLETED", scheduledAt: daysAgo(6) },
    withReview: { rating: 4, comment: "Solid operational experience, settled into the role quickly." },
  });

  await seedApplication({
    job: graphicDesigner,
    jobSeeker: kemiAlabi,
    status: "OFFER",
    withInterview: { type: "VIDEO", status: "ACCEPTED", scheduledAt: daysFromNow(2) },
    withConversationMessages: {
      fromEmployerFirst: true,
      bodies: [
        "Hi Kemi, loved your portfolio - we'd like to move forward with an offer.",
        "Thank you! I'm reviewing the details now.",
      ],
    },
  });

  await seedApplication({ job: contentStrategist, jobSeeker: lawalSuleiman, status: "VIEWED" });
  await seedApplication({ job: fleetSupervisor, jobSeeker: josephAdeyemi, status: "APPLIED" });

  console.log("Seeding a sample open report...");
  const openReportExists = await prisma.report.findFirst({ where: { status: "OPEN" } });
  if (!openReportExists) {
    await prisma.report.create({
      data: {
        reporterId: efeIghodalo.user.id,
        targetType: "JOB",
        targetJobId: financialAnalyst.id,
        reason: "MISLEADING_SALARY",
        description: "The advertised salary range seems much higher than similar roles at this company.",
      },
    });
  }

  console.log("\nSeed complete.");
  console.log(`All seeded accounts use the password: ${SEED_PASSWORD}`);
  console.log("Sample logins: ada.eze@example.com (job seeker), funke.adebayo@lagosfintechhub.example.com (employer)");

  await prisma.$disconnect();
}

main().catch(async (err) => {
  console.error(err);
  await prisma.$disconnect();
  process.exit(1);
});
