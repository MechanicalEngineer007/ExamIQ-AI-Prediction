import sys
import os
sys.stdout.reconfigure(encoding='utf-8')
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from app.database import Base, engine
from app.sample_data.seeder import seed_sample_database
from app.models.schemas import ExamConfigDB, HistoricalPaperDB, HistoricalQuestionDB
from app.database import SessionLocal
from app.ml.backtesting import ChronologicalBacktester
from app.ml.embeddings import MultilingualSemanticEngine
from app.pdf_generator.generator import OfficialStylePDFGenerator

print("Testing database creation...")
Base.metadata.create_all(bind=engine)

print("Testing sample seeder...")
seed_sample_database()

db = SessionLocal()
exams = db.query(ExamConfigDB).all()
print(f"Total exams seeded: {len(exams)}")
for e in exams:
    p_count = db.query(HistoricalPaperDB).filter(HistoricalPaperDB.exam_config_id == e.id).count()
    q_count = (
        db.query(HistoricalQuestionDB)
        .join(HistoricalPaperDB)
        .filter(HistoricalPaperDB.exam_config_id == e.id)
        .count()
    )
    print(f"Exam {e.id}: {e.title} - Papers: {p_count}, Questions: {q_count}")

# Test Chronological Backtesting for 2024
questions = (
    db.query(HistoricalQuestionDB)
    .join(HistoricalPaperDB)
    .filter(HistoricalPaperDB.exam_config_id == exams[0].id)
    .all()
)
q_dicts = [
    {
        "id": q.id,
        "question_text": q.question_text,
        "chapter": q.chapter,
        "topic": q.topic,
        "marks": q.marks,
        "year": q.year,
        "difficulty": q.difficulty
    } for q in questions
]
syllabus_dict = {
    "chapters": exams[0].syllabus.chapters,
    "is_official_weightage_available": exams[0].syllabus.is_official_weightage_available
}
bt_2024 = ChronologicalBacktester.run_backtest_for_year(
    test_year=2024,
    all_questions=q_dicts,
    syllabus=syllabus_dict,
    exam_config={"total_marks": exams[0].total_marks}
)
print("--- 2024 Backtest Results ---")
print(f"Train Range: {bt_2024['train_years_range']}")
print(f"Top 5 Topic Accuracy: {bt_2024['top5_topic_accuracy']}%")
print(f"Top 10 Topic Accuracy: {bt_2024['top10_topic_accuracy']}%")
print(f"Marks Coverage: {bt_2024['marks_coverage_pct']}%")
print(f"F1 Score: {bt_2024['semantic_matching_f1']}")
print(f"Brier Calibration: {bt_2024['brier_score_calibration']}")

# Test PDF Generation
os.makedirs("exports", exist_ok=True)
pdf_path = os.path.join("exports", "test_exam_paper.pdf")
from app.ml.predictor import HybridExamPredictor
predictor = HybridExamPredictor(target_year=2026)
topic_stats = predictor.compute_topic_stats(q_dicts, syllabus_dict)
clusters = MultilingualSemanticEngine.cluster_questions(q_dicts)
cands = predictor.score_candidate_questions(clusters, topic_stats)
slots = predictor.generate_structured_paper({"total_marks": 100}, cands)

OfficialStylePDFGenerator.create_predicted_paper_pdf(
    output_filepath=pdf_path,
    exam_config={
        "board_university": exams[0].board_university,
        "course_degree": exams[0].course_degree,
        "class_semester": exams[0].class_semester,
        "subject_name": exams[0].subject_name,
        "subject_code": exams[0].subject_code,
        "exam_type": exams[0].exam_type,
        "academic_year": exams[0].academic_year,
        "total_marks": 100,
        "duration_minutes": 180
    },
    paper_slots=slots,
    show_probabilities=True
)
print(f"Test PDF generated successfully at: {pdf_path}")
db.close()
