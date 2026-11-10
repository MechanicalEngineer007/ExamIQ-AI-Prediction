import urllib.request
import json

req_data = json.dumps({"exam_config_id": 1, "target_year": 2026, "language": "en"}).encode("utf-8")
req = urllib.request.Request("http://127.0.0.1:8000/api/predict", data=req_data, headers={"Content-Type": "application/json"})
res = urllib.request.urlopen(req)
data = json.loads(res.read())

print("Prediction API response:")
print("Subject:", data["subject_name"])
print("Target Year:", data["target_year"])
print("Total Paper Slots:", len(data["paper_slots"]))
for slot in data["paper_slots"]:
    print(f"  Slot {slot['slot_id']}: {slot['primary_predicted_question'][:50]}... [{slot['marks']}M] | ML Prob: {slot['primary_ml_probability']}%")
    print(f"    Alternatives: {len(slot['additional_predictions'])}")
    for alt in slot["additional_predictions"]:
        print(f"      - {alt['slot_label']}: {alt['question_text'][:40]}... [{alt['marks']}M] (Prob: {alt['ml_probability']}%)")
