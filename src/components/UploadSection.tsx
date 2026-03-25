"use client";

import React, { useState, useRef } from "react";
import { Upload, File, X, Loader2, Sparkles } from "lucide-react";

interface UploadSectionProps {
  onUpload: (files: File[]) => void;
  isUploading: boolean;
}

export default function UploadSection({ onUpload, isUploading }: UploadSectionProps) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const files = Array.from(e.dataTransfer.files).filter(f => f.type === "application/pdf");
      setSelectedFiles(prev => [...prev, ...files]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      const files = Array.from(e.target.files).filter(f => f.type === "application/pdf");
      setSelectedFiles(prev => [...prev, ...files]);
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if (selectedFiles.length > 0) {
      onUpload(selectedFiles);
      setSelectedFiles([]);
    }
  };

  return (
    <div className="w-full space-y-6">
      <div
        className={`relative border-2 border-dashed rounded-3xl p-12 transition-all duration-300 ease-out group ${
          dragActive 
            ? "border-blue-500 bg-blue-500/5 shadow-[0_0_20px_rgba(59,130,246,0.2)]" 
            : "border-white/10 hover:border-white/20 hover:bg-white/5"
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept=".pdf"
          onChange={handleChange}
          className="hidden"
        />
        
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="p-5 bg-gradient-to-tr from-blue-500/20 to-indigo-600/20 rounded-2xl shadow-inner ring-1 ring-white/10 group-hover:scale-110 transition-transform duration-300">
            <Upload className="w-10 h-10 text-blue-400" />
          </div>
          <div className="text-center">
            <p className="text-xl font-bold text-white tracking-tight">
              {dragActive ? "Drop files now" : "Click to upload or drag and drop"}
            </p>
            <p className="text-sm text-gray-400 mt-2 font-medium">
              Only PDF format is supported for AI extraction
            </p>
          </div>
          <button
            onClick={() => inputRef.current?.click()}
            className="px-6 py-2.5 bg-white shadow-lg shadow-black/20 rounded-xl text-xs font-bold text-gray-900 hover:bg-gray-100 active:scale-95 transition-all"
          >
            Select Files
          </button>
        </div>
      </div>

      {selectedFiles.length > 0 && (
        <div className="glass-card rounded-[2rem] border border-white/20 shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="px-6 py-4 border-b border-white/10 flex justify-between items-center bg-white/5 backdrop-blur-md">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <File className="w-4 h-4 text-blue-400" />
              <span>Queue ({selectedFiles.length})</span>
            </h3>
          </div>
          <ul className="divide-y divide-white/5 max-h-60 overflow-y-auto custom-scrollbar">
            {selectedFiles.map((file, index) => (
              <li key={index} className="px-6 py-4 flex items-center justify-between hover:bg-white/5 transition-colors group">
                <div className="flex items-center space-x-4 overflow-hidden">
                  <div className="p-2 bg-white/5 rounded-lg border border-white/10">
                    <File className="w-4 h-4 text-gray-400" />
                  </div>
                  <div>
                    <span className="text-sm font-semibold text-white truncate block">{file.name}</span>
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                  </div>
                </div>
                <button
                  onClick={() => removeFile(index)}
                  className="p-2 hover:bg-red-500/20 rounded-xl transition-all group-hover:scale-110 opacity-0 group-hover:opacity-100"
                >
                  <X className="w-4 h-4 text-red-400" />
                </button>
              </li>
            ))}
          </ul>
          <div className="p-6 bg-white/5 border-t border-white/10">
            <button
              onClick={handleSubmit}
              disabled={isUploading || selectedFiles.length === 0}
              className="w-full py-4 bg-gradient-to-tr from-blue-500 to-indigo-600 text-white rounded-[1.2rem] font-bold hover:brightness-110 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-xl shadow-blue-500/20 flex items-center justify-center space-x-3"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span className="tracking-tight">Initializing AI Pipeline...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  <span className="tracking-tight">Start AI Extraction</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
