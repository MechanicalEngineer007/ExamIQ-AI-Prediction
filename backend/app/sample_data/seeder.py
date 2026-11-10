import os
from typing import Dict, Any, List
from app.database import SessionLocal, Base, engine
from app.models.schemas import (
    ExamConfigDB, SyllabusDB, HistoricalPaperDB, HistoricalQuestionDB
)

def seed_sample_database():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    # Check if already seeded
    if db.query(ExamConfigDB).first():
        db.close()
        return

    print("Seeding rich 15-year examination data (2011-2025)...")

    # 1. Computer Engineering - Database Management Systems (English)
    db_config = ExamConfigDB(
        title="B.Tech Computer Science & Engineering - DBMS",
        board_university="Maharashtra State Technical University (Autonomous)",
        course_degree="Bachelor of Technology (B.Tech)",
        class_semester="Semester IV",
        subject_name="Database Management Systems & Information Architecture",
        subject_code="CS-402",
        exam_type="End Semester Examination",
        total_marks=100,
        duration_minutes=180,
        academic_year="2025-2026",
        default_language="en",
        pattern_structure={"total_questions": 5, "marks_per_question": 20, "sections": ["Section A", "Section B"]}
    )
    db.add(db_config)
    db.commit()
    db.refresh(db_config)

    # Syllabus with official weightage & deleted topics
    syllabus_dbms = SyllabusDB(
        exam_config_id=db_config.id,
        academic_year="2025-2026",
        status="active",
        is_official_weightage_available=True,
        chapters=[
            {
                "chapter_name": "Relational Data Model & ER Diagrams",
                "official_marks": 20,
                "topics": ["ER Modeling & Entities", "Relational Integrity Constraints", "Relational Algebra", "Cardinality & Keys"],
                "deleted_topics": ["Hierarchical & Network Data Models (Obsolete)"]
            },
            {
                "chapter_name": "SQL & Advanced Queries",
                "official_marks": 25,
                "topics": ["Complex Joins & Subqueries", "Aggregate Functions & Grouping", "Views and Triggers", "Indexes & Query Optimization"],
                "deleted_topics": []
            },
            {
                "chapter_name": "Database Normalization & Functional Dependency",
                "official_marks": 20,
                "topics": ["1NF, 2NF, 3NF Normal Forms", "Boyce-Codd Normal Form (BCNF)", "Lossless Join Decomposition", "Multi-valued Dependencies (4NF)"],
                "deleted_topics": []
            },
            {
                "chapter_name": "Transaction Management & Concurrency Control",
                "official_marks": 20,
                "topics": ["ACID Properties", "Serializability & Conflict Equivalence", "Two-Phase Locking (2PL) Protocol", "Deadlock Detection & Prevention"],
                "deleted_topics": []
            },
            {
                "chapter_name": "Storage, Indexing & NoSQL Architectures",
                "official_marks": 15,
                "topics": ["B-Trees & B+ Tree Indexing", "Hashing Techniques", "CAP Theorem & NoSQL Datastores"],
                "deleted_topics": ["Magnetic Tape Record Storage (Obsolete)"]
            }
        ],
        learning_objectives=[
            "Design normalized relational schemas without redundancy",
            "Construct complex SQL queries, views and triggers",
            "Ensure ACID compliance and deadlock-free concurrent transaction execution",
            "Analyze B+ Tree indexing and evaluate NoSQL architectures"
        ]
    )
    db.add(syllabus_dbms)
    db.commit()

    # Seed 15 years of papers (2011 to 2025)
    questions_corpus = [
        # Chapter 1
        ("ER Modeling & Entities", "Explain Entity-Relationship (ER) modeling with an example. Draw an ER diagram for a Hospital Management System.", 10, "Medium", "Relational Data Model & ER Diagrams", [2011, 2013, 2016, 2019, 2022, 2024]),
        ("Relational Integrity Constraints", "Define Primary Key, Foreign Key, and Candidate Key. Explain Referential Integrity with examples.", 10, "Easy", "Relational Data Model & ER Diagrams", [2012, 2015, 2018, 2021, 2023]),
        ("Relational Algebra", "Explain Relational Algebra operations: Select, Project, Cartesian Product, and Natural Join with formal mathematical notation.", 10, "Hard", "Relational Data Model & ER Diagrams", [2014, 2017, 2020, 2023, 2025]),
        ("Cardinality & Keys", "Discuss mapping cardinalities (1:1, 1:N, M:N) and structural constraints in ER diagrams.", 10, "Medium", "Relational Data Model & ER Diagrams", [2013, 2018, 2024]),

        # Chapter 2
        ("Complex Joins & Subqueries", "Explain Inner Join, Left Outer Join, Right Outer Join, and Full Outer Join with SQL syntax and sample tables.", 10, "Medium", "SQL & Advanced Queries", [2011, 2014, 2017, 2020, 2023, 2025]),
        ("Aggregate Functions & Grouping", "Demonstrate the use of GROUP BY and HAVING clauses in SQL. Differentiate between WHERE and HAVING with queries.", 10, "Medium", "SQL & Advanced Queries", [2012, 2016, 2019, 2022, 2024]),
        ("Views and Triggers", "What is a Database Trigger? Explain Before and After triggers with a realistic inventory audit log example.", 10, "Hard", "SQL & Advanced Queries", [2013, 2017, 2021, 2024]),
        ("Indexes & Query Optimization", "Explain Clustered vs Non-Clustered Indexes and how the SQL query optimizer generates an execution plan.", 10, "Hard", "SQL & Advanced Queries", [2015, 2018, 2022, 2025]),

        # Chapter 3
        ("1NF, 2NF, 3NF Normal Forms", "Explain 1NF, 2NF, and 3NF with suitable anomalies (Insertion, Deletion, Update anomalies). Normalize an unnormalized relation.", 10, "Hard", "Database Normalization & Functional Dependency", [2011, 2013, 2015, 2018, 2021, 2023, 2025]),
        ("Boyce-Codd Normal Form (BCNF)", "State the definition of BCNF. How does BCNF differ from 3NF? Give a relation that is in 3NF but not in BCNF.", 10, "Hard", "Database Normalization & Functional Dependency", [2012, 2016, 2019, 2022, 2024]),
        ("Lossless Join Decomposition", "Explain Lossless Join Decomposition and Dependency Preservation with a step-by-step testing algorithm.", 10, "Hard", "Database Normalization & Functional Dependency", [2014, 2017, 2020, 2023]),

        # Chapter 4
        ("ACID Properties", "Discuss ACID properties in transaction processing. Explain how each property is preserved by the DBMS recovery manager.", 10, "Medium", "Transaction Management & Concurrency Control", [2011, 2014, 2016, 2019, 2022, 2024]),
        ("Two-Phase Locking (2PL) Protocol", "Explain the Strict Two-Phase Locking (2PL) protocol. How does 2PL ensure serializability?", 10, "Hard", "Transaction Management & Concurrency Control", [2012, 2015, 2018, 2021, 2023, 2025]),
        ("Deadlock Detection & Prevention", "Describe Deadlock handling mechanisms: Wait-Die scheme, Wound-Wait scheme, and Wait-For Graph (WFG) detection.", 10, "Hard", "Transaction Management & Concurrency Control", [2013, 2017, 2020, 2024]),

        # Chapter 5
        ("B-Trees & B+ Tree Indexing", "Explain the structure of B+ Tree. Demonstrate insertion of keys into a B+ tree of order 4.", 10, "Hard", "Storage, Indexing & NoSQL Architectures", [2012, 2015, 2018, 2021, 2024]),
        ("CAP Theorem & NoSQL Datastores", "State and explain the CAP Theorem. Compare Document-oriented (MongoDB) vs Key-Value (Redis) datastores.", 10, "Medium", "Storage, Indexing & NoSQL Architectures", [2016, 2019, 2022, 2025]),
        ("Hashing Techniques", "Explain Static vs Dynamic Extensible Hashing with directory expansion and bucket splitting.", 10, "Medium", "Storage, Indexing & NoSQL Architectures", [2014, 2017, 2020, 2023])
    ]

    for yr in range(2011, 2026):
        paper = HistoricalPaperDB(
            exam_config_id=db_config.id,
            year=yr,
            session="Summer",
            language="en",
            total_marks=100,
            ocr_status="verified",
            raw_file_name=f"DBMS_Official_Exam_Paper_{yr}.pdf"
        )
        db.add(paper)
        db.commit()
        db.refresh(paper)

        # Questions for this year
        q_counter = 1
        for topic, text, marks, diff, chapter, years in questions_corpus:
            if yr in years:
                hq = HistoricalQuestionDB(
                    paper_id=paper.id,
                    q_number=f"Q.{q_counter}",
                    sub_q_number="",
                    section_name="Section A" if q_counter <= 3 else "Section B",
                    is_compulsory=True,
                    question_text=text,
                    marks=marks,
                    difficulty=diff,
                    chapter=chapter,
                    topic=topic,
                    subtopic="Core Concepts",
                    question_type="Descriptive",
                    language="en",
                    year=yr,
                    is_verified=True
                )
                db.add(hq)
                q_counter += 1
        db.commit()

    # 2. Management Studies - Principles of Management (Marathi & Hindi Support)
    mgmt_config = ExamConfigDB(
        title="व्यवस्थापन आणि व्यावसायिक धोरण (Principles of Management)",
        board_university="महाराष्ट्र राज्य उच्च शिक्षण मंडळ (MSBTE/Savitribai Phule University)",
        course_degree="Master of Business Administration (MBA / MMS)",
        class_semester="Semester I",
        subject_name="व्यवस्थापनाची मूलतत्त्वे (Principles of Management)",
        subject_code="MGMT-101",
        exam_type="सत्र परीक्षा (End Semester)",
        total_marks=100,
        duration_minutes=180,
        academic_year="2025-2026",
        default_language="mr",
        pattern_structure={"total_questions": 5, "marks_per_question": 20}
    )
    db.add(mgmt_config)
    db.commit()
    db.refresh(mgmt_config)

    syllabus_mgmt = SyllabusDB(
        exam_config_id=mgmt_config.id,
        academic_year="2025-2026",
        status="active",
        is_official_weightage_available=True,
        chapters=[
            {
                "chapter_name": "व्यवस्थापनाची संकल्पना व स्वरूप (Introduction to Management)",
                "official_marks": 25,
                "topics": ["व्यवस्थापनाची व्याख्या व महत्त्व", "हेन्री फेयॉल यांची व्यवस्थापनाची १४ तत्त्वे", "एफ. डब्ल्यू. टेलर यांचे वैज्ञानिक व्यवस्थापन"],
                "deleted_topics": []
            },
            {
                "chapter_name": "नियोजन आणि निर्णय प्रक्रिया (Planning & Decision Making)",
                "official_marks": 25,
                "topics": ["नियोजनाची प्रक्रिया व प्रकार", "निर्णय प्रक्रियेचे टप्पे व तंत्रे", "ध्येयाधारित व्यवस्थापन (MBO)"],
                "deleted_topics": []
            },
            {
                "chapter_name": "संघटन आणि मानवी संसाधन (Organizing & Staffing)",
                "official_marks": 25,
                "topics": ["संघटनात्मक रचना आणि प्रकार", "अधिकार प्रदान व विकेंद्रीकरण", "कर्मचारी निवड आणि प्रशिक्षण"],
                "deleted_topics": []
            },
            {
                "chapter_name": "नेतृत्व, अभिप्रेरणा व नियंत्रण (Leading & Controlling)",
                "official_marks": 25,
                "topics": ["मास्लो यांचा गरजांचा सिद्धांत", "नेतृत्वाच्या विविध कार्यशैली", "नियंत्रणाची तंत्रे व महत्त्व"],
                "deleted_topics": ["पारंपरिक पर्यवेक्षी पद्धती (कालबाह्य)"]
            }
        ],
        learning_objectives=[
            "व्यवस्थापनाची मूलभूत तत्त्वे आणि वैज्ञानिक दृष्टिकोन समजून घेणे",
            "संस्थेसाठी प्रभावी नियोजन आणि निर्णय घेणे",
            "कर्मचारी अभिप्रेरणा आणि नेतृत्व कौशल्ये विकसित करणे"
        ]
    )
    db.add(syllabus_mgmt)
    db.commit()

    # Marathi Questions Corpus
    mr_questions = [
        ("व्यवस्थापनाची व्याख्या व महत्त्व", "व्यवस्थापनाची व्याख्या सांगून आधुनिक व्यावसायिक संस्थांमध्ये व्यवस्थापनाचे महत्त्व सविस्तर स्पष्ट करा.", 10, "Medium", "व्यवस्थापनाची संकल्पना व स्वरूप (Introduction to Management)", [2015, 2017, 2019, 2021, 2023, 2024]),
        ("हेन्री फेयॉल यांची व्यवस्थापनाची १४ तत्त्वे", "हेन्री फेयॉल यांनी मांडलेली व्यवस्थापनाची १४ प्रशासकीय तत्त्वे योग्य उदाहरणांसह स्पष्ट करा.", 10, "Hard", "व्यवस्थापनाची संकल्पना व स्वरूप (Introduction to Management)", [2016, 2018, 2020, 2022, 2024, 2025]),
        ("एफ. डब्ल्यू. टेलर यांचे वैज्ञानिक व्यवस्थापन", "एफ. डब्ल्यू. टेलर यांचा वैज्ञानिक व्यवस्थापनाचा सिद्धांत आणि कामाचा अभ्यास स्पष्ट करा.", 10, "Medium", "व्यवस्थापनाची संकल्पना व स्वरूप (Introduction to Management)", [2015, 2018, 2021, 2023]),
        ("नियोजनाची प्रक्रिया व प्रकार", "नियोजन म्हणजे काय? नियोजनाची पायरीनिहाय प्रक्रिया आणि महत्त्व विशद करा.", 10, "Medium", "नियोजन आणि निर्णय प्रक्रिया (Planning & Decision Making)", [2016, 2019, 2022, 2024, 2025]),
        ("ध्येयाधारित व्यवस्थापन (MBO)", "ध्येयाधारित व्यवस्थापन (Management by Objectives - MBO) ची संकल्पना आणि फायदे-तोटे स्पष्ट करा.", 10, "Hard", "नियोजन आणि निर्णय प्रक्रिया (Planning & Decision Making)", [2017, 2020, 2023]),
        ("अधिकार प्रदान व विकेंद्रीकरण", "अधिकार प्रदान (Delegation of Authority) आणि विकेंद्रीकरण (Decentralization) यांमधील फरक स्पष्ट करा.", 10, "Medium", "संघटन आणि मानवी संसाधन (Organizing & Staffing)", [2015, 2017, 2020, 2022, 2024]),
        ("मास्लो यांचा गरजांचा सिद्धांत", "अब्राहम मास्लो यांचा मानवी गरजांच्या पदानुक्रमाचा अभिप्रेरणा सिद्धांत आकृतीसह स्पष्ट करा.", 10, "Medium", "नेतृत्व, अभिप्रेरणा व नियंत्रण (Leading & Controlling)", [2016, 2018, 2021, 2023, 2025]),
        ("नियंत्रणाची तंत्रे व महत्त्व", "व्यवस्थापकीय नियंत्रणाची आधुनिक तंत्रे स्पष्ट करा आणि व्यवसायात नियंत्रणाची आवश्यकता सांगा.", 10, "Medium", "नेतृत्व, अभिप्रेरणा व नियंत्रण (Leading & Controlling)", [2015, 2019, 2022, 2024])
    ]

    for yr in range(2015, 2026):
        paper_mr = HistoricalPaperDB(
            exam_config_id=mgmt_config.id,
            year=yr,
            session="Winter",
            language="mr",
            total_marks=100,
            ocr_status="verified",
            raw_file_name=f"MGMT_Marathi_Exam_{yr}.pdf"
        )
        db.add(paper_mr)
        db.commit()
        db.refresh(paper_mr)

        q_idx = 1
        for topic, text, marks, diff, ch, yrs in mr_questions:
            if yr in yrs:
                hq = HistoricalQuestionDB(
                    paper_id=paper_mr.id,
                    q_number=f"प्र.{q_idx}",
                    sub_q_number="",
                    section_name="विभाग १" if q_idx <= 2 else "विभाग २",
                    is_compulsory=True,
                    question_text=text,
                    marks=marks,
                    difficulty=diff,
                    chapter=ch,
                    topic=topic,
                    subtopic="मूलभूत संकल्पना",
                    question_type="Descriptive",
                    language="mr",
                    year=yr,
                    is_verified=True
                )
                db.add(hq)
                q_idx += 1
        db.commit()

    db.close()
    print("Sample database seeded successfully with 15 years of structured examination papers and syllabi.")
