import React, { useState, useEffect } from 'react';
import { 
  Layers, 
  ShieldCheck, 
  FileText 
} from 'lucide-react';
import { fetchMultiSets } from '../api';

interface MultiSetViewProps {
  examId: number;
}

export const MultiSetView: React.FC<MultiSetViewProps> = ({ examId }) => {
  const [multiSetsData, setMultiSetsData] = useState<any>(null);
  const [activeSet, setActiveSet] = useState<string>('Set A');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    setLoading(true);
    fetchMultiSets(examId)
      .then((res) => {
        setMultiSetsData(res);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [examId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-16 text-slate-400">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500 mr-3"></div>
        Synthesizing 4 mathematically equivalent examination sets (Set A, B, C, D)...
      </div>
    );
  }

  if (!multiSetsData || !multiSetsData.sets) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center text-slate-400">
        No multi-set data available.
      </div>
    );
  }

  const currentSet = multiSetsData.sets[activeSet];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Layers className="h-5 w-5 text-indigo-400" />
            <h2 className="text-xl font-bold text-white">
              Parallel Multi-Set Generator (Sets A, B, C, D)
            </h2>
          </div>
          <p className="text-xs text-slate-400">
            Formulates 4 distinct parallel sets maintaining identical chapter weightage and difficulty balance to prevent exam leaks.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 px-3.5 py-2 rounded-xl text-xs text-emerald-300 font-semibold">
          <ShieldCheck className="h-4 w-4 text-emerald-400" />
          Equivalence Score: {currentSet.equivalence_score}%
        </div>
      </div>

      {/* Set Selector Tabs */}
      <div className="flex items-center space-x-2 bg-slate-900 border border-slate-800 p-2 rounded-xl">
        {(['Set A', 'Set B', 'Set C', 'Set D'] as const).map((setName) => (
          <button
            key={setName}
            onClick={() => setActiveSet(setName)}
            className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-2 ${
              activeSet === setName
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <FileText className="h-4 w-4" />
            {setName} (Official Layout)
          </button>
        ))}
      </div>

      {/* Active Set Question Paper View */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6">
        <div className="border-b border-slate-800 pb-4 flex items-center justify-between">
          <div>
            <span className="text-xs font-mono font-bold text-indigo-400 uppercase tracking-widest block">
              Official Examination Code: {activeSet.toUpperCase()}
            </span>
            <h3 className="text-base font-bold text-white">
              {multiSetsData.exam_title}
            </h3>
          </div>
          <span className="px-3 py-1 rounded-md bg-slate-800 text-white font-mono font-bold text-xs border border-slate-700">
            Total Marks: {currentSet.total_marks}
          </span>
        </div>

        <div className="divide-y divide-slate-800/70">
          {currentSet.slots.map((slot: any) => (
            <div key={slot.slot_id} className="py-4 space-y-3">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <span className="text-sm font-extrabold text-indigo-400 font-mono">
                    {slot.slot_id}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-slate-100">
                      {slot.primary_predicted_question}
                    </p>
                    <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-2">
                      <span>Topic: <b className="text-slate-300">{slot.topic}</b></span>
                      <span>•</span>
                      <span>Difficulty: {slot.difficulty}</span>
                      <span>•</span>
                      <span className="text-emerald-400 font-mono font-bold">ML Prob: {slot.primary_ml_probability}%</span>
                    </div>
                  </div>
                </div>
                <span className="text-xs font-mono font-bold text-slate-300 bg-slate-800 px-2 py-1 rounded">
                  [{slot.marks} Marks]
                </span>
              </div>

              {/* Sub-options for this set */}
              {slot.additional_predictions && slot.additional_predictions.length > 0 && (
                <div className="pl-6 space-y-1.5 border-l-2 border-indigo-500/20">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">
                    Set {activeSet.slice(-1)} Alternatives:
                  </span>
                  {slot.additional_predictions.map((alt: any) => (
                    <div key={alt.slot_label} className="text-xs text-slate-300 flex items-start gap-2">
                      <span className="font-mono text-indigo-300 font-semibold">{alt.slot_label}</span>
                      <span>{alt.question_text}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
