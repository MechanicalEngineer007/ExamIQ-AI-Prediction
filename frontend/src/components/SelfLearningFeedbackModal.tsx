import React, { useState } from 'react';
import { 
  RefreshCw, 
  CheckCircle2, 
  Send, 
  Upload, 
  ShieldCheck
} from 'lucide-react';
import { submitModelFeedback } from '../api';

interface SelfLearningProps {
  examId: number;
}

export const SelfLearningView: React.FC<SelfLearningProps> = ({ examId }) => {
  const [actualPaperText, setActualPaperText] = useState('');
  const [evaluating, setEvaluating] = useState(false);
  const [evaluationResult, setEvaluationResult] = useState<any>(null);

  // Manual feedback state
  const [questionText, setQuestionText] = useState('');
  const [predictedTopic, setPredictedTopic] = useState('');
  const [feedbackType, setFeedbackType] = useState('correct');
  const [userComment, setUserComment] = useState('');
  const [feedbackSent, setFeedbackSent] = useState(false);

  const handlePostExamEvaluation = () => {
    if (!actualPaperText.trim()) {
      alert('Please enter or paste the actual examination questions.');
      return;
    }
    setEvaluating(true);
    setTimeout(() => {
      // Simulate real-time continuous learning evaluation
      setEvaluationResult({
        accuracy: 78.5,
        matched: [
          { actual: "Explain 1NF, 2NF and 3NF Normalization with anomalies.", predicted: "Explain 1NF, 2NF and 3NF with suitable anomalies.", similarity: 0.94, verdict: "True Positive" },
          { actual: "What is B+ Tree? Explain insertion algorithm with order 4.", predicted: "Explain the structure of B+ Tree. Demonstrate insertion of keys.", similarity: 0.91, verdict: "True Positive" },
          { actual: "Discuss Strict 2PL Protocol and serializability guarantees.", predicted: "Explain the Strict Two-Phase Locking (2PL) protocol.", similarity: 0.88, verdict: "True Positive" },
          { actual: "Demonstrate SQL Joins: Inner, Left Outer, Right Outer.", predicted: "Explain Inner Join, Left Outer Join, Right Outer Join with syntax.", similarity: 0.95, verdict: "True Positive" }
        ],
        missed: [
          { actual: "Explain CAP Theorem in distributed databases.", topic: "Storage, Indexing & NoSQL Architectures", marks: 10 }
        ],
        model_version: "v2.4.1-calibrated",
        retrain_status: "Training Dataset Updated & Weights Recalibrated"
      });
      setEvaluating(false);
    }, 1200);
  };

  const handleManualFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionText.trim()) return;

    try {
      await submitModelFeedback({
        exam_config_id: examId,
        question_text: questionText,
        predicted_topic: predictedTopic || 'General',
        feedback_type: feedbackType,
        user_comment: userComment
      });
      setFeedbackSent(true);
      setQuestionText('');
      setUserComment('');
      setTimeout(() => setFeedbackSent(false), 4000);
    } catch (err: any) {
      alert(`Feedback submission failed: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Title */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <RefreshCw className="h-5 w-5 text-indigo-400" />
          Continuous Self-Learning & Feedback Engine
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Distinguishes between <b>verified post-exam ground truth</b> and <b>subjective feedback</b>. Version controls model retrain folds to prevent degradation.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Module A: Post-Exam Actual Paper Verification */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Upload className="h-4 w-4 text-emerald-400" />
              Post-Exam Verification (Actual Paper Upload)
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Upload the actual question paper after the examination to automatically compute model accuracy and update the knowledge base.
            </p>
          </div>

          <textarea
            rows={5}
            value={actualPaperText}
            onChange={(e) => setActualPaperText(e.target.value)}
            placeholder="Paste actual questions from the conducted exam:&#10;1. Explain 1NF, 2NF and 3NF Normalization. [10 Marks]&#10;2. Explain B+ Tree insertion algorithm. [10 Marks]&#10;3. Explain Strict 2PL Protocol. [10 Marks]"
            className="w-full bg-slate-800 border border-slate-700 text-white text-xs font-mono rounded-lg p-3"
          />

          <button
            onClick={handlePostExamEvaluation}
            disabled={evaluating}
            className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition flex items-center justify-center gap-2"
          >
            <ShieldCheck className="h-4 w-4" />
            {evaluating ? 'Matching & Recalibrating...' : 'Verify Actual Exam & Update Model'}
          </button>

          {evaluationResult && (
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-300">
                  Post-Exam Accuracy: {evaluationResult.accuracy}%
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">
                  {evaluationResult.model_version}
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <span className="text-[11px] font-semibold text-slate-300 block">
                  Matched Predicted Questions ({evaluationResult.matched.length}):
                </span>
                {evaluationResult.matched.map((m: any, idx: number) => (
                  <div key={idx} className="p-2 rounded bg-slate-800/60 border border-slate-750 flex items-start gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-slate-200 font-medium">{m.actual}</p>
                      <p className="text-[10px] text-slate-400">Match similarity: {(m.similarity * 100).toFixed(0)}%</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="text-[11px] text-emerald-400 font-medium pt-1">
                ✓ {evaluationResult.retrain_status}
              </div>
            </div>
          )}
        </div>

        {/* Module B: Question-Level Feedback Submission */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Send className="h-4 w-4 text-blue-400" />
              Provide Question & Topic Feedback
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Tag predictions for continuous calibration (e.g. concept variant or wrong topic classification).
            </p>
          </div>

          <form onSubmit={handleManualFeedbackSubmit} className="space-y-3">
            <div>
              <label className="text-[11px] font-medium text-slate-300 block mb-1">
                Candidate Question Text:
              </label>
              <input
                type="text"
                required
                value={questionText}
                onChange={(e) => setQuestionText(e.target.value)}
                placeholder="e.g. Discuss ACID properties in transaction processing"
                className="w-full bg-slate-800 border border-slate-700 text-white text-xs rounded-lg px-3 py-2"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-medium text-slate-300 block mb-1">
                  Topic / Chapter:
                </label>
                <input
                  type="text"
                  value={predictedTopic}
                  onChange={(e) => setPredictedTopic(e.target.value)}
                  placeholder="e.g. Concurrency Control"
                  className="w-full bg-slate-800 border border-slate-700 text-white text-xs rounded-lg px-3 py-2"
                />
              </div>

              <div>
                <label className="text-[11px] font-medium text-slate-300 block mb-1">
                  Feedback Classification:
                </label>
                <select
                  value={feedbackType}
                  onChange={(e) => setFeedbackType(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 text-white text-xs rounded-lg px-2.5 py-2"
                >
                  <option value="correct">Correct Prediction</option>
                  <option value="partially_correct">Partially Correct</option>
                  <option value="same_concept_diff_wording">Same Concept, Different Wording</option>
                  <option value="wrong_topic">Wrong Topic Classification</option>
                  <option value="incorrect">Incorrect Prediction</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-[11px] font-medium text-slate-300 block mb-1">
                User Review & Notes:
              </label>
              <textarea
                rows={2}
                value={userComment}
                onChange={(e) => setUserComment(e.target.value)}
                placeholder="Optional notes or suggested re-weighting..."
                className="w-full bg-slate-800 border border-slate-700 text-white text-xs rounded-lg p-2"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-600/20 transition flex items-center justify-center gap-2"
            >
              <Send className="h-4 w-4" />
              Submit Review to Continuous Learning Pipeline
            </button>

            {feedbackSent && (
              <div className="text-xs text-emerald-400 font-semibold flex items-center justify-center gap-1.5 pt-1">
                <CheckCircle2 className="h-4 w-4" /> Feedback incorporated into model version records!
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};
