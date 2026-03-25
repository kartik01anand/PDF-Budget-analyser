import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { Job } from '@/types';
import { addJobs } from '@/lib/jobs';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const files = formData.getAll('files') as File[];

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No files uploaded" }, { status: 400 });
    }

    const batchId = uuidv4();
    
    const newBatch: Job = {
      id: batchId,
      files: files.map(file => ({
        name: file.name,
        size: file.size,
        status: 'uploading',
        progress: 0,
      })),
      status: 'uploading',
      progress: 0,
      timestamp: Date.now(),
    };

    addJobs([newBatch]);

    // Trigger n8n with ALL files + batchId + callbackUrl
    triggerN8nBatch(batchId, files);

    return NextResponse.json({ jobs: [newBatch] });
  } catch (error) {
    console.error("Upload handler error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

async function triggerN8nBatch(batchId: string, files: File[]) {
  const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL;
  const CALLBACK_URL = `${process.env.NEXT_PUBLIC_APP_URL}/api/callback`;
  
  console.log(`[UPLOAD] Starting n8n trigger for batch ${batchId} with ${files.length} files`);

  if (!N8N_WEBHOOK_URL) {
    console.log(`[SIMULATION] n8n triggered for batch ${batchId} with ${files.length} files`);
    return;
  }

  try {
    const formData = new FormData();
    formData.append('batchId', batchId);
    formData.append('callbackUrl', CALLBACK_URL);
    
    // Use the same key 'files' for all files. 
    // n8n Webhook will see this as binary.files_0, binary.files_1, etc.
    files.forEach((file) => {
      formData.append('files', file);
    });

    console.log(`[UPLOAD] Sending POST to ${N8N_WEBHOOK_URL}`);
    const response = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      body: formData,
    });

    if (response.ok) {
      console.log(`[UPLOAD] Successfully triggered n8n for batch ${batchId}`);
    } else {
      const errorText = await response.text();
      console.error(`[UPLOAD] n8n responded with error: ${response.status} - ${errorText}`);
    }
  } catch (error) {
    console.error(`[UPLOAD] Failed to trigger n8n for batch ${batchId}:`, error);
  }
}
