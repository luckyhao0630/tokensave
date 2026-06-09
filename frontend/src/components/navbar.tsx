"use client";

import { Button } from "@/components/ui/button";
import { Wand2, Video, Music, Image, ChevronDown } from "lucide-react";
import Link from "next/link";
import { getToken } from "@/lib/api";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import LanguageSwitcher from "./language-switcher";
import { useTranslation } from "react-i18next";

const toolCategories = {
  video: {
    name: "Video",
    icon: Video,
    tools: [
      { id: "video_translate", name: "Video Translate" },
      { id: "asr", name: "Speech to Text" },
      { id: "video_download", name: "Video Downloader" },
      { id: "video_cartoonizer", name: "Video to Anime" },
      { id: "remove_video_text", name: "Remove Video Text" },
      { id: "remove_object", name: "Remove Object" },
      { id: "video_to_gif", name: "Video to GIF" },
    ],
  },
  image: {
    name: "Image",
    icon: Image,
    tools: [
      { id: "background_removal", name: "Background Removal" },
      { id: "super_resolution", name: "Super Resolution" },
      { id: "image_inpainting", name: "Image Inpainting" },
      { id: "image_cartoonizer", name: "Image to Anime" },
      { id: "image_translate", name: "Image Translate" },
      { id: "remove_image_text", name: "Remove Image Text" },
      { id: "ai_replace_text", name: "AI Replace Text" },
    ],
  },
  audio: {
    name: "Audio",
    icon: Music,
    tools: [
      { id: "vocal_split", name: "Vocal Split" },
      { id: "speech_to_text", name: "Speech to Text" },
      { id: "text_to_speech", name: "Text to Speech" },
      { id: "video_to_audio", name: "Video to Audio" },
      { id: "audio_trim", name: "Audio Trim" },
      { id: "audio_mixing", name: "Audio Mixing" },
      { id: "audio_concat", name: "Audio Concat" },
    ],
  },
};

export default function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const pathname = usePathname();
  const { t } = useTranslation();

  useEffect(() => {
    setIsLoggedIn(!!getToken());
  }, [pathname]);

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-xl bg-white/90 border-b border-slate-200/50">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center">
            <Wand2 className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-xl tracking-tight text-slate-900">DubBot</span>
        </Link>

        {/* Category Navigation - Center */}
        <div className="hidden lg:flex items-center gap-1">
          {Object.entries(toolCategories).map(([key, category]) => {
            const Icon = category.icon;
            const isActive = activeCategory === key;
            
            return (
              <div
                key={key}
                className="relative"
                onMouseEnter={() => setActiveCategory(key)}
                onMouseLeave={() => setActiveCategory(null)}
              >
                <button
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? "bg-indigo-50 text-indigo-700"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {category.name}
                  <ChevronDown className={`w-3 h-3 transition-transform ${isActive ? "rotate-180" : ""}`} />
                </button>

                {/* Dropdown Menu */}
                {isActive && (
                  <div className="absolute top-full left-0 mt-1 w-56 bg-white rounded-xl shadow-lg border border-slate-200 py-2 z-50">
                    {category.tools.map((tool) => (
                      <Link
                        key={tool.id}
                        href={`/tools/${tool.id}`}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors"
                      >
                        <div className="w-2 h-2 rounded-full bg-indigo-400" />
                        {tool.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-3">
          <LanguageSwitcher />
          
          <Link href="/pricing" className="hidden md:block text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
            {t('nav.pricing')}
          </Link>
          
          {isLoggedIn ? (
            <Link href="/dashboard">
              <Button size="sm" className="rounded-full px-5 bg-indigo-600 hover:bg-indigo-700">
                {t('nav.dashboard')}
              </Button>
            </Link>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm" className="text-slate-600">
                  {t('nav.login')}
                </Button>
              </Link>
              <Link href="/register">
                <Button size="sm" className="rounded-full px-5 bg-indigo-600 hover:bg-indigo-700">
                  {t('nav.start')}
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
