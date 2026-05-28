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


try:
    model = joblib.load("models/random_forest_edu.pkl")
    print("[SUCCESS] Da tai mo hinh Random Forest thanh cong!")
except:
    print("[ERROR] Khong tim thay file models/random_forest_edu.pkl. Hay chay script huan luyen truoc.")

# Cấu trúc dữ liệu yêu cầu từ NodeJS gửi sang
class PredictionRequest(BaseModel):
    course_id: str
    course_name: str
    failed_students: int
    passed_prerequisite: int
    is_core_course: int 

@app.post("/predict-demand")
async def predict(data: PredictionRequest):

    input_data = pd.DataFrame([[
        data.failed_students, 
        data.passed_prerequisite, 
        data.is_core_course
    ]], columns=['failed_students', 'passed_prereq', 'is_general'])
    

    prediction = model.predict(input_data)[0]
    predicted_count = int(round(prediction))
    

    suggested_classes = (predicted_count // 40) + (1 if predicted_count % 40 > 0 else 0)
    
    return {
        "course_name": data.course_name,
        "predicted_students": predicted_count,
        "suggested_classes": suggested_classes,
        "status": "success"
    }

# ----- FEATURE 1: DỰ BÁO RỦI RO TRƯỢT MÔN -----
from typing import List, Optional

class StudentGrades(BaseModel):
    student_id: str
    attendance: Optional[float] = None
    midterm: Optional[float] = None

class RiskRequest(BaseModel):
    students: List[StudentGrades]

@app.post("/predict-risk")
async def predict_risk(data: RiskRequest):
    results = []
    for s in data.students:
        att = s.attendance if s.attendance is not None else 0
        mid = s.midterm if s.midterm is not None else 0
        
        if s.attendance is None and s.midterm is None:
            risk = "Chưa có điểm"
        else:
            # Mô hình dựa trên luật (Heuristic) demo
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
    # Giả lập cây môn học (Tech-tree)
    tech_tree = {
        "CS101": ["CS201", "IT001"],
        "CS201": ["CS301", "IT204"],
        "MA101": ["MA102"],
        "IT001": ["IT002"],
        "IT002": ["IT004"],
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
                    
    # Nếu chưa có môn nào cần học (cả học lại và lộ trình), gợi ý môn đại cương
    if not recommendations:
        if "CS101" not in passed and "CS101" not in failed: recommendations.add("CS101")
        if "MA101" not in passed and "MA101" not in failed: recommendations.add("MA101")
            
    rec_list = list(recommendations)[:3] # Gợi ý tối đa 3 môn
    return {"status": "success", "recommendations": rec_list}

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8080)