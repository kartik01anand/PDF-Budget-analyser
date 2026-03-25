export type JobStatus = 'queued' | 'uploading' | 'processing' | 'completed' | 'failed';

export interface Job {
  id: string; // Batch ID
  files: {
    name: string;
    size: number;
    status: JobStatus;
    progress: number;
    sheetLink?: string;
  }[];
  status: JobStatus;
  progress: number;
  sheetLink?: string;
  timestamp: number;
}
