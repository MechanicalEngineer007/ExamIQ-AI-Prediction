import sqlite3, os
p = "C:/Users/#Rajan Appa Gawade/.gemini/antigravity/scratch/exam-paper-prediction/backend/exam_prediction.db"
conn = sqlite3.connect(p)
rows = conn.execute("SELECT id, title, board_university, course_degree FROM exam_configs").fetchall()
for r in rows:
    print(r)
