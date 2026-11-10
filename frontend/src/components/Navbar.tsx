import React, { useState } from 'react';
import { 
  Sparkles, 
  BarChart3, 
  CheckCircle2, 
  ShieldCheck, 
  BookOpen, 
  UploadCloud, 
  RefreshCw,
  Globe2,
  FileCheck2,
  Layers,
  Compass,
  ArrowLeftRight,
  Menu,
  X,
  GraduationCap
} from 'lucide-react';
import type { ExamConfig } from '../api';

export interface NavTabItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

export const APP_TABS: NavTabItem[] = [
  { id: 'dashboard', label: 'Main Overview', icon: BarChart3 },
  { id: 'historical', label: 'Historical Trends', icon: BookOpen },
  { id: 'prediction', label: 'Prediction Studio', icon: Sparkles, badge: 'Core' },
  { id: 'customizer', label: 'Paper Customizer', icon: ArrowLeftRight, badge: 'Interactive' },
  { id: 'multiset', label: 'Multi-Set Generator', icon: Layers, badge: 'Sets A-D' },
  { id: 'markingscheme', label: 'Marking Rubric', icon: FileCheck2 },
  { id: 'roadmap', label: 'Study Roadmap', icon: Compass, badge: 'High Yield' },
  { id: 'backtest', label: 'Backtesting Lab', icon: ShieldCheck, badge: '98% Acc' },
  { id: 'documents', label: 'Document & OCR', icon: UploadCloud },
  { id: 'learning', label: 'Self-Learning Loop', icon: RefreshCw },
];

interface NavbarProps {
  exams: ExamConfig[];
  currentExamId: number;
  onSelectExam: (id: number) => void;
  activeTab: string;
  onSelectTab: (tab: string) => void;
  selectedLang: string;
  onSelectLang: (lang: string) => void;
  enrolledExamIds?: number[];
  onOpenEnrollModal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  exams,
  currentExamId,
  onSelectExam,
  activeTab,
  onSelectTab,
  selectedLang,
  onSelectLang,
  enrolledExamIds = [],
  onOpenEnrollModal,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const currentTabObj = APP_TABS.find(t => t.id === activeTab) || APP_TABS[0];
  const CurrentIcon = currentTabObj.icon;

  const handleSelectTab = (tabId: string) => {
    onSelectTab(tabId);
    setMobileMenuOpen(false);
  };

  // Helper to categorize exams
  const getExamCategory = (exam: ExamConfig): 'University' | 'School' | 'Competitive' => {
    const text = (exam.board_university + ' ' + exam.course_degree + ' ' + exam.exam_type + ' ' + exam.title).toLowerCase();
    if (text.includes('mpsc') || text.includes('upsc') || text.includes('rto') || text.includes('amvi') || text.includes('competitive') || text.includes('recruitment')) {
      return 'Competitive';
    }
    if (text.includes('school') || text.includes('board') || text.includes('hsc') || text.includes('ssc') || text.includes('cbse') || text.includes('icse') || text.includes('class 10') || text.includes('class 12')) {
      return 'School';
    }
    return 'University';
  };

  // Display only enrolled exams if configured, else all
  const displayedExams = enrolledExamIds.length > 0 
    ? exams.filter(e => enrolledExamIds.includes(e.id))
    : exams;

  const universityExams = displayedExams.filter(e => getExamCategory(e) === 'University');
  const schoolExams = displayedExams.filter(e => getExamCategory(e) === 'School');
  const competitiveExams = displayedExams.filter(e => getExamCategory(e) === 'Competitive');

  return (
    <header className="border-b border-slate-800 bg-slate-900/95 backdrop-blur sticky top-0 z-50 w-full max-w-full">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        {/* Main Header Bar */}
        <div className="flex items-center justify-between h-14 sm:h-16 gap-2">
          {/* Logo & Brand */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/20 shrink-0">
              <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="font-extrabold text-base sm:text-lg text-white tracking-tight">ExamIQ</span>
                <span className="hidden sm:inline-flex text-[10px] sm:text-xs px-2 py-0.5 rounded-full font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  AI Prediction
                </span>
                <span className="hidden md:inline-flex text-[10px] sm:text-xs px-2 py-0.5 rounded-full font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" /> Backtested
                </span>
              </div>
              <p className="hidden sm:block text-[10px] sm:text-[11px] text-slate-400 truncate max-w-[200px] md:max-w-none">
                Universal Multi-University & Multi-Category Intelligence
              </p>
            </div>
          </div>

          {/* Action Area: Subject, Multi-Exam Portfolio, Language, Mobile Drawer Toggle */}
          <div className="flex items-center gap-1.5 sm:gap-2.5">
            {/* Subject Selector grouped by Category */}
            <div className="relative max-w-[130px] sm:max-w-[220px]">
              <select
                value={currentExamId}
                onChange={(e) => {
                  if (e.target.value === '__manage__') {
                    onOpenEnrollModal?.();
                  } else {
                    onSelectExam(Number(e.target.value));
                  }
                }}
                aria-label="Select Subject"
                className="w-full bg-slate-800 border border-slate-700 text-slate-200 text-[11px] sm:text-xs rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none cursor-pointer truncate"
              >
                {universityExams.length > 0 && (
                  <optgroup label="🎓 University Degree Exams">
                    {universityExams.map((ex) => (
                      <option key={ex.id} value={ex.id}>
                        {ex.subject_name} ({ex.board_university.split(' ')[0]})
                      </option>
                    ))}
                  </optgroup>
                )}
                {schoolExams.length > 0 && (
                  <optgroup label="🏫 School Board Exams">
                    {schoolExams.map((ex) => (
                      <option key={ex.id} value={ex.id}>
                        {ex.subject_name}
                      </option>
                    ))}
                  </optgroup>
                )}
                {competitiveExams.length > 0 && (
                  <optgroup label="🏆 Competitive & RTO Exams">
                    {competitiveExams.map((ex) => (
                      <option key={ex.id} value={ex.id}>
                        {ex.subject_name}
                      </option>
                    ))}
                  </optgroup>
                )}
                <option value="__manage__">➕ Manage / Add More Exams...</option>
              </select>
            </div>

            {/* Quick Multi-Exam Portfolio Button */}
            {onOpenEnrollModal && (
              <button
                onClick={onOpenEnrollModal}
                className="flex items-center gap-1.5 px-2 sm:px-2.5 py-1.5 sm:py-2 rounded-lg bg-gradient-to-r from-blue-600/20 to-indigo-600/20 hover:from-blue-600/30 hover:to-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-[11px] sm:text-xs font-semibold transition shrink-0 shadow-sm"
                title="Manage Enrolled Exams & Multi-University Portfolio"
              >
                <GraduationCap className="h-3.5 w-3.5 text-indigo-400" />
                <span className="hidden sm:inline">My Exams</span>
                <span className="px-1.5 py-0.2 rounded-full bg-indigo-500/30 text-[10px] text-indigo-200 font-bold">
                  {enrolledExamIds.length > 0 ? enrolledExamIds.length : exams.length}
                </span>
              </button>
            )}

            {/* Language Selector */}
            <div className="flex items-center bg-slate-800 p-0.5 sm:p-1 rounded-lg border border-slate-700">
              <Globe2 className="hidden sm:block h-3.5 w-3.5 text-slate-400 ml-1 mr-1" />
              {(['en', 'mr', 'hi'] as const).map((lang) => (
                <button
                  key={lang}
                  onClick={() => onSelectLang(lang)}
                  className={`text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded font-medium transition ${
                    selectedLang === lang
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {lang === 'en' ? 'EN' : lang === 'mr' ? 'मरा' : 'हिन्'}
                </button>
              ))}
            </div>

            {/* Mobile Hamburger / Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-750 transition"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Desktop Navigation Tabs (Hidden on small screens) */}
        <nav className="hidden md:flex space-x-1 border-t border-slate-800/60 overflow-x-auto py-1 no-scrollbar">
          {APP_TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleSelectTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition whitespace-nowrap ${
                  isActive
                    ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                <Icon className={`h-3.5 w-3.5 ${isActive ? 'text-blue-400' : 'text-slate-400'}`} />
                {tab.label}
              </button>
            );
          })}
        </nav>

        {/* Mobile Active Tab Pill Indicator */}
        <div className="md:hidden flex items-center justify-between py-1.5 px-1 border-t border-slate-800/50 text-xs">
          <div className="flex items-center gap-1.5 text-blue-400 font-semibold truncate">
            <CurrentIcon className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{currentTabObj.label}</span>
          </div>
          <button 
            onClick={() => setMobileMenuOpen(true)}
            className="text-[11px] text-slate-400 hover:text-blue-300 underline font-medium"
          >
            All Features
          </button>
        </div>
      </div>

      {/* Mobile Drawer Overlay / Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex flex-col justify-end">
          <div className="bg-slate-900 border-t border-slate-700 rounded-t-2xl p-4 max-h-[85vh] overflow-y-auto space-y-3 shadow-2xl animate-in slide-in-from-bottom duration-200">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-blue-400" />
                <span className="font-bold text-white text-base">Select Examination Tool</span>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1 rounded-full bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              {APP_TABS.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => handleSelectTab(tab.id)}
                    className={`flex flex-col items-start p-3 rounded-xl border text-left transition ${
                      isActive
                        ? 'bg-blue-600/20 border-blue-500 text-white shadow-md'
                        : 'bg-slate-800/60 border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-1.5">
                      <div className={`p-2 rounded-lg ${isActive ? 'bg-blue-600 text-white' : 'bg-slate-700 text-blue-400'}`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      {tab.badge && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                          {tab.badge}
                        </span>
                      )}
                    </div>
                    <span className="font-semibold text-xs leading-snug">{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {onOpenEnrollModal && (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenEnrollModal();
                }}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-blue-600/30 to-indigo-600/30 border border-indigo-500/40 text-indigo-200 font-semibold text-xs transition shadow-sm"
              >
                <GraduationCap className="h-4 w-4 text-indigo-400" />
                Manage Multi-University Exams Portfolio ({enrolledExamIds.length})
              </button>
            )}

            <div className="pt-2 border-t border-slate-800 text-center">
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 font-medium text-xs transition"
              >
                Close Menu
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
