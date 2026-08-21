export type JobCardData = {
  id: string;
  slug: string;
  title: string;
  companyName: string;
  companyLogoUrl?: string | null;
  isVerified: boolean;
  city: string;
  state: string;
  salaryMin?: number | null;
  salaryMax?: number | null;
  salaryFrequency: string;
  employmentType: string;
  matchScore?: number | null;
  postedAt: string;
};

export type CompanyCardData = {
  id: string;
  name: string;
  logoUrl?: string | null;
  industry?: string | null;
  isVerified: boolean;
  city: string;
  state: string;
  openJobs: number;
};
