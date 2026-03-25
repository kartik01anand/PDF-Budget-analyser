import fs from 'fs';
import path from 'path';
import { Job } from '@/types';

// Vercel only allows writing to /tmp
const JOBS_FILE = process.env.VERCEL ? path.join('/tmp', 'jobs.json') : path.join(process.cwd(), 'jobs.json');

export function getJobs(): Job[] {
  try {
    if (!fs.existsSync(JOBS_FILE)) {
      return [];
    }
    const data = fs.readFileSync(JOBS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (e) {
    console.error('Error reading jobs:', e);
    return [];
  }
}

export function saveJobs(jobs: Job[]) {
  try {
    fs.writeFileSync(JOBS_FILE, JSON.stringify(jobs, null, 2));
  } catch (e) {
    console.error('Error saving jobs:', e);
  }
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
