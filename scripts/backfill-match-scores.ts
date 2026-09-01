/**
 * Computes matchScore/matchExplanation for any Application missing them -
 * useful right after Stage 13 shipped (existing applications predate the
 * matching system), and safe to re-run any time the algorithm changes.
 * Run with: npx tsx scripts/backfill-match-scores.ts
 */
import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { calculateMatch, buildCandidateMatchInput, buildJobMatchInput } from "../src/lib/matching";

async function main() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
  const prisma = new PrismaClient({ adapter });

  const applications = await prisma.application.findMany({
    where: { matchScore: null },
    include: {
      jobSeekerProfile: {
        include: { skills: { include: { skill: true } }, location: true, preference: { include: { location: true } } },
      },
      job: { include: { skills: { include: { skill: true } }, location: true } },
    },
  });

  for (const app of applications) {
    const { score, explanation } = calculateMatch(
      buildCandidateMatchInput(app.jobSeekerProfile),
      buildJobMatchInput(app.job)
    );
    await prisma.application.update({
      where: { id: app.id },
      data: { matchScore: score, matchExplanation: explanation },
    });
    console.log(`${app.jobSeekerProfile.fullName} -> ${app.job.title}: ${score}% (${explanation})`);
  }

  console.log(`Backfilled ${applications.length} application(s).`);
  await prisma.$disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
