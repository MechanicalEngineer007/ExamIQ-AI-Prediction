import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  AlertTriangle, 
  Download, 
  ListOrdered 
} from 'lucide-react';
import { fetchMarkingScheme, downloadMarkingSchemePDFUrl } from '../api';

interface MarkingSchemeViewProps {
  predictionId: number;
}

export const MarkingSchemeView: React.FC<MarkingSchemeViewProps> = ({ predictionId }) => {
  const [schemeData, setSchemeData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    setLoading(true);
    fetchMarkingScheme(predictionId)
      .then((res) => {
        setSchemeData(res);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [predictionId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-16 text-slate-400">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mr-3"></div>
        Synthesizing step-by-step marking rubrics and examiner model solutions...
      </div>
    );
  }

  if (!schemeData || !schemeData.marking_schemes) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center text-slate-400">
        No marking rubric available. Generate a predicted paper first.
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded bg-blue-500/15 text-blue-400 text-xs font-bold uppercase tracking-wider">
              Official Rubric
            </span>
            <h2 className="text-xl font-bold text-white">
              Model Answer Key & Marking Scheme
            </h2>
          </div>
          <p className="text-xs text-slate-400">
            Step-by-step marks allocation, examiner checklist keywords, and common student errors to avoid.
          </p>
        </div>

        <a
          href={downloadMarkingSchemePDFUrl(predictionId)}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-md shadow-blue-600/20 transition whitespace-nowrap"
        >
          <Download className="h-4 w-4" />
          Download Model Answer Scheme PDF
        </a>
      </div>

      {/* Rubrics List */}
      <div className="space-y-6">
        {schemeData.marking_schemes.map((scheme: any, idx: number) => (
          <div key={idx} className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
            <div className="flex items-start justify-between gap-4 border-b border-slate-800 pb-3">
              <div className="flex items-start gap-3">
                <span className="text-base font-extrabold text-blue-400 font-mono">
                  {scheme.slot_id}
                </span>
                <div>
                  <h3 className="text-sm sm:text-base font-semibold text-white leading-snug">
                    {scheme.question_text}
                  </h3>
                  <div className="text-xs text-slate-400 mt-1 flex items-center gap-2">
                    <span>Topic: <b className="text-slate-300">{scheme.topic}</b></span>
                    <span>•</span>
                    <span>Difficulty: {scheme.difficulty}</span>
                  </div>
                </div>
              </div>
              <span className="px-3 py-1 rounded-md bg-slate-800 text-white font-mono font-bold text-sm border border-slate-700 whitespace-nowrap">
                {scheme.total_marks} Marks Total
              </span>
            </div>

            {/* Step-by-Step Marking Table */}
            <div>
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2 flex items-center gap-1.5">
                <ListOrdered className="h-4 w-4 text-emerald-400" />
                Examiner's Step-by-Step Marks Allotment:
              </span>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border border-slate-800 rounded-lg">
                  <thead className="bg-slate-800/80 text-slate-400 uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="py-2 px-3 w-48">Evaluation Component</th>
                      <th className="py-2 px-3">Required Details & Criteria</th>
                      <th className="py-2 px-3 w-20 text-right">Marks</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80">
                    {scheme.rubric_steps.map((step: any, sIdx: number) => (
                      <tr key={sIdx} className="hover:bg-slate-800/30">
                        <td className="py-2.5 px-3 font-semibold text-slate-200">{step.component}</td>
                        <td className="py-2.5 px-3 text-slate-300">{step.description}</td>
                        <td className="py-2.5 px-3 font-mono font-bold text-emerald-400 text-right">
                          {step.marks} M
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Two Column Advice: Key Points vs Pitfalls */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-3.5 rounded-lg bg-emerald-950/20 border border-emerald-500/20 space-y-1.5">
                <span className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                  Examiner's Must-Include Keywords:
                </span>
                <ul className="text-[11px] text-slate-300 space-y-1 list-disc list-inside">
                  {scheme.examiner_key_points.map((pt: string, pIdx: number) => (
                    <li key={pIdx}>{pt}</li>
                  ))}
                </ul>
              </div>

              <div className="p-3.5 rounded-lg bg-rose-950/20 border border-rose-500/20 space-y-1.5">
                <span className="text-xs font-bold text-rose-300 flex items-center gap-1.5">
                  <AlertTriangle className="h-3.5 w-3.5 text-rose-400" />
                  Common Student Errors & Deductions:
                </span>
                <ul className="text-[11px] text-rose-200/90 space-y-1 list-disc list-inside">
                  {scheme.common_pitfalls_to_avoid.map((pf: string, pfIdx: number) => (
                    <li key={pfIdx}>{pf}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
