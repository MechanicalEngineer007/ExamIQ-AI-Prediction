import datetime
from typing import List, Optional, Dict, Any
from sqlalchemy import Column, Integer, String, Float, Boolean, Text, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from pydantic import BaseModel, Field
from app.database import Base

# ================= SQLAlchemy ORM Models =================

class ExamConfigDB(Base):
    __tablename__ = "exam_configs"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    board_university = Column(String(255), nullable=False)
    course_degree = Column(String(255), nullable=False)
    class_semester = Column(String(100), nullable=False)
    subject_name = Column(String(255), nullable=False)
    subject_code = Column(String(50), default="SUB-101")
    exam_type = Column(String(100), default="Annual/End Semester")
    total_marks = Column(Integer, default=100)
    duration_minutes = Column(Integer, default=180)
    academic_year = Column(String(50), default="2025-2026")
    default_language = Column(String(20), default="en") # en, mr, hi
    pattern_structure = Column(JSON, default=dict)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    papers = relationship("HistoricalPaperDB", back_populates="exam_config", cascade="all, delete-orphan")
    syllabus = relationship("SyllabusDB", back_populates="exam_config", uselist=False, cascade="all, delete-orphan")
    predictions = relationship("PredictedPaperDB", back_populates="exam_config", cascade="all, delete-orphan")
    backtests = relationship("BacktestResultDB", back_populates="exam_config", cascade="all, delete-orphan")


class SyllabusDB(Base):
    __tablename__ = "syllabus"

    id = Column(Integer, primary_key=True, index=True)
    exam_config_id = Column(Integer, ForeignKey("exam_configs.id"))
    academic_year = Column(String(50))
    status = Column(String(50), default="active")
    is_official_weightage_available = Column(Boolean, default=True)
    chapters = Column(JSON, default=list) # List of chapters with topics, official weightage, deleted_topics
    learning_objectives = Column(JSON, default=list)
    raw_document_url = Column(String(500), nullable=True)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow)

    exam_config = relationship("ExamConfigDB", back_populates="syllabus")


class HistoricalPaperDB(Base):
    __tablename__ = "historical_papers"

    id = Column(Integer, primary_key=True, index=True)
    exam_config_id = Column(Integer, ForeignKey("exam_configs.id"))
    year = Column(Integer, nullable=False, index=True)
    session = Column(String(50), default="Summer")
    language = Column(String(20), default="en")
    total_marks = Column(Integer, default=100)
    ocr_status = Column(String(50), default="verified") # pending, verified, corrected
    raw_file_name = Column(String(255), nullable=True)
    file_path = Column(String(500), nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    exam_config = relationship("ExamConfigDB", back_populates="papers")
    questions = relationship("HistoricalQuestionDB", back_populates="paper", cascade="all, delete-orphan")


class HistoricalQuestionDB(Base):
    __tablename__ = "historical_questions"

    id = Column(Integer, primary_key=True, index=True)
    paper_id = Column(Integer, ForeignKey("historical_papers.id"))
    q_number = Column(String(50), nullable=False)
    sub_q_number = Column(String(50), default="")
    section_name = Column(String(100), default="Section A")
    is_compulsory = Column(Boolean, default=True)
    question_text = Column(Text, nullable=False)
    marks = Column(Integer, default=5)
    difficulty = Column(String(30), default="Medium") # Easy, Medium, Hard
    chapter = Column(String(200), nullable=False)
    topic = Column(String(200), nullable=False)
    subtopic = Column(String(200), default="")
    question_type = Column(String(50), default="Descriptive") # Descriptive, Numerical, Analytical, Short
    language = Column(String(20), default="en")
    year = Column(Integer, index=True)
    cluster_id = Column(Integer, default=-1)
    is_verified = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    paper = relationship("HistoricalPaperDB", back_populates="questions")


class PredictedPaperDB(Base):
    __tablename__ = "predicted_papers"

    id = Column(Integer, primary_key=True, index=True)
    exam_config_id = Column(Integer, ForeignKey("exam_configs.id"))
    target_year = Column(Integer, default=2026)
    title = Column(String(255), nullable=False)
    total_marks = Column(Integer, default=100)
    duration_minutes = Column(Integer, default=180)
    language = Column(String(20), default="en")
    paper_structure = Column(JSON, default=list) # Full structured questions with supplementary predictions
    methodology_summary = Column(JSON, default=dict)
    pdf_path = Column(String(500), nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    exam_config = relationship("ExamConfigDB", back_populates="predictions")


class BacktestResultDB(Base):
    __tablename__ = "backtest_results"

    id = Column(Integer, primary_key=True, index=True)
    exam_config_id = Column(Integer, ForeignKey("exam_configs.id"))
    test_year = Column(Integer, nullable=False) # e.g. 2024 or 2025
    train_years = Column(String(100), nullable=False) # e.g. "2011-2023"
    top5_topic_accuracy = Column(Float, default=0.0)
    top10_topic_accuracy = Column(Float, default=0.0)
    semantic_matching_f1 = Column(Float, default=0.0)
    precision_at_k = Column(Float, default=0.0)
    recall_at_k = Column(Float, default=0.0)
    marks_coverage_pct = Column(Float, default=0.0)
    marks_weightage_accuracy = Column(Float, default=0.0)
    brier_score_calibration = Column(Float, default=0.0)
    details = Column(JSON, default=dict) # Matched items, missed items, false positives, calibration curve
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    exam_config = relationship("ExamConfigDB", back_populates="backtests")


class ModelFeedbackDB(Base):
    __tablename__ = "model_feedback"

    id = Column(Integer, primary_key=True, index=True)
    exam_config_id = Column(Integer, nullable=False)
    question_text = Column(Text, nullable=False)
    predicted_topic = Column(String(200), default="")
    actual_question_text = Column(Text, default="")
    feedback_type = Column(String(50), default="correct") # correct, partially_correct, incorrect, same_concept_diff_wording, wrong_topic
    user_comment = Column(Text, default="")
    is_verified_post_exam = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)


# ================= Pydantic Schemas for API =================

class ExamConfigCreate(BaseModel):
    title: str
    board_university: str
    course_degree: str
    class_semester: str
    subject_name: str
    subject_code: Optional[str] = "SUB-101"
    exam_type: Optional[str] = "Annual/End Semester"
    total_marks: Optional[int] = 100
    duration_minutes: Optional[int] = 180
    academic_year: Optional[str] = "2025-2026"
    default_language: Optional[str] = "en"
    pattern_structure: Optional[Dict[str, Any]] = None

class ExamConfigResponse(ExamConfigCreate):
    id: int
    created_at: datetime.datetime

    class Config:
        from_attributes = True

class QuestionItemSchema(BaseModel):
    id: Optional[int] = None
    q_number: str
    sub_q_number: Optional[str] = ""
    section_name: Optional[str] = "Section A"
    is_compulsory: Optional[bool] = True
    question_text: str
    marks: int = 5
    difficulty: Optional[str] = "Medium"
    chapter: str
    topic: str
    subtopic: Optional[str] = ""
    question_type: Optional[str] = "Descriptive"
    language: Optional[str] = "en"
    year: Optional[int] = 2024
    cluster_id: Optional[int] = -1
    is_verified: Optional[bool] = True

class OCRCorrectionRequest(BaseModel):
    paper_id: int
    questions: List[QuestionItemSchema]

class PredictionSlotAlternative(BaseModel):
    slot_label: str # e.g. "Q.1(A)"
    question_text: str
    chapter: str
    topic: str
    marks: int
    difficulty: str
    ml_probability: float # Calibrated e.g. 78.4
    prediction_confidence: str # High, Moderate, Exploratory
    historical_supporting_years: List[int]
    semantic_similarity_to_base: float

class PredictionSlot(BaseModel):
    slot_id: str # e.g. "Q.1"
    section_name: str
    instruction: Optional[str] = ""
    is_compulsory: bool
    marks: int
    primary_predicted_question: str
    chapter: str
    topic: str
    difficulty: str
    primary_ml_probability: float
    confidence_tier: str
    supporting_years: List[int]
    additional_predictions: List[PredictionSlotAlternative]

class GeneratePredictionRequest(BaseModel):
    exam_config_id: int
    target_year: int = 2026
    language: str = "en"
    include_supplementary: bool = True
    temperature_balance: float = 0.5 # 0 = strict historical, 1 = high novelty/gaps

class ModelFeedbackRequest(BaseModel):
    exam_config_id: int
    question_text: str
    predicted_topic: str
    actual_question_text: Optional[str] = ""
    feedback_type: str
    user_comment: Optional[str] = ""
    is_verified_post_exam: Optional[bool] = False
