import React, { useEffect, useState } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  CartesianGrid, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { 
  BookOpen, 
  Clock, 
  Layers, 
  Repeat, 
  Calendar, 
  Tag, 
  AlertCircle 
} from 'lucide-react';
import { fetchHistoricalAnalysis } from '../api';

interface HistoricalAnalysisViewProps {
  examId: number;
}

const COLORS = ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EC4899', '#06B6D4'];

export const HistoricalAnalysisView: React.FC<HistoricalAnalysisViewProps> = ({ examId }) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchHistoricalAnalysis(examId)
      .then((res) => {
        setData(res);
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
        Processing 15 years of question papers...
      </div>
    );
  }

  if (!data || data.error) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center text-slate-400">
        <AlertCircle className="h-8 w-8 text-amber-400 mx-auto mb-2" />
        No historical data found for this subject.
      </div>
    );
  }

  const { year_trends, chapter_distribution, frequently_repeated_concepts, dormant_topics } = data;

  return (
    <div className="space-y-6">
      {/* Title & Info Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-xl p-6">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-blue-400" />
            15-Year Historical Examination Analytics (2011–2025)
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Semantic clustering and recurrence detection across {data.total_historical_questions} extracted questions into {data.total_clusters} distinct conceptual clusters.
          </p>
        </div>
        <div className="flex gap-2">
          <span className="px-3 py-1.5 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs font-semibold">
            {data.total_historical_questions} Total Questions
          </span>
          <span className="px-3 py-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-xs font-semibold">
            {data.total_clusters} Concept Clusters
          </span>
        </div>
      </div>

      {/* Visual Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Year-wise question & marks volume */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <Calendar className="h-4 w-4 text-blue-400" />
            Year-over-Year Question Frequency (2011–2025)
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={year_trends}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="year" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                  labelStyle={{ color: '#f8fafc', fontWeight: 'bold' }}
                />
                <Bar dataKey="count" fill="#3B82F6" radius={[4, 4, 0, 0]} name="Questions" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Chapter-wise distribution */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <Layers className="h-4 w-4 text-indigo-400" />
            Chapter-wise Historical Marks Distribution
          </h3>
          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chapter_distribution}
                  dataKey="total_marks"
                  nameKey="chapter"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  innerRadius={45}
                  label={({ name, percent }: any) => `${name.substring(0, 16)}... (${(percent * 100).toFixed(0)}%)`}
                >
                  {chapter_distribution.map((_: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Two Column Table: Frequent Concepts vs Dormant Topics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Frequently Repeated Question Clusters */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Repeat className="h-4 w-4 text-emerald-400" />
              High-Frequency Question Concepts
            </h3>
            <span className="text-xs text-slate-400">Concept Clusters</span>
          </div>

          <div className="space-y-3">
            {frequently_repeated_concepts.map((c: any) => (
              <div 
                key={c.id} 
                className="p-3.5 rounded-lg bg-slate-800/60 border border-slate-750 hover:border-slate-700 transition"
              >
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <p className="text-xs font-semibold text-slate-100 leading-snug line-clamp-2">
                    {c.representative}
                  </p>
                  <span className="px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-400 font-mono text-xs font-bold whitespace-nowrap">
                    {c.frequency}x Asked
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-400">
                  <span className="flex items-center gap-1 text-slate-300">
                    <Tag className="h-3 w-3 text-blue-400" /> {c.topic}
                  </span>
                  <span>•</span>
                  <span>Years: {c.years_list.join(', ')}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Dormant Topics (Topics with weightage not appeared recently) */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Clock className="h-4 w-4 text-amber-400" />
              Dormant Syllabus Topics (Due for Exam)
            </h3>
            <span className="text-xs text-amber-400/80 font-medium">Periodic Recurrence Cycle</span>
          </div>

          <div className="space-y-3">
            {dormant_topics.map((d: any, idx: number) => (
              <div 
                key={idx} 
                className="p-3.5 rounded-lg bg-slate-800/60 border border-amber-500/20 hover:border-amber-500/40 transition"
              >
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <p className="text-xs font-semibold text-amber-100 leading-snug line-clamp-2">
                    {d.concept}
                  </p>
                  <span className="px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-400 font-mono text-xs font-bold whitespace-nowrap">
                    {d.years_dormant} yrs dormant
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-400">
                  <span className="text-slate-300 font-medium">Topic: {d.topic}</span>
                  <span>•</span>
                  <span>Last in {d.last_appeared_year}</span>
                  <span>•</span>
                  <span className="text-blue-400 font-medium">High Probability Surge</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
