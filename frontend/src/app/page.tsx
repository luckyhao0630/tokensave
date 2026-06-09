"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Upload, ArrowRight, Sparkles, Zap, Globe, Music, Image, Video, FileText, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Navbar from "@/components/navbar";
import { getToken } from "@/lib/api";

const tools = [
  {
    id: "vocal_split",
    name: "Vocal Split",
    description: "Separate vocals and instruments from audio",
    icon: Music,
    color: "bg-purple-500",
    category: "Audio",
    badge: "Popular",
  },
  {
    id: "asr",
    name: "Speech to Text",
    description: "Extract text from audio and video",
    icon: FileText,
    color: "bg-orange-500",
    category: "Audio",
  },
  {
    id: "background_removal",
    name: "Background Removal",
    description: "Remove background from images automatically",
    icon: Image,
    color: "bg-emerald-500",
    category: "Image",
  },
  {
    id: "video_download",
    name: "Video Downloader",
    description: "Download videos from YouTube, TikTok, Instagram",
    icon: Download,
    color: "bg-red-500",
    category: "Video",
    badge: "Free",
  },
];

export default function HomePage() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState("all");

  const categories = ["all", "video", "audio", "image"];

  const filteredTools =
    selectedCategory === "all"
      ? tools
      : tools.filter((t) => t.category.toLowerCase() === selectedCategory);

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50">
      <Navbar />

      <section className="pt-32 pb-20 text-center">
        <div className="max-w-4xl mx-auto px-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-100 text-indigo-700 text-sm font-medium mb-8">
            <Sparkles className="w-4 h-4" />
            20+ AI Tools for Video, Audio & Image
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">
            AI-Powered
            <br />
            <span className="text-indigo-600">Media Toolkit</span>
          </h1>

          <p className="text-xl text-slate-600 max-w-2xl mx-auto mb-10">
            One platform for all your media needs. Translate videos, separate vocals,
            remove backgrounds, and more — powered by AI.
          </p>

          <div className="flex flex-wrap justify-center gap-3 mb-8">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-6 py-3 rounded-full text-sm font-medium transition-all ${
                  selectedCategory === cat
                    ? "bg-indigo-600 text-white shadow-lg"
                    : "bg-white text-slate-700 hover:bg-slate-100 border"
                }`}
              >
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">All Tools</h2>
            <p className="text-lg text-slate-600">Choose the right tool for your task</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredTools.map((tool) => (
              <Card
                key={tool.id}
                className="p-6 border-0 shadow-sm hover:shadow-xl hover:scale-[1.02] transition-all cursor-pointer bg-white"
                onClick={() => router.push(`/tools/${tool.id}`)}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-2xl ${tool.color} flex items-center justify-center shrink-0`}>
                    <tool.icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold">{tool.name}</h3>
                      {tool.badge && (
                        <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-xs font-medium">
                          {tool.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-slate-600">{tool.description}</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-slate-400 shrink-0" />
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Why MediaKit?</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Zap, title: "AI-Powered", desc: "State-of-the-art AI models for best results" },
              { icon: Globe, title: "20+ Languages", desc: "Support for all major languages" },
              { icon: Video, title: "All Formats", desc: "Video, audio, and image processing" },
            ].map((feature) => (
              <Card key={feature.title} className="p-8 border-0 shadow-none bg-transparent">
                <div className="w-12 h-12 rounded-2xl bg-indigo-100 flex items-center justify-center mb-6">
                  <feature.icon className="w-6 h-6 text-indigo-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-slate-600">{feature.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
