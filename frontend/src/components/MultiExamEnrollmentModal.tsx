import React, { useState } from 'react';
import { 
  X, 
  GraduationCap, 
  School, 
  Trophy, 
  Plus, 
  Check, 
  Search, 
  Building2, 
  BookOpen, 
  Trash2, 
  Sparkles,
  ArrowRight
} from 'lucide-react';
import type { ExamConfig } from '../api';

interface MultiExamEnrollmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  allExams: ExamConfig[];
  enrolledExamIds: number[];
  currentExamId: number;
  onSelectExam: (id: number) => void;
  onEnrollExam: (id: number) => void;
  onUnenrollExam: (id: number) => void;
  onCreateCustomExam: (newExam: Partial<ExamConfig>) => void;
}

export const MultiExamEnrollmentModal: React.FC<MultiExamEnrollmentModalProps> = ({
  isOpen,
  onClose,
  allExams,
  enrolledExamIds,
  currentExamId,
  onSelectExam,
  onEnrollExam,
  onUnenrollExam,
  onCreateCustomExam,
}) => {
  const [activeTab, setActiveTab] = useState<'my_exams' | 'browse' | 'custom'>('browse');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [universityFilter, setUniversityFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Custom Exam Form State
  const [customTitle, setCustomTitle] = useState('');
  const [customCategory, setCustomCategory] = useState('University');
  const [customUniversity, setCustomUniversity] = useState('');
  const [customDegree, setCustomDegree] = useState('');
  const [customSemester, setCustomSemester] = useState('');
  const [customSubject, setCustomSubject] = useState('');
  const [customCode, setCustomCode] = useState('');
  const [customMarks, setCustomMarks] = useState(100);
  const [customDuration, setCustomDuration] = useState(180);

  if (!isOpen) return null;

  // Helper to determine category
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

  const getCategoryBadge = (category: 'University' | 'School' | 'Competitive') => {
    switch (category) {
      case 'Competitive':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-purple-500/15 text-purple-300 border border-purple-500/30">
            <Trophy className="h-3 w-3" /> Competitive Exam
          </span>
        );
      case 'School':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
            <School className="h-3 w-3" /> School Board Exam
          </span>
        );
      case 'University':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-500/15 text-blue-300 border border-blue-500/30">
            <GraduationCap className="h-3 w-3" /> University Degree
          </span>
        );
    }
  };

  // Distinct universities
  const universitiesList = Array.from(new Set(allExams.map(e => e.board_university)));

  // Filtered exams
  const filteredExams = allExams.filter(exam => {
    const cat = getExamCategory(exam);
    if (categoryFilter !== 'all' && cat.toLowerCase() !== categoryFilter.toLowerCase()) return false;
    if (universityFilter !== 'all' && exam.board_university !== universityFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match = exam.title.toLowerCase().includes(q) || 
                    exam.subject_name.toLowerCase().includes(q) || 
                    exam.board_university.toLowerCase().includes(q) ||
                    exam.course_degree.toLowerCase().includes(q) ||
                    exam.subject_code.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  const enrolledExams = allExams.filter(e => enrolledExamIds.includes(e.id));

  const handleCreateCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customSubject.trim() || !customUniversity.trim()) return;

    onCreateCustomExam({
      title: customTitle.trim() || `${customDegree} - ${customSubject}`,
      board_university: customUniversity.trim(),
      course_degree: customDegree.trim() || 'Degree Program',
      class_semester: customSemester.trim() || 'Annual',
      subject_name: customSubject.trim(),
      subject_code: customCode.trim() || 'SUB-001',
      exam_type: customCategory === 'Competitive' ? 'Recruitment Competitive Exam' : (customCategory === 'School' ? 'Board Examination' : 'Semester University Exam'),
      total_marks: Number(customMarks) || 100,
      duration_minutes: Number(customDuration) || 180,
      academic_year: '2025-2026',
      default_language: 'en'
    });

    // Reset and switch to my_exams
    setCustomTitle('');
    setCustomSubject('');
    setCustomUniversity('');
    setCustomDegree('');
    setActiveTab('my_exams');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/20">
              <GraduationCap className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                User Multi-Exam & University Portfolio
                <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  {enrolledExamIds.length} Enrolled
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Enroll in multiple exams across different universities, school boards, and competitive categories under one user account.
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-950/50 px-5 gap-2 pt-2">
          <button
            onClick={() => setActiveTab('browse')}
            className={`px-4 py-2 text-xs font-semibold rounded-t-lg transition border-b-2 flex items-center gap-1.5 ${
              activeTab === 'browse'
                ? 'border-blue-500 text-blue-400 bg-slate-900'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <BookOpen className="h-3.5 w-3.5" /> Browse All Examinations & Universities ({allExams.length})
          </button>
          <button
            onClick={() => setActiveTab('my_exams')}
            className={`px-4 py-2 text-xs font-semibold rounded-t-lg transition border-b-2 flex items-center gap-1.5 ${
              activeTab === 'my_exams'
                ? 'border-blue-500 text-blue-400 bg-slate-900'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Check className="h-3.5 w-3.5 text-emerald-400" /> My Enrolled Exams ({enrolledExamIds.length})
          </button>
          <button
            onClick={() => setActiveTab('custom')}
            className={`px-4 py-2 text-xs font-semibold rounded-t-lg transition border-b-2 flex items-center gap-1.5 ${
              activeTab === 'custom'
                ? 'border-blue-500 text-blue-400 bg-slate-900'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Plus className="h-3.5 w-3.5" /> + Add Custom University / Exam
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 flex-1 overflow-y-auto space-y-4">
          
          {/* TAB 1: BROWSE CATALOG */}
          {activeTab === 'browse' && (
            <div className="space-y-4">
              {/* Filter Controls */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Search by subject, code, university..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 text-xs text-white rounded-lg pl-8 pr-3 py-2 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                {/* Category Filter */}
                <div>
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 text-xs text-white rounded-lg px-3 py-2 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="all">All Categories (Universal)</option>
                    <option value="University">Category A: University Degrees (B.Tech, MBA, B.Com, BCA)</option>
                    <option value="School">Category B: School Boards (HSC, SSC, CBSE)</option>
                    <option value="Competitive">Category C: Competitive (RTO AMVI, UPSC, MPSC)</option>
                  </select>
                </div>

                {/* University / Authority Filter */}
                <div>
                  <select
                    value={universityFilter}
                    onChange={(e) => setUniversityFilter(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 text-xs text-white rounded-lg px-3 py-2 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="all">All Universities & Boards</option>
                    {universitiesList.map((u, i) => (
                      <option key={i} value={u}>{u}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Exam Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {filteredExams.map((exam) => {
                  const cat = getExamCategory(exam);
                  const isEnrolled = enrolledExamIds.includes(exam.id);
                  const isActive = currentExamId === exam.id;

                  return (
                    <div 
                      key={exam.id}
                      className={`p-4 rounded-xl border transition flex flex-col justify-between ${
                        isActive 
                          ? 'bg-blue-950/20 border-blue-500/50 shadow-md' 
                          : 'bg-slate-900/70 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          {getCategoryBadge(cat)}
                          <span className="text-[11px] text-slate-400 font-mono">
                            {exam.subject_code}
                          </span>
                        </div>

                        <h3 className="text-sm font-bold text-white leading-tight">
                          {exam.subject_name}
                        </h3>

                        <div className="text-xs text-slate-300 flex items-center gap-1.5">
                          <Building2 className="h-3.5 w-3.5 text-blue-400 shrink-0" />
                          <span className="truncate">{exam.board_university}</span>
                        </div>

                        <p className="text-[11px] text-slate-400">
                          {exam.course_degree} • {exam.class_semester} • {exam.total_marks} Marks
                        </p>
                      </div>

                      {/* Action buttons */}
                      <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                        {isEnrolled ? (
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                              <Check className="h-3 w-3" /> Enrolled
                            </span>
                            <button
                              onClick={() => onUnenrollExam(exam.id)}
                              className="text-[11px] text-slate-400 hover:text-red-400 transition"
                            >
                              Remove
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => onEnrollExam(exam.id)}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition"
                          >
                            <Plus className="h-3 w-3" /> Enroll in Exam
                          </button>
                        )}

                        <button
                          onClick={() => {
                            if (!isEnrolled) onEnrollExam(exam.id);
                            onSelectExam(exam.id);
                            onClose();
                          }}
                          className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                            isActive
                              ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                              : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                          }`}
                        >
                          {isActive ? 'Active Subject ✓' : 'Switch & Study →'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: MY ENROLLED EXAMS */}
          {activeTab === 'my_exams' && (
            <div className="space-y-4">
              <div className="bg-blue-950/20 border border-blue-500/20 rounded-xl p-3.5 flex items-start gap-3">
                <Sparkles className="h-4 w-4 text-blue-400 shrink-0 mt-0.5" />
                <div className="text-xs text-blue-200 leading-relaxed">
                  <strong>Multi-Exam Student Portfolio:</strong> You can prepare for multiple universities and competitive exams concurrently (e.g. B.Tech Semester Exams + RTO AMVI Competitive Recruitment + School Boards). All your historical trends, prediction papers, and syllabus weightage are saved independently per exam.
                </div>
              </div>

              <div className="space-y-2.5">
                {enrolledExams.map((exam) => {
                  const cat = getExamCategory(exam);
                  const isActive = currentExamId === exam.id;

                  return (
                    <div
                      key={exam.id}
                      className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                        isActive
                          ? 'bg-blue-950/30 border-blue-500/60 shadow-lg shadow-blue-500/5'
                          : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          {getCategoryBadge(cat)}
                          <span className="text-xs text-slate-400 font-mono">
                            {exam.subject_code}
                          </span>
                          {isActive && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500 text-white font-bold">
                              CURRENTLY ACTIVE
                            </span>
                          )}
                        </div>
                        <h4 className="text-sm font-bold text-white">
                          {exam.subject_name}
                        </h4>
                        <p className="text-xs text-slate-300">
                          {exam.board_university} • {exam.course_degree} ({exam.class_semester}) • {exam.total_marks} Marks
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => {
                            onSelectExam(exam.id);
                            onClose();
                          }}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1 ${
                            isActive
                              ? 'bg-blue-600 text-white shadow-sm'
                              : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                          }`}
                        >
                          {isActive ? 'Active Subject' : 'Switch to this Exam'}
                          <ArrowRight className="h-3 w-3" />
                        </button>

                        <button
                          onClick={() => onUnenrollExam(exam.id)}
                          className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition"
                          title="Unenroll from this exam"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: ADD CUSTOM UNIVERSITY / EXAM */}
          {activeTab === 'custom' && (
            <form onSubmit={handleCreateCustom} className="space-y-4 max-w-2xl mx-auto bg-slate-950/40 p-5 rounded-xl border border-slate-800">
              <div className="border-b border-slate-800 pb-2 mb-2">
                <h3 className="text-sm font-bold text-white">
                  Add Any Custom University, Board, or Competitive Exam
                </h3>
                <p className="text-xs text-slate-400">
                  Configure any university in India (or internationally) with your specific degree, semester, and pattern.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Exam Category *
                  </label>
                  <select
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 text-xs text-white rounded-lg px-3 py-2 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="University">Category A: University Examination</option>
                    <option value="School">Category B: School Board Examination</option>
                    <option value="Competitive">Category C: Competitive / Recruitment Exam</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    University / Board / Authority *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. University of Delhi, VTU, Anna University"
                    value={customUniversity}
                    onChange={(e) => setCustomUniversity(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 text-xs text-white rounded-lg px-3 py-2 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Course / Degree / Standard *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. B.Tech Mechanical, B.Com, Class 12"
                    value={customDegree}
                    onChange={(e) => setCustomDegree(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 text-xs text-white rounded-lg px-3 py-2 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Semester / Academic Year
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Semester V, Final Year, Mains 2025"
                    value={customSemester}
                    onChange={(e) => setCustomSemester(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 text-xs text-white rounded-lg px-3 py-2 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Subject Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Automobile Transmission & Vehicle Dynamics"
                    value={customSubject}
                    onChange={(e) => setCustomSubject(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 text-xs text-white rounded-lg px-3 py-2 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Subject Code
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. ME-503"
                    value={customCode}
                    onChange={(e) => setCustomCode(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 text-xs text-white rounded-lg px-3 py-2 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Total Marks
                  </label>
                  <input
                    type="number"
                    value={customMarks}
                    onChange={(e) => setCustomMarks(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-800 text-xs text-white rounded-lg px-3 py-2 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Duration (Minutes)
                  </label>
                  <input
                    type="number"
                    value={customDuration}
                    onChange={(e) => setCustomDuration(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-800 text-xs text-white rounded-lg px-3 py-2 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('browse')}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-blue-600/20"
                >
                  <Plus className="h-3.5 w-3.5" /> Save & Enroll in My Profile
                </button>
              </div>
            </form>
          )}

        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 border-t border-slate-800 bg-slate-950 flex items-center justify-between text-xs text-slate-400">
          <div>
            Active Multi-University Support: <strong>All Indian & Global Universities, State Boards, and Public Service Commissions</strong>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-medium"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
};
