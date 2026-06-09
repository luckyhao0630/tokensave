"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Image, Palette, ArrowLeft, Upload, Loader2, CheckCircle, AlertCircle, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Navbar from "@/components/navbar";

export default function ImageCartoonizerPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [taskId, setTaskId] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [style, setStyle] = useState("anime");

  const styles = [
    { id: "anime", name: "Anime", desc: "Japanese anime style" },
    { id: "3d", name: "3D Cartoon", desc: "Pixar-style 3D" },
    { id: "oil", name: "Oil Painting", desc: "Classic oil painting" },
    { id: "watercolor", name: "Watercolor", desc: "Soft watercolor" },
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    const allowed = [".jpg", ".jpeg", ".png", ".webp"];
    const ext = selected.name.toLowerCase().slice(selected.name.lastIndexOf("."));
    if (!allowed.includes(ext)) {
      setError(`Unsupported format. Supported: ${allowed.join(", ")}`);
      return;
    }

    if (selected.size > 50 * 1024 * 1024) {
      setError("File too large. Max: 50MB");
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
      formData.append("style", style);

      const resp = await fetch("https://api.tokesave.com/api/v1/image_cartoonizer", {
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
      setError(err?.message || "Upload failed");
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-pink-50">
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
          <div className="w-16 h-16 rounded-2xl bg-pink-500 flex items-center justify-center">
            <Palette className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Image to Anime</h1>
            <p className="text-slate-600">Convert images to anime, 3D, or painting styles</p>
          </div>
        </div>

        <Card className="p-8 border-0 shadow-xl bg-white">
          {!file ? (
            <div className="text-center">
              <div className="border-2 border-dashed border-slate-300 rounded-xl p-16 hover:border-pink-400 transition-colors">
                <input
                  type="file"
                  accept=".jpg,.jpeg,.png,.webp"
                  onChange={handleFileChange}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center gap-4">
                  <div className="w-20 h-20 rounded-full bg-pink-100 flex items-center justify-center">
                    <Upload className="w-10 h-10 text-pink-600" />
                  </div>
                  <div className="text-xl font-semibold">Drop image here or click to upload</div>
                  <p className="text-sm text-slate-500">JPG, PNG, WEBP up to 50MB</p>
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
                <div className="w-12 h-12 rounded-lg bg-pink-100 flex items-center justify-center">
                  <Image className="w-6 h-6 text-pink-600" />
                </div>
                <div className="flex-1">
                  <div className="font-medium">{file.name}</div>
                  <div className="text-sm text-slate-500">{(file.size / 1024 / 1024).toFixed(1)} MB</div>
                </div>
              </div>

              {!result && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Style</label>
                    <div className="grid grid-cols-2 gap-3">
                      {styles.map((s) => (
                        <button
                          key={s.id}
                          onClick={() => setStyle(s.id)}
                          className={`p-3 rounded-lg border text-left transition-all ${
                            style === s.id ? "border-pink-500 bg-pink-50 text-pink-700" : "border-slate-200"
                          }`}
                        >
                          <div className="font-medium">{s.name}</div>
                          <div className="text-xs text-slate-500">{s.desc}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {(uploading || processing) && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>{uploading ? "Uploading..." : "Converting..."}</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-pink-500 transition-all duration-500" style={{ width: `${progress}%` }} />
                  </div>
                </div>
              )}

              {result && (
                <div className="space-y-4">
                  <div className="p-4 bg-green-50 text-green-700 rounded-lg flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    Conversion complete!
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => window.open(`https://api.tokesave.com/api/v1/tasks/${taskId}/download`, "_blank")}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download Result
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
                  <Button onClick={handleUpload} className="flex-1 rounded-full h-12 bg-pink-500 hover:bg-pink-600">
                    <Palette className="w-5 h-5 mr-2" />
                    Convert to {styles.find(s => s.id === style)?.name}
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
