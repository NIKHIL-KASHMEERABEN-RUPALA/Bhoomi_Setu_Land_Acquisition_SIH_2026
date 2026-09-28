"""
BhoomiSetu — SIH 2026 PPTX Presentation Generator
Generates a professional 13-slide PowerPoint presentation.
"""

from pptx import Presentation
from pptx.util import Inches, Pt, Emu
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.enum.shapes import MSO_SHAPE
from pathlib import Path
import os

# ── Color Palette ──
NAVY       = RGBColor(0x0A, 0x16, 0x28)
NAVY_MID   = RGBColor(0x16, 0x25, 0x42)
NAVY_LIGHT = RGBColor(0x10, 0x1D, 0x33)
TEAL       = RGBColor(0x0F, 0xA8, 0x9A)
GREEN      = RGBColor(0x16, 0xA8, 0x78)
YELLOW     = RGBColor(0xF2, 0xA5, 0x1A)
ORANGE     = RGBColor(0xF9, 0x73, 0x16)
RED        = RGBColor(0xEF, 0x44, 0x44)
WHITE      = RGBColor(0xFF, 0xFF, 0xFF)
GRAY_LIGHT = RGBColor(0xE8, 0xED, 0xF3)
GRAY       = RGBColor(0xB0, 0xBE, 0xC5)
GRAY_DARK  = RGBColor(0x52, 0x6B, 0x82)

SLIDE_W = Inches(13.333)
SLIDE_H = Inches(7.5)

prs = Presentation()
prs.slide_width = SLIDE_W
prs.slide_height = SLIDE_H

ASSETS = Path("ppt_assets")

# ── Helpers ──

def set_slide_bg(slide, color=NAVY):
    bg = slide.background
    fill = bg.fill
    fill.solid()
    fill.fore_color.rgb = color

def add_rect(slide, left, top, width, height, fill_color, border_color=None, border_width=Pt(0)):
    shape = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left, top, width, height)
    shape.fill.solid()
    shape.fill.fore_color.rgb = fill_color
    if border_color:
        shape.line.color.rgb = border_color
        shape.line.width = border_width
    else:
        shape.line.fill.background()
    shape.shadow.inherit = False
    return shape

def add_text(slide, left, top, width, height, text, font_size=16, color=WHITE, bold=False, alignment=PP_ALIGN.LEFT, font_name="Calibri"):
    txBox = slide.shapes.add_textbox(left, top, width, height)
    tf = txBox.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.text = text
    p.font.size = Pt(font_size)
    p.font.color.rgb = color
    p.font.bold = bold
    p.font.name = font_name
    p.alignment = alignment
    return txBox

def add_para(text_frame, text, font_size=14, color=WHITE, bold=False, alignment=PP_ALIGN.LEFT, space_before=Pt(0), space_after=Pt(4), font_name="Calibri"):
    p = text_frame.add_paragraph()
    p.text = text
    p.font.size = Pt(font_size)
    p.font.color.rgb = color
    p.font.bold = bold
    p.font.name = font_name
    p.alignment = alignment
    p.space_before = space_before
    p.space_after = space_after
    return p

def add_eyebrow(slide, left, top, text):
    return add_text(slide, left, top, Inches(6), Inches(0.4), text, font_size=11, color=TEAL, bold=True, font_name="Calibri")

def add_title(slide, left, top, text, size=34):
    return add_text(slide, left, top, Inches(11), Inches(0.9), text, font_size=size, color=WHITE, bold=True, font_name="Calibri")

def add_bullet_list(slide, left, top, width, items, font_size=17, color=GRAY_LIGHT):
    txBox = slide.shapes.add_textbox(left, top, width, Inches(len(items) * 0.45))
    tf = txBox.text_frame
    tf.word_wrap = True
    for i, item in enumerate(items):
        if i == 0:
            p = tf.paragraphs[0]
        else:
            p = tf.add_paragraph()
        p.text = f"●  {item}"
        p.font.size = Pt(font_size)
        p.font.color.rgb = color
        p.font.name = "Calibri"
        p.space_before = Pt(6)
        p.space_after = Pt(6)
    return txBox

def add_card(slide, left, top, width, height, fill=NAVY_MID, border=TEAL):
    return add_rect(slide, left, top, width, height, fill, border_color=border, border_width=Pt(1))

def add_kpi_card(slide, left, top, label, value, val_color=TEAL):
    w, h = Inches(2.1), Inches(1.5)
    add_card(slide, left, top, w, h, border=RGBColor(0x0F, 0xA8, 0x9A))
    add_text(slide, left, top + Inches(0.2), w, Inches(0.3), label, font_size=10, color=GRAY, bold=True, alignment=PP_ALIGN.CENTER)
    add_text(slide, left, top + Inches(0.55), w, Inches(0.7), value, font_size=36, color=val_color, bold=True, alignment=PP_ALIGN.CENTER, font_name="Calibri")

def add_flow_step(slide, left, top, num, title, desc):
    w, h = Inches(2.5), Inches(2.7)
    add_card(slide, left, top, w, h)
    # Number circle
    circle = slide.shapes.add_shape(MSO_SHAPE.OVAL, left + Inches(0.85), top + Inches(0.25), Inches(0.6), Inches(0.6))
    circle.fill.solid()
    circle.fill.fore_color.rgb = TEAL
    circle.line.fill.background()
    circle.shadow.inherit = False
    tf = circle.text_frame
    tf.paragraphs[0].text = num
    tf.paragraphs[0].font.size = Pt(16)
    tf.paragraphs[0].font.color.rgb = NAVY
    tf.paragraphs[0].font.bold = True
    tf.paragraphs[0].alignment = PP_ALIGN.CENTER
    tf.word_wrap = False
    # Title
    add_text(slide, left + Inches(0.15), top + Inches(1.05), Inches(2.2), Inches(0.5), title, font_size=16, color=WHITE, bold=True, alignment=PP_ALIGN.CENTER)
    # Description
    add_text(slide, left + Inches(0.15), top + Inches(1.55), Inches(2.2), Inches(0.8), desc, font_size=12, color=GRAY, alignment=PP_ALIGN.CENTER)

def add_arrow(slide, left, top):
    add_text(slide, left, top, Inches(0.5), Inches(0.5), "→", font_size=28, color=TEAL, bold=True, alignment=PP_ALIGN.CENTER)

def add_image_safe(slide, path, left, top, width=None, height=None):
    p = Path(path)
    if p.exists():
        kwargs = {"left": left, "top": top}
        if width: kwargs["width"] = width
        if height: kwargs["height"] = height
        slide.shapes.add_picture(str(p), **kwargs)
        return True
    return False


# ═══════════════════════════════════════════════════════════════
# SLIDE 1 — TITLE
# ═══════════════════════════════════════════════════════════════
slide = prs.slides.add_slide(prs.slide_layouts[6])  # blank
set_slide_bg(slide, NAVY)

# Hero bg image
add_image_safe(slide, ASSETS / "hero_banner.jpg", Inches(0), Inches(0), width=SLIDE_W, height=SLIDE_H)
# Dark overlay
overlay = add_rect(slide, Inches(0), Inches(0), SLIDE_W, SLIDE_H, NAVY)
overlay.fill.solid()
overlay.fill.fore_color.rgb = NAVY
# Apply transparency via XML
try:
    from pptx.oxml.ns import qn
    from lxml import etree
    spPr = overlay._element.spPr
    solidFill_elem = spPr.find(qn('a:solidFill'))
    if solidFill_elem is not None:
        srgb = solidFill_elem.find(qn('a:srgbClr'))
        if srgb is not None:
            alpha = etree.SubElement(srgb, qn('a:alpha'))
            alpha.set('val', '72000')
except Exception:
    pass  # Transparency is optional

# SIH badge
add_text(slide, Inches(0), Inches(1.4), SLIDE_W, Inches(0.4), "SMART INDIA HACKATHON 2026", font_size=13, color=TEAL, bold=True, alignment=PP_ALIGN.CENTER)

# Title
add_text(slide, Inches(0), Inches(2.0), SLIDE_W, Inches(1.2), "BhoomiSetu", font_size=64, color=WHITE, bold=True, alignment=PP_ALIGN.CENTER, font_name="Calibri")

# Subtitle
add_text(slide, Inches(0), Inches(3.2), SLIDE_W, Inches(0.6), "AI-Powered Land Acquisition Early Warning System", font_size=22, color=GRAY_LIGHT, alignment=PP_ALIGN.CENTER)

# Badges
badge_y = Inches(4.2)
badges = ["🧠  Artificial Intelligence", "🗺️  GIS Mapping", "📊  Decision Intelligence"]
badge_w = Inches(2.8)
start_x = Inches(13.333/2) - Inches(4.5)
for i, b in enumerate(badges):
    bx = start_x + Inches(i * 3.1)
    card = add_card(slide, bx, badge_y, badge_w, Inches(0.5))
    add_text(slide, bx, badge_y + Inches(0.05), badge_w, Inches(0.4), b, font_size=12, color=TEAL, bold=True, alignment=PP_ALIGN.CENTER)

# Team
add_text(slide, Inches(0), Inches(5.3), SLIDE_W, Inches(0.4), "Team BhoomiSetu", font_size=14, color=GRAY_DARK, alignment=PP_ALIGN.CENTER)


# ═══════════════════════════════════════════════════════════════
# SLIDE 2 — PROBLEM
# ═══════════════════════════════════════════════════════════════
slide = prs.slides.add_slide(prs.slide_layouts[6])
set_slide_bg(slide, NAVY)

add_eyebrow(slide, Inches(0.9), Inches(0.6), "THE CHALLENGE")
add_title(slide, Inches(0.9), Inches(1.0), "Land Acquisition Delays Stall\nIndia's Infrastructure Growth", size=34)

add_bullet_list(slide, Inches(0.9), Inches(2.5), Inches(10), [
    "Land acquisition delays slow highways, railways & industrial corridors",
    "Compensation disputes & legal cases create uncertainty",
    "Officials identify risks after delays have already occurred",
    "No early-warning mechanism for proactive intervention",
], font_size=17)

# Problem flow
flow_y = Inches(5.0)
flow_items = [
    ("🏗️", "Land\nAcquisition"),
    ("⚖️", "Disputes &\nLitigation"),
    ("⏳", "Project\nDelay"),
    ("💸", "Cost\nOverrun"),
]
flow_card = add_card(slide, Inches(1.5), flow_y, Inches(10.3), Inches(1.7), border=RGBColor(0xEF, 0x44, 0x44))
for i, (icon, label) in enumerate(flow_items):
    fx = Inches(2.0) + Inches(i * 2.7)
    add_text(slide, fx, flow_y + Inches(0.15), Inches(1.5), Inches(0.5), icon, font_size=28, alignment=PP_ALIGN.CENTER)
    add_text(slide, fx, flow_y + Inches(0.7), Inches(1.5), Inches(0.7), label, font_size=13, color=GRAY_LIGHT, bold=True, alignment=PP_ALIGN.CENTER)
    if i < 3:
        add_text(slide, fx + Inches(1.5), flow_y + Inches(0.5), Inches(0.6), Inches(0.5), "→", font_size=24, color=RED, bold=True, alignment=PP_ALIGN.CENTER)


# ═══════════════════════════════════════════════════════════════
# SLIDE 3 — OUR SOLUTION
# ═══════════════════════════════════════════════════════════════
slide = prs.slides.add_slide(prs.slide_layouts[6])
set_slide_bg(slide, NAVY)

add_eyebrow(slide, Inches(0.9), Inches(0.6), "OUR SOLUTION")
add_title(slide, Inches(0.9), Inches(1.0), "Predict Risk. Explain Causes. Act Early.", size=34)

# Solution flow
sf_y = Inches(2.4)
sol_items = [
    ("📋", "Project Data"),
    ("🧠", "AI Prediction"),
    ("🔍", "Risk Explanation"),
    ("🚀", "Early Action"),
]
sol_card = add_card(slide, Inches(1.5), sf_y, Inches(10.3), Inches(1.5))
for i, (icon, label) in enumerate(sol_items):
    sx = Inches(2.0) + Inches(i * 2.7)
    add_text(slide, sx, sf_y + Inches(0.15), Inches(1.5), Inches(0.5), icon, font_size=26, alignment=PP_ALIGN.CENTER)
    add_text(slide, sx, sf_y + Inches(0.7), Inches(1.5), Inches(0.5), label, font_size=14, color=TEAL, bold=True, alignment=PP_ALIGN.CENTER)
    if i < 3:
        add_text(slide, sx + Inches(1.5), sf_y + Inches(0.4), Inches(0.6), Inches(0.5), "→", font_size=24, color=TEAL, bold=True, alignment=PP_ALIGN.CENTER)

add_bullet_list(slide, Inches(0.9), Inches(4.4), Inches(10), [
    "Predict delay risk before it becomes critical",
    "Identify the major factors driving risk",
    "Monitor all projects from one unified dashboard",
    "Support proactive administrative decision-making",
], font_size=17)


# ═══════════════════════════════════════════════════════════════
# SLIDE 4 — HOW IT WORKS
# ═══════════════════════════════════════════════════════════════
slide = prs.slides.add_slide(prs.slide_layouts[6])
set_slide_bg(slide, NAVY)

add_eyebrow(slide, Inches(0.9), Inches(0.6), "SYSTEM WORKFLOW")
add_title(slide, Inches(0.9), Inches(1.0), "How BhoomiSetu Works", size=34)

steps = [
    ("01", "Data Collection", "Project • Land • Legal\nCompensation • Stakeholder"),
    ("02", "AI Prediction", "ML model predicts\ndelay probability"),
    ("03", "Explainability", "SHAP identifies top\nrisk-driving factors"),
    ("04", "Decision Support", "Alerts • Dashboard\nRecommended Actions"),
]
for i, (num, title, desc) in enumerate(steps):
    sx = Inches(0.7) + Inches(i * 3.2)
    add_flow_step(slide, sx, Inches(2.3), num, title, desc)
    if i < 3:
        add_arrow(slide, sx + Inches(2.5), Inches(3.5))

add_text(slide, Inches(0), Inches(5.5), SLIDE_W, Inches(0.4),
         "End-to-end pipeline: from raw project data to actionable risk intelligence",
         font_size=13, color=GRAY_DARK, alignment=PP_ALIGN.CENTER)


# ═══════════════════════════════════════════════════════════════
# SLIDE 5 — AI ENGINE
# ═══════════════════════════════════════════════════════════════
slide = prs.slides.add_slide(prs.slide_layouts[6])
set_slide_bg(slide, NAVY)

add_eyebrow(slide, Inches(0.9), Inches(0.6), "AI ENGINE")
add_title(slide, Inches(0.9), Inches(1.0), "AI-Powered Risk Prediction", size=34)

# Left column - bullets
add_bullet_list(slide, Inches(0.9), Inches(2.2), Inches(5.5), [
    "XGBoost Machine Learning classifier",
    "500 decision trees for robust prediction",
    "58 engineered features across 5 domains",
    "Predicts >90 day delay risk",
], font_size=16)

# Metrics card
mc = add_card(slide, Inches(0.9), Inches(4.6), Inches(5.5), Inches(1.8))
add_text(slide, Inches(1.1), Inches(4.75), Inches(5), Inches(0.3),
         "REPORTED MODEL EVALUATION METRICS", font_size=10, color=GRAY_DARK, bold=True)
add_text(slide, Inches(1.3), Inches(5.15), Inches(2), Inches(0.7), "91.4%", font_size=40, color=TEAL, bold=True, font_name="Calibri")
add_text(slide, Inches(1.3), Inches(5.8), Inches(2), Inches(0.3), "Accuracy", font_size=12, color=GRAY)
add_text(slide, Inches(3.8), Inches(5.15), Inches(2), Inches(0.7), "0.974", font_size=40, color=GREEN, bold=True, font_name="Calibri")
add_text(slide, Inches(3.8), Inches(5.8), Inches(2), Inches(0.3), "ROC-AUC", font_size=12, color=GRAY)

# Right column - risk tiers
risk_tiers = [
    ("🟢  LOW", "< 40% probability", GREEN),
    ("🟡  MODERATE", "40 – 59%", YELLOW),
    ("🟠  HIGH", "60 – 79%", ORANGE),
    ("🔴  CRITICAL", "≥ 80%", RED),
]
add_text(slide, Inches(7.2), Inches(2.0), Inches(5), Inches(0.3), "RISK LEVELS", font_size=11, color=GRAY_DARK, bold=True, alignment=PP_ALIGN.CENTER)

for i, (label, threshold, color) in enumerate(risk_tiers):
    ry = Inches(2.6) + Inches(i * 0.95)
    card = add_card(slide, Inches(7.2), ry, Inches(5), Inches(0.75), border=color)
    add_text(slide, Inches(7.5), ry + Inches(0.15), Inches(2.5), Inches(0.45), label, font_size=16, color=color, bold=True)
    add_text(slide, Inches(10.0), ry + Inches(0.18), Inches(2), Inches(0.4), threshold, font_size=13, color=GRAY, alignment=PP_ALIGN.RIGHT)


# ═══════════════════════════════════════════════════════════════
# SLIDE 6 — EXPLAINABLE AI
# ═══════════════════════════════════════════════════════════════
slide = prs.slides.add_slide(prs.slide_layouts[6])
set_slide_bg(slide, NAVY)

add_eyebrow(slide, Inches(0.9), Inches(0.6), "EXPLAINABLE AI")
add_title(slide, Inches(0.9), Inches(1.0), "Why Is the Project at Risk?", size=34)

add_text(slide, Inches(0.9), Inches(2.0), Inches(5.5), Inches(0.6),
         "SHAP analysis reveals the top factors contributing to delay risk —\nnot just a score, but an explanation.",
         font_size=15, color=GRAY)

# SHAP bars card
shap_card = add_card(slide, Inches(0.9), Inches(2.9), Inches(6), Inches(3.7))
add_text(slide, Inches(1.1), Inches(3.05), Inches(4), Inches(0.3),
         "ILLUSTRATIVE SAMPLE", font_size=9, color=YELLOW, bold=True)

shap_data = [
    ("Compensation Pending", 0.92, "+0.184", ORANGE, RED),
    ("Legal Disputes", 0.74, "+0.142", YELLOW, ORANGE),
    ("Stage Stagnation", 0.62, "+0.118", YELLOW, ORANGE),
    ("Stakeholder Friction", 0.48, "+0.091", YELLOW, YELLOW),
    ("Acquisition Progress", 0.40, "−0.076", GREEN, GREEN),
]

for i, (label, pct, score, bar_color, score_color) in enumerate(shap_data):
    by = Inches(3.45) + Inches(i * 0.6)
    add_text(slide, Inches(1.2), by, Inches(3), Inches(0.3), label, font_size=13, color=GRAY_LIGHT)
    add_text(slide, Inches(5.4), by, Inches(1.2), Inches(0.3), score, font_size=12, color=score_color, bold=True, alignment=PP_ALIGN.RIGHT)
    # Bar track
    add_rect(slide, Inches(1.2), by + Inches(0.3), Inches(5.4), Inches(0.16), NAVY, border_color=None)
    # Bar fill
    add_rect(slide, Inches(1.2), by + Inches(0.3), Inches(5.4 * pct), Inches(0.16), bar_color, border_color=None)

# Right column - Gauge visual (text-based since shapes are limited)
gauge_card = add_card(slide, Inches(7.5), Inches(2.5), Inches(4.6), Inches(4.3))
add_text(slide, Inches(7.5), Inches(3.0), Inches(4.6), Inches(1.0), "72%", font_size=72, color=WHITE, bold=True, alignment=PP_ALIGN.CENTER, font_name="Calibri")
add_text(slide, Inches(7.5), Inches(4.2), Inches(4.6), Inches(0.5), "HIGH RISK", font_size=22, color=ORANGE, bold=True, alignment=PP_ALIGN.CENTER)
add_text(slide, Inches(7.5), Inches(4.8), Inches(4.6), Inches(0.3), "DEMO SAMPLE", font_size=10, color=GRAY_DARK, alignment=PP_ALIGN.CENTER)

# Mini risk bar
risk_colors_bar = [(GREEN, 0.3), (YELLOW, 0.2), (ORANGE, 0.2), (RED, 0.3)]
bar_start = Inches(8.2)
bar_y = Inches(5.4)
bar_total = Inches(3.2)
for color, frac in risk_colors_bar:
    w = Inches(3.2 * frac)
    add_rect(slide, bar_start, bar_y, w, Inches(0.18), color)
    bar_start = Emu(bar_start + w)

add_text(slide, Inches(7.5), Inches(5.8), Inches(4.6), Inches(0.4),
         "Risk score with factor attribution\nfor transparent decision-making",
         font_size=11, color=GRAY_DARK, alignment=PP_ALIGN.CENTER)


# ═══════════════════════════════════════════════════════════════
# SLIDE 7 — DASHBOARD
# ═══════════════════════════════════════════════════════════════
slide = prs.slides.add_slide(prs.slide_layouts[6])
set_slide_bg(slide, NAVY)

add_eyebrow(slide, Inches(0.9), Inches(0.5), "COMMAND CENTER")
add_title(slide, Inches(0.9), Inches(0.85), "One Dashboard. Complete Visibility.", size=32)

add_text(slide, Inches(0.9), Inches(1.65), Inches(6), Inches(0.3),
         "ILLUSTRATIVE DEMO DATA — NOT PRODUCTION STATISTICS", font_size=9, color=YELLOW, bold=True)

# KPI cards row
kpis = [
    ("TOTAL PROJECTS", "128", TEAL),
    ("LOW RISK", "66", GREEN),
    ("MODERATE", "31", YELLOW),
    ("HIGH RISK", "24", ORANGE),
    ("CRITICAL", "7", RED),
]
for i, (label, val, color) in enumerate(kpis):
    kx = Inches(0.9) + Inches(i * 2.35)
    add_kpi_card(slide, kx, Inches(2.1), label, val, color)

# Dashboard image
img_added = add_image_safe(slide, ASSETS / "dashboard_mockup.jpg",
                           Inches(0.9), Inches(3.9), width=Inches(11.5), height=Inches(3.3))
if not img_added:
    dash_card = add_card(slide, Inches(0.9), Inches(3.9), Inches(11.5), Inches(3.3))
    add_text(slide, Inches(0.9), Inches(5.0), Inches(11.5), Inches(0.6),
             "Dashboard Preview — Risk Heatmap • Trend Charts • Alert Feed",
             font_size=16, color=GRAY_DARK, alignment=PP_ALIGN.CENTER)


# ═══════════════════════════════════════════════════════════════
# SLIDE 8 — GIS MAP
# ═══════════════════════════════════════════════════════════════
slide = prs.slides.add_slide(prs.slide_layouts[6])
set_slide_bg(slide, NAVY)

add_eyebrow(slide, Inches(0.9), Inches(0.6), "SPATIAL INTELLIGENCE")
add_title(slide, Inches(0.9), Inches(1.0), "See Risk on the Map", size=34)

# Left bullets
add_bullet_list(slide, Inches(0.9), Inches(2.3), Inches(4.5), [
    "Project locations across India",
    "Infrastructure corridor mapping",
    "District-level risk concentration",
    "Spatial conflict detection",
], font_size=16)

# Legend
legend_items = [("Low", GREEN), ("Moderate", YELLOW), ("High", ORANGE), ("Critical", RED)]
for i, (label, color) in enumerate(legend_items):
    lx = Inches(1.0) + Inches(i * 1.3)
    ly = Inches(4.6)
    dot = slide.shapes.add_shape(MSO_SHAPE.OVAL, lx, ly + Inches(0.05), Inches(0.15), Inches(0.15))
    dot.fill.solid()
    dot.fill.fore_color.rgb = color
    dot.line.fill.background()
    dot.shadow.inherit = False
    add_text(slide, lx + Inches(0.2), ly, Inches(1), Inches(0.3), label, font_size=12, color=GRAY)

add_text(slide, Inches(0.9), Inches(5.2), Inches(3), Inches(0.3),
         "DEMO VISUALIZATION", font_size=9, color=YELLOW, bold=True)

# GIS image
img_added = add_image_safe(slide, ASSETS / "gis_map.jpg",
                           Inches(6.2), Inches(1.5), width=Inches(6.5), height=Inches(5.3))
if not img_added:
    gis_card = add_card(slide, Inches(6.2), Inches(1.5), Inches(6.5), Inches(5.3))
    add_text(slide, Inches(6.2), Inches(3.5), Inches(6.5), Inches(0.6),
             "India GIS Map — Corridor Visualization\nwith Risk Markers",
             font_size=16, color=GRAY_DARK, alignment=PP_ALIGN.CENTER)


# ═══════════════════════════════════════════════════════════════
# SLIDE 9 — KEY FEATURES
# ═══════════════════════════════════════════════════════════════
slide = prs.slides.add_slide(prs.slide_layouts[6])
set_slide_bg(slide, NAVY)

add_eyebrow(slide, Inches(0.9), Inches(0.6), "PLATFORM CAPABILITIES")
add_title(slide, Inches(0.9), Inches(1.0), "Key Features", size=34)

features = [
    ("🧠", "AI Early Warning System"),
    ("🔍", "Explainable AI (SHAP)"),
    ("🗺️", "GIS Corridor Mapping"),
    ("⚖️", "Legal & Statutory Tracking"),
    ("💰", "Compensation Fund Tracking"),
    ("🚨", "Automated Risk Alerts"),
    ("🔄", "What-If Simulation"),
    ("📊", "State Benchmarking"),
]
for i, (icon, label) in enumerate(features):
    col = i % 2
    row = i // 2
    fx = Inches(1.0) + Inches(col * 5.8)
    fy = Inches(2.2) + Inches(row * 1.15)
    feat_card = add_card(slide, fx, fy, Inches(5.2), Inches(0.9))
    add_text(slide, fx + Inches(0.2), fy + Inches(0.15), Inches(0.6), Inches(0.6), icon, font_size=22, alignment=PP_ALIGN.CENTER)
    add_text(slide, fx + Inches(0.9), fy + Inches(0.2), Inches(4), Inches(0.5), label, font_size=17, color=WHITE, bold=True)


# ═══════════════════════════════════════════════════════════════
# SLIDE 10 — TECH STACK
# ═══════════════════════════════════════════════════════════════
slide = prs.slides.add_slide(prs.slide_layouts[6])
set_slide_bg(slide, NAVY)

add_eyebrow(slide, Inches(0.9), Inches(0.6), "ENGINEERING")
add_title(slide, Inches(0.9), Inches(1.0), "Technology Stack", size=34)

tech_cols = [
    ("🎨  FRONTEND", ["React 19", "TypeScript", "Vite", "TailwindCSS", "Radix UI", "Recharts"]),
    ("⚙️  BACKEND", ["FastAPI", "Python", "SQLAlchemy", "PostgreSQL", "Redis", "Alembic"]),
    ("🧠  AI / ML", ["XGBoost", "Scikit-learn", "SHAP", "Pandas", "NumPy"]),
    ("🚀  DEPLOY", ["Docker", "Render", "Vercel", "PostGIS"]),
]
for i, (heading, tags) in enumerate(tech_cols):
    tx = Inches(0.7) + Inches(i * 3.15)
    tc = add_card(slide, tx, Inches(2.2), Inches(2.9), Inches(4.5))
    add_text(slide, tx + Inches(0.15), Inches(2.4), Inches(2.6), Inches(0.4), heading, font_size=12, color=TEAL, bold=True)
    for j, tag in enumerate(tags):
        tag_y = Inches(3.0) + Inches(j * 0.55)
        tag_card = add_card(slide, tx + Inches(0.15), tag_y, Inches(2.55), Inches(0.42))
        add_text(slide, tx + Inches(0.15), tag_y + Inches(0.05), Inches(2.55), Inches(0.35), tag, font_size=13, color=GRAY_LIGHT, alignment=PP_ALIGN.CENTER)


# ═══════════════════════════════════════════════════════════════
# SLIDE 11 — IMPACT
# ═══════════════════════════════════════════════════════════════
slide = prs.slides.add_slide(prs.slide_layouts[6])
set_slide_bg(slide, NAVY)

add_eyebrow(slide, Inches(0.9), Inches(0.6), "VALUE PROPOSITION")
add_title(slide, Inches(0.9), Inches(1.0), "Expected Impact", size=34)

# Before card
before_card = add_card(slide, Inches(0.9), Inches(2.2), Inches(5.3), Inches(4.0), border=RED)
add_text(slide, Inches(1.2), Inches(2.45), Inches(4.5), Inches(0.4), "❌  Before BhoomiSetu", font_size=17, color=RED, bold=True)
before_items = [
    "Reactive monitoring only",
    "Delayed risk identification",
    "Manual investigation",
    "No explainability",
]
for i, item in enumerate(before_items):
    iy = Inches(3.1) + Inches(i * 0.6)
    dot = slide.shapes.add_shape(MSO_SHAPE.OVAL, Inches(1.4), iy + Inches(0.08), Inches(0.12), Inches(0.12))
    dot.fill.solid(); dot.fill.fore_color.rgb = RED; dot.line.fill.background(); dot.shadow.inherit = False
    add_text(slide, Inches(1.7), iy, Inches(4), Inches(0.4), item, font_size=15, color=GRAY_LIGHT)

# After card
after_card = add_card(slide, Inches(7.1), Inches(2.2), Inches(5.3), Inches(4.0), border=GREEN)
add_text(slide, Inches(7.4), Inches(2.45), Inches(4.5), Inches(0.4), "✅  With BhoomiSetu", font_size=17, color=GREEN, bold=True)
after_items = [
    "Early risk visibility",
    "Explainable risk factors",
    "Proactive intervention",
    "Data-driven monitoring",
]
for i, item in enumerate(after_items):
    iy = Inches(3.1) + Inches(i * 0.6)
    dot = slide.shapes.add_shape(MSO_SHAPE.OVAL, Inches(7.6), iy + Inches(0.08), Inches(0.12), Inches(0.12))
    dot.fill.solid(); dot.fill.fore_color.rgb = GREEN; dot.line.fill.background(); dot.shadow.inherit = False
    add_text(slide, Inches(7.9), iy, Inches(4), Inches(0.4), item, font_size=15, color=GRAY_LIGHT)

add_text(slide, Inches(0), Inches(6.5), SLIDE_W, Inches(0.3),
         "Illustrative / Projected — Not Validated Results", font_size=11, color=GRAY_DARK, alignment=PP_ALIGN.CENTER)


# ═══════════════════════════════════════════════════════════════
# SLIDE 12 — FUTURE SCOPE
# ═══════════════════════════════════════════════════════════════
slide = prs.slides.add_slide(prs.slide_layouts[6])
set_slide_bg(slide, NAVY)

add_eyebrow(slide, Inches(0.9), Inches(0.6), "ROADMAP")
add_title(slide, Inches(0.9), Inches(1.0), "Future Scope", size=34)

future_items = [
    ("🏛️", "Govt. Integration", "Integration with government\nland records & revenue databases"),
    ("📈", "More Data", "Incorporate historical project\ndata across all states"),
    ("🗺️", "Better Analytics", "Improved district & state-level\ncomparative analytics"),
    ("🚀", "Nationwide Deploy", "Deployment across\ninfrastructure departments"),
]
for i, (icon, title, desc) in enumerate(future_items):
    fx = Inches(0.7) + Inches(i * 3.15)
    fc = add_card(slide, fx, Inches(2.5), Inches(2.9), Inches(3.5))
    add_text(slide, fx, Inches(2.8), Inches(2.9), Inches(0.6), icon, font_size=36, alignment=PP_ALIGN.CENTER)
    add_text(slide, fx, Inches(3.5), Inches(2.9), Inches(0.5), title, font_size=17, color=WHITE, bold=True, alignment=PP_ALIGN.CENTER)
    add_text(slide, fx + Inches(0.15), Inches(4.1), Inches(2.6), Inches(1), desc, font_size=13, color=GRAY, alignment=PP_ALIGN.CENTER)


# ═══════════════════════════════════════════════════════════════
# SLIDE 13 — CLOSING
# ═══════════════════════════════════════════════════════════════
slide = prs.slides.add_slide(prs.slide_layouts[6])
set_slide_bg(slide, NAVY)

add_text(slide, Inches(0), Inches(1.5), SLIDE_W, Inches(1.2), "BhoomiSetu", font_size=64, color=WHITE, bold=True, alignment=PP_ALIGN.CENTER, font_name="Calibri")

add_text(slide, Inches(0), Inches(2.9), SLIDE_W, Inches(0.7),
         '"From Delayed Response to Early Action."',
         font_size=24, color=TEAL, alignment=PP_ALIGN.CENTER)

# Closing pills
pills = ["🧠  AI", "🗺️  GIS", "🔍  Explainability", "📊  Decision Intelligence"]
pill_w = Inches(2.6)
start_x = Inches(13.333/2) - Inches(5.5)
for i, pill in enumerate(pills):
    px = start_x + Inches(i * 2.8)
    pc = add_card(slide, px, Inches(4.0), pill_w, Inches(0.55))
    add_text(slide, px, Inches(4.05), pill_w, Inches(0.45), pill, font_size=14, color=GRAY_LIGHT, alignment=PP_ALIGN.CENTER)

add_text(slide, Inches(0), Inches(5.2), SLIDE_W, Inches(0.8), "Thank You", font_size=40, color=GRAY, alignment=PP_ALIGN.CENTER, font_name="Calibri")

add_text(slide, Inches(0), Inches(6.2), SLIDE_W, Inches(0.4),
         "Smart India Hackathon 2026  •  Team BhoomiSetu",
         font_size=14, color=GRAY_DARK, alignment=PP_ALIGN.CENTER)


# ═══════════════════════════════════════════════════════════════
# SAVE
# ═══════════════════════════════════════════════════════════════
output_path = Path("BhoomiSetu_SIH2026_Presentation.pptx")
prs.save(str(output_path))
print(f"\n[OK] Presentation saved to: {output_path.resolve()}")
print(f"   Slides: {len(prs.slides)}")
print(f"   Size: {output_path.stat().st_size / 1024:.0f} KB")
