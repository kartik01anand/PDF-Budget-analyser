import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function GET() {
  const { data: jobs, error } = await supabaseAdmin
    .from('execution_jobs')
    .select('*, extractions:extracted_data(*)')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Status fetch error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(jobs);
}
