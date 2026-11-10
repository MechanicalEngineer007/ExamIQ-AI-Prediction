import React from 'react';
import { 
  History, 
  BookMarked, 
  ShieldCheck, 
  Award, 
  ArrowRight, 
  AlertTriangle, 
  Sparkles, 
  CheckCircle, 
  Layers, 
  Clock, 
  FileCheck,
  GraduationCap,
  School,
  Trophy,
  Plus
} from 'lucide-react';
import type { ExamDetail, ExamConfig } from '../api';

interface MainDashboardProps {
  detail: ExamDetail | null;
  onNavigateTab: (tab: string) => void;
  allExams?: ExamConfig[];
  enrolledExamIds?: number[];
  onSelectExam?: (id: number) => void;
  onOpenEnrollModal?: () => void;
}

export const MainDashboard: React.FC<MainDashboardProps> = ({ 
  detail, 
  onNavigateTab,
  allExams = [],
  enrolledExamIds = [],
  onSelectExam,
  onOpenEnrollModal
}) => {
  if (!detail) {
    return (
      <div className="flex items-center justify-center p-12 text-slate-400">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mr-3"></div>
        Loading examination intelligence data...
      </div>
    );
  }

  const { config, stats } = detail;
  const yearsRange = stats.analyzed_years.length > 0 
    ? `${stats.analyzed_years[0]} – ${stats.analyzed_years[stats.analyzed_years.length - 1]}`
    : '2011 – 2025';

  const getCategory = (exam: ExamConfig): 'University' | 'School' | 'Competitive' => {
    const text = (exam.board_university + ' ' + exam.course_degree + ' ' + exam.exam_type + ' ' + exam.title).toLowerCase();
    if (text.includes('mpsc') || text.includes('upsc') || text.includes('rto') || text.includes('amvi') || text.includes('competitive') || text.includes('recruitment')) {
      return 'Competitive';
    }
    if (text.includes('school') || text.includes('board') || text.includes('hsc') || text.includes('ssc') || text.includes('cbse') || text.includes('icse') || text.includes('class 10') || text.includes('class 12')) {
      return 'School';
    }
    return 'University';
  };

  const enrolledExams = allExams.filter(e => enrolledExamIds.includes(e.id));

  return (
    <div className="space-y-6">
      {/* Candidate Multi-Exam Portfolio Strip */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 mb-3 border-b border-slate-800/80 gap-2">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400">
              <GraduationCap className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-bold text-white">Candidate's Multi-Exam Portfolio</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                  {enrolledExams.length} Enrolled
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Single user enrolled in multiple examinations across multiple universities & categories. Switch instantly below:
              </p>
            </div>
          </div>
          {onOpenEnrollModal && (
            <button
              onClick={onOpenEnrollModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 transition self-start sm:self-auto"
            >
              <Plus className="h-3.5 w-3.5" />
              Enroll / Manage Exams
            </button>
          )}
        </div>

        {/* Enrolled Exam Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {enrolledExams.map((ex) => {
            const isCurrent = ex.id === config.id;
            const category = getCategory(ex);
            return (
              <div
                key={ex.id}
                onClick={() => onSelectExam?.(ex.id)}
                className={`group cursor-pointer rounded-xl p-3.5 border transition relative flex flex-col justify-between ${
                  isCurrent
                    ? 'bg-gradient-to-b from-blue-900/40 to-slate-900 border-blue-500 shadow-lg shadow-blue-500/10'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                      category === 'Competitive'
                        ? 'bg-purple-500/15 text-purple-300 border border-purple-500/30'
                        : category === 'School'
                        ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                        : 'bg-blue-500/15 text-blue-300 border border-blue-500/30'
                    }`}>
                      {category === 'Competitive' && <Trophy className="h-2.5 w-2.5" />}
                      {category === 'School' && <School className="h-2.5 w-2.5" />}
                      {category === 'University' && <GraduationCap className="h-2.5 w-2.5" />}
                      {category}
                    </span>
                    {isCurrent && (
                      <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                        Active
                      </span>
                    )}
                  </div>
                  <h4 className="text-xs font-bold text-white line-clamp-1 group-hover:text-blue-400 transition">
                    {ex.subject_name}
                  </h4>
                  <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                    {ex.board_university}
                  </p>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-400">
                  <span>{ex.course_degree.split('(')[0]}</span>
                  <span className="font-semibold text-slate-300">{ex.total_marks} Marks</span>
                </div>
              </div>
            );
          })}

          {onOpenEnrollModal && (
            <div
              onClick={onOpenEnrollModal}
              className="cursor-pointer rounded-xl p-3.5 border border-dashed border-slate-700 hover:border-indigo-500/60 bg-slate-900/30 hover:bg-indigo-950/20 transition flex flex-col items-center justify-center text-center group min-h-[110px]"
            >
              <div className="p-2 rounded-full bg-slate-800 group-hover:bg-indigo-600/20 text-slate-400 group-hover:text-indigo-400 mb-1.5 transition">
                <Plus className="h-4 w-4" />
              </div>
              <span className="text-xs font-semibold text-slate-300 group-hover:text-indigo-300 transition">
                Add More Exams
              </span>
              <span className="text-[10px] text-slate-400 mt-0.5">
                University, School & Competitive
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Hero Exam Summary Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-blue-950/60 to-slate-900 border border-slate-800 p-6 md:p-8">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md bg-blue-500/20 text-blue-300 text-xs font-semibold uppercase tracking-wider">
                {config.board_university}
              </span>
              <span className="px-2.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 text-xs font-semibold">
                {config.academic_year}
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              {config.subject_name}
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl">
              {config.course_degree} • {config.class_semester} • Code: <span className="text-white font-mono">{config.subject_code}</span>
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => onNavigateTab('prediction')}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm shadow-lg shadow-blue-600/30 transition transform hover:-translate-y-0.5"
            >
              <Sparkles className="h-4 w-4" />
              Generate Predicted Paper
            </button>
            <button
              onClick={() => onNavigateTab('backtest')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium text-sm transition"
            >
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              Run 2-Year Backtesting
            </button>
          </div>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Stat 1 */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-slate-400">Historical Scope</span>
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
              <History className="h-5 w-5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white mb-1">{stats.total_papers} Papers</div>
          <div className="text-xs text-slate-400 flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-blue-400" />
            Spanning {yearsRange} ({stats.analyzed_years.length} yrs)
          </div>
        </div>

        {/* Stat 2 */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-slate-400">Classified Questions</span>
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
              <Layers className="h-5 w-5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white mb-1">{stats.total_questions} Questions</div>
          <div className="text-xs text-slate-400 flex items-center gap-1.5">
            <FileCheck className="h-3.5 w-3.5 text-indigo-400" />
            Structured with marks & difficulty
          </div>
        </div>

        {/* Stat 3 */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-slate-400">Official Syllabus Weightage</span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <BookMarked className="h-5 w-5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white mb-1">
            {stats.is_official_weightage_available ? '100% Prescribed' : 'Estimated'}
          </div>
          <div className="text-xs text-emerald-400 flex items-center gap-1.5">
            <CheckCircle className="h-3.5 w-3.5" />
            Obsolete topics actively pruned
          </div>
        </div>

        {/* Stat 4 */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-slate-400">ML Model Status</span>
            <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400">
              <Award className="h-5 w-5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white mb-1">Calibrated</div>
          <div className="text-xs text-cyan-400 flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5" />
            Brier-Calibrated Platt Scaling
          </div>
        </div>
      </div>

      {/* Mandatory Entertainment Purposes Disclaimer */}
      <div className="rounded-2xl border-2 border-amber-500/40 bg-gradient-to-br from-amber-500/10 via-slate-900 to-amber-950/20 p-5 shadow-xl">
        <div className="flex items-start gap-3.5">
          <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 flex-shrink-0 mt-0.5">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <div className="text-xs text-amber-100 leading-relaxed space-y-2">
            <h3 className="text-sm font-extrabold text-amber-300 uppercase tracking-wide">
              ⚠️ Disclaimer: For Entertainment Purposes Only
            </h3>
            <p className="text-amber-200/95 font-medium">
              This AI Exam Prediction App is created purely for fun and entertainment. The predictions generated by AI are not real, accurate, or guaranteed in any way. This app does not provide actual exam predictions or guarantee which questions will appear in your examination.
            </p>
            <p className="text-amber-200/90">
              Please do not take these predictions seriously or rely on them for your exam preparation. Always study your syllabus, refer to official study materials, and prepare thoroughly.
            </p>
            <div className="pt-1 font-bold text-amber-300 flex items-center gap-1.5">
              <span>Remember: AI predictions are just for fun. Your hard work determines your success! 📚</span>
            </div>
          </div>
        </div>
      </div>

      {/* Feature Exploration Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div 
          onClick={() => onNavigateTab('historical')}
          className="group cursor-pointer rounded-xl bg-slate-900/60 border border-slate-800 p-5 hover:border-blue-500/50 hover:bg-slate-800/40 transition"
        >
          <div className="h-10 w-10 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center mb-3 group-hover:scale-110 transition">
            <History className="h-5 w-5" />
          </div>
          <h3 className="text-base font-semibold text-white mb-1.5 group-hover:text-blue-400 transition">
            Historical Paper Analysis
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed mb-4">
            Inspect 15 years of question recurrence patterns, chapter-wise marks distribution, and dormant topics not asked recently.
          </p>
          <div className="text-xs font-medium text-blue-400 flex items-center gap-1">
            Explore Trends <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition" />
          </div>
        </div>

        <div 
          onClick={() => onNavigateTab('prediction')}
          className="group cursor-pointer rounded-xl bg-slate-900/60 border border-slate-800 p-5 hover:border-indigo-500/50 hover:bg-slate-800/40 transition"
        >
          <div className="h-10 w-10 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-3 group-hover:scale-110 transition">
            <Sparkles className="h-5 w-5" />
          </div>
          <h3 className="text-base font-semibold text-white mb-1.5 group-hover:text-indigo-400 transition">
            Predicted Paper Generator
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed mb-4">
            Generates authentic board-style question papers with left Q. numbers, right marks, and 2-3 supplementary predictions per slot.
          </p>
          <div className="text-xs font-medium text-indigo-400 flex items-center gap-1">
            Open Studio <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition" />
          </div>
        </div>

        <div 
          onClick={() => onNavigateTab('backtest')}
          className="group cursor-pointer rounded-xl bg-slate-900/60 border border-slate-800 p-5 hover:border-emerald-500/50 hover:bg-slate-800/40 transition"
        >
          <div className="h-10 w-10 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-3 group-hover:scale-110 transition">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <h3 className="text-base font-semibold text-white mb-1.5 group-hover:text-emerald-400 transition">
            Chronological Backtesting
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed mb-4">
            Rigorous chronological validation predicting 2024 (from 2011-23) and 2025 (from 2011-24) to evaluate Top-K accuracy and F1.
          </p>
          <div className="text-xs font-medium text-emerald-400 flex items-center gap-1">
            View Backtests <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition" />
          </div>
        </div>
      </div>
    </div>
  );
};
