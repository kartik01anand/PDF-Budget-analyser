import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function POST(req: NextRequest) {
  try {
    const { files } = await req.json() as { 
      files: { name: string; url: string; size: number }[] 
    };

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No files provided" }, { status: 400 });
    }

    // 1. Create the job in the execution_jobs table
    const { data: job, error: jobError } = await supabaseAdmin
      .from('execution_jobs')
      .insert({
        status: 'pending',
        progress: 0
      })
      .select()
      .single();

    if (jobError) throw jobError;

    // 2. Trigger n8n with batchId + file metadata
    // We send the array of {name, url} so n8n can process them
    triggerN8nBatch(job.id, files);

    return NextResponse.json({ job });
  } catch (error) {
    console.error("Upload handler error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

async function triggerN8nBatch(batchId: string, files: { name: string; url: string; size: number }[]) {
  const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');
  const CALLBACK_URL = `${appUrl}/api/callback`;
  
  console.log(`[UPLOAD] Starting n8n trigger for batch ${batchId} with ${files.length} files`);
  console.log(`[UPLOAD] Callback URL set to: ${CALLBACK_URL}`);

  if (!N8N_WEBHOOK_URL) {
    console.log(`[SIMULATION] n8n triggered for batch ${batchId} with ${files.length} files`);
    return;
  }

  try {
    // Send JSON to n8n instead of FormData since files are already in Storage
    const response = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        batchId,
        callbackUrl: CALLBACK_URL,
        files // [{name, url, size}, ...]
      }),
    });

    if (response.ok) {
      console.log(`[UPLOAD] Successfully triggered n8n for batch ${batchId}`);
      
      // Update status to 'processing' now that n8n has it
      await supabaseAdmin
        .from('execution_jobs')
        .update({ status: 'processing', progress: 10 })
        .eq('id', batchId);
        
    } else {
      const errorText = await response.text();
      console.error(`[UPLOAD] n8n responded with error: ${response.status} - ${errorText}`);
    }
  } catch (error) {
    console.error(`[UPLOAD] Failed to trigger n8n for batch ${batchId}:`, error);
  }
}
