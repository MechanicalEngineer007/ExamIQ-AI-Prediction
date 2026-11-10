import React, { useState, useEffect, useRef } from 'react';
import { 
  UploadCloud, 
  FileText, 
  Edit3, 
  Save, 
  BookMarked, 
  Sparkles,
  CheckCircle2,
  FileUp,
  FolderArchive,
  FileCheck
} from 'lucide-react';
import { 
  fetchSyllabus, 
  uploadPaperAndOCR, 
  verifyOCR,
  bulkUploadPapersPDF,
  uploadSyllabusPDF
} from '../api';

interface DocumentManagementViewProps {
  examId: number;
  selectedLang: string;
}

export const DocumentManagementView: React.FC<DocumentManagementViewProps> = ({ examId, selectedLang }) => {
  const [activeSubTab, setActiveSubTab] = useState<'upload' | 'ocr_verify' | 'syllabus'>('upload');
  
  // Single paper upload state
  const [uploadYear, setUploadYear] = useState<number>(2025);
  const [uploadSession, setUploadSession] = useState<string>('Summer');
  const [paperText, setPaperText] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const singleFileInputRef = useRef<HTMLInputElement>(null);

  // Bulk upload state
  const [bulkFiles, setBulkFiles] = useState<File[]>([]);
  const [bulkStatus, setBulkStatus] = useState<string | null>(null);
  const bulkFileInputRef = useRef<HTMLInputElement>(null);

  // OCR verification state
  const [extractedQuestions, setExtractedQuestions] = useState<any[]>([]);
  const [currentPaperId, setCurrentPaperId] = useState<number | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  // Syllabus state & upload
  const [syllabusData, setSyllabusData] = useState<any>(null);
  const [loadingSyllabus, setLoadingSyllabus] = useState<boolean>(false);
  const [syllabusFileStatus, setSyllabusFileStatus] = useState<string | null>(null);
  const syllabusFileInputRef = useRef<HTMLInputElement>(null);

  const loadSyllabus = () => {
    setLoadingSyllabus(true);
    fetchSyllabus(examId)
      .then((res) => {
        setSyllabusData(res);
        setLoadingSyllabus(false);
      })
      .catch((err) => {
        console.error(err);
        setLoadingSyllabus(false);
      });
  };

  useEffect(() => {
    if (activeSubTab === 'syllabus') {
      loadSyllabus();
    }
  }, [examId, activeSubTab]);

  // Handle single paper upload
  const handleSinglePaperSubmit = async () => {
    if (!selectedFile && !paperText.trim()) {
      alert('Please select a PDF/image file or paste question paper text.');
      return;
    }

    setUploadStatus('Running Layout-Aware Multilingual OCR & Layout Analysis...');
    const formData = new FormData();
    formData.append('exam_config_id', examId.toString());
    formData.append('year', uploadYear.toString());
    formData.append('session', uploadSession);
    formData.append('language', selectedLang);
    if (selectedFile) {
      formData.append('file', selectedFile);
    }
    if (paperText) {
      formData.append('raw_text', paperText);
    }

    try {
      const res = await uploadPaperAndOCR(formData);
      setCurrentPaperId(res.paper_id);
      setExtractedQuestions(res.extracted_questions);
      setUploadStatus(null);
      setSelectedFile(null);
      setActiveSubTab('ocr_verify');
    } catch (err: any) {
      alert(`OCR extraction failed: ${err.message || 'Check backend'}`);
      setUploadStatus(null);
    }
  };

  // Handle bulk PDF upload
  const handleBulkUploadSubmit = async () => {
    if (bulkFiles.length === 0) {
      alert('Please select one or more PDF files for bulk ingestion.');
      return;
    }

    setBulkStatus(`Ingesting and parsing ${bulkFiles.length} examination papers in parallel...`);
    const formData = new FormData();
    formData.append('exam_config_id', examId.toString());
    formData.append('language', selectedLang);
    bulkFiles.forEach((file) => {
      formData.append('files', file);
    });

    try {
      const res = await bulkUploadPapersPDF(formData);
      setBulkStatus(null);
      alert(`Successfully ingested ${res.total_files_ingested} historical papers!`);
      setBulkFiles([]);
    } catch (err: any) {
      alert(`Bulk upload failed: ${err.message || 'Check backend'}`);
      setBulkStatus(null);
    }
  };

  // Handle syllabus PDF upload
  const handleSyllabusUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSyllabusFileStatus('Parsing official syllabus PDF, chapters, and weightage...');
    const formData = new FormData();
    formData.append('exam_config_id', examId.toString());
    formData.append('file', file);

    try {
      const res = await uploadSyllabusPDF(formData);
      setSyllabusFileStatus(null);
      alert(`Syllabus parsed successfully from ${file.name}! Found ${res.chapters_count} chapters totaling ${res.total_official_marks} marks.`);
      loadSyllabus();
    } catch (err: any) {
      alert(`Syllabus parsing failed: ${err.message || 'Check backend'}`);
      setSyllabusFileStatus(null);
    }
  };

  const handleUpdateQuestion = (index: number, field: string, value: any) => {
    const updated = [...extractedQuestions];
    updated[index][field] = value;
    setExtractedQuestions(updated);
  };

  const handleSaveVerifiedOCR = async () => {
    if (!currentPaperId) return;
    try {
      await verifyOCR({
        paper_id: currentPaperId,
        questions: extractedQuestions,
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err: any) {
      alert(`Verification save failed: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Sub tabs navigation */}
      <div className="flex space-x-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveSubTab('upload')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition flex items-center gap-2 ${
            activeSubTab === 'upload'
              ? 'bg-blue-600 text-white'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <UploadCloud className="h-4 w-4" />
          Upload Question Papers (PDF / Images)
        </button>

        <button
          onClick={() => setActiveSubTab('ocr_verify')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition flex items-center gap-2 ${
            activeSubTab === 'ocr_verify'
              ? 'bg-blue-600 text-white'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Edit3 className="h-4 w-4" />
          OCR Verification & Correction Screen {extractedQuestions.length > 0 && `(${extractedQuestions.length})`}
        </button>

        <button
          onClick={() => setActiveSubTab('syllabus')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition flex items-center gap-2 ${
            activeSubTab === 'syllabus'
              ? 'bg-blue-600 text-white'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <BookMarked className="h-4 w-4" />
          Official Syllabus & Weightage Engine
        </button>
      </div>

      {/* SUBTAB 1: Question Papers Upload (Single + Bulk) */}
      {activeSubTab === 'upload' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Card 1: Single Paper Upload (PDF / Image / Text) */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-5">
            <div className="border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <FileUp className="h-5 w-5 text-blue-400" />
                Upload Examination Paper (PDF / Image)
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Upload scanned PDF, digital PDF, or image file. The OCR engine automatically recognizes question numbers, marks, and sections.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">Examination Year</label>
                <input
                  type="number"
                  value={uploadYear}
                  onChange={(e) => setUploadYear(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 text-white text-xs rounded-lg px-3 py-2 font-mono"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">Session</label>
                <select
                  value={uploadSession}
                  onChange={(e) => setUploadSession(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 text-white text-xs rounded-lg px-3 py-2"
                >
                  <option value="Summer">Summer Examination</option>
                  <option value="Winter">Winter Examination</option>
                  <option value="Annual">Annual Board Exam</option>
                </select>
              </div>
            </div>

            {/* File Dropzone */}
            <div 
              onClick={() => singleFileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-700 hover:border-blue-500 rounded-xl p-6 text-center cursor-pointer bg-slate-800/40 hover:bg-slate-800/70 transition group"
            >
              <input
                ref={singleFileInputRef}
                type="file"
                accept=".pdf,image/png,image/jpeg,image/jpg"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files?.[0]) setSelectedFile(e.target.files[0]);
                }}
              />
              <UploadCloud className="h-8 w-8 text-slate-400 group-hover:text-blue-400 mx-auto mb-2 transition" />
              {selectedFile ? (
                <div className="space-y-1">
                  <p className="text-xs font-bold text-emerald-400 flex items-center justify-center gap-1">
                    <FileCheck className="h-4 w-4" /> {selectedFile.name}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    {(selectedFile.size / 1024).toFixed(1)} KB • Ready for OCR extraction
                  </p>
                </div>
              ) : (
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-slate-200">
                    Click to select Question Paper (PDF / Image)
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Supports Scanned PDF, Digital PDF, JPG, PNG (English, मराठी, हिन्दी)
                  </p>
                </div>
              )}
            </div>

            {/* Optional Text Paste Fallback */}
            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1">
                Or Paste OCR / Question Text (Optional)
              </label>
              <textarea
                rows={3}
                value={paperText}
                onChange={(e) => setPaperText(e.target.value)}
                placeholder="Paste question text if already extracted..."
                className="w-full bg-slate-800 border border-slate-700 text-white text-xs font-mono rounded-lg p-2.5"
              />
            </div>

            <button
              onClick={handleSinglePaperSubmit}
              disabled={!!uploadStatus}
              className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-bold shadow-md shadow-blue-600/20 transition flex items-center justify-center gap-2"
            >
              <Sparkles className="h-4 w-4" />
              {uploadStatus || 'Upload & Run Layout-Aware OCR'}
            </button>
          </div>

          {/* Card 2: Bulk Upload of Multiple Years (10–15 Years) */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-5 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="border-b border-slate-800 pb-3">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <FolderArchive className="h-5 w-5 text-indigo-400" />
                  Bulk Upload Multiple Papers (10–15 Years)
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Upload multiple past question paper PDFs simultaneously. The system infers years from filenames (e.g. <i>DBMS_2018.pdf, DBMS_2019.pdf</i>) and catalogs them in batch.
                </p>
              </div>

              {/* Bulk File Dropzone */}
              <div 
                onClick={() => bulkFileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-700 hover:border-indigo-500 rounded-xl p-8 text-center cursor-pointer bg-slate-800/40 hover:bg-slate-800/70 transition group"
              >
                <input
                  ref={bulkFileInputRef}
                  type="file"
                  multiple
                  accept=".pdf"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files) {
                      setBulkFiles(Array.from(e.target.files));
                    }
                  }}
                />
                <FolderArchive className="h-10 w-10 text-slate-400 group-hover:text-indigo-400 mx-auto mb-2 transition" />
                {bulkFiles.length > 0 ? (
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-indigo-300">
                      {bulkFiles.length} PDF Documents Selected
                    </p>
                    <p className="text-[11px] text-slate-400">
                      {bulkFiles.slice(0, 3).map(f => f.name).join(', ')} {bulkFiles.length > 3 ? `+${bulkFiles.length - 3} more` : ''}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-slate-200">
                      Select Multiple Examination Papers (Bulk PDF)
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Drag and drop or select 10–15 years of question paper PDFs at once
                    </p>
                  </div>
                )}
              </div>

              <div className="rounded-lg bg-slate-800/60 p-3 text-[11px] text-slate-400 space-y-1">
                <span className="font-semibold text-slate-300 block">Bulk Processing Protocol:</span>
                <p>• Automatically parses serial numbers and marks for each uploaded document.</p>
                <p>• Updates the historical question database and semantic concept clusters.</p>
              </div>
            </div>

            <button
              onClick={handleBulkUploadSubmit}
              disabled={bulkFiles.length === 0 || !!bulkStatus}
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition flex items-center justify-center gap-2"
            >
              <UploadCloud className="h-4 w-4" />
              {bulkStatus || `Bulk Ingest ${bulkFiles.length > 0 ? `(${bulkFiles.length} Papers)` : ''}`}
            </button>
          </div>
        </div>
      )}

      {/* SUBTAB 2: OCR Verification & Correction Screen */}
      {activeSubTab === 'ocr_verify' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Edit3 className="h-5 w-5 text-indigo-400" />
                OCR Verification & Correction Screen
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Verify bounding box parsing, marks allocation, and topic mapping before updating model training records.
              </p>
            </div>

            <div className="flex items-center gap-3">
              {saveSuccess && (
                <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="h-4 w-4" /> Saved & Verified!
                </span>
              )}
              <button
                onClick={handleSaveVerifiedOCR}
                disabled={extractedQuestions.length === 0}
                className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-600/20 transition"
              >
                <Save className="h-4 w-4" />
                Approve & Save Questions
              </button>
            </div>
          </div>

          {extractedQuestions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border border-slate-800 rounded-lg">
                <thead className="bg-slate-800 text-slate-300 uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="py-2 px-3 w-16">Q.No</th>
                    <th className="py-2 px-3">Question Text</th>
                    <th className="py-2 px-3 w-20">Marks</th>
                    <th className="py-2 px-3 w-40">Chapter</th>
                    <th className="py-2 px-3 w-36">Topic</th>
                    <th className="py-2 px-3 w-24">Difficulty</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 font-sans">
                  {extractedQuestions.map((q, idx) => (
                    <tr key={idx} className="hover:bg-slate-800/40">
                      <td className="py-2.5 px-3">
                        <input
                          type="text"
                          value={q.q_number}
                          onChange={(e) => handleUpdateQuestion(idx, 'q_number', e.target.value)}
                          className="w-14 bg-slate-800 border border-slate-700 text-white font-mono text-xs rounded px-1.5 py-1"
                        />
                      </td>
                      <td className="py-2.5 px-3">
                        <textarea
                          rows={2}
                          value={q.question_text}
                          onChange={(e) => handleUpdateQuestion(idx, 'question_text', e.target.value)}
                          className="w-full bg-slate-800 border border-slate-700 text-white text-xs rounded p-1.5"
                        />
                      </td>
                      <td className="py-2.5 px-3">
                        <input
                          type="number"
                          value={q.marks}
                          onChange={(e) => handleUpdateQuestion(idx, 'marks', Number(e.target.value))}
                          className="w-16 bg-slate-800 border border-slate-700 text-white font-mono text-xs rounded px-1.5 py-1"
                        />
                      </td>
                      <td className="py-2.5 px-3">
                        <input
                          type="text"
                          value={q.chapter}
                          onChange={(e) => handleUpdateQuestion(idx, 'chapter', e.target.value)}
                          className="w-full bg-slate-800 border border-slate-700 text-white text-xs rounded px-1.5 py-1"
                        />
                      </td>
                      <td className="py-2.5 px-3">
                        <input
                          type="text"
                          value={q.topic}
                          onChange={(e) => handleUpdateQuestion(idx, 'topic', e.target.value)}
                          className="w-full bg-slate-800 border border-slate-700 text-white text-xs rounded px-1.5 py-1"
                        />
                      </td>
                      <td className="py-2.5 px-3">
                        <select
                          value={q.difficulty}
                          onChange={(e) => handleUpdateQuestion(idx, 'difficulty', e.target.value)}
                          className="bg-slate-800 border border-slate-700 text-white text-xs rounded px-2 py-1"
                        >
                          <option value="Easy">Easy</option>
                          <option value="Medium">Medium</option>
                          <option value="Hard">Hard</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12 text-slate-400">
              <FileText className="h-8 w-8 text-slate-500 mx-auto mb-2" />
              No questions currently waiting for verification. Upload a question paper above first.
            </div>
          )}
        </div>
      )}

      {/* SUBTAB 3: Official Syllabus & Weightage Engine + Syllabus PDF Upload */}
      {activeSubTab === 'syllabus' && (
        <div className="space-y-6">
          {/* Syllabus PDF Upload Bar */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <BookMarked className="h-5 w-5 text-emerald-400" />
                Official Syllabus & Weightage Engine
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Upload official syllabus document to extract prescribed chapters, marks weightage, learning objectives, and deleted curriculum topics.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <input
                ref={syllabusFileInputRef}
                type="file"
                accept=".pdf,.txt"
                className="hidden"
                onChange={handleSyllabusUpload}
              />
              <button
                onClick={() => syllabusFileInputRef.current?.click()}
                disabled={!!syllabusFileStatus}
                className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition flex items-center gap-2 whitespace-nowrap"
              >
                <FileUp className="h-4 w-4" />
                {syllabusFileStatus || 'Upload Official Syllabus PDF'}
              </button>
            </div>
          </div>

          {loadingSyllabus ? (
            <div className="flex items-center justify-center p-12 text-slate-400">
              Loading official syllabus data...
            </div>
          ) : syllabusData ? (
            <>
              {/* Chapters & Official Marks Weightage Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {syllabusData.chapters.map((ch: any, idx: number) => (
                  <div key={idx} className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
                    <div className="flex items-start justify-between gap-2 border-b border-slate-800 pb-2">
                      <h4 className="text-sm font-bold text-white leading-snug">
                        {ch.chapter_name}
                      </h4>
                      <span className="px-2.5 py-1 rounded-md bg-blue-500/15 text-blue-300 font-mono text-xs font-bold whitespace-nowrap">
                        {ch.official_marks} Marks
                      </span>
                    </div>

                    <div>
                      <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
                        Prescribed Topics:
                      </span>
                      <ul className="space-y-1 text-xs text-slate-300 list-disc list-inside">
                        {ch.topics.map((t: string, tIdx: number) => (
                          <li key={tIdx}>{t}</li>
                        ))}
                      </ul>
                    </div>

                    {ch.deleted_topics && ch.deleted_topics.length > 0 && (
                      <div className="pt-2 border-t border-slate-800/80">
                        <span className="text-[11px] font-semibold text-rose-400 uppercase tracking-wider block mb-1">
                          Pruned / Obsolete Topics (Zero Probability):
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {ch.deleted_topics.map((dt: string, dtIdx: number) => (
                            <span key={dtIdx} className="px-2 py-0.5 rounded bg-rose-500/10 text-rose-300 border border-rose-500/20 text-[10px]">
                              {dt}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Topic-Wise Gap Analysis Table */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
                <h4 className="text-sm font-bold text-white mb-3">
                  Syllabus vs Historical Gap Analysis (Overrepresented vs Underrepresented Topics)
                </h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-800 text-slate-300 uppercase text-[10px] tracking-wider">
                      <tr>
                        <th className="py-2.5 px-3">Topic</th>
                        <th className="py-2.5 px-3">Chapter</th>
                        <th className="py-2.5 px-3">Official Weightage %</th>
                        <th className="py-2.5 px-3">Historical Frequency %</th>
                        <th className="py-2.5 px-3">Years Dormant</th>
                        <th className="py-2.5 px-3">Cycle Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {syllabusData.topic_comparison.map((row: any, rIdx: number) => (
                        <tr key={rIdx} className="hover:bg-slate-800/30">
                          <td className="py-2.5 px-3 font-semibold text-slate-200">{row.topic}</td>
                          <td className="py-2.5 px-3 text-slate-400">{row.chapter}</td>
                          <td className="py-2.5 px-3 font-mono text-emerald-400 font-bold">{row.official_pct}%</td>
                          <td className="py-2.5 px-3 font-mono text-blue-400">{row.historical_pct}%</td>
                          <td className="py-2.5 px-3 font-mono text-slate-300">{row.years_dormant} yrs</td>
                          <td className="py-2.5 px-3">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                              row.gap_status.includes('Underrepresented')
                                ? 'bg-amber-500/15 text-amber-300 border border-amber-500/20'
                                : row.gap_status.includes('Deleted')
                                ? 'bg-rose-500/15 text-rose-300 border border-rose-500/20'
                                : 'bg-slate-800 text-slate-300'
                            }`}>
                              {row.gap_status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          ) : null}
        </div>
      )}
    </div>
  );
};
