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
    # Cây tiên quyết đầy đủ theo đúng curriculum (môn -> các môn MỞ KHÓA sau khi qua)
    tech_tree = {
        # General
        "ENG101": ["ENG102"],
        # WEB
        "WEB101": ["WEB201"],
        "WEB102": ["WEB202", "WEB203"],
        "WEB103": ["WEB202", "WEB303"],
        "WEB201": ["WEB301"],
        "WEB202": ["WEB302"],
        "WEB203": ["WEB301", "WEB302"],
        "WEB301": ["WEB402", "WEB403"],
        "WEB302": ["WEB401", "WEB402", "WEB403"],
        "WEB303": [],
        "WEB401": [],
        "WEB402": [],
        "WEB403": [],
        # DS
        "DS101": ["DS201", "DS202"],
        "DS102": ["DS201"],
        "DS103": ["DS203", "DS303"],
        "DS201": ["DS301", "DS302"],
        "DS202": ["DS302"],
        "DS203": ["DS303"],
        "DS301": ["DS401", "DS402", "DS403"],
        "DS302": ["DS403"],
        "DS303": [],
        "DS401": [],
        "DS402": [],
        "DS403": [],
        # MOB
        "MOB101": ["MOB201", "MOB202"],
        "MOB102": [],
        "MOB103": ["MOB301"],
        "MOB201": ["MOB301", "MOB302"],
        "MOB202": [],
        "MOB203": ["MOB303"],
        "MOB301": ["MOB401", "MOB402", "MOB403"],
        "MOB302": ["MOB402", "MOB403"],
        "MOB303": [],
        "MOB401": [],
        "MOB402": [],
        "MOB403": [],
        # DES
        "DES101": ["DES201", "DES303", "DES401"],
        "DES102": ["DES201"],
        "DES103": ["DES202", "DES302"],
        "DES201": ["DES301", "DES402", "DES403"],
        "DES202": ["DES301"],
        "DES203": [],
        "DES301": ["DES402", "DES403"],
        "DES302": ["DES403"],
        "DES303": [],
        "DES401": [],
        "DES402": [],
        "DES403": [],
    }

    passed = set(data.passed_courses)
    failed = set(data.failed_courses)
    retry_recs = []   # Môn cần học lại (trượt, chưa qua)
    next_recs  = []   # Môn tiếp theo (đã qua tiên quyết)

    # 1. Gợi ý HỌC LẠI các môn trượt (ưu tiên cao nhất)
    for c in failed:
        if c not in passed:
            retry_recs.append(c)

    # 2. Gợi ý MÔN TIẾP THEO từ các môn đã qua
    for c in passed:
        for next_c in tech_tree.get(c, []):
            if next_c not in passed and next_c not in failed and next_c not in next_recs:
                next_recs.append(next_c)

    # Gộp: học lại trước, sau đó môn tiếp theo
    recommendations = retry_recs + [r for r in next_recs if r not in retry_recs]

    # Nếu không có gợi ý nào → gợi ý môn đại cương mở đầu
    if not recommendations:
        for starter in ["ENG101", "WEB101", "DS101", "MOB101", "DES101"]:
            if starter not in passed:
                recommendations.append(starter)
                break

    rec_list = recommendations[:3]  # Gợi ý tối đa 3 môn
    return {"status": "success", "recommendations": rec_list}

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8080)