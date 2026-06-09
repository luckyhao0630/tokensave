from fastapi import APIRouter, UploadFile, File, BackgroundTasks, HTTPException, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, Dict, List
import os
import uuid
import subprocess
import tempfile

from app.models.database import get_db, Task, User
from app.api.auth import get_current_user_optional
from app.core.vocal_separator import VocalSeparator, extract_audio_from_video, merge_audio_to_video
from app.core.asr_engine import ASREngine, extract_audio
from app.core.background_remover import BackgroundRemover

router = APIRouter(prefix="/api/v1", tags=["tools"])

# ==================== Vocal Split ====================
class VocalSplitRequest(BaseModel):
    stems: int = 2
    output_format: str = "wav"

@router.post("/vocal_split")
async def create_vocal_split(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    stems: int = 2,
    output_format: str = "wav",
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    """人声分离"""
    task_id = str(uuid.uuid4())
    upload_dir = "/tmp/mediakit/uploads"
    os.makedirs(upload_dir, exist_ok=True)
    file_path = os.path.join(upload_dir, f"{task_id}_{file.filename}")
    
    with open(file_path, "wb") as f:
        content = await file.read()
        f.write(content)
    
    task = Task(id=task_id, user_id=current_user.id if current_user else None,
                tool="vocal_split", status="pending", input_file=file_path,
                result={"stems": stems, "output_format": output_format})
    db.add(task)
    db.commit()
    
    background_tasks.add_task(process_vocal_split_task, task_id, file_path, stems, output_format)
    return {"id": task_id, "status": "pending", "progress": 0}

def process_vocal_split_task(task_id, file_path, stems, output_format):
    from app.main import SessionLocal
    db = SessionLocal()
    try:
        task = db.query(Task).filter(Task.id == task_id).first()
        task.status = "processing"
        task.progress = 10
        db.commit()
        
        output_dir = f"/tmp/mediakit/outputs/{task_id}"
        os.makedirs(output_dir, exist_ok=True)
        
        audio_path = file_path
        is_video = file_path.endswith((".mp4", ".mov", ".avi", ".mkv"))
        
        if is_video:
            task.progress = 20
            db.commit()
            audio_path = os.path.join(output_dir, "extracted_audio.wav")
            extract_audio_from_video(file_path, audio_path)
        
        task.progress = 40
        db.commit()
        
        separator = VocalSeparator()
        results = separator.separate(audio_path, output_dir)
        
        task.progress = 80
        db.commit()
        
        if is_video:
            for stem_name, stem_path in list(results.items()):
                if stem_name not in ["accompaniment"]:
                    output_video = os.path.join(output_dir, f"{stem_name}_video.mp4")
                    merge_audio_to_video(file_path, stem_path, output_video)
                    results[f"{stem_name}_video"] = output_video
        
        task.status = "completed"
        task.progress = 100
        task.output_file = results.get("vocals", "")
        task.result = results
        db.commit()
    except Exception as e:
        task.status = "failed"
        task.result = {"error": str(e)}
        db.commit()
    finally:
        db.close()

# ==================== ASR / Speech to Text ====================
class ASRRequest(BaseModel):
    language: Optional[str] = None
    output_format: str = "srt"  # srt, vtt, txt, json

@router.post("/asr")
async def create_asr(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    language: Optional[str] = None,
    output_format: str = "srt",
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    """语音识别/文案提取"""
    task_id = str(uuid.uuid4())
    upload_dir = "/tmp/mediakit/uploads"
    os.makedirs(upload_dir, exist_ok=True)
    file_path = os.path.join(upload_dir, f"{task_id}_{file.filename}")
    
    with open(file_path, "wb") as f:
        content = await file.read()
        f.write(content)
    
    task = Task(id=task_id, user_id=current_user.id if current_user else None,
                tool="asr", status="pending", input_file=file_path,
                result={"language": language, "output_format": output_format})
    db.add(task)
    db.commit()
    
    background_tasks.add_task(process_asr_task, task_id, file_path, language, output_format)
    return {"id": task_id, "status": "pending", "progress": 0}

def process_asr_task(task_id, file_path, language, output_format):
    from app.main import SessionLocal
    db = SessionLocal()
    try:
        task = db.query(Task).filter(Task.id == task_id).first()
        task.status = "processing"
        task.progress = 10
        db.commit()
        
        output_dir = f"/tmp/mediakit/outputs/{task_id}"
        os.makedirs(output_dir, exist_ok=True)
        
        # 如果是视频，先提取音频
        audio_path = file_path
        if file_path.endswith((".mp4", ".mov", ".avi", ".mkv")):
            task.progress = 20
            db.commit()
            audio_path = os.path.join(output_dir, "audio.wav")
            extract_audio(file_path, audio_path)
        
        task.progress = 40
        db.commit()
        
        # 转录
        engine = ASREngine(model_name="base")
        result = engine.transcribe(audio_path, language=language)
        
        task.progress = 70
        db.commit()
        
        # 导出
        base_name = os.path.splitext(os.path.basename(file_path))[0]
        output_files = {}
        
        if output_format in ["srt", "all"]:
            srt_path = os.path.join(output_dir, f"{base_name}.srt")
            engine.export_srt(result["segments"], srt_path)
            output_files["srt"] = srt_path
        
        if output_format in ["vtt", "all"]:
            vtt_path = os.path.join(output_dir, f"{base_name}.vtt")
            engine.export_vtt(result["segments"], vtt_path)
            output_files["vtt"] = vtt_path
        
        if output_format in ["txt", "all"]:
            txt_path = os.path.join(output_dir, f"{base_name}.txt")
            engine.export_txt(result["text"], txt_path)
            output_files["txt"] = txt_path
        
        if output_format in ["json", "all"]:
            json_path = os.path.join(output_dir, f"{base_name}.json")
            engine.export_json(result, json_path)
            output_files["json"] = json_path
        
        task.status = "completed"
        task.progress = 100
        task.output_file = output_files.get(output_format, output_files.get("txt", ""))
        task.result = {**result, "output_files": output_files}
        db.commit()
    except Exception as e:
        task.status = "failed"
        task.result = {"error": str(e)}
        db.commit()
    finally:
        db.close()

# ==================== Background Removal ====================
class BackgroundRemovalRequest(BaseModel):
    background_color: Optional[str] = "transparent"  # transparent, white, black, or hex

@router.post("/background_removal")
async def create_background_removal(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    background_color: str = "transparent",
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    """图片背景移除"""
    task_id = str(uuid.uuid4())
    upload_dir = "/tmp/mediakit/uploads"
    os.makedirs(upload_dir, exist_ok=True)
    file_path = os.path.join(upload_dir, f"{task_id}_{file.filename}")
    
    with open(file_path, "wb") as f:
        content = await file.read()
        f.write(content)
    
    task = Task(id=task_id, user_id=current_user.id if current_user else None,
                tool="background_removal", status="pending", input_file=file_path,
                result={"background_color": background_color})
    db.add(task)
    db.commit()
    
    background_tasks.add_task(process_background_removal_task, task_id, file_path, background_color)
    return {"id": task_id, "status": "pending", "progress": 0}

def process_background_removal_task(task_id, file_path, background_color):
    from app.main import SessionLocal
    db = SessionLocal()
    try:
        task = db.query(Task).filter(Task.id == task_id).first()
        task.status = "processing"
        task.progress = 20
        db.commit()
        
        output_dir = f"/tmp/mediakit/outputs/{task_id}"
        os.makedirs(output_dir, exist_ok=True)
        
        base_name = os.path.splitext(os.path.basename(file_path))[0]
        
        remover = BackgroundRemover()
        
        task.progress = 50
        db.commit()
        
        if background_color == "transparent":
            output_path = os.path.join(output_dir, f"{base_name}_nobg.png")
            remover.remove_background(file_path, output_path)
        else:
            # 解析颜色
            if background_color.startswith("#"):
                r = int(background_color[1:3], 16)
                g = int(background_color[3:5], 16)
                b = int(background_color[5:7], 16)
                color = (r, g, b)
            elif background_color == "white":
                color = (255, 255, 255)
            elif background_color == "black":
                color = (0, 0, 0)
            else:
                color = (255, 255, 255)
            
            output_path = os.path.join(output_dir, f"{base_name}_bg.jpg")
            remover.replace_background(file_path, output_path, color)
        
        task.status = "completed"
        task.progress = 100
        task.output_file = output_path
        task.result = {"output_path": output_path}
        db.commit()
    except Exception as e:
        task.status = "failed"
        task.result = {"error": str(e)}
        db.commit()
    finally:
        db.close()

# ==================== Video Download ====================
class VideoDownloadRequest(BaseModel):
    url: str
    format: str = "mp4"  # mp4, mp3
    quality: str = "best"  # best, 1080p, 720p, 480p

@router.post("/video_download")
async def create_video_download(
    request: VideoDownloadRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    """视频下载"""
    task_id = str(uuid.uuid4())
    
    task = Task(id=task_id, user_id=current_user.id if current_user else None,
                tool="video_download", status="pending", input_file=request.url,
                result={"format": request.format, "quality": request.quality})
    db.add(task)
    db.commit()
    
    background_tasks.add_task(process_video_download_task, task_id, request.url, request.format, request.quality)
    return {"id": task_id, "status": "pending", "progress": 0}

def process_video_download_task(task_id, url, format, quality):
    from app.main import SessionLocal
    db = SessionLocal()
    try:
        task = db.query(Task).filter(Task.id == task_id).first()
        task.status = "processing"
        task.progress = 10
        db.commit()
        
        output_dir = f"/tmp/mediakit/outputs/{task_id}"
        os.makedirs(output_dir, exist_ok=True)
        
        # 使用 yt-dlp 下载
        import yt_dlp
        
        ydl_opts = {
            "outtmpl": os.path.join(output_dir, "%(title)s.%(ext)s"),
            "format": "best" if quality == "best" else f"best[height<={quality.replace('p', '')}]",
        }
        
        if format == "mp3":
            ydl_opts.update({
                "format": "bestaudio/best",
                "postprocessors": [{
                    "key": "FFmpegExtractAudio",
                    "preferredcodec": "mp3",
                    "preferredquality": "192",
                }],
            })
        
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=True)
            downloaded_file = ydl.prepare_filename(info)
            
            # 如果是mp3，修改扩展名
            if format == "mp3":
                downloaded_file = downloaded_file.replace(".webm", ".mp3").replace(".m4a", ".mp3")
        
        task.status = "completed"
        task.progress = 100
        task.output_file = downloaded_file
        task.result = {"title": info.get("title", ""), "duration": info.get("duration", 0)}
        db.commit()
    except Exception as e:
        task.status = "failed"
        task.result = {"error": str(e)}
        db.commit()
    finally:
        db.close()

# ==================== Task Status & Download ====================
@router.get("/tasks/{task_id}")
async def get_task_status(task_id: str, db: Session = Depends(get_db)):
    """获取任务状态"""
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    return {
        "id": task.id,
        "tool": task.tool,
        "status": task.status,
        "progress": task.progress,
        "output_file": task.output_file,
        "result": task.result,
        "created_at": task.created_at.isoformat() if task.created_at else None,
    }

@router.get("/tasks/{task_id}/download")
async def download_task_result(task_id: str, db: Session = Depends(get_db)):
    """下载任务结果"""
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task or task.status != "completed":
        raise HTTPException(status_code=400, detail="Task not completed")
    
    if not task.output_file or not os.path.exists(task.output_file):
        raise HTTPException(status_code=404, detail="Output file not found")
    
    from fastapi.responses import FileResponse
    return FileResponse(
        task.output_file,
        filename=os.path.basename(task.output_file)
    )
