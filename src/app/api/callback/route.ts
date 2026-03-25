import { NextRequest, NextResponse } from 'next/server';
import { getJobs, saveJobs } from '@/lib/jobs';
import { JobStatus } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { batchId, status, progress, sheetLink } = body as {
      batchId: string;
      status: JobStatus;
      progress: number;
      sheetLink?: string;
    };

    if (!batchId || !status) {
      return NextResponse.json({ error: 'batchId and status are required' }, { status: 400 });
    }

    const jobs = getJobs();
    const jobIndex = jobs.findIndex(j => j.id === batchId);

    if (jobIndex === -1) {
      return NextResponse.json({ error: 'Batch not found' }, { status: 404 });
    }

    // Update the batch
    jobs[jobIndex].status = status;
    jobs[jobIndex].progress = Math.min(progress ?? jobs[jobIndex].progress, 100);

    // Update all files within the batch
    jobs[jobIndex].files = jobs[jobIndex].files.map(f => ({
      ...f,
      status: status,
      progress: Math.min(progress ?? f.progress, 100),
      ...(sheetLink ? { sheetLink } : {}),
    }));

    // Store the sheetLink at batch level too
    if (sheetLink) {
      (jobs[jobIndex] as any).sheetLink = sheetLink;
    }

    saveJobs(jobs);

    console.log(`[CALLBACK] Batch ${batchId}: status=${status}, progress=${progress}, sheetLink=${sheetLink || 'none'}`);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Callback error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
