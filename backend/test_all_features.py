import urllib.request
import json
import os

print("--- Testing 1: Bloom's Taxonomy Balance ---")
res = urllib.request.urlopen("http://127.0.0.1:8000/api/bloom-taxonomy/1")
data = json.loads(res.read())
print("Accreditation Compliant:", data["is_accreditation_compliant"])
for b in data["cognitive_breakdown"]:
    print(f"  {b['level']}: {b['percentage']}% ({b['marks']} Marks)")

print("\n--- Testing 2: Multi-Sets Generator (Sets A, B, C, D) ---")
req = urllib.request.Request("http://127.0.0.1:8000/api/multi-sets?exam_config_id=1", method="POST")
res = urllib.request.urlopen(req)
m_data = json.loads(res.read())
print("Sets generated:", list(m_data["sets"].keys()))
for s_name, s_val in m_data["sets"].items():
    print(f"  {s_name}: {len(s_val['slots'])} Slots, Equivalence: {s_val['equivalence_score']}%")

print("\n--- Testing 3: Student Study Roadmap (4-Quadrant) ---")
res = urllib.request.urlopen("http://127.0.0.1:8000/api/study-roadmap/1")
r_data = json.loads(res.read())
print("Target Preparation Hours:", r_data["total_estimated_study_hours"])
print("  Q1 Must-Master Core:", len(r_data["quadrant_1_must_master"]), "topics")
print("  Q2 High-Yield Gaps (Surge Alert):", len(r_data["quadrant_2_high_yield_gaps"]), "topics")
print("  Q3 Quick-Win Questions:", len(r_data["quadrant_3_quick_wins"]), "topics")
print("  Q4 Pruned/Low-Priority Topics:", len(r_data["quadrant_4_low_priority"]), "topics")

print("\n--- Testing 4: Marking Scheme & Model Rubric Generation ---")
req = urllib.request.Request("http://127.0.0.1:8000/api/marking-scheme?prediction_id=1", method="POST")
res = urllib.request.urlopen(req)
s_data = json.loads(res.read())
print("Marking rubrics generated for slots:", len(s_data["marking_schemes"]))
print("First slot component breakdown:", [s["component"] for s in s_data["marking_schemes"][0]["rubric_steps"]])

print("\n--- Testing 5: Bilingual PDF Export ---")
req = urllib.request.Request("http://127.0.0.1:8000/api/export-bilingual-pdf?prediction_id=1", method="POST")
res = urllib.request.urlopen(req)
pdf_bytes = res.read()
print("Bilingual PDF exported size:", len(pdf_bytes), "bytes")

print("\n--- Testing 6: Model Answer Scheme PDF Export ---")
req = urllib.request.Request("http://127.0.0.1:8000/api/export-marking-scheme-pdf?prediction_id=1", method="POST")
res = urllib.request.urlopen(req)
scheme_pdf_bytes = res.read()
print("Model Answer Key PDF exported size:", len(scheme_pdf_bytes), "bytes")
