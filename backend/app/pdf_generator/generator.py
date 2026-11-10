import os
import datetime
from typing import List, Dict, Any, Optional
from reportlab.lib.pagesizes import letter, A4
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether, HRFlowable
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT, TA_JUSTIFY
from reportlab.pdfgen import canvas

class NumberedCanvas(canvas.Canvas):
    """
    Two-pass canvas to dynamically compute and draw total page numbers and watermarks.
    """
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            super().showPage()
        super().save()

    def draw_page_decorations(self, page_count):
        self.saveState()
        self.setFont("Helvetica-Bold", 8)
        self.setFillColor(colors.HexColor("#DC2626"))
        
        # Prominent AI disclaimer watermark banner on header
        self.drawCentredString(A4[0] / 2.0, A4[1] - 24, "AI-PREDICTED – NOT AN OFFICIAL QUESTION PAPER (FOR REVISION & PRACTICE ONLY)")
        
        # Border box around examination paper
        self.setStrokeColor(colors.HexColor("#9CA3AF"))
        self.setLineWidth(0.75)
        self.rect(28, 28, A4[0] - 56, A4[1] - 56)

        # Footer page number
        self.setFont("Helvetica", 9)
        self.setFillColor(colors.HexColor("#4B5563"))
        page_str = f"Page {self._pageNumber} of {page_count}"
        self.drawRightString(A4[0] - 40, 36, page_str)
        self.drawString(40, 36, "Confidential AI Practice Paper | Validated via Chronological Backtesting")
        self.restoreState()


class OfficialStylePDFGenerator:
    """
    Generates authentic university/board question papers matching official layouts.
    Supports:
    - Official Header & University/Board branding
    - Left-aligned Question numbers (Q.1, Q.2, etc.)
    - Right-aligned Marks allocation ([5 Marks], [10 Marks])
    - Clear distinction between Main predicted question and Supplementary Alternative questions
    - Multilingual labels
    - Custom reports: Standard Paper, Paper with ML Probabilities, Important Questions, Chapter-wise Report.
    """

    @classmethod
    def create_predicted_paper_pdf(
        cls,
        output_filepath: str,
        exam_config: Dict[str, Any],
        paper_slots: List[Dict[str, Any]],
        show_probabilities: bool = False,
        report_mode: str = "standard" # standard, with_ml, important, chapterwise
    ) -> str:
        doc = SimpleDocTemplate(
            output_filepath,
            pagesize=A4,
            leftMargin=36,
            rightMargin=36,
            topMargin=40,
            bottomMargin=48
        )

        styles = getSampleStyleSheet()
        title_style = ParagraphStyle(
            'HeaderTitle',
            parent=styles['Normal'],
            fontName='Helvetica-Bold',
            fontSize=13,
            leading=16,
            alignment=TA_CENTER,
            textColor=colors.HexColor("#111827")
        )
        subtitle_style = ParagraphStyle(
            'HeaderSub',
            parent=styles['Normal'],
            fontName='Helvetica-Bold',
            fontSize=10,
            leading=13,
            alignment=TA_CENTER,
            textColor=colors.HexColor("#1F2937")
        )
        instr_style = ParagraphStyle(
            'Instructions',
            parent=styles['Normal'],
            fontName='Helvetica-Oblique',
            fontSize=8.5,
            leading=11,
            alignment=TA_LEFT,
            textColor=colors.HexColor("#374151")
        )
        q_text_style = ParagraphStyle(
            'QuestionBody',
            parent=styles['Normal'],
            fontName='Helvetica',
            fontSize=9.5,
            leading=13,
            alignment=TA_LEFT,
            textColor=colors.HexColor("#000000")
        )
        q_num_style = ParagraphStyle(
            'QuestionNum',
            parent=styles['Normal'],
            fontName='Helvetica-Bold',
            fontSize=9.5,
            leading=13,
            alignment=TA_LEFT,
            textColor=colors.HexColor("#000000")
        )
        marks_style = ParagraphStyle(
            'QuestionMarks',
            parent=styles['Normal'],
            fontName='Helvetica-Bold',
            fontSize=9.5,
            leading=13,
            alignment=TA_RIGHT,
            textColor=colors.HexColor("#000000")
        )
        alt_label_style = ParagraphStyle(
            'AltLabel',
            parent=styles['Normal'],
            fontName='Helvetica-Bold',
            fontSize=8,
            leading=10,
            alignment=TA_LEFT,
            textColor=colors.HexColor("#2563EB")
        )
        ml_prob_style = ParagraphStyle(
            'MLProb',
            parent=styles['Normal'],
            fontName='Helvetica-Bold',
            fontSize=8,
            leading=10,
            alignment=TA_RIGHT,
            textColor=colors.HexColor("#047857")
        )

        story = []

        # 1. Header Information Block
        board_name = exam_config.get("board_university", "STATE BOARD OF TECHNICAL EDUCATION & EXAMINATIONS").upper()
        course_name = f"{exam_config.get('course_degree', 'B.Tech / Diploma')} - {exam_config.get('class_semester', 'Semester V')}"
        subject_title = f"{exam_config.get('subject_name', 'Computer Engineering Core')} ({exam_config.get('subject_code', 'CS-502')})"
        exam_type = f"{exam_config.get('exam_type', 'End Semester Examination')} - {exam_config.get('academic_year', '2025-2026')}"

        story.append(Paragraph(board_name, title_style))
        story.append(Spacer(1, 2))
        story.append(Paragraph(course_name, subtitle_style))
        story.append(Spacer(1, 2))
        story.append(Paragraph(f"<b>SUBJECT: {subject_title.upper()}</b>", subtitle_style))
        story.append(Spacer(1, 2))
        story.append(Paragraph(exam_type, subtitle_style))
        story.append(Spacer(1, 6))

        # Meta info bar: Time, Total Marks
        meta_table_data = [
            [
                Paragraph(f"<b>Time:</b> {exam_config.get('duration_minutes', 180) // 60} Hours", q_text_style),
                Paragraph(f"<b>Max Marks:</b> {exam_config.get('total_marks', 100)}", marks_style)
            ]
        ]
        meta_table = Table(meta_table_data, colWidths=[A4[0] * 0.45, A4[0] * 0.45])
        meta_table.setStyle(TableStyle([
            ('BOTTOMPADDING', (0, 0), (-1, -1), 2),
            ('TOPPADDING', (0, 0), (-1, -1), 2),
        ]))
        story.append(meta_table)
        story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#1F2937"), spaceBefore=4, spaceAfter=6))

        # Instructions
        instructions_text = (
            "<b>Instructions to Candidates:</b><br/>"
            "1. All main questions carry specified marks. Answer according to section guidelines.<br/>"
            "2. Figures to the right indicate full marks.<br/>"
            "3. Assume suitable data if necessary and state them clearly.<br/>"
            "4. <i>Note: Supplementary questions marked (A), (B), (C) are additional AI-predicted alternative practice variations and do not add to official total marks.</i>"
        )
        story.append(Paragraph(instructions_text, instr_style))
        story.append(HRFlowable(width="100%", thickness=0.5, color=colors.HexColor("#9CA3AF"), spaceBefore=4, spaceAfter=8))

        # 2. Render Sections and Question Slots
        current_section = ""
        for slot in paper_slots:
            sec = slot.get("section_name", "Section A")
            if sec != current_section:
                current_section = sec
                sec_header = Paragraph(f"<b>--- {current_section.upper()} ---</b>", ParagraphStyle(
                    'SecHeader', parent=styles['Normal'], fontName='Helvetica-Bold', fontSize=10, alignment=TA_CENTER, textColor=colors.HexColor("#1F2937")
                ))
                story.append(Spacer(1, 4))
                story.append(sec_header)
                story.append(Spacer(1, 4))

            # Main Question Row
            q_num = slot.get("slot_id", "Q.1")
            q_body = slot.get("primary_predicted_question", "")
            q_marks = f"[{slot.get('marks', 20)}]"
            
            # Left: Q number, Middle: Question text + Topic tag, Right: Marks
            body_flowable = [
                Paragraph(q_body, q_text_style),
                Paragraph(f"<font size=7 color='#6B7280'>Topic: {slot.get('topic', 'General')} | Difficulty: {slot.get('difficulty', 'Medium')}</font>", q_text_style)
            ]
            if show_probabilities:
                prob_tag = f"<b>ML Prob: {slot.get('primary_ml_probability', 75.0)}%</b> ({slot.get('confidence_tier', 'High')})"
                body_flowable.append(Paragraph(f"<font size=7 color='#047857'>{prob_tag} | Historical Years: {', '.join(map(str, slot.get('supporting_years', [])))}</font>", q_text_style))

            main_row = [
                Paragraph(f"<b>{q_num}</b>", q_num_style),
                body_flowable,
                Paragraph(f"<b>{q_marks}</b>", marks_style)
            ]

            q_table = Table([main_row], colWidths=[40, A4[0] - 165, 55])
            q_table.setStyle(TableStyle([
                ('VALIGN', (0, 0), (-1, -1), 'TOP'),
                ('TOPPADDING', (0, 0), (-1, -1), 4),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
            ]))
            story.append(q_table)

            # Additional / Supplementary AI Predictions
            alts = slot.get("additional_predictions", [])
            if alts:
                alt_heading = Paragraph("<font size=7.5 color='#2563EB'><b>SUPPLEMENTARY AI PREDICTED ALTERNATIVES:</b></font>", alt_label_style)
                story.append(Table([[Paragraph("", q_text_style), alt_heading, Paragraph("", marks_style)]], colWidths=[40, A4[0] - 165, 55]))

                for alt in alts:
                    alt_slot = alt.get("slot_label", "")
                    alt_q = alt.get("question_text", "")
                    alt_marks = f"[{alt.get('marks', slot.get('marks', 20))}]"

                    alt_flowable = [
                        Paragraph(f"{alt_q}", q_text_style),
                        Paragraph(f"<font size=7 color='#4B5563'>Topic: {alt.get('topic')} | Diff: {alt.get('difficulty')}</font>", q_text_style)
                    ]
                    if show_probabilities:
                        alt_prob_str = f"<b>ML Prob: {alt.get('ml_probability', 65.0)}%</b> ({alt.get('prediction_confidence', 'Moderate')}) | Supporting: {', '.join(map(str, alt.get('historical_supporting_years', [])))}"
                        alt_flowable.append(Paragraph(f"<font size=7 color='#047857'>{alt_prob_str}</font>", ml_prob_style))

                    alt_row = [
                        Paragraph(f"<b>{alt_slot}</b>", q_num_style),
                        alt_flowable,
                        Paragraph(f"<i>{alt_marks}</i>", marks_style)
                    ]
                    alt_table = Table([alt_row], colWidths=[40, A4[0] - 165, 55])
                    alt_table.setStyle(TableStyle([
                        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
                        ('TOPPADDING', (0, 0), (-1, -1), 2),
                        ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
                        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor("#F9FAFB"))
                    ]))
                    story.append(alt_table)

            story.append(HRFlowable(width="100%", thickness=0.3, color=colors.HexColor("#E5E7EB"), spaceBefore=3, spaceAfter=4))

        # Build Document with NumberedCanvas
        doc.build(story, canvasmaker=NumberedCanvas)
        return output_filepath

    @classmethod
    def create_marking_scheme_pdf(
        cls,
        output_filepath: str,
        exam_config: Dict[str, Any],
        marking_schemes: List[Dict[str, Any]]
    ) -> str:
        doc = SimpleDocTemplate(
            output_filepath,
            pagesize=A4,
            leftMargin=36,
            rightMargin=36,
            topMargin=40,
            bottomMargin=48
        )
        styles = getSampleStyleSheet()
        title_style = ParagraphStyle(
            'SchemeTitle', parent=styles['Normal'], fontName='Helvetica-Bold', fontSize=12, alignment=TA_CENTER, textColor=colors.HexColor("#1E3A8A")
        )
        sub_style = ParagraphStyle(
            'SchemeSub', parent=styles['Normal'], fontName='Helvetica-Bold', fontSize=9.5, alignment=TA_CENTER, textColor=colors.HexColor("#1F2937")
        )
        body_style = ParagraphStyle(
            'SchemeBody', parent=styles['Normal'], fontName='Helvetica', fontSize=8.5, leading=11, textColor=colors.HexColor("#111827")
        )
        bold_style = ParagraphStyle(
            'SchemeBold', parent=styles['Normal'], fontName='Helvetica-Bold', fontSize=8.5, leading=11, textColor=colors.HexColor("#111827")
        )

        story = []
        story.append(Paragraph("CONFIDENTIAL – EXAMINER'S MODEL ANSWER KEY & MARKING SCHEME", title_style))
        story.append(Spacer(1, 3))
        story.append(Paragraph(f"SUBJECT: {exam_config.get('subject_name', 'Subject').upper()} | CODE: {exam_config.get('subject_code', 'SUB-101')}", sub_style))
        story.append(Paragraph(f"TOTAL MARKS: {exam_config.get('total_marks', 100)} | EVALUATION RUBRIC", sub_style))
        story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#1E3A8A"), spaceBefore=4, spaceAfter=8))

        for idx, item in enumerate(marking_schemes, start=1):
            q_head = Paragraph(f"<b>Q.{idx}: {item.get('question_text')}</b> [{item.get('total_marks')} Marks]", ParagraphStyle('QH', parent=styles['Normal'], fontName='Helvetica-Bold', fontSize=9, textColor=colors.HexColor("#1E40AF")))
            story.append(q_head)
            story.append(Spacer(1, 3))

            # Rubric table
            table_data = [[Paragraph("<b>Evaluation Component</b>", bold_style), Paragraph("<b>Expected Details & Examiner Criteria</b>", bold_style), Paragraph("<b>Marks</b>", bold_style)]]
            for step in item.get("rubric_steps", []):
                table_data.append([
                    Paragraph(f"<b>{step['component']}</b>", body_style),
                    Paragraph(step['description'], body_style),
                    Paragraph(f"<b>{step['marks']}M</b>", bold_style)
                ])
            
            t = Table(table_data, colWidths=[130, A4[0] - 250, 45])
            t.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#F3F4F6")),
                ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#D1D5DB")),
                ('VALIGN', (0, 0), (-1, -1), 'TOP'),
                ('TOPPADDING', (0, 0), (-1, -1), 3),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
            ]))
            story.append(t)

            # Common pitfalls
            pitfalls = item.get("common_pitfalls_to_avoid", [])
            if pitfalls:
                p_text = Paragraph(f"<font color='#B91C1C'><b>Deductions / Common Mistakes:</b> " + " | ".join(pitfalls) + "</font>", body_style)
                story.append(Spacer(1, 2))
                story.append(p_text)

            story.append(HRFlowable(width="100%", thickness=0.3, color=colors.HexColor("#E5E7EB"), spaceBefore=4, spaceAfter=6))

        doc.build(story, canvasmaker=NumberedCanvas)
        return output_filepath

    @classmethod
    def create_bilingual_paper_pdf(
        cls,
        output_filepath: str,
        exam_config: Dict[str, Any],
        paper_slots: List[Dict[str, Any]]
    ) -> str:
        """
        Generates Bilingual side-by-side examination paper (English on left, Marathi / Hindi on right).
        """
        doc = SimpleDocTemplate(
            output_filepath,
            pagesize=A4,
            leftMargin=36,
            rightMargin=36,
            topMargin=40,
            bottomMargin=48
        )
        styles = getSampleStyleSheet()
        title_style = ParagraphStyle('BTitle', parent=styles['Normal'], fontName='Helvetica-Bold', fontSize=12, alignment=TA_CENTER)
        sub_style = ParagraphStyle('BSub', parent=styles['Normal'], fontName='Helvetica-Bold', fontSize=9, alignment=TA_CENTER)
        body_style = ParagraphStyle('BBody', parent=styles['Normal'], fontName='Helvetica', fontSize=8.5, leading=11)
        bold_style = ParagraphStyle('BBold', parent=styles['Normal'], fontName='Helvetica-Bold', fontSize=8.5, leading=11)
        marks_style = ParagraphStyle('BMarks', parent=styles['Normal'], fontName='Helvetica-Bold', fontSize=9, alignment=TA_RIGHT)

        story = []
        story.append(Paragraph(f"<b>{exam_config.get('board_university', 'STATE TECHNICAL BOARD').upper()}</b>", title_style))
        story.append(Paragraph(f"BILINGUAL EXAMINATION PAPER / द्विभाषिक प्रश्नपत्रिका", sub_style))
        story.append(Paragraph(f"<b>{exam_config.get('subject_name', 'SUBJECT')} ({exam_config.get('subject_code', 'CODE')})</b>", sub_style))
        story.append(Spacer(1, 4))

        meta_table = Table([[
            Paragraph(f"<b>Time:</b> {exam_config.get('duration_minutes', 180) // 60} Hours", body_style),
            Paragraph(f"<b>Total Marks / एकूण गुण:</b> {exam_config.get('total_marks', 100)}", marks_style)
        ]], colWidths=[A4[0] * 0.45, A4[0] * 0.45])
        story.append(meta_table)
        story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#1F2937"), spaceBefore=4, spaceAfter=8))

        # Bilingual Header Table
        col_w = (A4[0] - 120) / 2
        for slot in paper_slots:
            q_num = slot.get("slot_id", "Q.1")
            eng_text = slot.get("primary_predicted_question", "")
            # Equivalent Devanagari translation placeholder/text
            dev_text = slot.get("marathi_question") or f"{eng_text} (सविस्तर स्पष्टीकरण आणि आवश्यक आकृतीसह उत्तर लिहा.)"
            q_marks = f"[{slot.get('marks', 20)}]"

            row = [
                Paragraph(f"<b>{q_num}</b>", bold_style),
                Paragraph(f"<b>(English)</b><br/>{eng_text}", body_style),
                Paragraph(f"<b>(मराठी / हिन्दी)</b><br/>{dev_text}", body_style),
                Paragraph(f"<b>{q_marks}</b>", marks_style)
            ]
            t = Table([row], colWidths=[35, col_w, col_w, 45])
            t.setStyle(TableStyle([
                ('VALIGN', (0, 0), (-1, -1), 'TOP'),
                ('TOPPADDING', (0, 0), (-1, -1), 4),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
                ('LINEBELOW', (0, 0), (-1, -1), 0.5, colors.HexColor("#E5E7EB")),
            ]))
            story.append(t)
            story.append(Spacer(1, 4))

        doc.build(story, canvasmaker=NumberedCanvas)
        return output_filepath
