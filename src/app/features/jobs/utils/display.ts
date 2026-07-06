import { Job } from '../models/job.model';

export function salaryDisplay(job: Pick<Job, 'salary'>): string {
  if (!job.salary) return 'Salary not disclosed';
  if (typeof job.salary === 'string') return job.salary;
  if (job.salary.display) return job.salary.display;
  if (job.salary.min && job.salary.max) return `₹${job.salary.min.toLocaleString('en-IN')} - ₹${job.salary.max.toLocaleString('en-IN')}`;
  return 'Salary not disclosed';
}

export function experienceDisplay(job: Pick<Job, 'minExperience' | 'maxExperience'>): string {
  if (job.minExperience === null && job.maxExperience === null) return 'Experience not specified';
  if (job.maxExperience === null) return `${job.minExperience}+ Years`;
  return `${job.minExperience ?? 0}-${job.maxExperience} Years`;
}

export function companyInitial(company?: { initial?: string; name?: string } | null): string {
  return (company?.initial || company?.name?.charAt(0) || '?').toUpperCase();
}
