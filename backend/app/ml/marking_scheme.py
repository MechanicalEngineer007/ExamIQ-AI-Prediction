from typing import List, Dict, Any

class MarkingSchemeGenerator:
    """
    Automated Official Marking Scheme & Model Solution Rubric Generator.
    Produces:
    - Step-by-step marks distribution (e.g. Definition: 2M, Architecture Diagram: 3M, Analysis: 3M, Example: 2M)
    - Key Examiner Checklist (critical technical keywords required for full marks)
    - High-scoring Model Solution Outline
    - Common Student Pitfalls & Penalties
    """

    @classmethod
    def generate_scheme_for_question(cls, question: Dict[str, Any]) -> Dict[str, Any]:
        text = question.get("question_text", "")
        marks = question.get("marks", 10)
        topic = question.get("topic", "Core Concepts")
        difficulty = question.get("difficulty", "Medium")

        # Determine breakdown proportions based on total marks
        if marks == 20:
            rubric_steps = [
                {"component": "Formal Definition & Theoretical Foundation", "marks": 4, "description": "Accurate formal definition, taxonomy, and mathematical/formal properties."},
                {"component": "System Architecture / Structural Diagram", "marks": 5, "description": "Neat, properly labeled architectural diagram or ER/schema representation."},
                {"component": "Detailed Technical Explanation & Working Mechanism", "marks": 7, "description": "Comprehensive explanation of operational algorithm, constraints, or protocols."},
                {"component": "Practical Case Study / SQL Queries / Numerical Demonstration", "marks": 4, "description": "Realistic implementation example, code snippet, or anomaly walk-through."}
            ]
        elif marks == 10:
            rubric_steps = [
                {"component": "Core Definition & Fundamental Concepts", "marks": 2, "description": "Precise definition and technical significance."},
                {"component": "Diagrammatic Representation / Schema Flow", "marks": 3, "description": "Clean labeled diagram, table structure, or state machine."},
                {"component": "Core Technical Principles & Step-by-Step Analysis", "marks": 3, "description": "Clear logical explanation covering all key properties/phases."},
                {"component": "Concrete Example / Syntax / Anomaly Illustration", "marks": 2, "description": "Demonstrative example illustrating real-world application."}
            ]
        else: # 5 marks or short question
            rubric_steps = [
                {"component": "Statement / Definition", "marks": 1, "description": "Clear technical definition."},
                {"component": "Key Characteristics / Diagram", "marks": 2, "description": "Essential features or minimal schematic."},
                {"component": "Practical Significance / Example", "marks": 2, "description": "Brief illustration or use-case."}
            ]

        # Key concepts based on question topic
        key_points = [
            f"Explicitly mention standard terminology related to {topic}",
            "Include formal mathematical or structural constraints",
            "Illustrate with an end-to-end trace or diagram rather than purely text"
        ]
        
        pitfalls = [
            "Giving vague generic answers without subject-specific technical terminology (-2 Marks)",
            "Omitting the diagram or failing to label components clearly (-3 Marks)",
            "Failing to provide a working code or concrete anomaly example (-2 Marks)"
        ]

        return {
            "question_text": text,
            "topic": topic,
            "total_marks": marks,
            "difficulty": difficulty,
            "rubric_steps": rubric_steps,
            "examiner_key_points": key_points,
            "common_pitfalls_to_avoid": pitfalls,
            "model_answer_summary": f"A full-marks answer for this question requires defining {topic}, presenting the foundational architecture, and illustrating the operational workflow with a realistic benchmark scenario."
        }
