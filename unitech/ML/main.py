# ML/main.py
from fastapi import FastAPI
from pydantic import BaseModel
import joblib
import pandas as pd
import uvicorn
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="EduConnect AI Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)




# ----- FEATURE 1: DỰ BÁO RỦI RO TRƯỢT MÔN -----
from typing import List, Optional

class StudentGrades(BaseModel):
    student_id: str
    attendance: Optional[float] = None
    midterm: Optional[float] = None
    final: Optional[float] = None

class RiskRequest(BaseModel):
    students: List[StudentGrades]

@app.post("/predict-risk")
async def predict_risk(data: RiskRequest):
    results = []
    for s in data.students:
        att = s.attendance if s.attendance is not None else 0
        mid = s.midterm if s.midterm is not None else 0
        fin = s.final if s.final is not None else 0
        
        if s.attendance is None and s.midterm is None and s.final is None:
            risk = "Chưa có điểm"
        elif s.final is not None:
            # Đã thi cuối kỳ -> Tính điểm tổng kết chính xác
            score = att * 0.1 + mid * 0.3 + fin * 0.6
            if score < 4.0:
                risk = "🔴 Rớt môn"
            elif score < 5.5:
                risk = "🟡 Cần chú ý"
            else:
                risk = "🟢 An toàn"
        else:
            # Chưa thi cuối kỳ -> Dự báo rủi ro dựa trên chuyên cần và giữa kỳ
            score = att * 0.3 + mid * 0.7
            if score < 4.0:
                risk = "🔴 Nguy cơ cao"
            elif score < 5.5:
                risk = "🟡 Cần chú ý"
            else:
                risk = "🟢 An toàn"
        results.append({"student_id": s.student_id, "risk_level": risk})
    return {"status": "success", "predictions": results}

# ----- FEATURE 2: GỢI Ý LỘ TRÌNH HỌC TẬP -----
class PathRequest(BaseModel):
    passed_courses: List[str]
    failed_courses: List[str] = []

@app.post("/recommend-path")
async def recommend_path(data: PathRequest):
    # Cây môn học (Tech-tree) dựa trên 21 môn thực tế (Trung tâm)
    tech_tree = {
        "WEB101": ["WEB102", "WEB201", "WEB202"],
        "WEB102": ["WEB301"],
        "WEB201": ["WEB301"],
        "DS101": ["DS102", "DS202"],
        "DS102": ["DS201"],
        "DS201": ["DS301"],
        "MOB101": ["MOB102"],
        "MOB102": ["MOB201"],
        "MOB201": ["MOB301"],
        "DES101": ["DES102"],
        "DES102": ["DES201"],
        "DES201": ["DES301"]
    }
    
    passed = set(data.passed_courses)
    failed = set(data.failed_courses)
    recommendations = set()
    
    # 1. Ưu tiên gợi ý HỌC LẠI các môn rớt
    for c in failed:
        if c not in passed:
            recommendations.add(c)
    
    for c in passed:
        if c in tech_tree:
            for next_c in tech_tree[c]:
                if next_c not in passed:
                    recommendations.add(next_c)
                    
    # Nếu chưa có môn nào cần học (cả học lại và lộ trình), gợi ý môn đại cương dùng chung cho tất cả các ngành
    if not recommendations:
        if "ENG101" not in passed and "ENG101" not in failed: recommendations.add("ENG101")
        if "PM101" not in passed and "PM101" not in failed: recommendations.add("PM101")
        if "SOFT101" not in passed and "SOFT101" not in failed: recommendations.add("SOFT101")
            
    rec_list = list(recommendations)[:3] # Gợi ý tối đa 3 môn
    return {"status": "success", "recommendations": rec_list}

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8080)