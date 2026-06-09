"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Download, ArrowLeft, Loader2, CheckCircle, AlertCircle, Link } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Navbar from "@/components/navbar";

export default function VideoDownloadPage() {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [taskId, setTaskId] = useState<string | null>(null);
  const [result, setResult] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [format, setFormat] = useState("mp4");
  const [quality, setQuality] = useState("best");

  const handleDownload = async () => {
    if (!url) return;
    setProcessing(true);
    setError(null);
    try {
      const resp = await fetch("https://api.tokesave.com/api/v1/video_download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, format, quality }),
      });
      if (!resp.ok) throw new Error("Failed to start download");
      const data = await resp.json();
      setTaskId(data.id);
      pollProgress(data.id);
    } catch (err: any) {
      setError(err?.message || "Download failed");
      setProcessing(false);
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
          setError(data.result?.error || "Download failed");
        }
      } catch {
        clearInterval(interval);
        setProcessing(false);
        setError("Failed to check progress");
      }
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-red-50">
      <Navbar />
      <div className="max-w-4xl mx-auto px-6 pt-24 pb-12">
        <button onClick={() => router.push("/")} className="flex items-center gap-2 text-slate-600 hover:text-indigo-600 mb-8 transition-colors">
          <ArrowLeft className="w-5 h-5" />
          Back to tools
        </button>

        <div className="flex items-center gap-4 mb-8">
          <div className="w-16 h-16 rounded-2xl bg-red-500 flex items-center justify-center">
            <Download className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Video Downloader</h1>
            <p className="text-slate-600">Download videos from YouTube, TikTok, Instagram</p>
          </div>
        </div>

        <Card className="p-8 border-0 shadow-xl bg-white">
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Video URL</label>
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <Link className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="Paste YouTube, TikTok, or Instagram URL here"
                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-200 bg-white focus:outline-none focus:border-red-400"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Format</label>
                <div className="flex gap-2">
                  {["mp4", "mp3"].map((f) => (
                    <button key={f} onClick={() => setFormat(f)} className={`flex-1 p-2 rounded-lg border text-center transition-all ${format === f ? "border-red-500 bg-red-50 text-red-700" : "border-slate-200"}`}>
                      {f.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Quality</label>
                <select value={quality} onChange={(e) => setQuality(e.target.value)} className="w-full p-2 rounded-lg border border-slate-200 bg-white">
                  <option value="best">Best</option>
                  <option value="1080">1080p</option>
                  <option value="720">720p</option>
                  <option value="480">480p</option>
                </select>
              </div>
            </div>

            {processing && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Downloading...</span>
                  <span>{progress}%</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-red-500 transition-all duration-500" style={{ width: `${progress}%` }} />
                </div>
              </div>
            )}

            {result && (
              <div className="space-y-4">
                <div className="p-4 bg-green-50 text-green-700 rounded-lg flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  Download complete!
                </div>
                <Button variant="outline" onClick={() => window.open(`https://api.tokesave.com/api/v1/tasks/${taskId}/download`, "_blank")}>
                  <Download className="w-4 h-4 mr-2" />
                  Download File
                </Button>
              </div>
            )}

            {error && <div className="p-4 bg-red-50 text-red-700 rounded-lg flex items-center gap-2"><AlertCircle className="w-5 h-5" />{error}</div>}

            {!processing && !result && (
              <Button onClick={handleDownload} className="w-full rounded-full h-12 bg-red-500 hover:bg-red-600">
                Download
              </Button>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
