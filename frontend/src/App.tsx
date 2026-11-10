import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Sparkles, 
  ArrowLeftRight, 
  Compass, 
  Grid
} from 'lucide-react';
import { 
  fetchExams, 
  fetchExamDetail, 
  runPrediction,
  type ExamConfig, 
  type ExamDetail,
  type PredictionResponse 
} from './api';
import { Navbar, APP_TABS } from './components/Navbar';
import { MainDashboard } from './components/MainDashboard';
import { HistoricalAnalysisView } from './components/HistoricalAnalysisView';
import { PredictionStudio } from './components/PredictionStudio';
import { BacktestingDashboard } from './components/BacktestingDashboard';
import { DocumentManagementView } from './components/DocumentManagementView';
import { SelfLearningView } from './components/SelfLearningFeedbackModal';
import { MarkingSchemeView } from './components/MarkingSchemeView';
import { StudyRoadmapView } from './components/StudyRoadmapView';
import { MultiSetView } from './components/MultiSetView';
import { InteractiveCustomizer } from './components/InteractiveCustomizer';
import { MultiExamEnrollmentModal } from './components/MultiExamEnrollmentModal';

export const App: React.FC = () => {
  const [exams, setExams] = useState<ExamConfig[]>([]);
  const [currentExamId, setCurrentExamId] = useState<number>(1);
  const [examDetail, setExamDetail] = useState<ExamDetail | null>(null);
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [selectedLang, setSelectedLang] = useState<string>('en');
  const [sharedPrediction, setSharedPrediction] = useState<PredictionResponse | null>(null);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState<boolean>(false);
  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState<boolean>(false);

  // Multi-exam portfolio enrolled exam IDs with persistence across universities & categories
  const [enrolledExamIds, setEnrolledExamIds] = useState<number[]>(() => {
    try {
      const saved = localStorage.getItem('user_enrolled_exams');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Failed reading user_enrolled_exams', e);
    }
    // Default enrolled portfolio across University, School, and Competitive:
    // 1: B.Tech DBMS (SPPU), 3: B.Com Auditing (Mumbai Univ), 5: HSC Physics (MSBSHSE), 8: RTO AMVI Mains (MPSC)
    return [1, 3, 5, 8];
  });

  // Save enrolled exams on change
  useEffect(() => {
    try {
      localStorage.setItem('user_enrolled_exams', JSON.stringify(enrolledExamIds));
    } catch (e) {
      console.error('Failed saving user_enrolled_exams', e);
    }
  }, [enrolledExamIds]);

  // Load available exams
  useEffect(() => {
    fetchExams()
      .then((data) => {
        setExams(data);
        if (data.length > 0) {
          // If currentExamId is not in enrolled or data, pick first enrolled or first available
          if (!enrolledExamIds.includes(currentExamId) && enrolledExamIds.length > 0) {
            const firstEnrolled = data.find(x => x.id === enrolledExamIds[0]);
            if (firstEnrolled) {
              setCurrentExamId(firstEnrolled.id);
              setSelectedLang(firstEnrolled.default_language || 'en');
              return;
            }
          }
          const defaultEx = data.find(x => x.id === currentExamId) || data[0];
          setCurrentExamId(defaultEx.id);
          setSelectedLang(defaultEx.default_language || 'en');
        }
      })
      .catch((err) => console.error('Failed to load exams', err));
  }, []);

  const handleEnrollExam = (id: number) => {
    setEnrolledExamIds((prev) => {
      if (prev.includes(id)) return prev;
      return [...prev, id];
    });
  };

  const handleUnenrollExam = (id: number) => {
    setEnrolledExamIds((prev) => {
      if (prev.length <= 1) return prev;
      const updated = prev.filter((x) => x !== id);
      if (currentExamId === id && updated.length > 0) {
        setCurrentExamId(updated[0]);
      }
      return updated;
    });
  };

  const handleCreateCustomExam = (newExamData: Partial<ExamConfig>) => {
    const newId = Date.now();
    const created: ExamConfig = {
      id: newId,
      title: newExamData.title || 'Custom Examination',
      board_university: newExamData.board_university || 'Custom University / Board',
      course_degree: newExamData.course_degree || 'Degree Program',
      class_semester: newExamData.class_semester || 'Final Stage',
      subject_name: newExamData.subject_name || newExamData.title || 'Subject',
      subject_code: newExamData.subject_code || `EX-${Math.floor(Math.random() * 900 + 100)}`,
      exam_type: newExamData.exam_type || 'Examination',
      total_marks: newExamData.total_marks || 100,
      duration_minutes: newExamData.duration_minutes || 180,
      academic_year: '2025-2026',
      default_language: 'en'
    };

    try {
      const existing = localStorage.getItem('user_custom_exams');
      const list = existing ? JSON.parse(existing) : [];
      list.push(created);
      localStorage.setItem('user_custom_exams', JSON.stringify(list));
    } catch (e) {
      console.error('Failed saving user_custom_exams', e);
    }

    setExams((prev) => [...prev, created]);
    setEnrolledExamIds((prev) => [...prev, newId]);
    setCurrentExamId(newId);
    setIsEnrollModalOpen(false);
  };

  // Load current exam detail & initialize base prediction for marking scheme and customizer
  useEffect(() => {
    if (!currentExamId) return;
    fetchExamDetail(currentExamId)
      .then((data) => {
        setExamDetail(data);
        setSelectedLang(data.config.default_language || 'en');
        runPrediction({
          exam_config_id: currentExamId,
          target_year: 2026,
          language: data.config.default_language || 'en'
        }).then(setSharedPrediction).catch(console.error);
      })
      .catch((err) => {
        console.error('Failed to load exam detail', err);
      });
  }, [currentExamId]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans w-full max-w-full overflow-x-hidden">
      <Navbar
        exams={exams}
        currentExamId={currentExamId}
        onSelectExam={(id) => setCurrentExamId(id)}
        activeTab={activeTab}
        onSelectTab={(tab) => setActiveTab(tab)}
        selectedLang={selectedLang}
        onSelectLang={(lang) => setSelectedLang(lang)}
        enrolledExamIds={enrolledExamIds}
        onOpenEnrollModal={() => setIsEnrollModalOpen(true)}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 pb-28 md:pb-12 overflow-x-hidden">
        {activeTab === 'dashboard' && (
          <MainDashboard 
            detail={examDetail} 
            onNavigateTab={(tab) => setActiveTab(tab)}
            allExams={exams}
            enrolledExamIds={enrolledExamIds}
            onSelectExam={(id) => setCurrentExamId(id)}
            onOpenEnrollModal={() => setIsEnrollModalOpen(true)}
          />
        )}

        {activeTab === 'historical' && (
          <HistoricalAnalysisView examId={currentExamId} />
        )}

        {activeTab === 'prediction' && (
          <PredictionStudio 
            examId={currentExamId} 
            selectedLang={selectedLang}
            onNavigateTab={(tab) => setActiveTab(tab)}
          />
        )}

        {activeTab === 'customizer' && (
          <InteractiveCustomizer 
            prediction={sharedPrediction} 
            onUpdatePrediction={(updated) => setSharedPrediction(updated)} 
          />
        )}

        {activeTab === 'multiset' && (
          <MultiSetView examId={currentExamId} />
        )}

        {activeTab === 'markingscheme' && (
          <MarkingSchemeView predictionId={sharedPrediction?.prediction_id || 1} />
        )}

        {activeTab === 'roadmap' && (
          <StudyRoadmapView examId={currentExamId} />
        )}

        {activeTab === 'backtest' && (
          <BacktestingDashboard examId={currentExamId} />
        )}

        {activeTab === 'documents' && (
          <DocumentManagementView examId={currentExamId} selectedLang={selectedLang} />
        )}

        {activeTab === 'learning' && (
          <SelfLearningView examId={currentExamId} />
        )}
      </main>

      {/* Android Native Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 border-t border-slate-800 backdrop-blur px-2 py-1.5 shadow-2xl">
        <div className="flex items-center justify-around">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-lg transition ${
              activeTab === 'dashboard' ? 'text-blue-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BarChart3 className="h-5 w-5 mb-0.5" />
            <span className="text-[10px]">Overview</span>
          </button>

          <button
            onClick={() => setActiveTab('prediction')}
            className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-lg transition ${
              activeTab === 'prediction' ? 'text-blue-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="h-5 w-5 mb-0.5" />
            <span className="text-[10px]">Predict</span>
          </button>

          <button
            onClick={() => setActiveTab('customizer')}
            className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-lg transition ${
              activeTab === 'customizer' ? 'text-blue-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ArrowLeftRight className="h-5 w-5 mb-0.5" />
            <span className="text-[10px]">Customize</span>
          </button>

          <button
            onClick={() => setActiveTab('roadmap')}
            className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-lg transition ${
              activeTab === 'roadmap' ? 'text-blue-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Compass className="h-5 w-5 mb-0.5" />
            <span className="text-[10px]">Roadmap</span>
          </button>

          <button
            onClick={() => setMobileDrawerOpen(true)}
            className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-lg transition ${
              !['dashboard', 'prediction', 'customizer', 'roadmap'].includes(activeTab)
                ? 'text-blue-400 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Grid className="h-5 w-5 mb-0.5" />
            <span className="text-[10px]">Tools ({APP_TABS.length})</span>
          </button>
        </div>
      </nav>

      {/* Mobile Tools Drawer Sheet */}
      {mobileDrawerOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex flex-col justify-end">
          <div className="bg-slate-900 border-t border-slate-700 rounded-t-3xl p-5 max-h-[85vh] overflow-y-auto space-y-4 shadow-2xl animate-in slide-in-from-bottom duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Grid className="h-5 w-5 text-blue-400" />
                <span className="font-bold text-white text-base">All 10 Examination Features</span>
              </div>
              <button
                onClick={() => setMobileDrawerOpen(false)}
                className="text-xs px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 font-medium"
              >
                Close
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {APP_TABS.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id);
                      setMobileDrawerOpen(false);
                    }}
                    className={`flex flex-col items-start p-3 rounded-2xl border text-left transition ${
                      isActive
                        ? 'bg-blue-600/20 border-blue-500 text-white shadow-lg shadow-blue-500/10'
                        : 'bg-slate-800/60 border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-2">
                      <div className={`p-2 rounded-xl ${isActive ? 'bg-blue-600 text-white' : 'bg-slate-700 text-blue-400'}`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      {tab.badge && (
                        <span className="text-[8px] px-1.5 py-0.5 rounded font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                          {tab.badge}
                        </span>
                      )}
                    </div>
                    <span className="font-semibold text-xs leading-snug">{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <footer className="hidden md:block border-t border-slate-800 bg-slate-900/50 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            <span className="font-semibold text-slate-400">ExamIQ AI Platform v2.5</span> • Enterprise Examination Intelligence Suite
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span>Bloom's Taxonomy</span>
            <span>•</span>
            <span>Parallel Sets A-D</span>
            <span>•</span>
            <span className="text-emerald-400 font-medium">Brier-Calibrated</span>
            <span>•</span>
            <span className="text-blue-400 font-medium">Bilingual Ready</span>
          </div>
        </div>
      </footer>

      {/* Universal Multi-Exam & Multi-University Enrollment Modal */}
      <MultiExamEnrollmentModal
        isOpen={isEnrollModalOpen}
        onClose={() => setIsEnrollModalOpen(false)}
        allExams={exams}
        enrolledExamIds={enrolledExamIds}
        currentExamId={currentExamId}
        onSelectExam={(id) => setCurrentExamId(id)}
        onEnrollExam={handleEnrollExam}
        onUnenrollExam={handleUnenrollExam}
        onCreateCustomExam={handleCreateCustomExam}
      />
    </div>
  );
};

export default App;
