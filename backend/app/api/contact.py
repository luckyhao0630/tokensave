from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from datetime import datetime

from app.models.database import get_db, User, ContactMessage
from app.api.auth import get_current_user_dependency

router = APIRouter(prefix="/api/v1", tags=["contact"])


class ContactRequest(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    subject: str
    message: str
    type: str = "support"  # support, feedback, bug, feature


@router.post("/contact")
async def submit_contact(
    request: ContactRequest,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_dependency)
):
    """提交联系/反馈消息"""
    
    # 创建消息记录
    msg = ContactMessage(
        user_id=current_user.id if current_user else None,
        name=request.name or (current_user.name if current_user else "匿名"),
        email=request.email or (current_user.email if current_user else None),
        subject=request.subject,
        message=request.message,
        type=request.type,
        status="new",
        created_at=datetime.utcnow(),
    )
    
    db.add(msg)
    db.commit()
    db.refresh(msg)
    
    # TODO: 发送通知到管理员（飞书/邮件）
    # send_notification_to_admin(msg)
    
    return {
        "success": True,
        "message_id": msg.id,
        "message": "消息已提交，我们会尽快回复您"
    }


@router.get("/contact/messages")
async def get_messages(
    status: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_dependency)
):
    """获取消息列表（仅管理员）"""
    # 检查管理员权限
    if current_user.email != "luckyhao0630@gmail.com":
        raise HTTPException(status_code=403, detail="需要管理员权限")
    
    query = db.query(ContactMessage)
    if status:
        query = query.filter(ContactMessage.status == status)
    
    messages = query.order_by(ContactMessage.created_at.desc()).all()
    
    return [
        {
            "id": m.id,
            "user_id": m.user_id,
            "name": m.name,
            "email": m.email,
            "subject": m.subject,
            "message": m.message,
            "type": m.type,
            "status": m.status,
            "created_at": m.created_at.isoformat() if m.created_at else None,
            "replied_at": m.replied_at.isoformat() if m.replied_at else None,
        }
        for m in messages
    ]


@router.post("/contact/messages/{message_id}/reply")
async def reply_message(
    message_id: int,
    reply: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_dependency)
):
    """回复消息（仅管理员）"""
    if current_user.email != "luckyhao0630@gmail.com":
        raise HTTPException(status_code=403, detail="需要管理员权限")
    
    msg = db.query(ContactMessage).filter(ContactMessage.id == message_id).first()
    if not msg:
        raise HTTPException(status_code=404, detail="消息不存在")
    
    msg.status = "replied"
    msg.reply = reply.get("reply")
    msg.replied_at = datetime.utcnow()
    msg.replied_by = current_user.id
    
    db.commit()
    
    # TODO: 发送回复通知给用户
    
    return {"success": True, "message": "回复已发送"}


@router.get("/stats/public")
async def get_public_stats(db: Session = Depends(get_db)):
    """获取公开统计数据"""
    from sqlalchemy import func
    
    total_users = db.query(func.count(User.id)).scalar() or 0
    # 今日注册
    today = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    new_users_today = db.query(func.count(User.id)).filter(
        User.created_at >= today
    ).scalar() or 0
    
    return {
        "total_users": total_users,
        "new_users_today": new_users_today,
        "active_promo": True,
        "promo_end_date": "2026-07-08",
    }
