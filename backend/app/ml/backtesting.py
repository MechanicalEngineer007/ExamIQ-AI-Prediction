import math
from typing import List, Dict, Any, Tuple
from collections import defaultdict
from app.ml.embeddings import MultilingualSemanticEngine
from app.ml.predictor import HybridExamPredictor

class ChronologicalBacktester:
    """
    Mandatory Chronological Backtesting System.
    Validates prediction reliability against previous 2 years of actual question papers:
    - Fold 1 (2024): Trained on 2011-2023 -> Predicts 2024 -> Compared against actual 2024 paper
    - Fold 2 (2025): Trained on 2011-2024 -> Predicts 2025 -> Compared against actual 2025 paper
    Guarantees strict chronological validation without future data leakage.
    Calculates Precision@K, Recall@K, Marks Coverage %, Semantic Matching F1, and Probability Calibration.
    """

    @classmethod
    def run_backtest_for_year(
        cls,
        test_year: int, # e.g. 2024 or 2025
        all_questions: List[Dict[str, Any]],
        syllabus: Dict[str, Any],
        exam_config: Dict[str, Any],
        k_values: List[int] = [5, 10]
    ) -> Dict[str, Any]:
        """
        Runs chronological backtest for a specific test year.
        Splits data chronologically:
        Training Set: all questions with year < test_year
        Ground Truth: all questions with year == test_year
        """
        train_questions = [q for q in all_questions if q.get("year", 0) < test_year]
        actual_questions = [q for q in all_questions if q.get("year", 0) == test_year]

        if not train_questions:
            return {"error": f"No training data prior to {test_year}"}
        if not actual_questions:
            return {"error": f"No actual examination ground truth found for {test_year}"}

        # 1. Cluster training questions into concept clusters
        clusters = MultilingualSemanticEngine.cluster_questions(train_questions)

        # 2. Score candidates strictly using training knowledge
        predictor = HybridExamPredictor(target_year=test_year)
        topic_stats = predictor.compute_topic_stats(train_questions, syllabus)
        scored_candidates = predictor.score_candidate_questions(clusters, topic_stats)

        # 3. Ground truth topics and questions
        actual_topics_set = set(q.get("topic", "").strip().lower() for q in actual_questions)
        actual_marks_total = sum(q.get("marks", 5) for q in actual_questions)
        actual_marks_total = max(1, actual_marks_total)

        # Top 5 and Top 10 predicted topics
        predicted_topics_ranked = []
        seen_topics = set()
        for cand in scored_candidates:
            t = cand["topic"].strip().lower()
            if t not in seen_topics:
                predicted_topics_ranked.append(t)
                seen_topics.add(t)

        top5_topics = set(predicted_topics_ranked[:5])
        top10_topics = set(predicted_topics_ranked[:10])

        top5_hits = len(top5_topics.intersection(actual_topics_set))
        top10_hits = len(top10_topics.intersection(actual_topics_set))

        top5_accuracy = (top5_hits / min(5, len(actual_topics_set))) * 100.0 if actual_topics_set else 0.0
        top10_accuracy = (top10_hits / min(10, len(actual_topics_set))) * 100.0 if actual_topics_set else 0.0

        # 4. Question-level semantic matching against actual exam
        # For each actual question, find if any of top-K predictions had high semantic similarity
        matched_pairs = []
        unmatched_actual = []
        covered_marks = 0

        # Let top K candidates be pool
        eval_pool = scored_candidates[:15]

        for act_q in actual_questions:
            act_text = act_q.get("question_text", "")
            act_marks = act_q.get("marks", 5)
            best_match = None
            best_sim = 0.0

            for pred_c in eval_pool:
                sim = MultilingualSemanticEngine.compute_similarity(act_text, pred_c["question_text"])
                if sim > best_sim:
                    best_sim = sim
                    best_match = pred_c

            if best_sim >= 0.58: # concept match threshold
                matched_pairs.append({
                    "actual_q": act_text,
                    "actual_marks": act_marks,
                    "actual_topic": act_q.get("topic", ""),
                    "predicted_q": best_match["question_text"],
                    "predicted_prob": best_match["calibrated_probability"],
                    "similarity": round(best_sim, 2),
                    "status": "Correctly Predicted Concept"
                })
                covered_marks += act_marks
            else:
                unmatched_actual.append({
                    "actual_q": act_text,
                    "actual_marks": act_marks,
                    "actual_topic": act_q.get("topic", ""),
                    "status": "Missed Concept"
                })

        marks_coverage_pct = round((covered_marks / actual_marks_total) * 100.0, 1)

        # 5. Precision@K and Recall@K (K=10)
        p_at_k = round(len(matched_pairs) / max(1, min(10, len(eval_pool))), 3)
        r_at_k = round(len(matched_pairs) / max(1, len(actual_questions)), 3)
        f1_score = round(2 * (p_at_k * r_at_k) / max(1e-5, (p_at_k + r_at_k)), 3)

        # 6. Marks weightage prediction accuracy
        # Compare predicted topic weightage vs actual exam marks distribution
        actual_topic_marks = defaultdict(int)
        for act in actual_questions:
            actual_topic_marks[act.get("topic", "").strip().lower()] += act.get("marks", 5)

        pred_topic_marks = defaultdict(int)
        for p in eval_pool[:8]:
            pred_topic_marks[p.get("topic", "").strip().lower()] += p.get("marks", 5)

        weightage_err = 0.0
        for top_k in set(actual_topic_marks.keys()).union(set(pred_topic_marks.keys())):
            a_m = actual_topic_marks.get(top_k, 0)
            p_m = pred_topic_marks.get(top_k, 0)
            weightage_err += abs(a_m - p_m)
        weightage_accuracy = max(0.0, round(100.0 - (weightage_err / (2.0 * actual_marks_total)) * 100.0, 1))

        # 7. Probability Calibration Error (Brier Score)
        # Outcome is 1 if predicted question had a semantic match in actual paper, else 0
        brier_sum = 0.0
        calibration_bins = [
            {"bin": "70-95% (High)", "predicted_avg": 82.5, "actual_frequency": 0, "count": 0},
            {"bin": "50-70% (Moderate)", "predicted_avg": 59.0, "actual_frequency": 0, "count": 0},
            {"bin": "20-50% (Exploratory)", "predicted_avg": 36.0, "actual_frequency": 0, "count": 0}
        ]

        matched_pred_texts = set(m["predicted_q"] for m in matched_pairs)
        for pred_c in eval_pool:
            p_val = pred_c["calibrated_probability"] / 100.0
            actual_outcome = 1.0 if pred_c["question_text"] in matched_pred_texts else 0.0
            brier_sum += (p_val - actual_outcome) ** 2

            if pred_c["calibrated_probability"] >= 70:
                calibration_bins[0]["count"] += 1
                if actual_outcome == 1.0:
                    calibration_bins[0]["actual_frequency"] += 1
            elif pred_c["calibrated_probability"] >= 50:
                calibration_bins[1]["count"] += 1
                if actual_outcome == 1.0:
                    calibration_bins[1]["actual_frequency"] += 1
            else:
                calibration_bins[2]["count"] += 1
                if actual_outcome == 1.0:
                    calibration_bins[2]["actual_frequency"] += 1

        brier_score = round(brier_sum / max(1, len(eval_pool)), 3)

        for b in calibration_bins:
            b["empirical_accuracy"] = round((b["actual_frequency"] / max(1, b["count"])) * 100.0, 1) if b["count"] > 0 else 0.0

        min_train_year = min(q.get("year", 2011) for q in train_questions)
        max_train_year = max(q.get("year", 2023) for q in train_questions)

        return {
            "test_year": test_year,
            "train_years_range": f"{min_train_year}–{max_train_year}",
            "training_samples_count": len(train_questions),
            "actual_questions_count": len(actual_questions),
            "top5_topic_accuracy": round(top5_accuracy, 1),
            "top10_topic_accuracy": round(top10_accuracy, 1),
            "semantic_matching_f1": f1_score,
            "precision_at_k": p_at_k,
            "recall_at_k": r_at_k,
            "marks_coverage_pct": marks_coverage_pct,
            "marks_weightage_accuracy": weightage_accuracy,
            "brier_score_calibration": brier_score,
            "calibration_curve": calibration_bins,
            "matched_questions": matched_pairs,
            "unmatched_actual": unmatched_actual,
            "model_verdict": "Validated & Reliable for Board Layout Deployment" if marks_coverage_pct >= 70.0 else "Requires Supplemental Historical Data"
        }
