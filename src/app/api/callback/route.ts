import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log('[CALLBACK BODY]', JSON.stringify(body, null, 2));
    const { 
      batchId, 
      status, 
      progress, 
      pdfName, 
      budget, 
      currency, 
      confidence, 
      mentorCount, 
      mentorNames, 
      sponsorCount, 
      sponsorNames, 
      notes,
      sheetLink
    } = body;

    if (status === 'completed' && !pdfName) {
      console.warn(`[CALLBACK WARNING] Batch ${batchId} marked completed but no pdfName found in body!`);
    }

    if (!batchId || !status) {
      return NextResponse.json({ error: 'batchId and status are required' }, { status: 400 });
    }

    // 1. Update the execution job status
    const { error: jobUpdateError } = await supabaseAdmin
      .from('execution_jobs')
      .update({
        status,
        progress: Math.min(progress ?? 0, 100),
        sheet_link: sheetLink
      })
      .eq('id', batchId);

    if (jobUpdateError) throw jobUpdateError;

    // 2. If we have final extraction data, save it
    if (pdfName) {
      const { error: extractionError } = await supabaseAdmin
        .from('extracted_data')
        .insert({
          job_id: batchId,
          pdf_name: pdfName,
          budget: Number(budget) || 0,
          currency: currency || 'USD',
          confidence: confidence || 'High',
          mentor_count: Number(mentorCount) || 0,
          mentor_names: mentorNames || '',
          sponsor_count: Number(sponsorCount) || 0,
          sponsor_names: sponsorNames || '',
          notes: notes || ''
        });

      if (extractionError) throw extractionError;
    }

    console.log(`[CALLBACK] Batch ${batchId} updated to ${status} (${progress}%)`);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Callback error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
