import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Download, 
  Sliders, 
  Calendar, 
  FileText, 
  CheckCircle2,
  Brain,
  FileCheck2,
  ArrowLeftRight
} from 'lucide-react';
import { 
  type PredictionResponse, 
  type PredictionSlot, 
  runPrediction, 
  downloadPDFUrl, 
  submitModelFeedback,
  fetchBloomTaxonomy
} from '../api';

interface PredictionStudioProps {
  examId: number;
  selectedLang: string;
  onNavigateTab?: (tab: string) => void;
}

export const PredictionStudio: React.FC<PredictionStudioProps> = ({ examId, selectedLang, onNavigateTab }) => {
  const [targetYear, setTargetYear] = useState<number>(2026);
  const [temperature, setTemperature] = useState<number>(0.5);
  const [includeProbInPdf, setIncludeProbInPdf] = useState<boolean>(true);
  const [prediction, setPrediction] = useState<PredictionResponse | null>(null);
  const [bloomData, setBloomData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [feedbackSuccess, setFeedbackSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchBloomTaxonomy(examId).then(setBloomData).catch(console.error);
  }, [examId]);

  const handleGenerate = async () => {
    setLoading(true);
    setFeedbackSuccess(null);
    try {
      const res = await runPrediction({
        exam_config_id: examId,
        target_year: targetYear,
        language: selectedLang,
        temperature_balance: temperature,
      });
      setPrediction(res);
    } catch (err: any) {
      alert(`Prediction generation failed: ${err.message || 'Check backend connection'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFeedback = async (questionText: string, topic: string, type: string) => {
    try {
      await submitModelFeedback({
        exam_config_id: examId,
        question_text: questionText,
        predicted_topic: topic,
        feedback_type: type,
        user_comment: `Direct user review from Prediction Studio (${type})`
      });
      setFeedbackSuccess(`Feedback recorded: "${type}" for "${topic}". Model calibrated.`);
      setTimeout(() => setFeedbackSuccess(null), 4000);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Controls & Configuration Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4">
            {/* Target Year */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Calendar className="h-4 w-4 text-blue-400" /> Target Year:
              </span>
              <select
                value={targetYear}
                onChange={(e) => setTargetYear(Number(e.target.value))}
                className="bg-slate-800 border border-slate-700 text-white text-xs font-medium rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-blue-500"
              >
                <option value={2026}>2026 Examination</option>
                <option value={2027}>2027 Examination</option>
              </select>
            </div>

            {/* Novelty / Gap Slider */}
            <div className="flex items-center gap-2.5">
              <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Sliders className="h-4 w-4 text-indigo-400" /> Syllabus Gap Balance:
              </span>
              <input
                type="range"
                min="0.1"
                max="0.9"
                step="0.1"
                value={temperature}
                onChange={(e) => setTemperature(parseFloat(e.target.value))}
                className="w-28 accent-blue-600 cursor-pointer"
              />
              <span className="text-[11px] font-mono text-slate-400">
                {temperature < 0.4 ? 'Historical Core' : temperature > 0.6 ? 'Novel Gaps' : 'Balanced (50%)'}
              </span>
            </div>

            {/* PDF options */}
            <div className="flex items-center gap-2 border-l-0 pl-0 sm:border-l sm:border-slate-800 sm:pl-4">
              <label className="flex items-center gap-1.5 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeProbInPdf}
                  onChange={(e) => setIncludeProbInPdf(e.target.checked)}
                  className="rounded bg-slate-800 border-slate-700 text-blue-600 focus:ring-0"
                />
                Include ML Probabilities in PDF
              </label>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="flex items-center gap-2 px-4 sm:px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold text-xs shadow-md shadow-blue-600/20 transition"
            >
              <Sparkles className="h-4 w-4" />
              {loading ? 'Synthesizing Patterns...' : 'Generate Calibrated Paper'}
            </button>

            {prediction && (
              <a
                href={downloadPDFUrl(prediction.prediction_id, includeProbInPdf)}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-md shadow-emerald-600/20 transition"
              >
                <Download className="h-4 w-4" />
                Download PDF
              </a>
            )}
          </div>
        </div>
      </div>

      {feedbackSuccess && (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          {feedbackSuccess}
        </div>
      )}

      {/* Bloom's Taxonomy Cognitive Balancer Card */}
      {bloomData && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-indigo-500/15 text-indigo-400">
              <Brain className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white">Bloom's Revised Taxonomy Cognitive Spread:</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 font-semibold border border-emerald-500/20">
                  {bloomData.is_accreditation_compliant ? 'NBA / AICTE Compliant' : 'Review Cognitive Spread'}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-300 mt-1">
                {bloomData.cognitive_breakdown.map((b: any) => (
                  <span key={b.level} className="flex items-center gap-1 font-mono">
                    <span className="text-slate-400 font-sans">{b.level}:</span>
                    <b className="text-indigo-400">{b.percentage}%</b>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {prediction && onNavigateTab && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onNavigateTab('markingscheme')}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition"
              >
                <FileCheck2 className="h-3.5 w-3.5 text-blue-400" />
                View Marking Rubric
              </button>
              <button
                onClick={() => onNavigateTab('customizer')}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition"
              >
                <ArrowLeftRight className="h-3.5 w-3.5 text-indigo-400" />
                Customize / Swap Questions
              </button>
            </div>
          )}
        </div>
      )}

      {/* Main Official Question Paper Sheet Layout */}
      {prediction ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-10 max-w-5xl mx-auto shadow-2xl">
          {/* Official Style Header */}
          <div className="border-b-2 border-slate-700 pb-5 text-center space-y-2">
            <div className="inline-block px-3 py-1 rounded bg-red-500/10 text-red-400 border border-red-500/20 text-[10px] font-bold tracking-widest uppercase mb-1">
              AI-PREDICTED – NOT AN OFFICIAL QUESTION PAPER (FOR REVISION & PRACTICE ONLY)
            </div>
            <h2 className="text-lg sm:text-xl font-extrabold text-white tracking-wide uppercase">
              {prediction.exam_title}
            </h2>
            <p className="text-xs text-slate-300 font-medium">
              Target Year: <span className="font-bold text-white">{prediction.target_year}</span> • Total Marks: <span className="font-bold text-white">{prediction.total_marks}</span> • Duration: 3 Hours
            </p>
            <div className="text-[11px] text-slate-400 italic max-w-xl mx-auto pt-2">
              Instructions: Attempt all main questions. Figures to the right indicate full marks. Supplementary questions marked (A), (B), (C) are high-probability AI alternatives for comprehensive preparation.
            </div>
          </div>

          {/* Question Slots List */}
          <div className="divide-y divide-slate-800/80 mt-6">
            {prediction.paper_slots.map((slot: PredictionSlot) => (
              <div key={slot.slot_id} className="py-6 space-y-4">
                {/* Section Header if changing */}
                <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider">
                  <span>{slot.section_name}</span>
                  <span className="text-slate-500 font-normal italic">{slot.instruction}</span>
                </div>

                {/* Primary Question Box (Official Format) */}
                <div className="bg-slate-850 border border-slate-750 rounded-xl p-4 sm:p-5 relative">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <span className="text-base font-extrabold text-blue-400 font-mono">
                        {slot.slot_id}
                      </span>
                      <div className="space-y-1">
                        <p className="text-sm sm:text-base font-medium text-slate-100 leading-relaxed">
                          {slot.primary_predicted_question}
                        </p>
                        <div className="flex flex-wrap items-center gap-2 text-xs pt-1">
                          <span className="text-slate-400">Chapter: <span className="text-slate-200">{slot.chapter}</span></span>
                          <span className="text-slate-600">•</span>
                          <span className="text-slate-400">Topic: <span className="text-slate-200">{slot.topic}</span></span>
                          <span className="text-slate-600">•</span>
                          <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px]">
                            {slot.difficulty}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <span className="text-sm font-extrabold text-white font-mono bg-slate-800 px-2.5 py-1 rounded-md border border-slate-700">
                        [{slot.marks} Marks]
                      </span>
                    </div>
                  </div>

                  {/* ML Confidence & Supporting Data Pill */}
                  <div className="mt-3 pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 font-bold font-mono">
                        ML Probability: {slot.primary_ml_probability}%
                      </span>
                      <span className="text-slate-400 text-[11px]">
                        ({slot.confidence_tier})
                      </span>
                      <span className="text-slate-500 text-[11px] hidden sm:inline">
                        • Historical appearances: {slot.supporting_years.join(', ')}
                      </span>
                    </div>

                    {/* Quick Feedback Actions */}
                    <div className="flex items-center gap-1.5 text-[11px]">
                      <span className="text-slate-500 mr-1">Feedback:</span>
                      <button
                        onClick={() => handleQuickFeedback(slot.primary_predicted_question, slot.topic, 'correct')}
                        className="px-2 py-0.5 rounded bg-slate-800 hover:bg-emerald-900/40 text-slate-300 hover:text-emerald-300 border border-slate-700 transition"
                        title="Mark as correct prediction"
                      >
                        ✓ Accurate
                      </button>
                      <button
                        onClick={() => handleQuickFeedback(slot.primary_predicted_question, slot.topic, 'same_concept_diff_wording')}
                        className="px-2 py-0.5 rounded bg-slate-800 hover:bg-blue-900/40 text-slate-300 hover:text-blue-300 border border-slate-700 transition"
                        title="Same concept, different wording"
                      >
                        ≈ Similar Concept
                      </button>
                    </div>
                  </div>
                </div>

                {/* Additional / Supplementary Predictions for this slot */}
                {slot.additional_predictions && slot.additional_predictions.length > 0 && (
                  <div className="pl-3 sm:pl-8 space-y-2 border-l-2 border-blue-500/30">
                    <div className="text-[11px] font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="h-3 w-3" />
                      Supplementary AI Predictions (Alternative Practice Variations):
                    </div>

                    <div className="grid grid-cols-1 gap-2.5">
                      {slot.additional_predictions.map((alt) => (
                        <div
                          key={alt.slot_label}
                          className="bg-slate-800/50 border border-slate-750/70 rounded-lg p-3 hover:border-slate-700 transition"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-start gap-2">
                              <span className="text-xs font-bold text-indigo-400 font-mono mt-0.5">
                                {alt.slot_label}
                              </span>
                              <div className="space-y-0.5">
                                <p className="text-xs text-slate-200 font-medium">
                                  {alt.question_text}
                                </p>
                                <div className="text-[10px] text-slate-400 flex items-center gap-2">
                                  <span>Topic: <b className="text-slate-300">{alt.topic}</b></span>
                                  <span>•</span>
                                  <span>Diff: {alt.difficulty}</span>
                                </div>
                              </div>
                            </div>

                            <div className="text-right flex-shrink-0">
                              <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-mono text-[11px] font-bold">
                                {alt.ml_probability}%
                              </span>
                              <div className="text-[10px] text-slate-500 font-mono">[{alt.marks} M]</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center max-w-2xl mx-auto space-y-4">
          <div className="h-14 w-14 rounded-2xl bg-blue-500/10 text-blue-400 flex items-center justify-center mx-auto">
            <FileText className="h-7 w-7" />
          </div>
          <h3 className="text-lg font-bold text-white">Generate 2026 Examination Prediction Paper</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Click <b>"Generate Calibrated Paper"</b> above to run the hybrid ML engine against 15 years of examination papers and official syllabus weightage.
          </p>
        </div>
      )}
    </div>
  );
};
