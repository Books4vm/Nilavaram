from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_CELL_VERTICAL_ALIGNMENT
from docx.enum.section import WD_SECTION
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.enum.style import WD_STYLE_TYPE

OUT = "SVT_Nexus_2026_2029_Financial_Estimate_Memorandum_V2.docx"
NAVY="16324F"; TEAL="1B7F79"; PALE="EAF4F3"; GOLD="D9A441"; GRAY="667085"; WHITE="FFFFFF"; ORANGE="FFF4E5"

def shade(cell, fill):
    tcPr=cell._tc.get_or_add_tcPr(); shd=OxmlElement('w:shd'); shd.set(qn('w:fill'),fill); tcPr.append(shd)
def margins(cell, top=100, start=100, bottom=100, end=100):
    tc=cell._tc.get_or_add_tcPr(); el=tc.first_child_found_in('w:tcMar')
    if el is None: el=OxmlElement('w:tcMar'); tc.append(el)
    for tag,val in [('top',top),('start',start),('bottom',bottom),('end',end)]:
        x=OxmlElement('w:'+tag); x.set(qn('w:w'),str(val)); x.set(qn('w:type'),'dxa'); el.append(x)
def set_repeat(row):
    trPr=row._tr.get_or_add_trPr(); h=OxmlElement('w:tblHeader'); h.set(qn('w:val'),'true'); trPr.append(h)
def table(doc, headers, rows, widths=None):
    t=doc.add_table(rows=1, cols=len(headers)); t.alignment=WD_TABLE_ALIGNMENT.CENTER; t.style='Table Grid'
    for i,h in enumerate(headers):
        c=t.rows[0].cells[i]; c.text=str(h); shade(c,TEAL); margins(c); c.vertical_alignment=WD_CELL_VERTICAL_ALIGNMENT.CENTER
        for r in c.paragraphs[0].runs: r.font.bold=True; r.font.color.rgb=RGBColor(255,255,255); r.font.size=Pt(8.5)
    set_repeat(t.rows[0])
    for ri,row in enumerate(rows):
        cells=t.add_row().cells
        for i,v in enumerate(row):
            cells[i].text=str(v); margins(cells[i]); cells[i].vertical_alignment=WD_CELL_VERTICAL_ALIGNMENT.CENTER
            if ri%2: shade(cells[i],'F4F7FA')
            for p in cells[i].paragraphs:
                p.paragraph_format.space_after=Pt(0)
                for r in p.runs: r.font.size=Pt(8.5); r.font.color.rgb=RGBColor(35,45,55)
    if widths:
        for row in t.rows:
            for i,w in enumerate(widths): row.cells[i].width=Inches(w)
    doc.add_paragraph().paragraph_format.space_after=Pt(2)
    return t
def bullet(doc,text):
    p=doc.add_paragraph(style='List Bullet'); p.add_run(text); return p
def callout(doc,text,fill=ORANGE):
    t=doc.add_table(rows=1,cols=1); t.alignment=WD_TABLE_ALIGNMENT.CENTER; c=t.cell(0,0); shade(c,fill); margins(c,160,180,160,180)
    p=c.paragraphs[0]; p.paragraph_format.space_after=Pt(0); r=p.add_run(text); r.bold=True; r.font.color.rgb=RGBColor.from_string(NAVY); r.font.size=Pt(9)
    doc.add_paragraph().paragraph_format.space_after=Pt(1)

d=Document(); sec=d.sections[0]; sec.top_margin=Inches(.7); sec.bottom_margin=Inches(.65); sec.left_margin=Inches(.72); sec.right_margin=Inches(.72)
styles=d.styles; normal=styles['Normal']; normal.font.name='Aptos'; normal.font.size=Pt(9.5); normal.font.color.rgb=RGBColor(35,45,55); normal.paragraph_format.space_after=Pt(5); normal.paragraph_format.line_spacing=1.08
for name,size,color in [('Title',28,NAVY),('Heading 1',17,NAVY),('Heading 2',12,TEAL),('Heading 3',10,NAVY)]:
    s=styles[name]; s.font.name='Aptos Display' if name!='Normal' else 'Aptos'; s.font.size=Pt(size); s.font.color.rgb=RGBColor.from_string(color); s.font.bold=True
    s.paragraph_format.space_before=Pt(10); s.paragraph_format.space_after=Pt(5); s.paragraph_format.keep_with_next=True
if 'Caption Small' not in styles:
    st=styles.add_style('Caption Small',WD_STYLE_TYPE.PARAGRAPH); st.font.name='Aptos'; st.font.size=Pt(8); st.font.italic=True; st.font.color.rgb=RGBColor.from_string(GRAY)

# Header/footer
for section in d.sections:
    hp=section.header.paragraphs[0]; hp.text="SVT NEXUS  |  FINANCIAL ESTIMATE MEMORANDUM V2"; hp.alignment=WD_ALIGN_PARAGRAPH.RIGHT
    for r in hp.runs: r.font.name='Aptos'; r.font.size=Pt(7.5); r.font.bold=True; r.font.color.rgb=RGBColor.from_string(TEAL)
    fp=section.footer.paragraphs[0]; fp.alignment=WD_ALIGN_PARAGRAPH.CENTER
    run=fp.add_run("DRAFT — MANAGEMENT AND SECURITIES COUNSEL REVIEW  |  21 AUGUST 2026  |  ")
    run.font.size=Pt(7); run.font.color.rgb=RGBColor.from_string(GRAY)
    fld=OxmlElement('w:fldSimple'); fld.set(qn('w:instr'),'PAGE'); fp._p.append(fld)

# Cover
p=d.add_paragraph(); p.alignment=WD_ALIGN_PARAGRAPH.CENTER; p.paragraph_format.space_before=Pt(90)
r=p.add_run("SVT NEXUS"); r.font.name='Aptos Display'; r.font.size=Pt(34); r.font.bold=True; r.font.color.rgb=RGBColor.from_string(NAVY)
p=d.add_paragraph(); p.alignment=WD_ALIGN_PARAGRAPH.CENTER
r=p.add_run("2026–2029 Financial Estimate\nand Offering Support Memorandum"); r.font.name='Aptos Display'; r.font.size=Pt(22); r.font.bold=True; r.font.color.rgb=RGBColor.from_string(TEAL)
p=d.add_paragraph(); p.alignment=WD_ALIGN_PARAGRAPH.CENTER; p.paragraph_format.space_before=Pt(16)
r=p.add_run("VERSION 2  •  21 AUGUST 2026"); r.font.size=Pt(11); r.font.bold=True; r.font.color.rgb=RGBColor.from_string(GRAY)
callout(d,"Convertible Note: $3,000,000 principal • 9% per annum • tranche-date accrual • quarterly cash interest • no conversion forecast through 2029",PALE)
p=d.add_paragraph(); p.alignment=WD_ALIGN_PARAGRAPH.CENTER; p.paragraph_format.space_before=Pt(80)
r=p.add_run("Confidential draft for management, accounting advisers, and securities counsel. Not for investor distribution until reviewed and approved."); r.font.size=Pt(8.5); r.font.italic=True; r.font.color.rgb=RGBColor.from_string(GRAY)
d.add_page_break()

d.add_heading('1. Executive Summary',level=1)
d.add_paragraph("Version 2 replaces the prior financing methodology and introduces an auditable operating framework for the December 2026 through December 2029 forecast. The revised model preserves the established offering schedule and management operating assumptions while separately adding analytical safeguards requested in the financial review.")
callout(d,"The Convertible Note remains debt throughout the forecast. Conversion begins after 2029 and is therefore a post-forecast-period matter subject to the definitive note terms.")
table(d,["Measure","2026","2027","2028","2029"],[
 ["Convertible Note proceeds","$150,000","$2,850,000","—","—"],
 ["Gross revenue","—","$1,392,000","$1,548,690","$1,618,381"],
 ["Net revenue after bad debt","—","$1,364,160","$1,517,716","$1,586,013"],
 ["Operating income","$(42,500)","$268,060","$306,448","$270,629"],
 ["Interest expense accrued","$(1,147)","$(167,042)","$(270,740)","$(270,000)"],
 ["Net income","$(43,647)","$53,677","$(7,579)","$(38,001)"],
 ["Ending cash","$106,353","$3,010,030","$3,002,451","$2,964,450"],
 ["Outstanding note principal","$150,000","$3,000,000","$3,000,000","$3,000,000"],
], [2.2,1.05,1.05,1.05,1.05])
d.add_paragraph("Amounts are rounded. The workbook remains the controlling calculation file; this memorandum summarizes its principal assumptions, mechanics, results, and disclosure considerations.",style='Caption Small')

d.add_heading('2. Convertible Note Architecture',level=1)
d.add_heading('2.1 Principal and funding schedule',level=2)
d.add_paragraph("The forecast assumes $3.0 million of Convertible Note principal raised in twelve tranches: $150,000 on December 1, 2026; $300,000 on January 1, 2027; $300,000 on February 1, 2027; and $250,000 on the first day of each month from March through November 2027. Funding dates are editable inputs and should be replaced with actual closing dates as subscriptions are funded.")
table(d,["Funding period","Amount","Cumulative principal"],[
 ["December 2026","$150,000","$150,000"],["January 2027","$300,000","$450,000"],["February 2027","$300,000","$750,000"],["March–November 2027 (9 × $250,000)","$2,250,000","$3,000,000"],["Total","$3,000,000","$3,000,000"]],[3.25,1.35,1.55])
d.add_heading('2.2 Accrual versus payment',level=2)
d.add_paragraph("Interest expense and cash interest are modeled separately. Each tranche begins accruing at 9% per annum on its funding date using an ACT/365 planning convention. Interest expense is recognized as the obligation accrues. Cash payments occur at calendar-quarter ends, producing an accrued-interest payable balance between payment dates.")
bullet(d,"No interest is charged before a tranche is funded.")
bullet(d,"At $3.0 million outstanding, the annualized coupon is $270,000 and a representative full quarter is approximately $67,500.")
bullet(d,"The ACT/365 convention produces modest calendar-day differences, including in leap years; the definitive note’s day-count convention controls once executed.")
bullet(d,"No principal amortization, repayment, or conversion occurs in the 2026–2029 forecast.")
d.add_heading('2.3 Accounting and legal status',level=2)
d.add_paragraph("The model treats the instrument as debt based on management’s clarification. Final accounting may require evaluation of issuance costs, original issue discount, beneficial conversion features, embedded derivatives, warrants, or other terms. Securities counsel and the accounting adviser should reconcile the executed instrument to the model before investor distribution.")

d.add_heading('3. Revenue Cases and Client Ramp',level=1)
d.add_paragraph("Version 2 removes the assumption that all twelve Base Case clients begin on the same date. It also separates the operating forecast from the aspirational management target.")
table(d,["Scenario","2027 clients","Ramp and pricing basis","2027 revenue","Target attainment"],[
 ["Downside","6","Six-month delay; retainer-only","$388,080","12.9%"],
 ["Base","12","3/3/2/2/2 additions from Jan–May; differentiated rates","$1,392,000","46.4%"],
 ["Management","18","Aspirational target case; incremental execution required","$3,000,000","100.0%"],
],[1.0,.8,3.3,1.15,1.05])
d.add_paragraph("The Management Case is not presented as current backlog or contracted revenue. It requires additional contracts, strategic revenue, higher-value engagements, or other supported commercial activity beyond the Base Case.")
d.add_heading('3.1 Base Case ramp',level=2)
table(d,["Month","New clients","Cumulative clients"],[
 ["January 2027","3","3"],["February 2027","3","6"],["March 2027","2","8"],["April 2027","2","10"],["May 2027","2","12"],["June–December 2027","—","12"],
],[2.2,1.4,1.6])
d.add_heading('3.2 Pricing, churn, and collectibility',level=2)
d.add_paragraph("For January through June 2027, activated clients are modeled at $10,000 per month. Beginning in July 2027, monthly rates are $11,000 for retainers, $12,000 for commission-category relationships, and $15,000 for pilot/revenue-share relationships. The model applies a 2% bad-debt reserve, 5% annual churn beginning in 2028, and 10% annual pricing/revenue growth in 2028 and 2029.")
table(d,["Category","Steady-state clients","Monthly rate","Direct cost rate"],[
 ["Retainer","6","$11,000","15%"],["Commission category","3","$12,000","20%"],["Pilot / revenue-share","3","$15,000","30%"],
],[2.4,1.2,1.3,1.3])

d.add_heading('4. Operating Model and Break-Even',level=1)
d.add_paragraph("The 2027 operating budget remains $820,000 before rounding mechanics, including $120,000 of CEO compensation, $300,000 of other personnel and contractors, and the previously established technology, marketing, professional-fee, insurance, travel, office, and consultant budgets. Monthly budgets are rounded for presentation. Recurring operating expenses grow 10% in each of 2028 and 2029.")
table(d,["Break-even measure","Base Case result"],[
 ["Steady-state monthly gross revenue (12-client mix)","$147,000"],
 ["Bad-debt reserve","2.0%"],["Category-weighted direct project costs","20.7% of gross revenue"],
 ["Approximate contribution margin","77.3%"],["Monthly fixed operating expenses","approximately $68,300"],
 ["Indicative monthly revenue break-even","approximately $88,400"],["Equivalent client count","approximately 7.2 clients"],
],[4.4,2.0])
d.add_paragraph("The monthly cash-flow statement separately presents Operating Cash Flow (ex-financing), so operating performance is not obscured by Convertible Note proceeds. Early ramp months remain negative, and the business becomes positive on an operating basis as the client ramp matures; quarter-end taxes may create periodic cash outflows.")

d.add_heading('5. Use of Proceeds and Liquidity',level=1)
table(d,["Use","Amount","% of offering"],[
 ["Technology / AI / cloud (Year 1)","$60,000","2.0%"],["Sales & marketing","$120,000","4.0%"],["Legal / compliance / audit","$80,000","2.7%"],["Personnel (non-CEO)","$300,000","10.0%"],["CEO compensation","$120,000","4.0%"],["Insurance","$30,000","1.0%"],["Travel","$40,000","1.3%"],["Office / administration","$30,000","1.0%"],["Other consultants","$40,000","1.3%"],["Liquidity reserve","$525,000","17.5%"],["Working capital / contingency","$1,655,000","55.2%"],["Total","$3,000,000","100.0%"],
],[3.8,1.35,1.2])
d.add_paragraph("The liquidity reserve is shown separately from available operating cash at 17.5% of funded principal, the midpoint of management’s 15%–20% framework. The reserve is a planning designation, not legally restricted cash, unless definitive documents or board actions establish restrictions.")

d.add_heading('6. Tax and Financial Statement Treatment',level=1)
bullet(d,"The income statement recognizes interest expense monthly as accrued.")
bullet(d,"The cash-flow statement records interest only when paid at quarter-end.")
bullet(d,"A 26% blended tax provision is modeled on positive monthly pre-tax income, with cash tax payments at quarter-end for planning purposes.")
bullet(d,"Revenue inputs do not determine GAAP recognition. Executed contracts require ASC 606 analysis, including variable consideration and collectibility.")
bullet(d,"The forecast does not include deferred-tax attributes, net operating loss limitations, state apportionment, or detailed estimated-tax rules.")
d.add_paragraph("These treatments are planning conventions and should be replaced with transaction-specific accounting and tax conclusions when definitive agreements and entity tax facts are available.")

d.add_heading('7. Sensitivities and Principal Risks',level=1)
d.add_heading('7.1 Coupon sensitivity',level=2)
table(d,["Coupon","Approximate 2026–2029 cash interest","Effect versus 9%"],[
 ["8%","approximately $630,159","Increases ending cash before tax effects"],["9%","approximately $708,929","Base term"],["10%","approximately $787,699","Decreases ending cash before tax effects"],
],[1.2,2.4,2.7])
d.add_heading('7.2 Material forecast risks',level=2)
for x in [
 "Capital raising: tranches may close later, in different amounts, or not at all.",
 "Customer acquisition: the Base Case assumes twelve relationships by May 2027 without historical operating evidence for this activity.",
 "Pricing and delivery: actual scope, variable consideration, direct costs, and customer payment terms may differ.",
 "Retention and collections: actual churn and credit losses may exceed the planning assumptions.",
 "Cost and tax: staffing, technology, professional fees, insurance, taxes, and compliance costs may exceed budget.",
 "Offering compliance: Rule 506(c), accredited-investor verification, state notices, legends, risk factors, and intermediary issues remain matters for securities counsel."
]: bullet(d,x)

d.add_heading('8. Required Review Before Investor Distribution',level=1)
table(d,["Area","Required action"],[
 ["Convertible Note","Reconcile coupon, day-count convention, payment dates, maturity, conversion mechanics, defaults, security, subordination, and issuance features to the executed note."],
 ["Funding dates","Replace assumed first-of-month dates with actual closing and receipt dates."],
 ["Customer support","Identify executed contracts, non-binding LOIs/MOUs, pipeline evidence, pricing support, and collection terms."],
 ["Management Case","Document the contracts, client counts, pricing, start dates, or strategic revenue needed to reach $3.0 million in 2027."],
 ["Use of proceeds","Confirm allocations, permitted reallocation discretion, reserve policy, and multi-year deployment rationale."],
 ["Accounting and tax","Validate ASC 606, note classification, issuance costs, embedded features, tax provision, and cash-payment timing."],
 ["Securities law","Have qualified counsel approve the exemption, PPM disclosure, legends, risk factors, and investor-verification process."],
],[1.55,5.3])

d.add_heading('9. Forward-Looking Statement',level=1)
d.add_paragraph("The projections are forward-looking management estimates and are not guarantees of future performance. They depend on assumptions regarding capital availability, customer acquisition, pricing, client retention, collectibility, project delivery, personnel, technology, professional services, financing terms, taxes, and other matters. SVT Nexus is pre-operating for the proposed activity and does not have historical results demonstrating achievement of the projections. Actual results may differ materially.")
d.add_paragraph("This memorandum is financial-planning support, not legal, tax, investment, or accounting advice. It should not be distributed to prospective investors until the related workbook, definitive Convertible Note, PPM, risk factors, and offering procedures have been reviewed and approved by qualified advisers.")

d.add_heading('Appendix A — Version 2 Assumption Register',level=1)
table(d,["Assumption","Version 2 basis","Classification"],[
 ["Principal","$3,000,000","Management assumption"],["Coupon","9% per annum","Definitive working term"],["Interest accrual","From each actual funding date; ACT/365 planning convention","Definitive working term / planning convention"],["Cash interest","Quarterly","Definitive working term"],["Conversion","After 2029; excluded from forecast","Management clarification"],["Base client ramp","3/3/2/2/2 additions Jan–May 2027","Analytical safeguard"],["Bad debt","2% of gross revenue","Analytical safeguard"],["Annual churn","5% beginning 2028","Analytical safeguard"],["Revenue growth","10% in 2028 and 2029","Analytical safeguard"],["Tax rate","26% blended planning rate","Planning assumption"],["Liquidity reserve","17.5% of funded principal","Management framework midpoint"],
],[2.1,3.4,1.7])

# Core properties
d.core_properties.title="SVT Nexus 2026–2029 Financial Estimate and Offering Support Memorandum — Version 2"
d.core_properties.subject="Convertible Note and operating forecast support"
d.core_properties.author="SVT Nexus"
d.core_properties.comments="Draft for management and securities counsel review"
d.save(OUT)
print(OUT)
