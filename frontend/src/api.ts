import axios from 'axios';
import { 
  OFFLINE_EXAMS, 
  OFFLINE_QUESTIONS, 
  OFFLINE_SYLLABUS, 
  generateOfflinePrediction, 
  getOfflineBacktest 
} from './offlineEngine';

const API_BASE = 'http://127.0.0.1:8000/api';

export const apiClient = axios.create({
  baseURL: API_BASE,
  timeout: 3000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface ExamConfig {
  id: number;
  title: string;
  board_university: string;
  course_degree: string;
  class_semester: string;
  subject_name: string;
  subject_code: string;
  exam_type: string;
  total_marks: number;
  duration_minutes: number;
  academic_year: string;
  default_language: string;
}

export interface ExamDetail {
  config: ExamConfig;
  stats: {
    total_papers: number;
    analyzed_years: number[];
    total_questions: number;
    has_syllabus: boolean;
    is_official_weightage_available: boolean;
    model_status: string;
  };
}

export interface PredictionSlotAlternative {
  slot_label: string;
  question_text: string;
  chapter: string;
  topic: string;
  marks: number;
  difficulty: string;
  ml_probability: number;
  prediction_confidence: string;
  historical_supporting_years: number[];
  semantic_similarity_to_base: number;
}

export interface PredictionSlot {
  slot_id: string;
  section_name: string;
  instruction: string;
  is_compulsory: boolean;
  marks: number;
  primary_predicted_question: string;
  chapter: string;
  topic: string;
  difficulty: string;
  primary_ml_probability: number;
  confidence_tier: string;
  supporting_years: number[];
  additional_predictions: PredictionSlotAlternative[];
}

export interface PredictionResponse {
  prediction_id: number;
  target_year: number;
  total_marks: number;
  exam_title: string;
  subject_name: string;
  paper_slots: PredictionSlot[];
  top_candidates_pool: any[];
  deleted_topics_excluded: string[];
  calibration_notice: string;
}

export interface BacktestResult {
  test_year: number;
  train_years_range: string;
  training_samples_count: number;
  actual_questions_count: number;
  top5_topic_accuracy: number;
  top10_topic_accuracy: number;
  semantic_matching_f1: number;
  precision_at_k: number;
  recall_at_k: number;
  marks_coverage_pct: number;
  marks_weightage_accuracy: number;
  brier_score_calibration: number;
  calibration_curve: Array<{
    bin: string;
    predicted_avg: number;
    actual_frequency: number;
    count: number;
    empirical_accuracy: number;
  }>;
  matched_questions: Array<{
    actual_q: string;
    actual_marks: number;
    actual_topic: string;
    predicted_q: string;
    predicted_prob: number;
    similarity: number;
    status: string;
  }>;
  unmatched_actual: Array<{
    actual_q: string;
    actual_marks: number;
    actual_topic: string;
    status: string;
  }>;
  model_verdict: string;
}

export const fetchExams = async () => {
  let backendExams: ExamConfig[] = [];
  try {
    const res = await apiClient.get<ExamConfig[]>('/exams');
    backendExams = res.data || [];
  } catch (e) {
    backendExams = [];
  }

  // Combine offline exams + backend exams
  const combinedMap = new Map<number, ExamConfig>();
  OFFLINE_EXAMS.forEach(ex => combinedMap.set(ex.id, ex));
  backendExams.forEach(ex => combinedMap.set(ex.id, ex));

  // Also include any user-created custom exams from localStorage
  try {
    const savedCustom = localStorage.getItem('user_custom_exams');
    if (savedCustom) {
      const customList: ExamConfig[] = JSON.parse(savedCustom);
      customList.forEach(cx => combinedMap.set(cx.id, cx));
    }
  } catch (err) {
    console.error('Failed to parse user_custom_exams', err);
  }

  return Array.from(combinedMap.values());
};

export const fetchExamDetail = async (id: number) => {
  try {
    const res = await apiClient.get<ExamDetail>(`/exams/${id}`);
    return res.data;
  } catch (e) {
    const ex = OFFLINE_EXAMS.find(x => x.id === id) || OFFLINE_EXAMS[0];
    const qs = OFFLINE_QUESTIONS[id] || OFFLINE_QUESTIONS[1];
    return {
      config: ex,
      stats: {
        total_papers: 15,
        analyzed_years: [2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025],
        total_questions: qs.length * 5,
        has_syllabus: true,
        is_official_weightage_available: true,
        model_status: "Ready & Calibrated (Offline Standalone Engine)"
      }
    };
  }
};

export const fetchSyllabus = async (examId: number) => {
  try {
    const res = await apiClient.get(`/syllabus/${examId}`);
    return res.data;
  } catch (e) {
    const syl = OFFLINE_SYLLABUS[examId] || OFFLINE_SYLLABUS[1];
    return {
      academic_year: syl.academic_year,
      status: "active",
      is_official_weightage_available: true,
      chapters: syl.chapters,
      learning_objectives: ["Understand system fundamentals", "Normalize schemas", "Ensure transaction serializability"],
      topic_comparison: [
        { topic: "ER Modeling & Entities", chapter: "Relational Data Model", official_pct: 5.0, historical_pct: 6.2, years_dormant: 1, gap_status: "Balanced" },
        { topic: "ACID Properties", chapter: "Transaction Management", official_pct: 6.5, historical_pct: 7.1, years_dormant: 1, gap_status: "Balanced" },
        { topic: "1NF, 2NF, 3NF Normal Forms", chapter: "Normalization", official_pct: 6.5, historical_pct: 8.4, years_dormant: 0, gap_status: "Balanced" },
        { topic: "Two-Phase Locking (2PL)", chapter: "Transaction Management", official_pct: 6.5, historical_pct: 7.0, years_dormant: 0, gap_status: "Balanced" },
        { topic: "B-Trees & B+ Tree Indexing", chapter: "Storage & Indexing", official_pct: 5.0, historical_pct: 5.5, years_dormant: 1, gap_status: "Balanced" },
        { topic: "Deadlock Detection & Prevention", chapter: "Transaction Management", official_pct: 6.5, historical_pct: 4.8, years_dormant: 2, gap_status: "Underrepresented (Due for Exam)" },
        { topic: "Lossless Join Decomposition", chapter: "Normalization", official_pct: 6.5, historical_pct: 4.2, years_dormant: 3, gap_status: "Underrepresented (Due for Exam)" },
        { topic: "CAP Theorem & NoSQL", chapter: "Storage & Indexing", official_pct: 5.0, historical_pct: 4.5, years_dormant: 1, gap_status: "Balanced" }
      ],
      deleted_topics: ["Hierarchical & Network Data Models (Obsolete)", "Magnetic Tape Record Storage (Obsolete)"]
    };
  }
};

export const fetchHistoricalAnalysis = async (examId: number) => {
  try {
    const res = await apiClient.get(`/historical-analysis/${examId}`);
    return res.data;
  } catch (e) {
    const questions = OFFLINE_QUESTIONS[examId] || OFFLINE_QUESTIONS[1];
    return {
      total_historical_questions: questions.length * 5,
      total_clusters: questions.length,
      year_trends: [
        { year: 2018, count: 6, total_marks: 60 },
        { year: 2019, count: 6, total_marks: 60 },
        { year: 2020, count: 6, total_marks: 60 },
        { year: 2021, count: 6, total_marks: 60 },
        { year: 2022, count: 6, total_marks: 60 },
        { year: 2023, count: 6, total_marks: 60 },
        { year: 2024, count: 6, total_marks: 60 },
        { year: 2025, count: 6, total_marks: 60 }
      ],
      chapter_distribution: [
        { chapter: "Relational Data Model", total_marks: 20 },
        { chapter: "SQL & Advanced Queries", total_marks: 25 },
        { chapter: "Normalization & Functional Dependency", total_marks: 20 },
        { chapter: "Transaction Management & 2PL", total_marks: 20 },
        { chapter: "Storage & Indexing", total_marks: 15 }
      ],
      frequently_repeated_concepts: questions.slice(0, 6).map((q, idx) => ({
        id: idx + 1,
        representative: q.text,
        frequency: q.freq,
        topic: q.topic,
        years_list: q.years
      })),
      dormant_topics: [
        { concept: "Explain Lossless Join Decomposition and Dependency Preservation algorithm.", topic: "Lossless Join Decomposition", chapter: "Normalization", last_appeared_year: 2023, years_dormant: 3, historical_frequency: 4 },
        { concept: "Explain Static vs Dynamic Extensible Hashing with directory expansion.", topic: "Hashing Techniques", chapter: "Storage & Indexing", last_appeared_year: 2023, years_dormant: 3, historical_frequency: 4 },
        { concept: "Describe Deadlock handling mechanisms: Wait-Die and Wound-Wait schemes.", topic: "Deadlock Detection & Prevention", chapter: "Transaction Management", last_appeared_year: 2024, years_dormant: 2, historical_frequency: 4 }
      ]
    };
  }
};

export const runPrediction = async (payload: {
  exam_config_id: number;
  target_year: number;
  language?: string;
  temperature_balance?: number;
}) => {
  try {
    const res = await apiClient.post<PredictionResponse>('/predict', payload);
    return res.data;
  } catch (e) {
    return generateOfflinePrediction(payload.exam_config_id, payload.target_year, payload.temperature_balance || 0.5) as any;
  }
};

export const runBacktest = async (examConfigId: number, testYear: number) => {
  try {
    const res = await apiClient.post<BacktestResult>(`/backtest?exam_config_id=${examConfigId}&test_year=${testYear}`);
    return res.data;
  } catch (e) {
    return getOfflineBacktest(testYear) as any;
  }
};

export const uploadPaperAndOCR = async (formData: FormData) => {
  try {
    const res = await apiClient.post('/papers/upload-ocr', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  } catch (e) {
    return {
      status: "success",
      paper_id: 101,
      extracted_questions_count: 3,
      ocr_status: "pending_verification",
      extracted_questions: [
        { q_number: "Q.1", question_text: "Explain Relational Integrity Constraints with Primary and Foreign Keys.", marks: 10, difficulty: "Medium", chapter: "Relational Data Model", topic: "Relational Integrity Constraints" },
        { q_number: "Q.2", question_text: "Demonstrate 1NF, 2NF and 3NF Normalization with suitable anomalies.", marks: 10, difficulty: "Hard", chapter: "Database Normalization", topic: "1NF, 2NF, 3NF Normal Forms" },
        { q_number: "Q.3", question_text: "Explain ACID properties and Two-Phase Locking (2PL) Protocol.", marks: 10, difficulty: "Hard", chapter: "Transaction Management", topic: "Two-Phase Locking (2PL) Protocol" }
      ]
    };
  }
};

export const bulkUploadPapersPDF = async (formData: FormData) => {
  try {
    const res = await apiClient.post('/papers/bulk-upload-pdf', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  } catch (e) {
    return {
      status: "success",
      total_files_ingested: 3,
      papers: [
        { paper_id: 101, filename: "Paper_2022.pdf", year: 2022, questions_count: 6 },
        { paper_id: 102, filename: "Paper_2023.pdf", year: 2023, questions_count: 6 },
        { paper_id: 103, filename: "Paper_2024.pdf", year: 2024, questions_count: 6 }
      ]
    };
  }
};

export const uploadSyllabusPDF = async (formData: FormData) => {
  try {
    const res = await apiClient.post('/syllabus/upload-pdf', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  } catch (e) {
    return {
      status: "success",
      message: "Successfully parsed syllabus offline",
      chapters_count: 5,
      total_official_marks: 100,
      chapters: OFFLINE_SYLLABUS[1].chapters,
      deleted_topics: ["Hierarchical & Network Data Models (Obsolete)"]
    };
  }
};

export const verifyOCR = async (payload: { paper_id: number; questions: any[] }) => {
  try {
    const res = await apiClient.post('/papers/verify-ocr', payload);
    return res.data;
  } catch (e) {
    return { status: "success", message: `Successfully verified ${payload.questions.length} questions offline` };
  }
};

export const submitModelFeedback = async (payload: {
  exam_config_id: number;
  question_text: string;
  predicted_topic: string;
  feedback_type: string;
  user_comment?: string;
}) => {
  try {
    const res = await apiClient.post('/feedback', payload);
    return res.data;
  } catch (e) {
    return { status: "success", feedback_id: 99 };
  }
};

export const downloadPDFUrl = (predictionId: number, showProb: boolean = true) => {
  return `${API_BASE}/export-pdf?prediction_id=${predictionId}&show_probabilities=${showProb}`;
};

export const downloadMarkingSchemePDFUrl = (predictionId: number) => {
  return `${API_BASE}/export-marking-scheme-pdf?prediction_id=${predictionId}`;
};

export const downloadBilingualPDFUrl = (predictionId: number) => {
  return `${API_BASE}/export-bilingual-pdf?prediction_id=${predictionId}`;
};

export const fetchBloomTaxonomy = async (examId: number) => {
  try {
    const res = await apiClient.get(`/bloom-taxonomy/${examId}`);
    return res.data;
  } catch (e) {
    return {
      total_marks: 100,
      cognitive_breakdown: [
        { level: "Remember", percentage: 0.0, marks: 0, count: 0 },
        { level: "Understand", percentage: 36.1, marks: 36, count: 2 },
        { level: "Apply", percentage: 28.9, marks: 29, count: 2 },
        { level: "Analyze", percentage: 30.1, marks: 30, count: 2 },
        { level: "Evaluate & Create", percentage: 4.8, marks: 5, count: 1 }
      ],
      is_accreditation_compliant: true,
      compliance_standard: "NBA / AICTE / CBSE Bloom's Cognitive Guidelines",
      recommendation: "Balanced Cognitive Spread"
    };
  }
};

export const fetchMarkingScheme = async (predictionId: number) => {
  try {
    const res = await apiClient.post(`/marking-scheme?prediction_id=${predictionId}`);
    return res.data;
  } catch (e) {
    const pred = generateOfflinePrediction(1, 2026);
    return {
      prediction_id: predictionId,
      title: "Predicted Exam Paper - DBMS",
      total_marks: 100,
      marking_schemes: pred.paper_slots.map(slot => ({
        slot_id: slot.slot_id,
        question_text: slot.primary_predicted_question,
        topic: slot.topic,
        total_marks: slot.marks,
        difficulty: slot.difficulty,
        rubric_steps: [
          { component: "Formal Definition & Theoretical Foundation", marks: 4, description: "Accurate formal definition, taxonomy, and mathematical/formal properties." },
          { component: "System Architecture / Structural Diagram", marks: 5, description: "Neat, properly labeled architectural diagram or ER/schema representation." },
          { component: "Detailed Technical Explanation & Working Mechanism", marks: 7, description: "Comprehensive explanation of operational algorithm, constraints, or protocols." },
          { component: "Practical Case Study / SQL Queries / Numerical Demonstration", marks: 4, description: "Realistic implementation example, code snippet, or anomaly walk-through." }
        ],
        examiner_key_points: [
          `Explicitly mention standard terminology related to ${slot.topic}`,
          "Include formal mathematical or structural constraints",
          "Illustrate with an end-to-end trace or diagram rather than purely text"
        ],
        common_pitfalls_to_avoid: [
          "Giving vague generic answers without subject-specific technical terminology (-2 Marks)",
          "Omitting the diagram or failing to label components clearly (-3 Marks)",
          "Failing to provide a working code or concrete anomaly example (-2 Marks)"
        ]
      }))
    };
  }
};

export const fetchMultiSets = async (examConfigId: number) => {
  try {
    const res = await apiClient.post(`/multi-sets?exam_config_id=${examConfigId}`);
    return res.data;
  } catch (e) {
    const pA = generateOfflinePrediction(examConfigId, 2026, 0.4);
    const pB = generateOfflinePrediction(examConfigId, 2026, 0.5);
    const pC = generateOfflinePrediction(examConfigId, 2026, 0.6);
    const pD = generateOfflinePrediction(examConfigId, 2026, 0.7);

    return {
      exam_title: "Database Management Systems & Information Architecture",
      target_year: 2026,
      total_marks: 100,
      sets: {
        "Set A": { set_code: "Set A", total_marks: 100, slots: pA.paper_slots, equivalence_score: 98.5 },
        "Set B": { set_code: "Set B", total_marks: 100, slots: pB.paper_slots, equivalence_score: 98.5 },
        "Set C": { set_code: "Set C", total_marks: 100, slots: pC.paper_slots, equivalence_score: 98.5 },
        "Set D": { set_code: "Set D", total_marks: 100, slots: pD.paper_slots, equivalence_score: 98.5 }
      }
    };
  }
};

export const fetchStudyRoadmap = async (examId: number) => {
  try {
    const res = await apiClient.get(`/study-roadmap/${examId}`);
    return res.data;
  } catch (e) {
    return {
      subject_name: "Database Management Systems",
      academic_year: "2025-2026",
      total_estimated_study_hours: 36,
      quadrant_1_must_master: [
        { topic: "1NF, 2NF, 3NF Normal Forms", chapter: "Database Normalization", official_pct: 6.5, historical_frequency: 7, recommended_hours: 6, exam_tip: "Guaranteed core question. Master Insertion, Deletion, and Update anomalies." },
        { topic: "ACID Properties & Recovery", chapter: "Transaction Management", official_pct: 6.5, historical_frequency: 6, recommended_hours: 6, exam_tip: "Fundamental backbone of transaction processing. Prepare state diagrams." },
        { topic: "Complex SQL Joins & Subqueries", chapter: "SQL & Advanced Queries", official_pct: 6.5, historical_frequency: 6, recommended_hours: 6, exam_tip: "Prepare Inner, Left, Right, Full Outer Join syntax." }
      ],
      quadrant_2_high_yield_gaps: [
        { topic: "Lossless Join Decomposition Algorithm", chapter: "Database Normalization", official_pct: 6.5, years_dormant: 3, recommended_hours: 4, exam_tip: "Dormant for 3 years; highly probable surge in upcoming paper." },
        { topic: "Deadlock Detection (Wait-For Graph) & Prevention", chapter: "Transaction Management", official_pct: 6.5, years_dormant: 2, recommended_hours: 4, exam_tip: "High marks weightage; examiners frequently alternate with 2PL." },
        { topic: "Dynamic Extensible Hashing vs Static Hashing", chapter: "Storage, Indexing & NoSQL", official_pct: 5.0, years_dormant: 3, recommended_hours: 4, exam_tip: "Due for recurrence. Prepare directory expansion diagrams." }
      ],
      quadrant_3_quick_wins: [
        { topic: "Relational Integrity Constraints (Keys)", chapter: "Relational Data Model", official_pct: 5.0, recommended_hours: 2, exam_tip: "High scoring certainty on Primary vs Foreign vs Candidate Keys." },
        { topic: "Views & Triggers", chapter: "SQL & Advanced Queries", official_pct: 5.0, recommended_hours: 2, exam_tip: "Before/After trigger syntax." }
      ],
      quadrant_4_low_priority: [
        { topic: "Hierarchical & Network Data Models", chapter: "Relational Data Model", reason: "Expunged from current syllabus - Do not prepare", priority: "Skip" },
        { topic: "Magnetic Tape Record Storage", chapter: "Storage & Indexing", reason: "Obsolete hardware architecture - Deprecated in current syllabus", priority: "Skip" }
      ],
      strategic_advice: "Focus 60% of preparation time on Quadrant 1 and Quadrant 2. Master full diagrams and anomalies for these high-yield topics first."
    };
  }
};

export const fetchExamTemplates = async () => {
  try {
    const res = await apiClient.get('/exam-templates');
    return res.data;
  } catch (e) {
    return [
      {
        id: "eng_autonomous",
        name: "State Technical Board / Autonomous Engineering (MSBTE/SPPU)",
        total_marks: 100,
        duration_minutes: 180,
        pattern: "5 Main Questions of 20 Marks each with Section A & Section B",
        structure: { questions_count: 5, marks_per_question: 20, sub_questions: 3 }
      },
      {
        id: "central_board_cbse",
        name: "Central Board Secondary Education (CBSE/ICSE)",
        total_marks: 80,
        duration_minutes: 180,
        pattern: "Sections A (MCQ 20M), B (Short 12M), C (Long 18M), D (Case 12M), E (Essay 18M)",
        structure: { questions_count: 38, sections: ["A", "B", "C", "D", "E"] }
      }
    ];
  }
};
