import re
from typing import List, Dict, Any

class BloomTaxonomyClassifier:
    """
    Bloom's Revised Taxonomy Cognitive Balancer.
    Classifies questions into 5 core cognitive levels:
    - Remember (L1): Define, State, List, Recall, Name, Identify
    - Understand (L2): Explain, Describe, Discuss, Illustrate, Compare, Distinguish
    - Apply (L3): Demonstrate, Calculate, Solve, Construct, Design, Implement, Normalize
    - Analyze (L4): Analyze, Differentiate, Decompose, Troubleshoot, Trace
    - Evaluate & Create (L5): Evaluate, Justify, Optimize, Synthesize, Formulate
    
    Checks accreditation compliance (AICTE, NBA, UGC, CBSE) requiring:
    - ~20-25% Remember
    - ~35-40% Understand
    - ~25-30% Apply
    - ~10-15% Analyze & Evaluate
    """

    CHECK_ORDER = ["Evaluate & Create", "Analyze", "Apply", "Understand", "Remember"]

    VERBS_MAP = {
        "Evaluate & Create": [
            "evaluate", "justify", "optimize", "synthesize", "formulate", "critique",
            "मूल्यमापन", "समर्थन", "सुधारणा"
        ],
        "Analyze": [
            "analyze", "examine", "investigate", "decompose", "troubleshoot", "trace", "anomalies", "differ",
            "differentiate", "distinguish", "vs", "versus", "विश्लेषण", "तपासा", "तपशीलवार", "दोष", "फरक"
        ],
        "Apply": [
            "demonstrate", "calculate", "solve", "construct", "design", "implement", "normalize", 
            "insert", "derive", "compute", "draw", "mapping", "testing", "show", "queries", "sql",
            "शोधा", "रचना करा", "उदाहरणासह", "गणना", "लागू", "आकृती"
        ],
        "Understand": [
            "explain", "describe", "discuss", "illustrate", "compare",
            "स्पष्ट करा", "वर्णन करा", "चर्चा करा", "तुलना", "समझाएं", "अंतर"
        ],
        "Remember": [
            "define", "state", "list", "name", "identify", "recall", "what is", "mention", 
            "व्याख्या", "सांगा", "नावे", "यादी", "काय आहे", "परिभाषा"
        ]
    }

    @classmethod
    def classify_question(cls, text: str) -> Dict[str, Any]:
        lower_t = text.lower()
        for level in cls.CHECK_ORDER:
            keywords = cls.VERBS_MAP[level]
            for kw in keywords:
                if kw in lower_t:
                    tier_code = "L5" if "Create" in level else ("L4" if level == "Analyze" else ("L3" if level == "Apply" else ("L2" if level == "Understand" else "L1")))
                    return {
                        "level": level,
                        "code": tier_code,
                        "matched_trigger": kw
                    }
        # Fallback to Understand / L2
        return {"level": "Understand", "code": "L2", "matched_trigger": "default"}

    @classmethod
    def evaluate_paper_balance(cls, questions: List[Dict[str, Any]]) -> Dict[str, Any]:
        total_marks = sum(q.get("marks", 5) for q in questions)
        total_marks = max(1, total_marks)

        breakdown = {
            "Remember": {"count": 0, "marks": 0, "pct": 0.0},
            "Understand": {"count": 0, "marks": 0, "pct": 0.0},
            "Apply": {"count": 0, "marks": 0, "pct": 0.0},
            "Analyze": {"count": 0, "marks": 0, "pct": 0.0},
            "Evaluate & Create": {"count": 0, "marks": 0, "pct": 0.0}
        }

        for q in questions:
            cls_res = cls.classify_question(q.get("question_text", ""))
            lvl = cls_res["level"]
            m = q.get("marks", 5)
            breakdown[lvl]["count"] += 1
            breakdown[lvl]["marks"] += m

        for lvl, data in breakdown.items():
            data["pct"] = round((data["marks"] / total_marks) * 100.0, 1)

        # Check accreditation compliance
        is_compliant = (
            breakdown["Remember"]["pct"] <= 35.0 and
            breakdown["Understand"]["pct"] >= 25.0 and
            (breakdown["Apply"]["pct"] + breakdown["Analyze"]["pct"]) >= 30.0
        )

        return {
            "total_marks": total_marks,
            "cognitive_breakdown": [
                {"level": k, "marks": v["marks"], "percentage": v["pct"], "count": v["count"]}
                for k, v in breakdown.items()
            ],
            "is_accreditation_compliant": is_compliant,
            "compliance_standard": "NBA / AICTE / CBSE Bloom's Cognitive Guidelines",
            "recommendation": "Balanced Cognitive Spread" if is_compliant else "Increase Higher-Order Application / Analysis Questions"
        }
