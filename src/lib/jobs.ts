import { Job } from '@/types';

// In-memory store for active jobs (resets on server restart/refresh on Vercel)
const jobsMap = new Map<string, Job>();

export function getJobs(): Job[] {
  return Array.from(jobsMap.values()).sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
}

export function saveJobs(jobs: Job[]) {
  if (!Array.isArray(jobs)) return;
  // Overwrite existing jobs in the map
  // Note: This matches the old behavior of saving the full list, 
  // but we should ideally update individual jobs.
  jobs.forEach(job => {
    jobsMap.set(job.id, job);
  });
}

export function updateJob(id: string, updates: Partial<Job>) {
  const job = jobsMap.get(id);
  if (job) {
    jobsMap.set(id, { ...job, ...updates });
  }
}

export function addJobs(newJobs: Job[]) {
  newJobs.forEach(job => {
    jobsMap.set(job.id, job);
  });
}
