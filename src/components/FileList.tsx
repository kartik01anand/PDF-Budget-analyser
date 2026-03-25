"use client";

import React from "react";
import { FileText, ExternalLink, AlertCircle, Clock, Loader2, Files } from "lucide-react";
import { Job } from "@/types";
import { StatusBadge } from "./StatusBadge";

interface FileListProps {
  jobs: Job[];
}

export default function FileList({ jobs }: FileListProps) {
  if (jobs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 glass rounded-[2rem] border border-white/10 animate-in fade-in zoom-in-95 duration-700">
        <div className="p-6 bg-white/5 rounded-full border border-white/5 shadow-2xl mb-6">
          <Clock className="w-12 h-12 text-gray-400" />
        </div>
        <h3 className="text-xl font-bold text-white tracking-tight">System Idle</h3>
        <p className="text-gray-400 text-sm mt-2 max-w-xs text-center font-medium leading-relaxed">
           Ready for your next budget batch. Upload PDFs to begin AI extraction.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center px-2">
        <h2 className="text-xl font-bold text-white tracking-tight flex items-center space-x-3">
          <div className="w-1.5 h-6 bg-blue-500 rounded-full"></div>
          <span>Extraction Batches</span>
        </h2>
        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{jobs.length} TOTAL BATCHES</span>
      </div>
      
      <div className="grid gap-8">
        {jobs.sort((a, b) => b.timestamp - a.timestamp).map((job, i) => (
          <div
            key={job.id}
            className="group glass-card rounded-[2.5rem] p-8 border border-white/10 shadow-3xl relative overflow-hidden transition-all duration-500 hover:border-blue-500/30"
            style={{ animationDelay: `${i * 100}ms` }}
          >
            {/* Batch Progress Bar */}
            <div 
              className="absolute bottom-0 left-0 h-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 transition-all duration-1000 shadow-[0_0_15px_rgba(59,130,246,0.5)]"
              style={{ width: `${job.progress}%` }}
            />

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
              <div className="flex items-center space-x-4">
                <div className="p-4 bg-blue-500/10 rounded-2xl border border-blue-500/20 group-hover:scale-110 transition-transform">
                  <Files className="w-7 h-7 text-blue-400" />
                </div>
                <div>
                   <h3 className="text-xl font-bold text-white tracking-tight">
                     Batch {job.id.slice(0, 8)}
                   </h3>
                   <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">
                     {job.files.length} Files • {new Date(job.timestamp).toLocaleTimeString()}
                   </p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                 <div className="text-right hidden sm:block">
                   <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total Progress</p>
                   <p className="text-lg font-black text-blue-400">{job.progress}%</p>
                 </div>
                 <StatusBadge status={job.status} />
              </div>
            </div>

            <div className="space-y-3">
              {job.files.map((file, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 transition-all hover:bg-white/10 group/file">
                   <div className="flex items-center space-x-4 overflow-hidden">
                     <FileText className="w-4 h-4 text-gray-500 group-hover/file:text-blue-400 transition-colors" />
                     <span className="text-sm font-semibold text-gray-300 truncate tracking-tight">{file.name}</span>
                   </div>
                   <div className="flex items-center space-x-4">
                      {file.sheetLink && (
                        <a 
                          href={file.sheetLink} 
                          target="_blank" 
                          className="p-1.5 bg-green-500/10 text-green-400 rounded-lg border border-green-500/20 hover:bg-green-500/20 transition-all"
                          title="Open Sheet"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                      <span className="text-[10px] font-black text-gray-500 block w-8 text-right">{file.progress}%</span>
                   </div>
                </div>
              ))}
            </div>

            {job.status === 'completed' && job.sheetLink && (
               <div className="mt-8">
                 <a
                    href={job.sheetLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center space-x-3 py-4 bg-gradient-to-r from-green-500/20 to-emerald-600/20 hover:from-green-500/30 hover:to-emerald-600/30 text-green-400 rounded-2xl text-[11px] font-black tracking-widest uppercase transition-all border border-green-500/20 shadow-xl shadow-green-500/5 group/btn"
                  >
                    <ExternalLink className="w-4 h-4 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
                    <span>Open Master Google Sheet</span>
                  </a>
               </div>
            )}
            
            {job.status === 'processing' && (
              <div className="mt-8 flex items-center justify-center space-x-3 text-blue-400/60 font-bold text-[10px] tracking-widest uppercase">
                 <Loader2 className="w-4 h-4 animate-spin" />
                 <span>Synchronizing Data Nodes...</span>
              </div>
            )}

            {/* Decorator */}
            <div className="absolute -right-12 -bottom-12 w-40 h-40 bg-blue-500/5 rounded-full blur-3xl pointer-events-none group-hover:bg-blue-500/10 transition-colors"></div>
          </div>
        ))}
      </div>
    </div>
  );
}
