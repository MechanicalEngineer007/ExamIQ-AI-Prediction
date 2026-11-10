import datetime
from typing import List, Dict, Any
from app.ml.embeddings import MultilingualSemanticEngine

class SelfLearningEngine:
    """
    Continuous Learning and Model Recalibration Engine.
    Handles:
    - Post-exam verification against uploaded actual paper
    - Distinguishes between Verified Ground Truth vs Subjective User Feedback
    - Feedback tagging (Correct, Partially Correct, Incorrect, Same concept different wording, Wrong topic)
    - Dynamic weight update and model versioning
    """

    @classmethod
    def evaluate_post_exam_paper(
        cls,
        predicted_slots: List[Dict[str, Any]],
        actual_extracted_questions: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """
        Matches actual questions against predicted questions.
        Computes precision, missed topics, false positives, and updates model validation metrics.
        """
        all_predicted_questions = []
        for slot in predicted_slots:
            all_predicted_questions.append({
                "type": "Primary",
                "slot_id": slot["slot_id"],
                "text": slot["primary_predicted_question"],
                "topic": slot["topic"],
                "probability": slot.get("primary_ml_probability", 70.0)
            })
            for alt in slot.get("additional_predictions", []):
                all_predicted_questions.append({
                    "type": "Alternative",
                    "slot_id": alt["slot_label"],
                    "text": alt["question_text"],
                    "topic": alt["topic"],
                    "probability": alt.get("ml_probability", 65.0)
                })

        matches = []
        unmatched_actual = []
        matched_predicted_texts = set()

        for act_q in actual_extracted_questions:
            act_text = act_q.get("question_text", "")
            act_marks = act_q.get("marks", 5)
            act_topic = act_q.get("topic", "General")

            best_pred = None
            best_sim = 0.0

            for pred_q in all_predicted_questions:
                sim = MultilingualSemanticEngine.compute_similarity(act_text, pred_q["text"])
                if sim > best_sim:
                    best_sim = sim
                    best_pred = pred_q

            if best_sim >= 0.58:
                matches.append({
                    "actual_text": act_text,
                    "actual_topic": act_topic,
                    "actual_marks": act_marks,
                    "predicted_slot": best_pred["slot_id"],
                    "predicted_text": best_pred["text"],
                    "predicted_probability": best_pred["probability"],
                    "semantic_similarity": round(best_sim, 2),
                    "verdict": "Verified True Positive"
                })
                matched_predicted_texts.add(best_pred["text"])
            else:
                unmatched_actual.append({
                    "actual_text": act_text,
                    "actual_topic": act_topic,
                    "actual_marks": act_marks,
                    "verdict": "Missed by Model"
                })

        false_positives = [
            p for p in all_predicted_questions if p["text"] not in matched_predicted_texts and p["probability"] >= 75.0
        ]

        total_actual_marks = sum(q.get("marks", 5) for q in actual_extracted_questions)
        total_actual_marks = max(1, total_actual_marks)
        covered_marks = sum(m["actual_marks"] for m in matches)
        accuracy_pct = round((covered_marks / total_actual_marks) * 100.0, 1)

        return {
            "evaluation_timestamp": datetime.datetime.utcnow().isoformat(),
            "total_actual_questions": len(actual_extracted_questions),
            "matched_count": len(matches),
            "missed_count": len(unmatched_actual),
            "false_positives_count": len(false_positives),
            "marks_accuracy_pct": accuracy_pct,
            "matches": matches,
            "missed_questions": unmatched_actual,
            "false_positives": false_positives,
            "model_revision_recommended": accuracy_pct < 65.0
        }
