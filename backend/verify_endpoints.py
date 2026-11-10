import urllib.request
import json

res = urllib.request.urlopen("http://127.0.0.1:8000/openapi.json")
schema = json.loads(res.read())
upload_paths = [path for path in schema["paths"] if "upload" in path]
print("Verified upload endpoints in backend:")
for p in upload_paths:
    print(" -", p)
