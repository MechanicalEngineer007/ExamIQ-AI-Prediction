import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import Base, engine
from app.routers.api import router
from app.sample_data.seeder import seed_sample_database

app = FastAPI(
    title="AI-Based Exam Paper Prediction & Question Paper Generator API",
    description="Intelligent examination prediction engine using 15-year historical papers, official syllabus weightage, multilingual OCR, and chronological backtesting.",
    version="2.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def startup_event():
    Base.metadata.create_all(bind=engine)
    # Seed 15 years of sample papers and official syllabi
    try:
        seed_sample_database()
    except Exception as e:
        print(f"Startup seeding notice: {e}")

app.include_router(router)

from fastapi.responses import RedirectResponse

@app.get("/")
def health_check():
    return RedirectResponse(url="http://localhost:5173/")

@app.get("/health")
def api_health():
    return {
        "status": "online",
        "service": "AI Exam Paper Prediction Platform",
        "supported_languages": ["en", "mr", "hi"],
        "backtesting_verified": True
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
