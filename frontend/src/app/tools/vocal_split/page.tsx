"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Music, Upload, ArrowLeft, Download, Loader2, CheckCircle, AlertCircle, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Navbar from "@/components/navbar";

export default function VocalSplitPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [taskId, setTaskId] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [stems, setStems] = useState(2);
  const [outputFormat, setOutputFormat] = useState("wav");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    const allowed = [".mp3", ".wav", ".flac", ".mp4", ".mov", ".avi"];
    const ext = selected.name.toLowerCase().slice(selected.name.lastIndexOf("."));
    if (!allowed.includes(ext)) {
      setError(`Unsupported format. Supported: ${allowed.join(", ")}`);
      return;
    }

    if (selected.size > 200 * 1024 * 1024) {
      setError("File too large. Max: 200MB");
      return;
    }

    setFile(selected);
    setError(null);
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("stems", stems.toString());
      formData.append("output_format", outputFormat);

      const resp = await fetch("https://api.tokesave.com/api/v1/vocal_split", {
        method: "POST",
        body: formData,
      });

      if (!resp.ok) throw new Error("Upload failed");

      const data = await resp.json();
      setTaskId(data.id);
      setUploading(false);
      setProcessing(true);
      pollProgress(data.id);
    } catch (err: any) {
      setError(err.message || "Upload failed");
      setUploading(false);
    }
  };

  const pollProgress = async (id: string) => {
    const interval = setInterval(async () => {
      try {
        const resp = await fetch(`https://api.tokesave.com/api/v1/tasks/${id}`);
        const data = await resp.json();
        setProgress(data.progress);

        if (data.status === "completed") {
          clearInterval(interval);
          setProcessing(false);
          setResult(data.result);
        } else if (data.status === "failed") {
          clearInterval(interval);
          setProcessing(false);
          setError(data.result?.error || "Processing failed");
        }
      } catch {
        clearInterval(interval);
        setProcessing(false);
        setError("Failed to check progress");
      }
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50">
      <Navbar />

      <div className="max-w-4xl mx-auto px-6 pt-24 pb-12">
        <button
          onClick={() => router.push("/")}
          className="flex items-center gap-2 text-slate-600 hover:text-indigo-600 mb-8 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to tools
        </button>

        <div className="flex items-center gap-4 mb-8">
          <div className="w-16 h-16 rounded-2xl bg-purple-500 flex items-center justify-center">
            <Music className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Vocal Split</h1>
            <p className="text-slate-600">Separate vocals and instruments from audio</p>
          </div>
        </div>

        <Card className="p-8 border-0 shadow-xl bg-white">
          {!file ? (
            <div className="text-center">
              <div className="border-2 border-dashed border-slate-300 rounded-xl p-16 hover:border-purple-400 transition-colors">
                <input
                  type="file"
                  accept=".mp3,.wav,.flac,.mp4,.mov,.avi"
                  onChange={handleFileChange}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center gap-4">
                  <div className="w-20 h-20 rounded-full bg-purple-100 flex items-center justify-center">
                    <Upload className="w-10 h-10 text-purple-600" />
                  </div>
                  <div className="text-xl font-semibold">Drop audio/video here or click to upload</div>
                  <p className="text-sm text-slate-500">MP3, WAV, FLAC, MP4, MOV up to 200MB</p>
                </label>
              </div>
              {error && (
                <div className="mt-4 p-4 bg-red-50 text-red-600 rounded-lg flex items-center gap-2">
                  <AlertCircle className="w-5 h-5" />
                  {error}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl">
                <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center">
                  <Music className="w-6 h-6 text-purple-600" />
                </div>
                <div className="flex-1">
                  <div className="font-medium">{file.name}</div>
                  <div className="text-sm text-slate-500">{(file.size / 1024 / 1024).toFixed(1)} MB</div>
                </div>
              </div>

              {!result && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Separation Mode</label>
                    <div className="flex gap-3">
                      <button
                        onClick={() => setStems(2)}
                        className={`flex-1 p-3 rounded-lg border text-center transition-all ${
                          stems === 2 ? "border-purple-500 bg-purple-50 text-purple-700" : "border-slate-200"
                        }`}
                      >
                        <div className="font-medium">2 Stems</div>
                        <div className="text-xs text-slate-500">Vocals + Accompaniment</div>
                      </button>
                      <button
                        onClick={() => setStems(4)}
                        className={`flex-1 p-3 rounded-lg border text-center transition-all ${
                          stems === 4 ? "border-purple-500 bg-purple-50 text-purple-700" : "border-slate-200"
                        }`}
                      >
                        <div className="font-medium">4 Stems</div>
                        <div className="text-xs text-slate-500">Vocals + Drums + Bass + Other</div>
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Output Format</label>
                    <select
                      className="w-full p-3 rounded-lg border border-slate-200 bg-white"
                      value={outputFormat}
                      onChange={(e) => setOutputFormat(e.target.value)}
                    >
                      <option value="wav">WAV (Lossless)</option>
                      <option value="mp3">MP3 (Compressed)</option>
                      <option value="flac">FLAC (Lossless)</option>
                    </select>
                  </div>
                </div>
              )}

              {(uploading || processing) && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>{uploading ? "Uploading..." : "Separating..."}</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-purple-500 transition-all duration-500" style={{ width: `${progress}%` }} />
                  </div>
                </div>
              )}

              {result && (
                <div className="space-y-4">
                  <div className="p-4 bg-green-50 text-green-700 rounded-lg flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    Separation complete!
                  </div>
                  <div className="space-y-2">
                    {Object.entries(result).filter(([k]) => !k.startsWith("_")).map(([key, path]) => (
                      <div key={key} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Music className="w-5 h-5 text-purple-500" />
                          <span className="font-medium capitalize">{key.replace("_", " ")}</span>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => window.open(`https://api.tokesave.com/api/v1/tasks/${taskId}/download`, "_blank")}>
                          <Download className="w-4 h-4 mr-1" />
                          Download
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {error && (
                <div className="p-4 bg-red-50 text-red-700 rounded-lg flex items-center gap-2">
                  <AlertCircle className="w-5 h-5" />
                  {error}
                </div>
              )}

              {!uploading && !processing && !result && (
                <div className="flex gap-4">
                  <Button onClick={handleUpload} className="flex-1 rounded-full h-12 bg-purple-500 hover:bg-purple-600">
                    Start Separation
                  </Button>
                  <Button variant="outline" onClick={() => setFile(null)} className="rounded-full h-12">
                    Cancel
                  </Button>
                </div>
              )}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
