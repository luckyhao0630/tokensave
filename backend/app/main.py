from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime

app = FastAPI(
    title="TokenSaver API",
    description="智能压缩 LLM Token，节省 60-95% 费用",
    version="1.0.0",
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 生产环境需要限制
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 导入路由
from app.api import auth, compression, billing, proxy, admin, oauth, contact

app.include_router(auth.router)
app.include_router(compression.router)
app.include_router(billing.router)
app.include_router(proxy.router)
app.include_router(admin.router)
app.include_router(oauth.router)
app.include_router(contact.router)

@app.get("/api/v1")
async def root_api():
    return {"message": "TokenSaver API", "version": "1.0.0", "docs": "/docs"}

@app.get("/api/v1/")
async def root_api_slash():
    return {"message": "TokenSaver API", "version": "1.0.0", "docs": "/docs"}

@app.get("/")
async def root():
    return {"message": "TokenSaver API", "version": "1.0.0", "docs": "/docs"}

@app.get("/health")
async def health_check():
    return {"status": "ok", "service": "tokensaver-api", "timestamp": datetime.utcnow().isoformat()}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
