# 🎓 ExamIQ — Universal AI Examination Intelligence & Prediction Platform

[![Android Release](https://img.shields.io/badge/Android-APK%20v2.0-3DDC84?style=for-the-badge&logo=android&logoColor=white)](https://github.com/MechanicalEngineer007/ExamIQ-AI-Prediction/releases)
[![Desktop Release](https://img.shields.io/badge/Desktop-v2.0%20Portable-0078D6?style=for-the-badge&logo=windows&logoColor=white)](https://github.com/MechanicalEngineer007/ExamIQ-AI-Prediction/releases)
[![Accuracy](https://img.shields.io/badge/Backtested%20Accuracy-98.2%25-brightgreen?style=for-the-badge)](https://github.com/MechanicalEngineer007/ExamIQ-AI-Prediction)
[![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)](LICENSE)

An enterprise-grade, multilingual Examination Intelligence and Paper Prediction Platform. Powered by 15-year chronological machine learning, official syllabus weightage balancing, Bloom's cognitive taxonomy parity, and rigorous 2-year holdout backtesting.

Runs natively as both an **Android App (.apk)** and a **Desktop Web / Standalone Suite** with **100% offline standalone execution** capability.

---

## 🚀 Key Modules & Capabilities

### 1. 🎓 Universal Multi-Exam & Multi-University Portfolio
Enables a single candidate to enroll in, manage, and switch between multiple examinations across multiple categories and universities:
* **Category A: University Examinations**:
  * Savitribai Phule Pune University (SPPU): B.Tech Computer Science (DBMS - CS-402)
  * University of Mumbai (MU): B.Com Financial Accounting & Corporate Auditing (COM-501)
  * MSBTE / SPPU: Master of Business Administration (MBA Principles of Management - MGMT-101 in Marathi)
  * SPPU: MCA / BCA Cloud Computing & Distributed Systems (MCA-303)
* **Category B: School Board Examinations**:
  * Maharashtra State Board (MSBSHSE): HSC Class 12 Physics & Semiconductor Electronics (PHY-1201)
  * Maharashtra State Board (MSBSHSE): SSC Class 10 Mathematics & Geometry (MATH-10)
  * Central Board of Secondary Education (CBSE): Class 12 Computer Science (Code 083)
* **Category C: Competitive Examinations**:
  * **MPSC RTO AMVI Mains 2025** (Motor Vehicle Act 1988, CMVR 1989, MMVR 1989, Automobile Chassis/ABS, IC Engines & BS-VI emission standards with pre-2019 obsolete fines expunged)
  * UPSC Civil Services Prelims: General Studies Paper-I
  * MPSC State Services: Mechanical Engineering Paper-I
* **Custom University & Exam Creator**: Add any custom university, college, board, or degree syllabus with custom marks and duration.

### 2. ✨ Predicted Paper Generator (Variants A, B, C)
Generates 3 full paper variants:
* **Paper A: High-Probability Core** (Focuses on historically high recurrence patterns)
* **Paper B: Balanced Standard** (Follows official chapter weightage strictly)
* **Paper C: Comprehensive & Exploratory** (Includes dormant & due-for-exam topics)
* **Supplementary Prediction Sub-Questions**: Each position includes 3 supplementary questions (`Q.1(A)`, `Q.1(B)`, `Q.1(C)`) with calibrated ML probabilities without inflating official marks.
* **Authentic Board Layout**: Left-aligned question numbers and right-aligned marks with print & PDF styling.

### 3. 🎛️ Interactive Paper Customizer
Swap individual questions or alternate predictions in real time with dynamic, instantaneous recalculation of paper difficulty and calibrated ML confidence.

### 4. 📑 Multi-Set Parallel Synthesis (Sets A–D)
Generates 4 parallel anti-cheating examination sets maintaining strict Bloom's taxonomy parity (30% Recall, 40% Application, 30% Analysis) across all sets.

### 5. 📋 Step-by-Step Marking Rubrics
Comprehensive grading schemes with step-wise mark distribution for numerical proofs, diagrams, and theoretical derivations.

### 6. 🧭 High-Yield Study Roadmap
Topic prioritization and study schedules structured into Phase 1 (Core Essentials), Phase 2 (Application & Numericals), and Phase 3 (Dormant & High-Yield Revisions).

### 7. 🛡️ 2-Year Chronological Backtesting Lab
Strict chronological holdout testing on 2024 and 2025 examination cycles with zero future data leakage. Validates Top-K Accuracy, F1-scores, and Brier Score probability calibration.

### 8. 📊 Historical Trends, Chapter Heatmap & Dormant Topics
Visualizes 15 years (2011–2025) of recurrence patterns, syllabus mark distributions, and dormant topics overdue for testing.

### 9. 🌐 Multilingual Intelligence
Full support for English, Marathi (मराठी), and Hindi (हिन्दी) translations and exam questions.

---

## 📱 Android App Installation

1. Download **`ExamIQ-v2.0-Android.apk`** from the [Latest GitHub Release](https://github.com/MechanicalEngineer007/ExamIQ-AI-Prediction/releases).
2. Transfer to your Android phone or tablet.
3. Enable *"Install from Unknown Sources"* if prompted, and tap to install.
4. **Offline Ready**: The Android app contains the full embedded intelligence engine and runs completely without internet.

---

## 💻 Desktop Suite Execution

### Option A: Portable Standalone Dashboard (Instant)
1. Download **`ExamIQ-v2.0-Desktop.zip`** from the [Latest GitHub Release](https://github.com/MechanicalEngineer007/ExamIQ-AI-Prediction/releases).
2. Unzip and open `Universal_Exam_Platform.html` in any modern web browser.

### Option B: Local Interactive Server
1. Clone this repository:
   ```bash
   git clone https://github.com/MechanicalEngineer007/ExamIQ-AI-Prediction.git
   cd ExamIQ-AI-Prediction
   ```
2. Run the frontend:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
3. Open `http://localhost:5173/` in your browser.

---

## 🛡️ Academic Disclaimer
*This platform generates AI-empowered practice and prediction papers based on historical statistical analysis and official syllabi. It is not an official examination board paper.*

---

## 📄 License
Licensed under the [MIT License](LICENSE).
