"use client";

import React, { useState, useEffect } from "react";
import UploadSection from "@/components/UploadSection";
import FileList from "@/components/FileList";
import { Job } from "@/types";
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
        // Filter out legacy jobs that don't have files to prevent crashes
        const validJobs = data.filter((j: any) => Array.isArray(j.files));
        setJobs(validJobs);
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

        setJobs(prev => {
          return prev.map(job => {
            const update = updatedJobs.find(uj => uj.id === job.id);
            if (update) {
              return { ...job, ...update };
            }
            return job;
          });
        });
      } catch (error) {
        console.error("Polling error:", error);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [jobs]);

  const handleUpload = async (files: File[]) => {
    setIsUploading(true);
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error("Upload failed");

      const data = await response.json();

      // The API now returns a single batch in the jobs array
      setJobs(prev => [...prev, ...data.jobs]);
    } catch (error) {
      console.error("Upload error:", error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white selection:bg-blue-500/30 overflow-hidden relative selection:text-white">
      {/* Mesh Background */}
      <div className="mesh-gradient opacity-40" />

      {/* Main Layout */}
      <div className="flex h-screen overflow-hidden p-4 md:p-8 gap-8 max-w-[1700px] mx-auto">

        {/* Work Area */}
        <main className="flex-1 overflow-y-auto custom-scrollbar lg:pr-4">
          <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
            <div>
              <h2 className="text-4xl font-black text-white tracking-tighter">
                Orchestration <span className="text-blue-600">Dashboard</span>
              </h2>
              <p className="text-gray-500 text-sm mt-3 font-semibold tracking-wide">
                Monitor batch-processing states and Google Sheet synchronizations.
              </p>
            </div>
          </header>

          <div className="grid grid-cols-1 2xl:grid-cols-12 gap-12">

            {/* Primary Action Zone */}
            <div className="2xl:col-span-8 space-y-12">
              <section className="glass rounded-[3rem] p-1.5 shadow-[0_0_50px_rgba(0,0,0,0.5)] hover:shadow-blue-500/5 transition-all">
                <div className="bg-[#0c0c0c] rounded-[2.8rem] overflow-hidden">
                  <UploadSection onUpload={handleUpload} isUploading={isUploading} />
                </div>
              </section>

              <section>
                <FileList jobs={jobs} />
              </section>
            </div>

            {/* Insight Metrics */}
            <div className="2xl:col-span-4 space-y-8">
              <div className="glass-card rounded-[3rem] p-10 border border-white/10">
                <div className="flex items-center space-x-4 mb-10">
                  <div className="p-3 bg-blue-600/10 rounded-2xl border border-blue-500/20">
                    <Zap className="w-6 h-6 text-blue-500" />
                  </div>
                  <h3 className="text-white font-black tracking-tight text-xl">Batch Metrics</h3>
                </div>

                <div className="space-y-6">
                  {[
                    { label: "Active Nodes", value: jobs.filter(j => j.status !== 'completed' && j.status !== 'failed').length, color: "text-blue-500", bg: "bg-blue-500/5" },
                    { label: "Synced Files", value: jobs.reduce((acc, j) => acc + j.files.filter(f => f.status === 'completed').length, 0), color: "text-green-500", bg: "bg-green-500/5" },
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
            </div>
          </div>
        </main>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.1);
        }
      `}</style>
    </div>
  );
}
