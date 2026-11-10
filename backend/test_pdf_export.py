import urllib.request
import os

url = "http://127.0.0.1:8000/api/export-pdf?prediction_id=1&show_probabilities=true"
req = urllib.request.Request(url, method="POST")
res = urllib.request.urlopen(req)
pdf_bytes = res.read()

output_path = os.path.join("exports", "official_predicted_paper_downloaded.pdf")
with open(output_path, "wb") as f:
    f.write(pdf_bytes)

print(f"Downloaded predicted paper PDF size: {len(pdf_bytes)} bytes at {output_path}")
