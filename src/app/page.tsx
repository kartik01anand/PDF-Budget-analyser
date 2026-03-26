"use client";

import React, { useState, useEffect } from "react";
import UploadSection from "@/components/UploadSection";
import FileList from "@/components/FileList";
import { Job } from "@/types";
import { supabase } from "@/lib/supabase/client";
import { LayoutDashboard, Sparkles, Settings, Bell, Zap, ShieldCheck } from "lucide-react";

export default function Home() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  // Initial fetch
  useEffect(() => {
    async function fetchInitialJobs() {
      try {
        const response = await fetch('/api/status');
        if (!response.ok) throw new Error("Initial fetch failed");
        const data = await response.json();
        setJobs(data);
      } catch (error) {
        console.error("Initial fetch error:", error);
      }
    }
    fetchInitialJobs();
  }, []);

  // Polling logic
  useEffect(() => {
    const activeJobs = jobs.filter(j => j.status !== 'completed' && j.status !== 'failed');
    if (activeJobs.length === 0) return;

    const interval = setInterval(async () => {
      try {
        const response = await fetch('/api/status');
        if (!response.ok) throw new Error("Status fetch failed");

        const updatedJobs: Job[] = await response.json();
        setJobs(updatedJobs);
      } catch (error) {
        console.error("Polling error:", error);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [jobs]);

  const handleUpload = async (files: File[]) => {
    setIsUploading(true);
    
    try {
      const uploadResults = [];
      
      for (const file of files) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
        const filePath = `uploads/${fileName}`;

        const { error } = await supabase.storage
          .from('pdfs')
          .upload(filePath, file);

        if (error) throw error;
        
        const { data: { publicUrl } } = supabase.storage
          .from('pdfs')
          .getPublicUrl(filePath);

        uploadResults.push({
          name: file.name,
          url: publicUrl,
          size: file.size
        });
      }

      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ files: uploadResults }),
      });

      if (!response.ok) throw new Error("Job creation failed");

      const data = await response.json();
      setJobs(prev => [data.job, ...prev]);
    } catch (error: any) {
      console.error("Upload error:", error);
      alert(`Upload failed: ${error.message || 'Check console'}`);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white selection:bg-blue-500/30">
      <main className="">
        <header className="px-8 md:px-16 pt-12 pb-8 bg-gradient-to-b from-blue-500/5 to-transparent">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <span className="px-3 py-1 bg-blue-500/10 text-blue-400 text-[10px] font-black uppercase tracking-widest rounded-full border border-blue-500/20">System Online</span>
                <span className="text-gray-500">•</span>
                <span className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">v2.4 Neural Sync</span>
              </div>
              <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter leading-none">
                Budget <span className="text-blue-500">Extractor</span>
              </h1>
              <p className="text-gray-400 mt-4 text-sm font-medium flex items-center">
                <ShieldCheck className="w-4 h-4 mr-2 text-blue-500/50" />
                Orchestrating AI-driven budget synthesis
              </p>
            </div>
          </div>
        </header>

        <div className="px-8 md:px-16 py-12 grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-8 space-y-12">
            <UploadSection onUpload={handleUpload} isUploading={isUploading} />
            <FileList jobs={jobs} />
          </div>

          <div className="lg:col-span-4 space-y-8 h-fit lg:sticky lg:top-12">
            <div className="glass p-10 rounded-[2.5rem] border border-white/10 shadow-3xl bg-gradient-to-br from-white/[0.03] to-transparent relative overflow-hidden group">
              <div className="relative z-10">
                <div className="flex items-center space-x-4 mb-10">
                  <div className="p-3 bg-blue-600/10 rounded-2xl border border-blue-500/20">
                    <Zap className="w-6 h-6 text-blue-500" />
                  </div>
                  <h3 className="text-white font-black tracking-tight text-xl">Batch Metrics</h3>
                </div>

                <div className="space-y-6">
                  {[
                    { label: "Active Nodes", value: jobs.filter(j => j.status !== 'completed' && j.status !== 'failed').length, color: "text-blue-500", bg: "bg-blue-500/5" },
                    { label: "Synced Files", value: jobs.reduce((acc, j) => acc + (j.extractions?.length || 0), 0), color: "text-green-500", bg: "bg-green-500/5" },
                    { label: "Failed Segments", value: jobs.filter(j => j.status === 'failed').length, color: "text-red-500", bg: "bg-red-500/5" },
                  ].map((stat, i) => (
                    <div key={i} className={`${stat.bg} p-6 rounded-3xl border border-white/5 transition-all hover:scale-105 hover:bg-white/5`}>
                      <span className="text-gray-500 text-[10px] font-black uppercase tracking-widest">{stat.label}</span>
                      <p className={`text-4xl font-black ${stat.color} mt-2`}>{stat.value}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-12">
                  <div className="flex justify-between items-center mb-4 text-[10px] font-black text-gray-400 tracking-widest uppercase">
                    <span>Global Extraction Health</span>
                    <span>{jobs.length > 0 ? "OPTIMIZED" : "STANDBY"}</span>
                  </div>
                  <div className="h-4 p-1 bg-white/5 rounded-full ring-1 ring-white/10">
                    <div
                      className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full transition-all duration-1000 shadow-[0_0_15px_rgba(59,130,246,0.6)]"
                      style={{
                        width: `${jobs.length > 0 ? (jobs.filter(j => j.status === 'completed').length / jobs.length) * 100 : 0}%`
                      }}
                    />
                  </div>
                </div>
              </div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl -mr-16 -mt-16 transition-all group-hover:bg-blue-500/10"></div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
