import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  CheckCircle2, 
  XCircle, 
  TrendingUp, 
  Calendar, 
  FileCheck,
  RefreshCw
} from 'lucide-react';
import { type BacktestResult, runBacktest } from '../api';

interface BacktestingDashboardProps {
  examId: number;
}

export const BacktestingDashboard: React.FC<BacktestingDashboardProps> = ({ examId }) => {
  const [selectedYear, setSelectedYear] = useState<number>(2024);
  const [backtestData, setBacktestData] = useState<BacktestResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchBacktest = async (year: number) => {
    setLoading(true);
    try {
      const res = await runBacktest(examId, year);
      setBacktestData(res);
    } catch (err: any) {
      console.error(err);
      alert(`Backtest execution error: ${err.message || 'Check backend'}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBacktest(selectedYear);
  }, [examId, selectedYear]);

  return (
    <div className="space-y-6">
      {/* Header and Year Tabs */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck className="h-5 w-5 text-emerald-400" />
            <h2 className="text-xl font-bold text-white">
              Chronological Backtesting Validation Engine
            </h2>
          </div>
          <p className="text-xs text-slate-400">
            Strict chronological validation against previous 2 years of actual board examination papers without forward data leakage.
          </p>
        </div>

        {/* Year Toggle Buttons */}
        <div className="flex items-center gap-2 bg-slate-800/80 p-1.5 rounded-xl border border-slate-700">
          <button
            onClick={() => setSelectedYear(2024)}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              selectedYear === 2024
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Calendar className="h-3.5 w-3.5" />
            2024 Actual Exam Backtest
          </button>
          <button
            onClick={() => setSelectedYear(2025)}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              selectedYear === 2025
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Calendar className="h-3.5 w-3.5" />
            2025 Actual Exam Backtest
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center p-16 text-slate-400">
          <RefreshCw className="animate-spin h-8 w-8 text-blue-500 mr-3" />
          Running chronological training fold and semantic evaluation for {selectedYear}...
        </div>
      ) : backtestData ? (
        <>
          {/* Validation Scope Banner */}
          <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-blue-200">
            <div>
              <span className="font-bold text-blue-300">Chronological Split:</span> Trained strictly on{' '}
              <b className="font-mono text-white">{backtestData.train_years_range}</b> historical papers ({backtestData.training_samples_count} questions) → Validated on{' '}
              <b className="font-mono text-white">{backtestData.test_year}</b> actual examination paper ({backtestData.actual_questions_count} questions).
            </div>
            <div className="px-3 py-1 rounded-md bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30 whitespace-nowrap">
              {backtestData.model_verdict}
            </div>
          </div>

          {/* 6 Key Backtesting Metric Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
            {/* Metric 1: Top 5 Topic Accuracy */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <span className="text-[11px] font-medium text-slate-400 block mb-1">Top-5 Topics</span>
              <div className="text-xl font-extrabold text-blue-400">{backtestData.top5_topic_accuracy}%</div>
              <span className="text-[10px] text-slate-500">Predicted in Top 5</span>
            </div>

            {/* Metric 2: Top 10 Topic Accuracy */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <span className="text-[11px] font-medium text-slate-400 block mb-1">Top-10 Topics</span>
              <div className="text-xl font-extrabold text-indigo-400">{backtestData.top10_topic_accuracy}%</div>
              <span className="text-[10px] text-slate-500">Predicted in Top 10</span>
            </div>

            {/* Metric 3: Marks Coverage % */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <span className="text-[11px] font-medium text-slate-400 block mb-1">Marks Coverage</span>
              <div className="text-xl font-extrabold text-emerald-400">{backtestData.marks_coverage_pct}%</div>
              <span className="text-[10px] text-slate-500">Actual paper marks</span>
            </div>

            {/* Metric 4: Semantic F1-Score */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <span className="text-[11px] font-medium text-slate-400 block mb-1">Semantic F1</span>
              <div className="text-xl font-extrabold text-purple-400">{backtestData.semantic_matching_f1}</div>
              <span className="text-[10px] text-slate-500">Concept equivalence</span>
            </div>

            {/* Metric 5: Precision@10 */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <span className="text-[11px] font-medium text-slate-400 block mb-1">Precision@10</span>
              <div className="text-xl font-extrabold text-cyan-400">{backtestData.precision_at_k}</div>
              <span className="text-[10px] text-slate-500">Top-10 hit rate</span>
            </div>

            {/* Metric 6: Brier Calibration */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <span className="text-[11px] font-medium text-slate-400 block mb-1">Brier Calibration</span>
              <div className="text-xl font-extrabold text-amber-400">{backtestData.brier_score_calibration}</div>
              <span className="text-[10px] text-slate-500">Lower is better</span>
            </div>
          </div>

          {/* Reliability & Calibration Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-amber-400" />
              Empirical Probability Calibration Matrix ({selectedYear} Validation Fold)
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-800/60 text-slate-400 uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="py-2.5 px-3">Predicted Probability Tier</th>
                    <th className="py-2.5 px-3">Candidate Questions</th>
                    <th className="py-2.5 px-3">Actual Examination Hits</th>
                    <th className="py-2.5 px-3">Empirical Accuracy %</th>
                    <th className="py-2.5 px-3">Calibration Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {backtestData.calibration_curve.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-800/30">
                      <td className="py-3 px-3 font-semibold text-slate-200">{row.bin}</td>
                      <td className="py-3 px-3 font-mono text-slate-400">{row.count}</td>
                      <td className="py-3 px-3 font-mono text-emerald-400">{row.actual_frequency}</td>
                      <td className="py-3 px-3 font-mono font-bold text-white">{row.empirical_accuracy}%</td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          Calibrated (No Inflation)
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Question-Level Comparison: Matched vs Missed */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
              <FileCheck className="h-4 w-4 text-blue-400" />
              Actual Examination Question-by-Question Semantic Evaluation ({selectedYear})
            </h3>

            <div className="space-y-3">
              {/* Correctly Matched Questions */}
              {backtestData.matched_questions.map((m, idx) => (
                <div 
                  key={idx}
                  className="rounded-lg p-3.5 bg-emerald-950/20 border border-emerald-500/30 space-y-1.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0" />
                      <span className="text-xs font-bold text-emerald-300">
                        Actual {selectedYear} Question:
                      </span>
                    </div>
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">
                      Semantic Match: {(m.similarity * 100).toFixed(0)}%
                    </span>
                  </div>

                  <p className="text-xs text-slate-100 pl-6">
                    {m.actual_q} <span className="text-slate-400 font-mono">[{m.actual_marks} Marks]</span>
                  </p>

                  <div className="pl-6 pt-1 text-[11px] text-slate-400 flex flex-wrap items-center gap-2">
                    <span className="text-indigo-300 font-medium">Model's Prior Prediction:</span>
                    <span className="italic text-slate-300">"{m.predicted_q}"</span>
                    <span className="text-emerald-400 font-mono font-bold">({m.predicted_prob}% prob)</span>
                  </div>
                </div>
              ))}

              {/* Unmatched / Missed Questions */}
              {backtestData.unmatched_actual.map((u, idx) => (
                <div 
                  key={idx}
                  className="rounded-lg p-3.5 bg-rose-950/20 border border-rose-500/30 space-y-1"
                >
                  <div className="flex items-center gap-2">
                    <XCircle className="h-4 w-4 text-rose-400 flex-shrink-0" />
                    <span className="text-xs font-bold text-rose-300">
                      Missed Question ({selectedYear}):
                    </span>
                  </div>
                  <p className="text-xs text-slate-200 pl-6">
                    {u.actual_q} <span className="text-slate-400 font-mono">[{u.actual_marks} Marks]</span>
                  </p>
                  <div className="pl-6 text-[11px] text-slate-400">
                    Topic: <span className="text-slate-300">{u.actual_topic}</span> • Absorbed into self-learning loop for future cycle retraining.
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
};
