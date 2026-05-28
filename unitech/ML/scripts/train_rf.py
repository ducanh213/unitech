import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, r2_score
import joblib
import os

print("1. Đọc dữ liệu từ DB (CSV files)...")
courses_df = pd.read_csv('EduConnect.courses.csv')
classes_df = pd.read_csv('EduConnect.classes.csv')


courses_df['isGeneral'] = courses_df['isGeneral'].fillna(False).astype(int)
course_map = dict(zip(courses_df['_id'], courses_df['code']))
is_general_map = dict(zip(courses_df['_id'], courses_df['isGeneral']))

print("2. Đang tạo Mock Data lịch sử học tập từ hệ thống của bạn...")
np.random.seed(42)
num_records = 800 


course_ids = courses_df['_id'].tolist()

data = {
    'course_id': np.random.choice(course_ids, num_records),
    'failed_students': np.random.randint(0, 50, num_records), 
    'passed_prereq': np.random.randint(30, 300, num_records) 
}
df = pd.DataFrame(data)


df['is_general'] = df['course_id'].map(is_general_map)


base_enrollment = (df['failed_students'] * 0.85) + \
                  (df['passed_prereq'] * np.where(df['is_general'] == 1, 0.80, 0.50))


df['actual_enrolled'] = np.maximum(10, base_enrollment + np.random.normal(0, 15, num_records)).astype(int)

print("3. Tiến hành Training Mô hình Random Forest...")
X = df[['failed_students', 'passed_prereq', 'is_general']]
y = df['actual_enrolled']

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)


model = RandomForestRegressor(n_estimators=150, max_depth=10, random_state=42)
model.fit(X_train, y_train)


y_pred = model.predict(X_test)
mae = mean_absolute_error(y_test, y_pred)
r2 = r2_score(y_test, y_pred)

print(f"-> R2 Score (Độ chính xác): {r2*100:.2f}%")
print(f"-> Mean Absolute Error: Lệch ~{mae:.0f} sinh viên cho mỗi dự báo")

print("4. Lưu mô hình chuẩn bị cho API Backend...")
os.makedirs('../models', exist_ok=True)
joblib.dump(model, '../models/random_forest_edu.pkl')
print(" HOÀN TẤT! File mô hình đã lưu tại: ML/models/random_forest_edu.pkl")