"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Upload, ArrowRight, Sparkles, Zap, Globe, Music, Image, Video, FileText, Download, Wand2, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Navbar from "@/components/navbar";

const featuredTools = [
  {
    id: "video_translate",
    name: "Video Translate",
    description: "Translate videos to 12+ languages with AI dubbing",
    icon: Globe,
    color: "bg-blue-500",
    popular: true,
  },
  {
    id: "vocal_split",
    name: "Vocal Split",
    description: "Separate vocals and instruments from any audio",
    icon: Music,
    color: "bg-purple-500",
    popular: true,
  },
  {
    id: "background_removal",
    name: "Background Removal",
    description: "Remove image backgrounds automatically",
    icon: Image,
    color: "bg-emerald-500",
    popular: false,
  },
  {
    id: "asr",
    name: "Speech to Text",
    description: "Extract text from audio and video files",
    icon: FileText,
    color: "bg-orange-500",
    popular: false,
  },
];

export default function HomePage() {
  const router = useRouter();
  const [dragActive, setDragActive] = useState(false);

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
      router.push("/tools/asr");
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-32 pb-20 text-center">
        <div className="max-w-4xl mx-auto px-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 text-indigo-700 text-sm font-medium mb-8">
            <Sparkles className="w-4 h-4" />
            20+ AI Tools for Video, Audio & Image
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">
            One Platform.
            <br />
            <span className="text-indigo-600">All Your Media.</span>
          </h1>

          <p className="text-xl text-slate-500 max-w-2xl mx-auto mb-12">
            Translate videos, separate vocals, remove backgrounds, and more — all powered by AI. No installation needed.
          </p>

          {/* Quick Upload */}
          <Card 
            className={`p-8 max-w-2xl mx-auto border-2 border-dashed transition-all cursor-pointer ${
              dragActive 
                ? "border-indigo-500 bg-indigo-50 shadow-xl scale-[1.02]" 
                : "border-slate-300 hover:border-indigo-400 hover:shadow-lg"
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center mx-auto mb-4">
                <Upload className="w-8 h-8 text-indigo-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Drop any file to get started</h3>
              <p className="text-sm text-slate-500 mb-4">
                Video, audio, or image — we'll automatically suggest the best tool
              </p>
              <div className="flex justify-center gap-2 text-xs text-slate-400">
                <span className="flex items-center gap-1"><Video className="w-3 h-3" /> MP4</span>
                <span className="flex items-center gap-1"><Music className="w-3 h-3" /> MP3</span>
                <span className="flex items-center gap-1"><Image className="w-3 h-3" /> JPG</span>
                <span className="flex items-center gap-1"><Wand2 className="w-3 h-3" /> +20 formats</span>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Featured Tools */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3">Popular Tools</h2>
            <p className="text-slate-500">Most used by our community</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredTools.map((tool) => (
              <Card
                key={tool.id}
                className="p-6 border-0 shadow-sm hover:shadow-xl hover:scale-[1.02] transition-all cursor-pointer bg-white group"
                onClick={() => router.push(`/tools/${tool.id}`)}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-2xl ${tool.color} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
                    <tool.icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold">{tool.name}</h3>
                      {tool.popular && (
                        <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-xs font-medium">
                          Popular
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-slate-500 leading-relaxed">{tool.description}</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-slate-300 shrink-0 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 text-emerald-700 text-sm font-medium mb-6">
              <Star className="w-4 h-4" />
              Simple, Transparent Pricing
            </div>
            <h2 className="text-4xl font-bold mb-4">Choose Your Plan</h2>
            <p className="text-lg text-slate-500">
              Start free, upgrade when you need more
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: "Free",
                price: "$0",
                period: "/month",
                features: [
                  "5 tasks per day",
                  "Basic quality",
                  "Watermark on output",
                  "Community support",
                ],
                cta: "Get Started",
                highlight: false,
              },
              {
                name: "Pro",
                price: "$19",
                period: "/month",
                features: [
                  "Unlimited tasks",
                  "HD quality output",
                  "No watermark",
                  "Priority processing",
                  "All 20+ tools",
                ],
                cta: "Start Free Trial",
                highlight: true,
              },
              {
                name: "Team",
                price: "$49",
                period: "/month",
                features: [
                  "Everything in Pro",
                  "5 team members",
                  "API access",
                  "Custom integrations",
                  "Dedicated support",
                ],
                cta: "Contact Sales",
                highlight: false,
              },
            ].map((plan) => (
              <Card
                key={plan.name}
                className={`p-8 border-0 ${
                  plan.highlight
                    ? "bg-indigo-600 text-white shadow-xl ring-2 ring-indigo-600 scale-105"
                    : "bg-white shadow-sm border border-slate-200"
                }`}
              >
                <div className="mb-6">
                  <div className={`text-sm font-medium mb-2 ${plan.highlight ? "text-indigo-200" : "text-slate-500"}`}>
                    {plan.name}
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className={plan.highlight ? "text-indigo-200" : "text-slate-400"}>{plan.period}</span>
                  </div>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-3 text-sm">
                      <Zap className={`w-4 h-4 shrink-0 ${plan.highlight ? "text-indigo-300" : "text-emerald-500"}`} />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button
                  className={`w-full rounded-full h-12 ${
                    plan.highlight
                      ? "bg-white text-indigo-600 hover:bg-indigo-50"
                      : "bg-indigo-600 text-white hover:bg-indigo-700"
                  }`}
                >
                  {plan.cta}
                </Button>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Why DubBot */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Why DubBot?</h2>
            <p className="text-lg text-slate-500">Trusted by creators worldwide</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Zap,
                title: "AI-Powered",
                desc: "State-of-the-art AI models for best results",
              },
              {
                icon: Globe,
                title: "20+ Languages",
                desc: "Support for all major languages",
              },
              {
                icon: Video,
                title: "All Formats",
                desc: "Video, audio, and image processing",
              },
            ].map((feature) => (
              <Card key={feature.title} className="p-8 border-0 shadow-none bg-transparent">
                <div className="w-12 h-12 rounded-2xl bg-indigo-100 flex items-center justify-center mb-6">
                  <feature.icon className="w-6 h-6 text-indigo-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-slate-500">{feature.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
