from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
import json

from app.models.database import get_db, User, ContactMessage
from app.api.auth import get_current_user_dependency

router = APIRouter(prefix="/api/v1", tags=["contact"])


class ContactRequest(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    subject: str
    message: str
    type: str = "support"  # support, feedback, bug, feature


def send_feishu_notification(message_data: dict):
    """发送飞书通知（简单版，不阻塞主流程）"""
    import os
    import urllib.request
    import urllib.parse
    
    # 从环境变量获取飞书 Webhook（如果有配置）
    webhook_url = os.getenv("FEISHU_WEBHOOK_URL", "")
    
    if not webhook_url:
        return
    
    try:
        data = {
            "msg_type": "text",
            "content": {
                "text": f"🚨 新用户反馈\n\n" + 
                        f"类型: {message_data.get('type', 'support')}\n" +
                        f"姓名: {message_data.get('name', '匿名')}\n" +
                        f"邮箱: {message_data.get('email', '无')}\n" +
                        f"主题: {message_data.get('subject', '')}\n" +
                        f"内容: {message_data.get('message', '')[:500]}\n\n" +
                        f"时间: {datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')} UTC"
            }
        }
        
        req = urllib.request.Request(
            webhook_url,
            data=json.dumps(data).encode('utf-8'),
            headers={'Content-Type': 'application/json'},
            method='POST'
        )
        
        with urllib.request.urlopen(req, timeout=5) as response:
            pass
    except Exception as e:
        print(f"[Notification] 飞书通知失败: {e}")


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
    
    # 发送通知（后台异步，不阻塞）
    send_feishu_notification({
        "type": request.type,
        "name": request.name or (current_user.name if current_user else "匿名"),
        "email": request.email or (current_user.email if current_user else None),
        "subject": request.subject,
        "message": request.message,
    })
    
    # 自动回复常见问题
    auto_reply = ""
    lower_msg = request.message.lower() + request.subject.lower()
    
    if "api" in lower_msg or "key" in lower_msg or "对接" in lower_msg:
        auto_reply = "\n\n【自动回复】关于 API Key 对接问题，请查看我们的教程：https://www.tokesave.com/guide"
    elif "压缩" in lower_msg or "compress" in lower_msg or "token" in lower_msg:
        auto_reply = "\n\n【自动回复】关于压缩算法和 Token 节省问题，请查看文档：https://www.tokesave.com/docs"
    elif "价格" in lower_msg or "收费" in lower_msg or "付费" in lower_msg or "pricing" in lower_msg:
        auto_reply = "\n\n【自动回复】目前限时免费活动中！所有 Pro 功能免费体验至 2026-07-08。"
    elif "退款" in lower_msg or "refund" in lower_msg:
        auto_reply = "\n\n【自动回复】退款政策请查看：https://www.tokesave.com/refund"
    
    return {
        "success": True,
        "message_id": msg.id,
        "message": "消息已提交，我们会尽快回复您" + auto_reply,
        "auto_reply": auto_reply != ""
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
