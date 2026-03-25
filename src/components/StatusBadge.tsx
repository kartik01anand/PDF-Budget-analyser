import { JobStatus } from "@/types";

export function StatusBadge({ status }: { status: JobStatus }) {
  const styles = {
    queued: "bg-white/5 text-gray-400 border-white/10",
    uploading: "bg-blue-500/10 text-blue-400 border-blue-500/20 animate-pulse",
    processing: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20 animate-pulse",
    completed: "bg-green-500/10 text-green-400 border-green-500/20",
    failed: "bg-red-500/10 text-red-400 border-red-500/20",
  };

  return (
    <span className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase border backdrop-blur-sm ${styles[status]}`}>
      {status}
    </span>
  );
}
