from typing import List, Dict, Any

class StudentStudyRoadmapEngine:
    """
    Student High-Yield Study Roadmap & Revision Priority Matrix.
    Categorizes curriculum into 4 actionable quadrants:
    Q1: Must-Master Core (High Weightage + High Frequency)
    Q2: High-Yield Gaps (High Weightage + Dormant for 2+ Years) -> Highest ROI
    Q3: Quick-Win Revision (Direct / Foundational Marks)
    Q4: Low Priority / Deprecated Topics
    """

    @classmethod
    def generate_roadmap(
        cls,
        topic_comparison: List[Dict[str, Any]],
        deleted_topics: List[str]
    ) -> Dict[str, Any]:
        q1_must_master = []
        q2_high_yield_gaps = []
        q3_quick_wins = []
        q4_low_priority = []

        for item in topic_comparison:
            t_name = item.get("topic", "")
            ch_name = item.get("chapter", "")
            off_pct = item.get("official_pct", 10.0)
            hist_pct = item.get("historical_pct", 10.0)
            dormant_yrs = item.get("years_dormant", 1)
            is_deleted = item.get("is_deleted", False)

            is_del = is_deleted or any(len(d.strip()) > 2 and d.strip().lower() in t_name.lower() for d in deleted_topics)
            if is_del:
                q4_low_priority.append({
                    "topic": t_name,
                    "chapter": ch_name,
                    "reason": "Expunged from current syllabus - Do not prepare",
                    "priority": "Skip"
                })
                continue

            # Quadrant 2: High Yield Surge Gaps (High official marks, dormant for 2+ years)
            if dormant_yrs >= 2 and off_pct >= 4.0:
                q2_high_yield_gaps.append({
                    "topic": t_name,
                    "chapter": ch_name,
                    "official_pct": off_pct,
                    "years_dormant": dormant_yrs,
                    "recommended_hours": 4,
                    "roi_tier": "Highest ROI (Surge Alert)",
                    "exam_tip": "High official weightage that has skipped recent cycles; examiner focus is imminent."
                })
            # Quadrant 1: Must-Master Core (High official weightage + strong historical presence)
            elif off_pct >= 4.5 or hist_pct >= 5.0 or item.get("historical_occurrences", 0) >= 3:
                q1_must_master.append({
                    "topic": t_name,
                    "chapter": ch_name,
                    "official_pct": off_pct,
                    "historical_frequency": item.get("historical_occurrences", 5),
                    "recommended_hours": 6,
                    "roi_tier": "Must-Master Core",
                    "exam_tip": "Fundamental backbone of the examination paper; guaranteed to test core concepts."
                })
            # Quadrant 3: Quick Wins (Direct / short questions)
            elif off_pct >= 2.0 or hist_pct >= 2.0:
                q3_quick_wins.append({
                    "topic": t_name,
                    "chapter": ch_name,
                    "official_pct": off_pct,
                    "recommended_hours": 2,
                    "roi_tier": "Quick-Win Marks",
                    "exam_tip": "Direct definitions or short questions with high scoring certainty."
                })
            else:
                q4_low_priority.append({
                    "topic": t_name,
                    "chapter": ch_name,
                    "reason": "Appeared in immediate past cycle; low likelihood of repeating back-to-back.",
                    "priority": "Optional / Low"
                })

        total_study_hours = (
            sum(i["recommended_hours"] for i in q1_must_master) +
            sum(i["recommended_hours"] for i in q2_high_yield_gaps) +
            sum(i["recommended_hours"] for i in q3_quick_wins)
        )

        return {
            "total_estimated_study_hours": total_study_hours,
            "quadrant_1_must_master": q1_must_master,
            "quadrant_2_high_yield_gaps": q2_high_yield_gaps,
            "quadrant_3_quick_wins": q3_quick_wins,
            "quadrant_4_low_priority": q4_low_priority,
            "strategic_advice": "Focus 60% of preparation time on Quadrant 1 and Quadrant 2. Master full diagrams and anomalies for these high-yield topics first."
        }
