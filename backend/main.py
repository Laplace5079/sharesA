from fastapi import FastAPI, HTTPException, Depends, Security
from fastapi.security import APIKeyHeader
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import akshare as ak
import pandas as pd
from fastapi.responses import RedirectResponse, FileResponse
import logging
import os

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

VALID_PASSWORDS = ['friday_A66', 'shares_B88', 'report_C99', 'fast_D22', 'stock_E11']
api_key_header = APIKeyHeader(name="X-Password", auto_error=False)

def verify_password(password: str = Security(api_key_header)):
    if not password or password not in VALID_PASSWORDS:
        raise HTTPException(status_code=403, detail="Invalid password")
    return password

class LoginRequest(BaseModel):
    password: str

@app.post("/api/login")
async def login(req: LoginRequest):
    if req.password in VALID_PASSWORDS:
        return {"status": "success", "token": req.password}
    raise HTTPException(status_code=401, detail="Invalid password")

@app.get("/api/reports")
async def get_reports(stock_code: str = "000001", keyword: Optional[str] = None, password: str = Depends(verify_password)):
    try:
        logger.info(f"Fetching reports for {stock_code} with keyword {keyword}")
        # Fetch announcements from Cninfo using the correct method
        df = ak.stock_zh_a_disclosure_report_cninfo(symbol=stock_code)
        
        if df is None or df.empty:
            return []

        # Map to expected frontend keys
        # Expected keys: announcementTitle, adjunctUrl, announcementTime
        # Actual columns: ['代码', '简称', '公告标题', '公告时间', '公告链接']
        reports = []
        for _, row in df.iterrows():
            reports.append({
                "announcementTitle": row['公告标题'],
                "adjunctUrl": row['公告链接'],
                "announcementTime": row['公告时间']
            })
        
        # Filter by keyword if provided
        if keyword:
            reports = [r for r in reports if keyword.lower() in str(r.get('announcementTitle', '')).lower()]
            
        return reports
    except Exception as e:
        logger.error(f"Error fetching reports: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/download")
async def download_report(url: str, password: str = Depends(verify_password)):
    # url usually looks like "http://www.cninfo.com.cn/new/announcement/download?bulletinId=..."
    if not url.startswith("http"):
        # Prepend base url if it's just a path/ID
        if "bulletinId" in url:
            url = f"http://www.cninfo.com.cn/new/announcement/download?{url}"
        else:
            raise HTTPException(status_code=400, detail="Invalid URL")
    
    return RedirectResponse(url=url)

@app.get("/")
async def read_index():
    return FileResponse('index.html')

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
