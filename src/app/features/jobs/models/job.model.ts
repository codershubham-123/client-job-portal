export interface ApiMeta {
  page?: number;
  pageSize?: number;
  totalItems?: number;
  totalPages?: number;
}

export interface ApiResponse<T> {
  data: T;
  meta?: ApiMeta;
}

export interface CompanySummary {
  id: number;
  name: string;
  logoUrl: string | null;
  initial: string;
  rating: number;
  reviewCount: number;
}

export interface Company extends CompanySummary {
  description: string;
  industry: string;
  location: string;
  openJobCount: number;
}

export interface Salary {
  display?: string;
  min?: number;
  max?: number;
}

export interface Job {
  id: number;
  title: string;
  description: string;
  location: string;
  jobType: string;
  employmentType: string;
  minExperience: number | null;
  maxExperience: number | null;
  postedAt: string;
  skills: string[];
  company: CompanySummary | null;
  salary: string | Salary | null;
  isNew: boolean;
}

export interface SavedJob extends Job {
  savedAt: string;
}

export interface SavedJobStatus {
  jobId: number;
  saved: boolean;
}

export interface ReviewCompanySummary {
  id: number;
  name: string;
  logoUrl: string | null;
  initial: string;
}

export interface Review {
  id: number;
  title: string;
  description: string;
  rating: number;
  pros: string;
  cons: string;
  reviewerRole: string;
  employmentStatus: string;
  createdAt: string;
  company: ReviewCompanySummary | null;
}

export interface JobPayload extends Omit<Job, 'id' | 'company'> {
  companyId?: number | null;
}

export interface CompanyPayload extends Omit<
  Company,
  'id' | 'rating' | 'reviewCount' | 'openJobCount'
> {}

export interface ReviewPayload extends Omit<Review, 'id' | 'company' | 'createdAt'> {}
