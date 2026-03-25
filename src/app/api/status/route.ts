import { NextResponse } from 'next/server';
import { getJobs } from '@/lib/jobs';

export const dynamic = 'force-dynamic';

export async function GET() {
  const jobs = getJobs();
  return NextResponse.json(jobs);
}
