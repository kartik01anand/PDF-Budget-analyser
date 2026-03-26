export type JobStatus = 'pending' | 'queued' | 'uploading' | 'processing' | 'completed' | 'failed';

export interface ExtractedData {
  pdf_name: string;
  budget: number;
  currency: string;
  confidence: string;
  mentor_count: number;
  mentor_names: string;
  sponsor_count: number;
  sponsor_names: string;
  notes: string;
}

export interface Job {
  id: string; // UUID from Supabase
  status: JobStatus;
  progress: number;
  created_at?: string;
  files?: {
    name: string;
    size: number;
    status: JobStatus;
    progress: number;
  }[];
  extractions?: ExtractedData[];
  sheet_link?: string;
}
