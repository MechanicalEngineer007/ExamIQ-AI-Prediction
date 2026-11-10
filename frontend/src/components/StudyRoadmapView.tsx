import React, { useState, useEffect } from 'react';
import { 
  Compass, 
  Flame, 
  Clock, 
  Zap, 
  CheckCircle2, 
  XOctagon 
} from 'lucide-react';
import { fetchStudyRoadmap } from '../api';

interface StudyRoadmapViewProps {
  examId: number;
}

export const StudyRoadmapView: React.FC<StudyRoadmapViewProps> = ({ examId }) => {
  const [roadmap, setRoadmap] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    setLoading(true);
    fetchStudyRoadmap(examId)
      .then((res) => {
        setRoadmap(res);
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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mr-3"></div>
        Calculating 4-Quadrant High-Yield Student Roadmap...
      </div>
    );
  }

  if (!roadmap) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center text-slate-400">
        No study roadmap data available.
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Compass className="h-5 w-5 text-indigo-400" />
            <h2 className="text-xl font-bold text-white">
              Student High-Yield Revision Matrix & Study Roadmap
            </h2>
          </div>
          <p className="text-xs text-slate-400">
            Subject: <b className="text-white">{roadmap.subject_name}</b> • Curated for Academic Session {roadmap.academic_year}
          </p>
        </div>

        <div className="flex items-center gap-3 bg-slate-800/80 px-4 py-2.5 rounded-xl border border-slate-700">
          <Clock className="h-5 w-5 text-blue-400" />
          <div>
            <div className="text-xs text-slate-400">Target Preparation Time</div>
            <div className="text-base font-extrabold text-white font-mono">
              ~{roadmap.total_estimated_study_hours} Hours Total
            </div>
          </div>
        </div>
      </div>

      {/* Strategic Tip Banner */}
      <div className="rounded-xl border border-indigo-500/30 bg-indigo-500/10 p-4 text-xs text-indigo-200 flex items-start gap-3">
        <Zap className="h-5 w-5 text-indigo-400 flex-shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-indigo-300 uppercase tracking-wider block mb-0.5">
            Strategic Scoring Protocol:
          </span>
          <p>{roadmap.strategic_advice}</p>
        </div>
      </div>

      {/* 4 Quadrants Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Quadrant 1: Must-Master Core */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-blue-500"></span>
              Quadrant 1: Must-Master Core Topics
            </h3>
            <span className="px-2 py-0.5 rounded bg-blue-500/15 text-blue-300 font-mono text-[10px] font-bold">
              High Weightage + High Recurrence
            </span>
          </div>

          <div className="space-y-3">
            {roadmap.quadrant_1_must_master.map((item: any, idx: number) => (
              <div key={idx} className="p-3.5 rounded-lg bg-slate-800/60 border border-slate-750 space-y-1.5">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-xs font-bold text-white">{item.topic}</span>
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-blue-400 font-mono text-[11px] font-bold whitespace-nowrap">
                    ~{item.recommended_hours} Hours
                  </span>
                </div>
                <div className="text-[11px] text-slate-400">Chapter: {item.chapter}</div>
                <div className="text-[11px] text-blue-200/90 italic pt-1">{item.exam_tip}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Quadrant 2: High-Yield Surge Gaps (Highest ROI) */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-amber-200 flex items-center gap-2">
              <Flame className="h-4 w-4 text-amber-400" />
              Quadrant 2: High-Yield Gaps (Surge Alert)
            </h3>
            <span className="px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 font-mono text-[10px] font-bold">
              High Marks + 2+ Yrs Dormant
            </span>
          </div>

          <div className="space-y-3">
            {roadmap.quadrant_2_high_yield_gaps.map((item: any, idx: number) => (
              <div key={idx} className="p-3.5 rounded-lg bg-amber-950/20 border border-amber-500/30 space-y-1.5">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-xs font-bold text-amber-100">{item.topic}</span>
                  <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono text-[11px] font-bold whitespace-nowrap">
                    {item.years_dormant} Yrs Dormant
                  </span>
                </div>
                <div className="text-[11px] text-slate-400">Chapter: {item.chapter} • Rec: {item.recommended_hours} hrs</div>
                <div className="text-[11px] text-amber-300/90 italic pt-1">🔥 {item.exam_tip}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Quadrant 3: Quick Wins */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-emerald-200 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              Quadrant 3: Quick-Win Questions
            </h3>
            <span className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 font-mono text-[10px] font-bold">
              Direct / High Certainty
            </span>
          </div>

          <div className="space-y-3">
            {roadmap.quadrant_3_quick_wins.map((item: any, idx: number) => (
              <div key={idx} className="p-3 rounded-lg bg-slate-800/60 border border-slate-750 flex items-start justify-between gap-3">
                <div>
                  <span className="text-xs font-semibold text-white block">{item.topic}</span>
                  <span className="text-[11px] text-slate-400">{item.chapter}</span>
                  <span className="text-[11px] text-slate-400 italic block mt-0.5">{item.exam_tip}</span>
                </div>
                <span className="text-xs font-mono text-emerald-400 font-bold whitespace-nowrap">
                  {item.recommended_hours}h
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Quadrant 4: Low Priority / Deprecated */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-rose-300 flex items-center gap-2">
              <XOctagon className="h-4 w-4 text-rose-400" />
              Quadrant 4: Pruned / Saturated Topics
            </h3>
            <span className="px-2 py-0.5 rounded bg-rose-500/15 text-rose-300 font-mono text-[10px] font-bold">
              Zero / Low Priority
            </span>
          </div>

          <div className="space-y-3">
            {roadmap.quadrant_4_low_priority.map((item: any, idx: number) => (
              <div key={idx} className="p-3 rounded-lg bg-rose-950/15 border border-rose-500/20 space-y-1">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-xs font-semibold text-rose-200 line-through">{item.topic}</span>
                  <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 text-[10px] font-bold uppercase">
                    {item.priority}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">{item.reason}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
