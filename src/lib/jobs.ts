import fs from 'fs';
import path from 'path';
import { Job } from '@/types';

const JOBS_FILE = path.join(process.cwd(), 'jobs.json');

export function getJobs(): Job[] {
  if (!fs.existsSync(JOBS_FILE)) {
    return [];
  }
  try {
    const data = fs.readFileSync(JOBS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (e) {
    return [];
  }
}

export function saveJobs(jobs: Job[]) {
  fs.writeFileSync(JOBS_FILE, JSON.stringify(jobs, null, 2));
}

export function updateJob(id: string, updates: Partial<Job>) {
  const jobs = getJobs();
  const index = jobs.findIndex(j => j.id === id);
  if (index !== -1) {
    jobs[index] = { ...jobs[index], ...updates };
    saveJobs(jobs);
  }
}

export function addJobs(newJobs: Job[]) {
  const jobs = getJobs();
  saveJobs([...jobs, ...newJobs]);
}
