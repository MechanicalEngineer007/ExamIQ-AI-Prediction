import re
import numpy as np
from typing import List, Dict, Any, Tuple
from collections import defaultdict

class MultilingualSemanticEngine:
    """
    Multilingual Semantic Similarity, Vectorizer and Concept Clustering Engine.
    Handles English, Marathi, and Hindi questions.
    Uses n-gram character and word tokenization + cosine similarity with concept clustering.
    """

    STOPWORDS = {
        "en": {"what", "is", "explain", "describe", "discuss", "the", "a", "an", "and", "or", "in", "of", "to", "with", "for", "by", "on", "write", "note", "notes", "short", "give", "briefly", "diagram", "neat"},
        "mr": {"काय", "आहे", "स्पष्ट", "करा", "टिपा", "लिहा", "सविस्तर", "वर्णन", "आकृतीसह", "फरक", "सांगा", "माहिती", "आणि", "किंवा", "च्या", "चे", "ची", "मध्ये"},
        "hi": {"क्या", "है", "समझाइए", "वर्णन", "कीजिए", "टिप्पणी", "लिखिए", "संक्षेप", "में", "अंतर", "बताइए", "और", "या", "के", "की", "का"}
    }

    @classmethod
    def clean_and_tokenize(cls, text: str, lang: str = "en") -> List[str]:
        # Lowercase and clean punctuation
        cleaned = re.sub(r'[^\w\s\u0900-\u097F]', ' ', text.lower())
        tokens = cleaned.split()
        stopwords = cls.STOPWORDS.get(lang, cls.STOPWORDS["en"]).union(cls.STOPWORDS["en"])
        meaningful = [t for t in tokens if len(t) > 1 and t not in stopwords]
        # Also include character 3-grams for morphological similarity in Devanagari and English
        char_ngrams = []
        for word in meaningful:
            if len(word) >= 4:
                char_ngrams.extend([word[i:i+3] for i in range(len(word)-2)])
        return meaningful + char_ngrams

    @classmethod
    def compute_similarity(cls, text1: str, text2: str, lang: str = "en") -> float:
        """
        Computes Jaccard / Cosine hybrid similarity between two questions.
        """
        toks1 = cls.clean_and_tokenize(text1, lang)
        toks2 = cls.clean_and_tokenize(text2, lang)
        if not toks1 or not toks2:
            return 0.0

        set1 = set(toks1)
        set2 = set(toks2)
        intersection = len(set1.intersection(set2))
        union = len(set1.union(set2))
        jaccard = intersection / max(1, union)

        # Overlap coefficient
        overlap = intersection / min(len(set1), len(set2))
        sim = 0.4 * jaccard + 0.6 * overlap
        return min(1.0, float(sim))

    @classmethod
    def cluster_questions(cls, questions: List[Dict[str, Any]], threshold: float = 0.55) -> List[Dict[str, Any]]:
        """
        Groups historical questions across years into conceptual clusters.
        Assigns cluster_id, concept_representative, frequency, and supporting years.
        """
        clusters = [] # list of {"id": int, "representative": str, "questions": list, "years": set, "chapter": str, "topic": str}

        for q in questions:
            q_text = q.get("question_text", "")
            q_year = q.get("year", 2024)
            q_topic = q.get("topic", "General")
            q_chapter = q.get("chapter", "General")

            matched_cluster = None
            best_sim = 0.0

            for c in clusters:
                # Same topic check gives high affinity
                topic_bonus = 0.2 if (c["topic"].lower() == q_topic.lower()) else 0.0
                sim = cls.compute_similarity(q_text, c["representative"]) + topic_bonus
                if sim >= threshold and sim > best_sim:
                    best_sim = sim
                    matched_cluster = c

            if matched_cluster:
                matched_cluster["questions"].append(q)
                matched_cluster["years"].add(q_year)
                # Keep the longest or most detailed question as the representative text
                if len(q_text) > len(matched_cluster["representative"]):
                    matched_cluster["representative"] = q_text
            else:
                new_c = {
                    "id": len(clusters) + 1,
                    "representative": q_text,
                    "questions": [q],
                    "years": {q_year},
                    "chapter": q_chapter,
                    "topic": q_topic,
                    "marks": q.get("marks", 5),
                    "difficulty": q.get("difficulty", "Medium")
                }
                clusters.append(new_c)

        # Format clusters
        formatted = []
        for c in clusters:
            c["frequency"] = len(c["questions"])
            c["years_list"] = sorted(list(c["years"]))
            c["distinct_years_count"] = len(c["years_list"])
            formatted.append(c)

        return formatted
