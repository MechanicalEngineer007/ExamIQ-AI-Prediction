import React, { useState } from 'react';
import { 
  ArrowLeftRight, 
  CheckCircle2, 
  AlertTriangle, 
  Download, 
  Sparkles, 
  Languages 
} from 'lucide-react';
import { 
  downloadPDFUrl, 
  downloadBilingualPDFUrl 
} from '../api';

interface CustomizerProps {
  prediction: any;
  onUpdatePrediction: (updated: any) => void;
}

export const InteractiveCustomizer: React.FC<CustomizerProps> = ({
  prediction,
  onUpdatePrediction
}) => {
  const [bilingualMode, setBilingualMode] = useState<boolean>(false);
  const targetMarks = prediction?.total_marks || 100;

  if (!prediction || !prediction.paper_slots) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center text-slate-400">
        Generate a predicted question paper in the Prediction Studio first to customize slots.
      </div>
    );
  }

  // Calculate live total marks
  const currentTotalMarks = prediction.paper_slots.reduce((acc: number, slot: any) => acc + (slot.marks || 0), 0);
  const isMarksValid = currentTotalMarks === targetMarks;

  // Swap primary question with one of its alternative questions
  const handleSwapAlternative = (slotIndex: number, altIndex: number) => {
    const updated = { ...prediction };
    const slot = { ...updated.paper_slots[slotIndex] };
    const alt = slot.additional_predictions[altIndex];

    // Swap texts, topics, probabilities
    const oldPrimaryText = slot.primary_predicted_question;
    const oldTopic = slot.topic;
    const oldProb = slot.primary_ml_probability;
    const oldDiff = slot.difficulty;

    slot.primary_predicted_question = alt.question_text;
    slot.topic = alt.topic;
    slot.primary_ml_probability = alt.ml_probability;
    slot.difficulty = alt.difficulty;

    // Put old primary into alt slot
    slot.additional_predictions[altIndex] = {
      ...alt,
      question_text: oldPrimaryText,
      topic: oldTopic,
      ml_probability: oldProb,
      difficulty: oldDiff
    };

    updated.paper_slots[slotIndex] = slot;
    onUpdatePrediction(updated);
  };

  const handleUpdateSlotMarks = (slotIndex: number, newMarks: number) => {
    const updated = { ...prediction };
    updated.paper_slots[slotIndex].marks = newMarks;
    onUpdatePrediction(updated);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Controller Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded bg-blue-500/15 text-blue-400 text-xs font-bold uppercase tracking-wider">
              Studio Builder
            </span>
            <h2 className="text-xl font-bold text-white">
              Interactive Question Paper Customizer & Swap Studio
            </h2>
          </div>
          <p className="text-xs text-slate-400">
            Swap primary questions with supplementary alternatives with 1 click. Real-time total marks validation.
          </p>
        </div>

        {/* Live Total Marks Validator Badge */}
        <div className="flex flex-wrap items-center gap-2">
          <div className={`px-4 py-2 rounded-xl border flex items-center gap-2 text-xs font-bold ${
            isMarksValid 
              ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' 
              : 'bg-rose-500/15 text-rose-300 border-rose-500/30 animate-pulse'
          }`}>
            {isMarksValid ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            ) : (
              <AlertTriangle className="h-4 w-4 text-rose-400" />
            )}
            <span>
              Total Marks: {currentTotalMarks} / {targetMarks} {isMarksValid ? '(Valid)' : '(Requires Adjustment)'}
            </span>
          </div>

          {/* Bilingual Toggle */}
          <button
            onClick={() => setBilingualMode(!bilingualMode)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition flex items-center gap-1.5 ${
              bilingualMode
                ? 'bg-indigo-600 text-white border-indigo-500'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white'
            }`}
          >
            <Languages className="h-4 w-4" />
            {bilingualMode ? 'Bilingual Mode ON' : 'Standard Mode'}
          </button>
        </div>
      </div>

      {/* Action Bar for PDFs */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-850 p-4 rounded-xl border border-slate-800">
        <span className="text-xs text-slate-400">
          Ready to export your customized examination layout:
        </span>
        <div className="flex flex-wrap items-center gap-2">
          <a
            href={downloadPDFUrl(prediction.prediction_id, true)}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-600/20 transition"
          >
            <Download className="h-3.5 w-3.5" />
            Export Official Paper PDF
          </a>
          <a
            href={downloadBilingualPDFUrl(prediction.prediction_id)}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 transition"
          >
            <Languages className="h-3.5 w-3.5" />
            Export Bilingual Side-by-Side PDF
          </a>
        </div>
      </div>

      {/* Interactive Slots Builder */}
      <div className="space-y-6">
        {prediction.paper_slots.map((slot: any, sIdx: number) => (
          <div key={slot.slot_id} className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
            {/* Header row with Marks input */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-base font-extrabold text-blue-400 font-mono">
                  {slot.slot_id}
                </span>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  [{slot.section_name}]
                </span>
              </div>

              <div className="flex items-center gap-2">
                <label className="text-xs text-slate-400 font-medium">Marks:</label>
                <input
                  type="number"
                  value={slot.marks}
                  onChange={(e) => handleUpdateSlotMarks(sIdx, Number(e.target.value))}
                  className="w-16 bg-slate-800 border border-slate-700 text-white font-mono text-xs rounded px-2 py-1 text-center font-bold"
                />
              </div>
            </div>

            {/* Primary Question Box */}
            <div className="bg-slate-800/80 border border-slate-700 rounded-lg p-4 space-y-2">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="text-[10px] text-emerald-400 font-mono font-bold uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="h-3 w-3" />
                    Current Primary Question (ML Prob: {slot.primary_ml_probability}%)
                  </div>
                  <p className="text-sm font-semibold text-white">
                    {slot.primary_predicted_question}
                  </p>
                  {bilingualMode && (
                    <p className="text-xs text-indigo-300 italic pt-1">
                      (मराठी / हिन्दी) {slot.primary_predicted_question} (सविस्तर स्पष्टीकरण लिहा.)
                    </p>
                  )}
                  <div className="text-[11px] text-slate-400 pt-1">
                    Topic: <b className="text-slate-300">{slot.topic}</b> • Diff: {slot.difficulty}
                  </div>
                </div>
              </div>
            </div>

            {/* Available Alternatives for 1-Click Swap */}
            {slot.additional_predictions && slot.additional_predictions.length > 0 && (
              <div className="space-y-2 pt-1">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                  Available Supplementary Alternatives (Click to Swap with Primary):
                </span>

                <div className="grid grid-cols-1 gap-2.5">
                  {slot.additional_predictions.map((alt: any, aIdx: number) => (
                    <div
                      key={alt.slot_label}
                      className="bg-slate-800/40 hover:bg-slate-800 border border-slate-750 rounded-lg p-3 flex items-start justify-between gap-3 transition group"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-xs">
                          <span className="font-mono text-indigo-400 font-bold">{alt.slot_label}</span>
                          <span className="text-slate-200">{alt.question_text}</span>
                        </div>
                        <div className="text-[10px] text-slate-400">
                          Topic: {alt.topic} • ML Prob: <b className="text-emerald-400 font-mono">{alt.ml_probability}%</b>
                        </div>
                      </div>

                      <button
                        onClick={() => handleSwapAlternative(sIdx, aIdx)}
                        className="px-3 py-1.5 rounded bg-blue-600/20 hover:bg-blue-600 text-blue-300 hover:text-white border border-blue-500/30 text-xs font-semibold flex items-center gap-1 transition whitespace-nowrap"
                        title="Swap with primary question"
                      >
                        <ArrowLeftRight className="h-3.5 w-3.5" />
                        Swap
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
