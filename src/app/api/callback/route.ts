import { NextRequest, NextResponse } from 'next/server';
import { getJobs, saveJobs } from '@/lib/jobs';
import { JobStatus } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { batchId, status, progress, sheetLink, fileName } = body as {
      batchId: string;
      status: JobStatus;
      progress: number;
      sheetLink?: string;
      fileName?: string;
    };

    if (!batchId || !status) {
      return NextResponse.json({ error: 'batchId and status are required' }, { status: 400 });
    }

    const jobs = getJobs();
    const jobIndex = jobs.findIndex(j => j.id === batchId);

    if (jobIndex === -1) {
      return NextResponse.json({ error: 'Batch not found' }, { status: 404 });
    }

    // Update specific file if fileName is provided, otherwise update all
    if (fileName) {
      const fileIndex = jobs[jobIndex].files.findIndex(f => f.name === fileName);
      if (fileIndex !== -1) {
        jobs[jobIndex].files[fileIndex].status = status;
        jobs[jobIndex].files[fileIndex].progress = Math.min(progress ?? jobs[jobIndex].files[fileIndex].progress, 100);
        if (sheetLink) jobs[jobIndex].files[fileIndex].sheetLink = sheetLink;
      }
    } else {
      // Legacy/Batch-level update: apply to all files
      jobs[jobIndex].files = jobs[jobIndex].files.map(f => ({
        ...f,
        status: status,
        progress: Math.min(progress ?? f.progress, 100),
        ...(sheetLink ? { sheetLink } : {}),
      }));
    }

    // Recalculate batch-level status and progress
    const allFiles = jobs[jobIndex].files;
    const totalProgress = allFiles.reduce((acc, f) => acc + f.progress, 0);
    jobs[jobIndex].progress = Math.round(totalProgress / allFiles.length);

    // Batch status: if any failed -> failed, if all completed -> completed, else processing
    if (allFiles.every(f => f.status === 'completed')) {
      jobs[jobIndex].status = 'completed';
    } else if (allFiles.some(f => f.status === 'failed')) {
      jobs[jobIndex].status = 'failed';
    } else {
      jobs[jobIndex].status = 'processing';
    }

    // Store the sheetLink at batch level if it's a batch-level update or if all files have it
    if (sheetLink && !fileName) {
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
