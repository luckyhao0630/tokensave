"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Wand2, Sparkles, Zap, Globe, Video, Music, Image, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Navbar from "@/components/navbar";
import { getToken } from "@/lib/api";

export default function HomePage() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState("video");

  const toolCategories: Record<string, { name: string; icon: any; tools: { id: string; name: string; desc: string }[] }> = {
  video: {
    name: "Video",
    icon: Video,
    tools: [
      { id: "video_translate", name: "Video Translate", desc: "Translate video to any language with AI dubbing" },
      { id: "asr", name: "Speech to Text", desc: "Extract text from audio and video" },
      { id: "video_download", name: "Video Downloader", desc: "Download from YouTube, TikTok, Instagram" },
      { id: "video_cartoonizer", name: "Video to Anime", desc: "Convert videos to anime style" },
      { id: "remove_video_text", name: "Remove Video Text", desc: "Remove text overlays from videos" },
      { id: "remove_object", name: "Remove Object", desc: "Remove unwanted objects from videos" },
      { id: "video_to_gif", name: "Video to GIF", desc: "Convert videos to GIF format" },
    ],
  },
  image: {
    name: "Image",
    icon: Image,
    tools: [
      { id: "background_removal", name: "Background Removal", desc: "Remove background from images" },
      { id: "super_resolution", name: "Super Resolution", desc: "Upscale images with AI" },
      { id: "image_inpainting", name: "Image Inpainting", desc: "Remove objects from images" },
      { id: "image_cartoonizer", name: "Image to Anime", desc: "Convert images to anime style" },
      { id: "image_translate", name: "Image Translate", desc: "Translate text in images" },
      { id: "remove_image_text", name: "Remove Image Text", desc: "Remove text from images" },
      { id: "ai_replace_text", name: "AI Replace Text", desc: "Replace text in images with AI" },
    ],
  },
  audio: {
    name: "Audio",
    icon: Music,
    tools: [
      { id: "vocal_split", name: "Vocal Split", desc: "Separate vocals and instruments" },
      { id: "speech_to_text", name: "Speech to Text", desc: "Transcribe audio to text" },
      { id: "text_to_speech", name: "Text to Speech", desc: "Convert text to natural speech" },
      { id: "video_to_audio", name: "Video to Audio", desc: "Extract audio from videos" },
      { id: "audio_trim", name: "Audio Trim", desc: "Trim and cut audio files" },
      { id: "audio_mixing", name: "Audio Mixing", desc: "Mix multiple audio tracks" },
      { id: "audio_concat", name: "Audio Concat", desc: "Merge audio files together" },
    ],
  },
};

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

          {/* Category Navigation */}
          <div className="mt-8">
            <div className="flex justify-center gap-4 mb-6">
              {Object.entries(toolCategories).map(([key, category]) => {
                const Icon = category.icon;
                return (
                  <button
                    key={key}
                    onClick={() => setSelectedCategory(key)}
                    onMouseEnter={() => setSelectedCategory(key)}
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-medium transition-all ${
                      selectedCategory === key
                        ? "bg-indigo-600 text-white shadow-lg scale-105"
                        : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200 hover:border-indigo-300"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {category.name}
                    <span className="text-xs opacity-70">({category.tools.length})</span>
                  </button>
                );
              })}
            </div>

            {/* Sub-category Tools Grid */}
            <div className="max-w-6xl mx-auto">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {selectedCategory && toolCategories[selectedCategory]?.tools.map((tool) => (
                  <Card
                    key={tool.id}
                    className="p-4 border-0 shadow-sm hover:shadow-xl hover:scale-[1.02] transition-all cursor-pointer bg-white/80 backdrop-blur-sm"
                    onClick={() => router.push(`/tools/${tool.id}`)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center shrink-0">
                        <Wand2 className="w-5 h-5 text-indigo-600" />
                      </div>
                      <div className="text-left">
                        <h3 className="font-medium text-sm">{tool.name}</h3>
                        <p className="text-xs text-slate-500 line-clamp-1">{tool.desc}</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* All Tools by Category */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">All Tools</h2>
            <p className="text-lg text-slate-600">20+ AI-powered tools for your creative needs</p>
          </div>

          {Object.entries(toolCategories).map(([key, category]) => {
            const Icon = category.icon;
            return (
              <div key={key} className="mb-12">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-indigo-600" />
                  </div>
                  <h3 className="text-xl font-semibold">{category.name} Tools</h3>
                  <span className="text-sm text-slate-500">{category.tools.length} tools</span>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {category.tools.map((tool) => (
                    <Card
                      key={tool.id}
                      className="p-5 border-0 shadow-sm hover:shadow-xl hover:scale-[1.02] transition-all cursor-pointer bg-white group"
                      onClick={() => router.push(`/tools/${tool.id}`)}
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                          <Wand2 className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold mb-1">{tool.name}</h4>
                          <p className="text-sm text-slate-600 line-clamp-2">{tool.desc}</p>
                        </div>
                        <ArrowRight className="w-5 h-5 text-slate-400 shrink-0 group-hover:text-indigo-600 transition-colors" />
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            );
          })}
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
