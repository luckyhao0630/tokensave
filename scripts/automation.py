#!/usr/bin/env python3
"""
MediaKit 自动化开发脚本 - 简化版
"""

import os
import sys
import subprocess
from datetime import datetime

LOG_DIR = "/Users/apple/.openclaw/workspace/token-saver/logs"
os.makedirs(LOG_DIR, exist_ok=True)
LOG_FILE = os.path.join(LOG_DIR, f"automation_{datetime.now().strftime('%Y%m%d')}.log")

def log(message):
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    log_msg = f"[{timestamp}] {message}"
    print(log_msg)
    with open(LOG_FILE, "a") as f:
        f.write(log_msg + "\n")

def create_missing_pages():
    """创建缺失的前端页面"""
    log("🔄 检查缺失的前端页面...")
    
    frontend_dir = "/Users/apple/.openclaw/workspace/token-saver/frontend/src/app/tools"
    
    tools = ["background_removal", "video_download"]
    
    for tool in tools:
        page_dir = os.path.join(frontend_dir, tool)
        page_path = os.path.join(page_dir, "page.tsx")
        
        if os.path.exists(page_path):
            log(f"✅ {tool} 页面已存在")
            continue
        
        log(f"📝 创建 {tool} 页面...")
        os.makedirs(page_dir, exist_ok=True)
        
        if tool == "background_removal":
            content = BACKGROUND_REMOVAL_PAGE
        elif tool == "video_download":
            content = VIDEO_DOWNLOAD_PAGE
        else:
            content = GENERIC_PAGE
        
        with open(page_path, "w") as f:
            f.write(content)
        
        log(f"✅ {tool} 页面创建完成")

def commit_changes():
    """提交代码变更"""
    log("🔄 提交代码变更...")
    project_dir = "/Users/apple/.openclaw/workspace/token-saver"
    
    try:
        subprocess.run(["git", "add", "-A"], cwd=project_dir, check=True)
        subprocess.run(
            ["git", "commit", "-m", "auto: Create missing tool pages"],
            cwd=project_dir,
            capture_output=True
        )
        subprocess.run(["git", "push", "origin", "main"], cwd=project_dir, check=True, timeout=60)
        log("✅ 代码已提交到 GitHub")
    except subprocess.CalledProcessError:
        log("⚠️ 没有新的变更需要提交")
    except Exception as e:
        log(f"❌ 提交失败: {e}")

def main():
    log("=== MediaKit 自动化工作流启动 ===")
    create_missing_pages()
    commit_changes()
    log("=== 工作流完成 ===")

BACKGROUND_REMOVAL_PAGE = '''"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Image, Upload, ArrowLeft, Download, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Navbar from "@/components/navbar";

export default function BackgroundRemovalPage() {
  const router = useRouter();
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [taskId, setTaskId] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [backgroundColor, setBackgroundColor] = useState("transparent");

  const handleFileChange = (e) => {
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
      formData.append("background_color", backgroundColor);
      const resp = await fetch("https://api.tokesave.com/api/v1/background_removal", {
        method: "POST",
        body: formData,
      });
      if (!resp.ok) throw new Error("Upload failed");
      const data = await resp.json();
      setTaskId(data.id);
      setUploading(false);
      setProcessing(true);
      pollProgress(data.id);
    } catch (err) {
      setError(err.message || "Upload failed");
      setUploading(false);
    }
  };

  const pollProgress = async (id) => {
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50">
      <Navbar />
      <div className="max-w-4xl mx-auto px-6 pt-24 pb-12">
        <button onClick={() => router.push("/")} className="flex items-center gap-2 text-slate-600 hover:text-indigo-600 mb-8 transition-colors">
          <ArrowLeft className="w-5 h-5" />
          Back to tools
        </button>

        <div className="flex items-center gap-4 mb-8">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500 flex items-center justify-center">
            <Image className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Background Removal</h1>
            <p className="text-slate-600">Remove background from images automatically</p>
          </div>
        </div>

        <Card className="p-8 border-0 shadow-xl bg-white">
          {!file ? (
            <div className="text-center">
              <div className="border-2 border-dashed border-slate-300 rounded-xl p-16 hover:border-emerald-400 transition-colors">
                <input type="file" accept=".jpg,.jpeg,.png,.webp" onChange={handleFileChange} className="hidden" id="file-upload" />
                <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center gap-4">
                  <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center">
                    <Upload className="w-10 h-10 text-emerald-600" />
                  </div>
                  <div className="text-xl font-semibold">Drop image here or click to upload</div>
                  <p className="text-sm text-slate-500">JPG, PNG, WEBP up to 50MB</p>
                </label>
              </div>
              {error && <div className="mt-4 p-4 bg-red-50 text-red-600 rounded-lg flex items-center gap-2"><AlertCircle className="w-5 h-5" />{error}</div>}
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl">
                <div className="w-12 h-12 rounded-lg bg-emerald-100 flex items-center justify-center">
                  <Image className="w-6 h-6 text-emerald-600" />
                </div>
                <div className="flex-1">
                  <div className="font-medium">{file.name}</div>
                  <div className="text-sm text-slate-500">{(file.size / 1024 / 1024).toFixed(1)} MB</div>
                </div>
              </div>

              {!result && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Background</label>
                    <div className="flex gap-3">
                      {["transparent", "white", "black"].map((bg) => (
                        <button key={bg} onClick={() => setBackgroundColor(bg)} className={`flex-1 p-3 rounded-lg border text-center transition-all capitalize ${backgroundColor === bg ? "border-emerald-500 bg-emerald-50 text-emerald-700" : "border-slate-200"}`}>
                          {bg}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {(uploading || processing) && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>{uploading ? "Uploading..." : "Processing..."}</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 transition-all duration-500" style={{ width: `${progress}%` }} />
                  </div>
                </div>
              )}

              {result && (
                <div className="space-y-4">
                  <div className="p-4 bg-green-50 text-green-700 rounded-lg flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    Background removed!
                  </div>
                  <Button variant="outline" onClick={() => window.open(`https://api.tokesave.com/api/v1/tasks/${taskId}/download`, "_blank")}>
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                </div>
              )}

              {error && <div className="p-4 bg-red-50 text-red-700 rounded-lg flex items-center gap-2"><AlertCircle className="w-5 h-5" />{error}</div>}

              {!uploading && !processing && !result && (
                <div className="flex gap-4">
                  <Button onClick={handleUpload} className="flex-1 rounded-full h-12 bg-emerald-500 hover:bg-emerald-600">Remove Background</Button>
                  <Button variant="outline" onClick={() => setFile(null)} className="rounded-full h-12">Cancel</Button>
                </div>
              )}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
'''

VIDEO_DOWNLOAD_PAGE = '''"use client";

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
  const [taskId, setTaskId] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
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
    } catch (err) {
      setError(err.message || "Download failed");
      setProcessing(false);
    }
  };

  const pollProgress = async (id) => {
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
'''

GENERIC_PAGE = '''"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, Wrench } from "lucide-react";
import { Card } from "@/components/ui/card";
import Navbar from "@/components/navbar";

export default function GenericToolPage() {
  const router = useRouter();
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50">
      <Navbar />
      <div className="max-w-4xl mx-auto px-6 pt-24 pb-12">
        <button onClick={() => router.push("/")} className="flex items-center gap-2 text-slate-600 hover:text-indigo-600 mb-8 transition-colors">
          <ArrowLeft className="w-5 h-5" />
          Back to tools
        </button>

        <div className="flex items-center gap-4 mb-8">
          <div className="w-16 h-16 rounded-2xl bg-indigo-500 flex items-center justify-center">
            <Wrench className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Coming Soon</h1>
            <p className="text-slate-600">This tool is under development.</p>
          </div>
        </div>

        <Card className="p-8 border-0 shadow-xl bg-white">
          <div className="text-center py-12">
            <Wrench className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p className="text-lg text-slate-600">This tool is under development.</p>
            <p className="text-sm text-slate-400 mt-2">Check back soon for updates.</p>
          </div>
        </Card>
      </div>
    </div>
  );
}
'''

if __name__ == "__main__":
    main()
