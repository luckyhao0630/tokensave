"""
语音识别引擎 - 使用 Whisper
支持多语言、时间轴、说话人分离
"""

import os
import subprocess
import json
import tempfile
from typing import List, Dict, Optional
import whisper
from datetime import timedelta

class ASREngine:
    """语音识别引擎"""
    
    def __init__(self, model_name="base"):
        self.model = whisper.load_model(model_name)
        
    def transcribe(self, audio_path: str, language: Optional[str] = None, 
                   with_timestamps: bool = True, with_diarization: bool = False) -> Dict:
        """
        转录音频
        
        Args:
            audio_path: 音频文件路径
            language: 语言代码 (en, zh, ja, etc.)，None则自动检测
            with_timestamps: 是否包含时间轴
            with_diarization: 是否进行说话人分离（需要额外模型）
            
        Returns:
            dict: {
                text: 完整文本,
                language: 检测到的语言,
                segments: [{id, start, end, text, speaker?}]
            }
        """
        
        # 使用 Whisper 转录
        options = {
            "verbose": False,
            "fp16": False,
        }
        
        if language:
            options["language"] = language
        
        result = self.model.transcribe(audio_path, **options)
        
        segments = []
        for i, seg in enumerate(result["segments"]):
            segment = {
                "id": i,
                "start": round(seg["start"], 2),
                "end": round(seg["end"], 2),
                "text": seg["text"].strip(),
            }
            segments.append(segment)
        
        return {
            "text": result["text"].strip(),
            "language": result.get("language", "unknown"),
            "segments": segments,
        }
    
    def export_srt(self, segments: List[Dict], output_path: str):
        """导出 SRT 字幕格式"""
        with open(output_path, "w", encoding="utf-8") as f:
            for seg in segments:
                f.write(f"{seg['id'] + 1}\n")
                f.write(f"{self._format_time(seg['start'])} --> {self._format_time(seg['end'])}\n")
                f.write(f"{seg['text']}\n\n")
    
    def export_vtt(self, segments: List[Dict], output_path: str):
        """导出 VTT 字幕格式"""
        with open(output_path, "w", encoding="utf-8") as f:
            f.write("WEBVTT\n\n")
            for seg in segments:
                f.write(f"{self._format_time_vtt(seg['start'])} --> {self._format_time_vtt(seg['end'])}\n")
                f.write(f"{seg['text']}\n\n")
    
    def export_txt(self, text: str, output_path: str):
        """导出纯文本"""
        with open(output_path, "w", encoding="utf-8") as f:
            f.write(text)
    
    def export_json(self, result: Dict, output_path: str):
        """导出 JSON 格式"""
        with open(output_path, "w", encoding="utf-8") as f:
            json.dump(result, f, ensure_ascii=False, indent=2)
    
    def _format_time(self, seconds: float) -> str:
        """格式化为 SRT 时间格式 HH:MM:SS,mmm"""
        td = timedelta(seconds=seconds)
        hours, remainder = divmod(td.seconds, 3600)
        minutes, seconds = divmod(remainder, 60)
        milliseconds = int(td.microseconds / 1000)
        return f"{hours:02d}:{minutes:02d}:{seconds:02d},{milliseconds:03d}"
    
    def _format_time_vtt(self, seconds: float) -> str:
        """格式化为 VTT 时间格式 HH:MM:SS.mmm"""
        td = timedelta(seconds=seconds)
        hours, remainder = divmod(td.seconds, 3600)
        minutes, seconds = divmod(remainder, 60)
        milliseconds = int(td.microseconds / 1000)
        return f"{hours:02d}:{minutes:02d}:{seconds:02d}.{milliseconds:03d}"

# 从视频提取音频
def extract_audio(video_path: str, output_audio_path: str, sample_rate: int = 16000):
    """从视频提取音频"""
    cmd = [
        "ffmpeg", "-y", "-i", video_path,
        "-vn", "-acodec", "pcm_s16le", "-ar", str(sample_rate), "-ac", "1",
        output_audio_path
    ]
    subprocess.run(cmd, capture_output=True, check=True)
    return output_audio_path
