"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FileText, Upload, ArrowLeft, Download, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Navbar from "@/components/navbar";

export default function ASRPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [taskId, setTaskId] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [language, setLanguage] = useState("auto");
  const [outputFormat, setOutputFormat] = useState("srt");

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
      formData.append("language", language === "auto" ? "" : language);
      formData.append("output_format", outputFormat);

      const resp = await fetch("https://api.tokesave.com/api/v1/asr", {
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-orange-50">
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
          <div className="w-16 h-16 rounded-2xl bg-orange-500 flex items-center justify-center">
            <FileText className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Speech to Text</h1>
            <p className="text-slate-600">Extract text from audio and video</p>
          </div>
        </div>

        <Card className="p-8 border-0 shadow-xl bg-white">
          {!file ? (
            <div className="text-center">
              <div className="border-2 border-dashed border-slate-300 rounded-xl p-16 hover:border-orange-400 transition-colors">
                <input
                  type="file"
                  accept=".mp3,.wav,.flac,.mp4,.mov,.avi"
                  onChange={handleFileChange}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center gap-4">
                  <div className="w-20 h-20 rounded-full bg-orange-100 flex items-center justify-center">
                    <Upload className="w-10 h-10 text-orange-600" />
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
                <div className="w-12 h-12 rounded-lg bg-orange-100 flex items-center justify-center">
                  <FileText className="w-6 h-6 text-orange-600" />
                </div>
                <div className="flex-1">
                  <div className="font-medium">{file.name}</div>
                  <div className="text-sm text-slate-500">{(file.size / 1024 / 1024).toFixed(1)} MB</div>
                </div>
              </div>

              {!result && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Language</label>
                    <select
                      className="w-full p-3 rounded-lg border border-slate-200 bg-white"
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                    >
                      <option value="auto">Auto Detect</option>
                      <option value="en">English</option>
                      <option value="zh">Chinese</option>
                      <option value="ja">Japanese</option>
                      <option value="ko">Korean</option>
                      <option value="es">Spanish</option>
                      <option value="fr">French</option>
                      <option value="de">German</option>
                      <option value="ru">Russian</option>
                      <option value="ar">Arabic</option>
                      <option value="hi">Hindi</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Output Format</label>
                    <div className="flex gap-3">
                      {["srt", "vtt", "txt", "json"].map((fmt) => (
                        <button
                          key={fmt}
                          onClick={() => setOutputFormat(fmt)}
                          className={`flex-1 p-3 rounded-lg border text-center transition-all ${
                            outputFormat === fmt
                              ? "border-orange-500 bg-orange-50 text-orange-700"
                              : "border-slate-200"
                          }`}
                        >
                          <div className="font-medium uppercase">{fmt}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {(uploading || processing) && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>{uploading ? "Uploading..." : "Transcribing..."}</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-orange-500 transition-all duration-500" style={{ width: `${progress}%` }} />
                  </div>
                </div>
              )}

              {result && (
                <div className="space-y-4">
                  <div className="p-4 bg-green-50 text-green-700 rounded-lg flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    Transcription complete!
                  </div>
                  <div className="p-4 bg-slate-50 rounded-lg max-h-96 overflow-y-auto">
                    <pre className="text-sm whitespace-pre-wrap">{result.text}</pre>
                  </div>
                  <Button variant="outline" onClick={() => window.open(`https://api.tokesave.com/api/v1/tasks/${taskId}/download`, "_blank")}>
                    <Download className="w-4 h-4 mr-2" />
                    Download {outputFormat.toUpperCase()}
                  </Button>
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
                  <Button onClick={handleUpload} className="flex-1 rounded-full h-12 bg-orange-500 hover:bg-orange-600">
                    Start Transcription
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
