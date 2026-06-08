"""
初始化管理员账号
"""
import sys
import os

# 添加项目路径
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.models.database import get_db, User, SessionLocal
from app.services.auth import get_password_hash
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import os

# 从环境变量获取数据库URL
DATABASE_URL = os.environ.get("DATABASE_URL", "postgresql://neondb_owner:npg_9U8oZHLFbMfh@ep-patient-art-aprjrzrd-pooler.c-7.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require")

def init_admin():
    """创建默认管理员账号"""
    engine = create_engine(DATABASE_URL)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = SessionLocal()
    
    try:
        # 检查管理员是否已存在
        admin = db.query(User).filter(User.email == "luckyhao0630@gmail.com").first()
        
        if admin:
            print(f"✅ 管理员账号已存在: {admin.email}")
            # 确保plan是enterprise
            if admin.plan != "enterprise":
                admin.plan = "enterprise"
                db.commit()
                print(f"✅ 已更新管理员权限")
        else:
            # 创建管理员账号
            admin = User(
                email="luckyhao0630@gmail.com",
                hashed_password=get_password_hash("admin123456"),
                name="管理员",
                plan="enterprise",
                is_active=True
            )
            db.add(admin)
            db.commit()
            db.refresh(admin)
            print(f"✅ 管理员账号创建成功: {admin.email}")
            print(f"🔑 默认密码: admin123456")
            
        print(f"\n管理员信息:")
        print(f"  邮箱: {admin.email}")
        print(f"  名称: {admin.name}")
        print(f"  套餐: {admin.plan}")
        print(f"  ID: {admin.id}")
        
    except Exception as e:
        print(f"❌ 错误: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    init_admin()
