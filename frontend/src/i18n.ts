import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  en: {
    translation: {
      "nav": {
        "features": "Tools",
        "pricing": "Pricing",
        "guide": "Guide",
        "docs": "Docs",
        "contact": "Contact",
        "login": "Login",
        "start": "Get Started",
        "dashboard": "Dashboard"
      },
      "hero": {
        "badge": "20+ AI Tools for Video, Audio & Image",
        "title": "AI-Powered",
        "highlight": "Media Toolkit",
        "subtitle": "One platform for all your media needs. Translate videos, separate vocals, remove backgrounds, and more — powered by AI.",
        "cta_primary": "Get Started Free",
        "cta_secondary": "View Tools",
      },
      "tools": {
        "vocal_split": {
          "name": "Vocal Split",
          "description": "Separate vocals and instruments from audio",
          "category": "Audio",
          "badge": "Popular"
        },
        "asr": {
          "name": "Speech to Text",
          "description": "Extract text from audio and video",
          "category": "Audio"
        },
        "background_removal": {
          "name": "Background Removal",
          "description": "Remove background from images automatically",
          "category": "Image"
        },
        "video_download": {
          "name": "Video Downloader",
          "description": "Download videos from YouTube, TikTok, Instagram",
          "category": "Video",
          "badge": "Free"
        },
        "all_tools": "All Tools",
        "choose_tool": "Choose the right tool for your task",
        "why_title": "Why MediaKit?",
        "ai_powered": "AI-Powered",
        "ai_powered_desc": "State-of-the-art AI models for best results",
        "multilingual": "20+ Languages",
        "multilingual_desc": "Support for all major languages",
        "all_formats": "All Formats",
        "all_formats_desc": "Video, audio, and image processing",
      },
      "vocal_split": {
        "title": "Vocal Split",
        "subtitle": "Separate vocals and instruments from audio",
        "upload": "Drop audio/video here or click to upload",
        "formats": "MP3, WAV, FLAC, MP4, MOV up to 200MB",
        "separation_mode": "Separation Mode",
        "2stems": "2 Stems",
        "2stems_desc": "Vocals + Accompaniment",
        "4stems": "4 Stems",
        "4stems_desc": "Vocals + Drums + Bass + Other",
        "output_format": "Output Format",
        "wav": "WAV (Lossless)",
        "mp3": "MP3 (Compressed)",
        "flac": "FLAC (Lossless)",
        "start": "Start Separation",
        "cancel": "Cancel",
        "uploading": "Uploading...",
        "separating": "Separating...",
        "complete": "Separation complete!",
        "download": "Download",
        "vocals": "Vocals",
        "accompaniment": "Accompaniment",
        "drums": "Drums",
        "bass": "Bass",
        "other": "Other"
      },
      "asr": {
        "title": "Speech to Text",
        "subtitle": "Extract text from audio and video",
        "upload": "Drop audio/video here or click to upload",
        "formats": "MP3, WAV, FLAC, MP4, MOV up to 200MB",
        "language": "Language",
        "auto_detect": "Auto Detect",
        "output_format": "Output Format",
        "start": "Start Transcription",
        "cancel": "Cancel",
        "uploading": "Uploading...",
        "transcribing": "Transcribing...",
        "complete": "Transcription complete!",
        "download": "Download"
      },
      "background_removal": {
        "title": "Background Removal",
        "subtitle": "Remove background from images automatically",
        "upload": "Drop image here or click to upload",
        "formats": "JPG, PNG, WEBP up to 50MB",
        "background": "Background",
        "transparent": "Transparent",
        "white": "White",
        "black": "Black",
        "custom": "Custom Color",
        "start": "Remove Background",
        "cancel": "Cancel",
        "uploading": "Uploading...",
        "processing": "Processing...",
        "complete": "Background removed!",
        "download": "Download"
      },
      "video_download": {
        "title": "Video Downloader",
        "subtitle": "Download videos from YouTube, TikTok, Instagram",
        "url": "Video URL",
        "url_placeholder": "Paste YouTube, TikTok, or Instagram URL here",
        "format": "Format",
        "video": "Video (MP4)",
        "audio": "Audio (MP3)",
        "quality": "Quality",
        "best": "Best",
        "1080p": "1080p",
        "720p": "720p",
        "480p": "480p",
        "start": "Download",
        "cancel": "Cancel",
        "processing": "Downloading...",
        "complete": "Download complete!",
        "download": "Download File"
      },
      "common": {
        "loading": "Loading...",
        "error": "Error",
        "retry": "Retry",
        "back": "Back",
        "logout": "Logout",
        "continue": "Continue",
        "save": "Save",
        "close": "Close"
      }
    }
  },
  zh: {
    translation: {
      "nav": {
        "features": "工具",
        "pricing": "定价",
        "guide": "教程",
        "docs": "文档",
        "contact": "联系",
        "login": "登录",
        "start": "开始使用",
        "dashboard": "Dashboard"
      },
      "hero": {
        "badge": "20+ 个视频/音频/图片 AI 工具",
        "title": "AI 驱动的",
        "highlight": "媒体工具箱",
        "subtitle": "一个平台满足所有媒体需求。视频翻译、人声分离、背景移除等功能，全部由 AI 驱动。",
        "cta_primary": "免费开始",
        "cta_secondary": "查看工具",
      },
      "tools": {
        "vocal_split": {
          "name": "人声分离",
          "description": "从音频中分离人声和伴奏",
          "category": "音频",
          "badge": "热门"
        },
        "asr": {
          "name": "语音转文字",
          "description": "从音频和视频中提取文字",
          "category": "音频"
        },
        "background_removal": {
          "name": "背景移除",
          "description": "自动移除图片背景",
          "category": "图片"
        },
        "video_download": {
          "name": "视频下载",
          "description": "下载 YouTube、TikTok、Instagram 视频",
          "category": "视频",
          "badge": "免费"
        },
        "all_tools": "所有工具",
        "choose_tool": "选择适合你的工具",
        "why_title": "为什么选择 MediaKit？",
        "ai_powered": "AI 驱动",
        "ai_powered_desc": "使用最先进的 AI 模型，获得最佳效果",
        "multilingual": "20+ 语言",
        "multilingual_desc": "支持所有主流语言",
        "all_formats": "全格式",
        "all_formats_desc": "视频、音频、图片处理",
      },
      "vocal_split": {
        "title": "人声分离",
        "subtitle": "从音频中分离人声和伴奏",
        "upload": "拖放音频/视频到这里或点击上传",
        "formats": "MP3, WAV, FLAC, MP4, MOV 最大 200MB",
        "separation_mode": "分离模式",
        "2stems": "2 轨",
        "2stems_desc": "人声 + 伴奏",
        "4stems": "4 轨",
        "4stems_desc": "人声 + 鼓 + 贝斯 + 其他",
        "output_format": "输出格式",
        "wav": "WAV (无损)",
        "mp3": "MP3 (压缩)",
        "flac": "FLAC (无损)",
        "start": "开始分离",
        "cancel": "取消",
        "uploading": "上传中...",
        "separating": "分离中...",
        "complete": "分离完成！",
        "download": "下载",
        "vocals": "人声",
        "accompaniment": "伴奏",
        "drums": "鼓",
        "bass": "贝斯",
        "other": "其他"
      },
      "asr": {
        "title": "语音转文字",
        "subtitle": "从音频和视频中提取文字",
        "upload": "拖放音频/视频到这里或点击上传",
        "formats": "MP3, WAV, FLAC, MP4, MOV 最大 200MB",
        "language": "语言",
        "auto_detect": "自动检测",
        "output_format": "输出格式",
        "start": "开始转录",
        "cancel": "取消",
        "uploading": "上传中...",
        "transcribing": "转录中...",
        "complete": "转录完成！",
        "download": "下载"
      },
      "background_removal": {
        "title": "背景移除",
        "subtitle": "自动移除图片背景",
        "upload": "拖放图片到这里或点击上传",
        "formats": "JPG, PNG, WEBP 最大 50MB",
        "background": "背景",
        "transparent": "透明",
        "white": "白色",
        "black": "黑色",
        "custom": "自定义颜色",
        "start": "移除背景",
        "cancel": "取消",
        "uploading": "上传中...",
        "processing": "处理中...",
        "complete": "背景已移除！",
        "download": "下载"
      },
      "video_download": {
        "title": "视频下载",
        "subtitle": "下载 YouTube、TikTok、Instagram 视频",
        "url": "视频链接",
        "url_placeholder": "粘贴 YouTube、TikTok 或 Instagram 链接",
        "format": "格式",
        "video": "视频 (MP4)",
        "audio": "音频 (MP3)",
        "quality": "画质",
        "best": "最佳",
        "1080p": "1080p",
        "720p": "720p",
        "480p": "480p",
        "start": "下载",
        "cancel": "取消",
        "processing": "下载中...",
        "complete": "下载完成！",
        "download": "下载文件"
      },
      "common": {
        "loading": "加载中...",
        "error": "错误",
        "retry": "重试",
        "back": "返回",
        "logout": "退出",
        "continue": "继续",
        "save": "保存",
        "close": "关闭"
      }
    }
  },
  ja: {
    translation: {
      "nav": {
        "features": "ツール",
        "pricing": "価格",
        "guide": "ガイド",
        "docs": "ドキュメント",
        "contact": "お問い合わせ",
        "login": "ログイン",
        "start": "始める",
        "dashboard": "ダッシュボード"
      },
      "hero": {
        "badge": "20+ 動画/音声/画像 AI ツール",
        "title": "AI 駆動の",
        "highlight": "メディアツールキット",
        "subtitle": "動画翻訳、ボーカル分離、背景削除など、AI を活用したメディア処理ツール。",
        "cta_primary": "無料で始める",
        "cta_secondary": "ツールを見る",
      }
    }
  },
  es: {
    translation: {
      "nav": {
        "features": "Herramientas",
        "pricing": "Precios",
        "guide": "Guía",
        "docs": "Docs",
        "contact": "Contacto",
        "login": "Iniciar sesión",
        "start": "Empezar",
        "dashboard": "Panel"
      },
      "hero": {
        "badge": "20+ Herramientas AI para Video, Audio e Imagen",
        "title": "Kit de Herramientas",
        "highlight": "AI Media",
        "subtitle": "Una plataforma para todas tus necesidades de medios. Traduce videos, separa voces, elimina fondos y más.",
        "cta_primary": "Empezar Gratis",
        "cta_secondary": "Ver Herramientas",
      }
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en', // 默认英文
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
    },
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
