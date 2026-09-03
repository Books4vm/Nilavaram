import fs from "node:fs/promises";
import { Workbook, SpreadsheetFile } from "@oai/artifact-tool";

const wb = Workbook.create();
const OUT = "SVT_Nexus_Financial_Model_V3.xlsx";
const navy = "#16324F", teal = "#1B7F79", pale = "#EAF4F3", gold = "#D9A441", gray = "#667085", light = "#F4F7FA", red = "#B42318", green = "#027A48";
const moneyFmt = '$#,##0;[Red]($#,##0);-';
const pctFmt = '0.0%';
const dateFmt = 'mmm-yy';
const months = [];
for (let y=2026,m=11; y<2030;) { months.push(new Date(Date.UTC(y,m,1))); m++; if(m===12){m=0;y++;} }
const col = n => { let s=""; while(n){n--;s=String.fromCharCode(65+n%26)+s;n=Math.floor(n/26);} return s; };
const monthCol = i => col(i+2);
const title = (s, text, endCol="H") => {
  s.mergeCells(`A1:${endCol}1`); s.getRange("A1").values=[[text]];
  s.getRange(`A1:${endCol}1`).format={fill:navy,font:{bold:true,color:"#FFFFFF",size:16},verticalAlignment:"center"};
  s.getRange("A1").format.rowHeight=30;
  s.mergeCells(`A2:${endCol}2`); s.getRange("A2").values=[["Version 3 | Model date: 21 Aug 2026 | Proposed structure — management and securities counsel review required"]];
  s.getRange(`A2:${endCol}2`).format={fill:"#DCE7F0",font:{italic:true,color:navy,size:9}};
  s.showGridLines=false;
};
const header = (s, range) => s.getRange(range).format={fill:teal,font:{bold:true,color:"#FFFFFF"},verticalAlignment:"center",wrapText:true};
const section = (s, range) => s.getRange(range).format={fill:pale,font:{bold:true,color:navy}};
const formatMonthly = (s, lastRow) => {
  s.getRange(`B3:AL3`).format={fill:teal,font:{bold:true,color:"#FFFFFF"},horizontalAlignment:"center"};
  s.getRange("B3:AL3").format.numberFormat=dateFmt;
  s.getRange(`B4:AL${lastRow}`).format.numberFormat=moneyFmt;
  s.getRange(`A1:AL${lastRow}`).format.font={name:"Aptos",size:10};
  s.getRange("A:A").format.columnWidth=31;
  s.getRange("B:AL").format.columnWidth=12;
  s.freezePanes.freezeRows(3); s.freezePanes.freezeColumns(1);
};

// Assumptions
const a=wb.worksheets.add("Assumptions"); title(a,"SVT Nexus — Version 3 Assumptions","H");
a.getRange("A4:D4").values=[["Financing assumption","Value","Classification","Basis / disclosure"]]; header(a,"A4:D4");
const fin=[
 ["Convertible Note principal",3000000,"Management assumption","Twelve tranches; checksum below"],
 ["Cash coupon rate",0.04,"Proposed term","Accrues from actual receipt date; ACT/365"],
 ["Cash interest frequency (months)",3,"Definitive working term","Quarterly payments; expense accrues monthly"],
 ["Conversion timing","No modeled trigger through 2029","Proposed modeling treatment","Terms disclosed; conversion remains contingent"],
 ["Tax rate",0.26,"Planning assumption","Blended provision; confirm with tax adviser"],
 ["Bad debt reserve",0.02,"Analytical safeguard","Applied to gross revenue"],
 ["Annual churn",0.05,"Analytical safeguard","Applied to effective clients beginning 2028"],
 ["Annual revenue growth",0.10,"Analytical safeguard","Pricing/growth factor for 2028-2029"],
 ["2028 operating expense growth",0.10,"Planning assumption","Recurring expense growth"],
 ["2029 operating expense growth",0.10,"Planning assumption","Recurring expense growth"],
 ["Liquidity reserve target",0.10,"Proposed capital-efficiency target","10% of funded face principal"],
 ["2027 management revenue target",3000000,"Management target","Aspirational; separate from Base Case"]
]; a.getRange(`A5:D${4+fin.length}`).values=fin;
a.getRange("B5:B17").format.numberFormat=moneyFmt; a.getRange("B6").format.numberFormat=pctFmt; a.getRange("B9:B15").format.numberFormat=pctFmt;
a.getRange("B7").format.numberFormat="0"; a.getRange("B8").format.numberFormat="General"; a.getRange("B16").format.numberFormat=moneyFmt;
a.getRange("F4:H4").values=[["2027 operating expense","Annual base","Classification"]]; header(a,"F4:H4");
const opex=[["CEO compensation",120000,"Management assumption"],["Other personnel / contractors",600000,"Growth deployment"],["Technology / AI / cloud",180000,"Growth deployment"],["Sales & marketing",420000,"Growth deployment"],["Legal / accounting / audit / tax / compliance",80000,"Planning estimate"],["Insurance",30000,"Planning estimate"],["Travel",40000,"Planning estimate"],["Office / administrative",30000,"Planning estimate"],["Other consultants / contractors",40000,"Planning estimate"]];
a.getRange("F5:H13").values=opex; a.getRange("G5:G13").format.numberFormat=moneyFmt;
a.getRange("F15:H15").values=[["Client economics","Monthly rate","Direct cost %"]]; header(a,"F15:H15");
a.getRange("F16:H18").values=[["Retainer",11000,0.15],["Commission category",12000,0.20],["Pilot / revenue-share",15000,0.30]]; a.getRange("G16:G18").format.numberFormat=moneyFmt; a.getRange("H16:H18").format.numberFormat=pctFmt;
a.getRange("F20:H20").values=[["Offering checksum","Amount","Status"]]; header(a,"F20:H20");
a.getRange("F21:H21").values=[["Scheduled tranches",null,null]]; a.getRange("G21").formulas=[["=SUM('Convertible Note'!$C$5:$C$16)"]]; a.getRange("H21").formulas=[["=IF(G21=$B$5,\"OK\",\"CHECK\")"]]; a.getRange("G21").format.numberFormat=moneyFmt;
a.getRange("A23:D23").values=[["Proposed hybrid / conversion terms","Value","Status","Model treatment"]]; header(a,"A23:D23");
a.getRange("A24:D29").values=[["PIK coupon rate",0.05,"Proposed","Noncash accrual added to note carrying amount"],["Conversion discount",0.20,"Illustrative — counsel approval required","Applied only if a qualifying conversion occurs"],["Valuation cap",12000000,"Illustrative — counsel approval required","No conversion value recorded in forecast"],["Qualified financing threshold",5000000,"Illustrative — counsel approval required","No qualifying financing forecast"],["Maturity",new Date(Date.UTC(2030,10,30)),"Proposed","36 months after final scheduled close"],["Section 163(j) stress toggle",1,"Planning safeguard","1 = limitation applied; small-business exception not evaluated"]];
a.getRange("B24:B25").format.numberFormat=pctFmt; a.getRange("B26:B27").format.numberFormat=moneyFmt; a.getRange("B28").format.numberFormat="mmm d, yyyy"; a.getRange("B29").format.numberFormat="0";
a.getRange("A4:H21").format.font={name:"Aptos",size:10}; a.getRange("A:A").format.columnWidth=31; a.getRange("B:B").format.columnWidth=18; a.getRange("C:C").format.columnWidth=20; a.getRange("D:D").format.columnWidth=42; a.getRange("F:F").format.columnWidth=37; a.getRange("G:G").format.columnWidth=16; a.getRange("H:H").format.columnWidth=21; a.freezePanes.freezeRows(4);

// Client Ramp
const cr=wb.worksheets.add("Client Ramp"); title(cr,"SVT Nexus — Client Ramp and Scenario Drivers","M");
cr.getRange("A4:M4").values=[["Scenario","Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]]; header(cr,"A4:M4");
cr.getRange("A5:M5").values=[["Downside — new clients",0,0,0,0,0,0,2,1,1,1,1,0]];
cr.getRange("A6:M6").values=[["Base — new clients",3,3,2,2,2,0,0,0,0,0,0,0]];
cr.getRange("A7:M7").values=[["Management — new clients",4,4,3,3,2,2,0,0,0,0,0,0]];
cr.getRange("A9:M9").values=[["Base cumulative clients",null,null,null,null,null,null,null,null,null,null,null,null]];
cr.getRange("B9").formulas=[["=B6"]]; for(let i=2;i<=12;i++) cr.getRange(`${col(i+1)}9`).formulas=[[`=${col(i)}9+${col(i+1)}6`]];
cr.getRange("A11:D11").values=[["Scenario","Year-end clients","2027 timing","Investor interpretation"]]; header(cr,"A11:D11");
cr.getRange("A12:D14").values=[
 ["Downside",6,"Six-month delay; retainer-only","Stress case; 50% attainment and delayed ramp"],
 ["Base",12,"3/3/2/2/2 client additions Jan-May","Operating case used in statements"],
 ["Management",18,"4/4/3/3/2/2 additions Jan-Jun","Aspirational case; target bridge disclosed separately"]
];
cr.getRange("A18:D18").values=[["Base growth year","Opening clients","New clients","Ending clients"]]; header(cr,"A18:D18");
cr.getRange("A19:D21").values=[[2027,0,12,12],[2028,12,6,18],[2029,18,6,24]];
cr.getRange("A16:M16").merge(); cr.getRange("A16").values=[["Note: client counts are planning assumptions, not executed contracts. LOIs/MOUs are not treated as revenue commitments."]]; cr.getRange("A16:M16").format={fill:"#FFF4E5",font:{italic:true,color:"#7A2E0E"},wrapText:true};
cr.getRange("A:A").format.columnWidth=32; cr.getRange("B:M").format.columnWidth=11; cr.getRange("D:D").format.columnWidth=47; cr.getRange("A4:M16").format.font={name:"Aptos",size:10}; cr.freezePanes.freezeRows(4);

// Revenue Model - Base case
const rev=wb.worksheets.add("Revenue Model"); title(rev,"SVT Nexus — Base Case Monthly Revenue Model","AL");
rev.getRange("A3").values=[["Revenue item"]]; rev.getRange("B3:AL3").values=[months];
const revLabels=["Retainer active clients","Commission active clients","Pilot/share active clients","Retainer gross revenue","Commission gross revenue","Pilot/share gross revenue","Gross Revenue","Bad Debt Reserve","Net Revenue","Direct Project Costs","Gross Contribution"];
rev.getRange("A4:A14").values=revLabels.map(x=>[x]);
for(let i=0;i<months.length;i++){
 const c=monthCol(i), d=months[i], y=d.getUTCFullYear(), m=d.getUTCMonth()+1;
 if(y===2026){ rev.getRange(`${c}4:${c}14`).values=Array.from({length:11},()=>[0]); continue; }
 const rampCol=col(m+1); const churnFactor=y===2027?"1":"(1-'Assumptions'!$B$11)";
 const priceGrowth=y===2027?"1":y===2028?"(1+'Assumptions'!$B$12)":"(1+'Assumptions'!$B$12)^2";
 if(y===2027){
  rev.getRange(`${c}4`).formulas=[[`=MIN(6,'Client Ramp'!${rampCol}$9)`]];
  rev.getRange(`${c}5`).formulas=[[`=MIN(3,MAX(0,'Client Ramp'!${rampCol}$9-6))`]];
  rev.getRange(`${c}6`).formulas=[[`=MIN(3,MAX(0,'Client Ramp'!${rampCol}$9-9))`]];
 } else {
  const total=y===2028?18:24;
  rev.getRange(`${c}4`).formulas=[[`=${total}*50%*${churnFactor}`]];
  rev.getRange(`${c}5`).formulas=[[`=${total}*25%*${churnFactor}`]];
  rev.getRange(`${c}6`).formulas=[[`=${total}*25%*${churnFactor}`]];
 }
 const intro = y===2027 && m<=6;
 rev.getRange(`${c}7`).formulas=[[`=${c}4*${intro?10000:"'Assumptions'!$G$16"}*${priceGrowth}`]];
 rev.getRange(`${c}8`).formulas=[[`=${c}5*${intro?10000:"'Assumptions'!$G$17"}*${priceGrowth}`]];
 rev.getRange(`${c}9`).formulas=[[`=${c}6*${intro?10000:"'Assumptions'!$G$18"}*${priceGrowth}`]];
 rev.getRange(`${c}10`).formulas=[[`=SUM(${c}7:${c}9)`]];
 rev.getRange(`${c}11`).formulas=[[`=-${c}10*'Assumptions'!$B$10`]];
 rev.getRange(`${c}12`).formulas=[[`=SUM(${c}10:${c}11)`]];
 rev.getRange(`${c}13`).formulas=[[`=-(${c}7*'Assumptions'!$H$16+${c}8*'Assumptions'!$H$17+${c}9*'Assumptions'!$H$18)`]];
 rev.getRange(`${c}14`).formulas=[[`=SUM(${c}12:${c}13)`]];
}
rev.getRange("B4:AL6").format.numberFormat="0.0"; section(rev,"A10:AL10"); section(rev,"A12:AL12"); section(rev,"A14:AL14"); formatMonthly(rev,14);

// Operating Model
const op=wb.worksheets.add("Operating Model"); title(op,"SVT Nexus — Monthly Operating Expense Model","AL"); op.getRange("A3").values=[["Expense category"]]; op.getRange("B3:AL3").values=[months];
const opLabels=opex.map(x=>x[0]).concat(["Total Operating Expenses"]); op.getRange("A4:A13").values=opLabels.map(x=>[x]);
for(let i=0;i<months.length;i++){
 const c=monthCol(i), d=months[i], y=d.getUTCFullYear(), m=d.getUTCMonth()+1;
 for(let r=4;r<=12;r++){
   if(y===2026){ const pre=[0,0,5000,10000,15000,2500,2500,2500,5000][r-4]; op.getRange(`${c}${r}`).values=[[-pre]]; }
   else { const factor=y===2027?"1":y===2028?"(1+'Assumptions'!$B$13)":"(1+'Assumptions'!$B$13)*(1+'Assumptions'!$B$14)"; const ar=r+1; if(m===12){ const first=y===2027?'C':y===2028?'O':'AA'; const prior=y===2027?'M':y===2028?'Y':'AK'; op.getRange(`${c}${r}`).formulas=[[`=-'Assumptions'!$G$${ar}*${factor}-SUM(${first}${r}:${prior}${r})`]]; } else op.getRange(`${c}${r}`).formulas=[[`=-ROUND('Assumptions'!$G$${ar}/12*${factor},-2)`]]; }
 }
 op.getRange(`${c}13`).formulas=[[`=SUM(${c}4:${c}12)`]];
}
section(op,"A13:AL13"); formatMonthly(op,13);

// Convertible Note
const note=wb.worksheets.add("Convertible Note"); title(note,"SVT Nexus — Convertible Note Schedule (ACT/365)","AO");
note.getRange("A4:D4").values=[["Tranche","Funding date","Principal","Status / basis"]]; header(note,"A4:D4");
const tranches=[["Phase 1 — Tranche 1",new Date(Date.UTC(2026,11,1)),150000,"Phase 1"],["Phase 1 — Tranche 2",new Date(Date.UTC(2027,0,1)),300000,"Phase 1"],["Phase 1 — Tranche 3",new Date(Date.UTC(2027,1,1)),300000,"Phase 1"]];
for(let k=0;k<9;k++) tranches.push([`${k<2?'Phase 1':'Phase 2'} — Tranche ${k+4}`,new Date(Date.UTC(2027,k+2,1)),250000,k<2?"Phase 1":"Milestone-gated Phase 2"]);
note.getRange("A5:D16").values=tranches; note.getRange("B5:B16").format.numberFormat="mmm d, yyyy"; note.getRange("C5:C16").format.numberFormat=moneyFmt;
for(let r=10;r<=16;r++) note.getRange(`C${r}`).formulas=[["=IF('Revenue Model'!F10*12>=1000000,250000,0)"]];
note.getRange("E4:AO4").values=[months]; note.getRange("E4:AO4").format={fill:teal,font:{bold:true,color:"#FFFFFF"},horizontalAlignment:"center",numberFormat:dateFmt};
for(let r=5;r<=16;r++) for(let i=0;i<months.length;i++){
 const c=col(i+5), end=new Date(Date.UTC(months[i].getUTCFullYear(),months[i].getUTCMonth()+1,0));
 const endSerial=Math.floor(end.getTime()/86400000)+25569; const startSerial=Math.floor(months[i].getTime()/86400000)+25569;
 note.getRange(`${c}${r}`).formulas=[[`=IF($B${r}>${endSerial},0,$C${r}*'Assumptions'!$B$6*(${endSerial}-MAX($B${r},${startSerial})+1)/365)`]];
}
note.getRange("A18:A24").values=[["Cash coupon expense accrued (4%)"],["Cash interest paid (quarterly)"],["Ending accrued cash interest payable"],["PIK interest accrued (5%)"],["Cumulative PIK principal"],["Note carrying amount (face + PIK)"],["Conversion / principal repayment"]];
for(let i=0;i<months.length;i++){
 const c=col(i+5), m=months[i].getUTCMonth()+1;
 note.getRange(`${c}18`).formulas=[[`=SUM(${c}5:${c}16)`]];
 if(m%3===0){ const start=Math.max(5,i+5-2); note.getRange(`${c}19`).formulas=[[`=-SUM(${col(start)}18:${c}18)`]]; } else note.getRange(`${c}19`).values=[[0]];
 note.getRange(`${c}20`).formulas=[[i===0?`=${c}18+${c}19`:`=${col(i+4)}20+${c}18+${c}19`]];
 note.getRange(`${c}21`).formulas=[[`=${c}18*'Assumptions'!$B$24/'Assumptions'!$B$6`]];
 note.getRange(`${c}22`).formulas=[[i===0?`=${c}21`:`=${col(i+4)}22+${c}21`]];
 note.getRange(`${c}23`).formulas=[[`=SUMIF($B$5:$B$16,"<="&EOMONTH(${c}$4,0),$C$5:$C$16)+${c}22`]];
 note.getRange(`${c}24`).values=[[0]];
}
section(note,"A18:AO18"); section(note,"A21:AO24"); note.getRange("E5:AO24").format.numberFormat=moneyFmt; note.getRange("A:A").format.columnWidth=32; note.getRange("B:B").format.columnWidth=15; note.getRange("C:C").format.columnWidth=15; note.getRange("D:D").format.columnWidth=24; note.getRange("E:AO").format.columnWidth=11; note.freezePanes.freezeRows(4); note.freezePanes.freezeColumns(4);

// Income Statement
const inc=wb.worksheets.add("Income Statement"); title(inc,"SVT Nexus — Base Case Income Statement (Accrual Basis)","AL"); inc.getRange("A3").values=[["Income statement item"]]; inc.getRange("B3:AL3").values=[months];
inc.getRange("A4:A12").values=[["Net Revenue"],["Direct Project Costs"],["Gross Contribution"],["Operating Expenses"],["Operating Income"],["Interest Expense (accrued)"],["Pre-Tax Income"],["Income Tax Provision"],["Net Income"]];
for(let i=0;i<months.length;i++){ const c=monthCol(i), nc=col(i+5), y=months[i].getUTCFullYear(), m=months[i].getUTCMonth()+1; inc.getRange(`${c}4`).formulas=[[`='Revenue Model'!${c}12`]]; inc.getRange(`${c}5`).formulas=[[`='Revenue Model'!${c}13`]]; inc.getRange(`${c}6`).formulas=[[`=SUM(${c}4:${c}5)`]]; inc.getRange(`${c}7`).formulas=[[`='Operating Model'!${c}13`]]; inc.getRange(`${c}8`).formulas=[[`=SUM(${c}6:${c}7)`]]; inc.getRange(`${c}9`).formulas=[[`=-SUM('Convertible Note'!${nc}18,'Convertible Note'!${nc}21)`]]; inc.getRange(`${c}10`).formulas=[[`=SUM(${c}8:${c}9)`]]; inc.getRange(`${c}11`).formulas=[[m===12?`=-'Tax & 163j'!${col(y-2024)}11`:"=0"]]; inc.getRange(`${c}12`).formulas=[[`=SUM(${c}10:${c}11)`]]; }
for(const r of [6,8,10,12]) section(inc,`A${r}:AL${r}`); formatMonthly(inc,12);

// Cash Flow
const cf=wb.worksheets.add("Cash Flow"); title(cf,"SVT Nexus — Monthly Cash Flow and Liquidity","AL"); cf.getRange("A3").values=[["Cash flow item"]]; cf.getRange("B3:AL3").values=[months];
cf.getRange("A4:A18").values=[["Beginning Cash"],["Customer Collections"],["Direct Project Costs"],["Operating Expenses"],["Operating Cash Flow (ex-financing, pre-tax)"],["Income Tax Paid"],["Operating Cash Flow (ex-financing, after-tax)"],["Convertible Note Proceeds"],["Cash Interest Paid (quarterly)"],["Financing Cash Flow"],["Net Cash Flow"],["Ending Cash"],["Reserved Cash (17.5% of funded principal)"],["Available Operating Cash"],["Outstanding Convertible Note Principal"]];
for(let i=0;i<months.length;i++){
 const c=monthCol(i), nc=col(i+5), m=months[i].getUTCMonth()+1;
 cf.getRange(`${c}4`).formulas=[[i===0?"=0":`=${monthCol(i-1)}15`]];
 cf.getRange(`${c}5`).formulas=[[`='Revenue Model'!${c}12`]]; cf.getRange(`${c}6`).formulas=[[`='Revenue Model'!${c}13`]]; cf.getRange(`${c}7`).formulas=[[`='Operating Model'!${c}13`]]; cf.getRange(`${c}8`).formulas=[[`=SUM(${c}5:${c}7)`]];
 if(m%3===0){ const sc=Math.max(2,i+2-2); cf.getRange(`${c}9`).formulas=[[`=SUM('Income Statement'!${col(sc)}11:${c}11)`]]; } else cf.getRange(`${c}9`).values=[[0]];
 cf.getRange(`${c}10`).formulas=[[`=SUM(${c}8:${c}9)`]];
 cf.getRange(`${c}11`).formulas=[[`=SUMIF('Convertible Note'!$B$5:$B$16,${c}$3,'Convertible Note'!$C$5:$C$16)`]]; cf.getRange(`${c}12`).formulas=[[`='Convertible Note'!${nc}19`]]; cf.getRange(`${c}13`).formulas=[[`=SUM(${c}11:${c}12)`]]; cf.getRange(`${c}14`).formulas=[[`=SUM(${c}10,${c}13)`]]; cf.getRange(`${c}15`).formulas=[[`=SUM(${c}4,${c}14)`]]; cf.getRange(`${c}16`).formulas=[[`=SUMIF('Convertible Note'!$B$5:$B$16,"<="&EOMONTH(${c}$3,0),'Convertible Note'!$C$5:$C$16)*'Assumptions'!$B$15`]]; cf.getRange(`${c}17`).formulas=[[`=${c}15-${c}16`]]; cf.getRange(`${c}18`).formulas=[[`='Convertible Note'!${nc}23`]];
}
for(const r of [8,10,13,15,17,18]) section(cf,`A${r}:AL${r}`); formatMonthly(cf,18);

// Use of Proceeds
const u=wb.worksheets.add("Use of Proceeds"); title(u,"SVT Nexus — Estimated Use of Proceeds","F"); u.getRange("A4:D4").values=[["Use","Amount","% of Offering","Investor-facing rationale"]]; header(u,"A4:D4");
const uses=[["Technology / AI / cloud",180000,"Platform and service infrastructure"],["Sales & enterprise marketing",420000,"Includes $300K reallocation for 2 AEs, 1 SDR, events and pilots"],["Legal / compliance / audit",80000,"Offering, contracts, reporting and governance"],["Personnel (non-CEO)",600000,"Delivery capacity and enterprise sales team"],["CEO compensation",120000,"Leadership compensation"],["Insurance",30000,"Risk management"],["Travel",40000,"Business development and delivery"],["Office / administration",30000,"Operating infrastructure"],["Other consultants",40000,"Specialist resources"],["Liquidity reserve",300000,"10% of face principal"],["Working capital / contingency",null,"Milestone deployment and operating flexibility"]];
u.getRange("A5:A15").values=uses.map(x=>[x[0]]); u.getRange("B5:B14").values=uses.slice(0,10).map(x=>[x[1]]); u.getRange("B15").formulas=[["='Assumptions'!$B$5-SUM(B5:B14)"]]; u.getRange("C5:C15").formulas=Array.from({length:11},(_,i)=>[`=B${i+5}/'Assumptions'!$B$5`]); u.getRange("D5:D15").values=uses.map(x=>[x[2]]); u.getRange("A16:D16").values=[["Total",null,null,"Must equal the note principal"]]; u.getRange("B16").formulas=[["=SUM(B5:B15)"]]; u.getRange("C16").formulas=[["=SUM(C5:C15)"]]; section(u,"A16:D16"); u.getRange("B5:B16").format.numberFormat=moneyFmt; u.getRange("C5:C16").format.numberFormat=pctFmt; u.getRange("A:A").format.columnWidth=36; u.getRange("B:C").format.columnWidth=17; u.getRange("D:D").format.columnWidth=50; u.freezePanes.freezeRows(4);
u.getRange("A19:D19").values=[["Funding phase","Maximum","Release condition","Modeled timing"]]; header(u,"A19:D19");
u.getRange("A20:D22").values=[["Phase 1",1250000,"Initial operating runway and 12-client build","Dec 2026-Apr 2027"],["Phase 2",1750000,"Prior-month annualized gross revenue >= $1.0M","May-Nov 2027 if milestone achieved"],["Total",3000000,"Both phases","Subject to actual closings"]]; u.getRange("B20:B22").format.numberFormat=moneyFmt; section(u,"A22:D22");

// Scenario Analysis
const sc=wb.worksheets.add("Scenario Analysis"); title(sc,"SVT Nexus — Scenario and Interest Sensitivity Analysis","H");
sc.getRange("A4:F4").values=[["Scenario","2027 clients","Ramp / pricing basis","2027 Revenue","% of Management Target","Key risk / interpretation"]]; header(sc,"A4:F4");
sc.getRange("A5:C7").values=[["Downside",6,"6-month delay; retainer-only"],["Base",12,"Jan-May ramp; differentiated pricing"],["Management",18,"Aspirational target case"]];
sc.getRange("D5").formulas=[["=SUMPRODUCT('Client Ramp'!B5:M5,{60000,50000,40000,30000,20000,10000,0,0,0,0,0,0})+SUM('Client Ramp'!B5:M5)*0"]];
// explicit, transparent annual values: downside calculation, base link, management target
sc.getRange("D5").formulas=[["=6*11000*6*(1-'Assumptions'!$B$10)"]]; sc.getRange("D6").formulas=[["=SUM('Revenue Model'!C10:N10)"]]; sc.getRange("D7").formulas=[["='Assumptions'!$B$16"]];
sc.getRange("E5:E7").formulas=[["=D5/'Assumptions'!$B$16"],["=D6/'Assumptions'!$B$16"],["=D7/'Assumptions'!$B$16"]]; sc.getRange("F5:F7").values=[["Delayed sales conversion and 50% client attainment"],["Primary forecast used in financial statements"],["Requires incremental contracts/strategic revenue beyond modeled Base Case"]];
sc.getRange("A10:D10").values=[["Cash coupon sensitivity","2026-2029 cash interest","Ending cash impact vs. 4%","Interpretation"]]; header(sc,"A10:D10"); sc.getRange("A11:A13").values=[[0.03],[0.04],[0.05]];
sc.getRange("B11:B13").formulas=[["=SUM('Convertible Note'!E18:AO18)*A11/'Assumptions'!$B$6"],["=SUM('Convertible Note'!E18:AO18)*A12/'Assumptions'!$B$6"],["=SUM('Convertible Note'!E18:AO18)*A13/'Assumptions'!$B$6"]]; sc.getRange("C11:C13").formulas=[["=B12-B11"],["=0"],["=B12-B13"]]; sc.getRange("D11:D13").values=[["Lower coupon increases ending cash before tax effects"],["Base note term"],["Higher coupon decreases ending cash before tax effects"]];
sc.getRange("D5:D7").format.numberFormat=moneyFmt; sc.getRange("E5:E7").format.numberFormat=pctFmt; sc.getRange("A11:A13").format.numberFormat=pctFmt; sc.getRange("B11:C13").format.numberFormat=moneyFmt; sc.getRange("A:A").format.columnWidth=21; sc.getRange("B:B").format.columnWidth=17; sc.getRange("C:C").format.columnWidth=38; sc.getRange("D:E").format.columnWidth=20; sc.getRange("F:F").format.columnWidth=52;

// Break-Even
const be=wb.worksheets.add("Break-Even"); title(be,"SVT Nexus — Operating Break-Even Analysis","F"); be.getRange("A4:C4").values=[["Metric","Base Case","Explanation"]]; header(be,"A4:C4");
be.getRange("A5:A13").values=[["Steady-state gross monthly revenue / 12 clients"],["Bad debt reserve"],["Net revenue"],["Direct project costs"],["Monthly contribution"],["Contribution margin"],["Monthly fixed operating expenses"],["Revenue break-even"],["Equivalent clients at current mix"]];
be.getRange("B5").formulas=[["=6*'Assumptions'!$G$16+3*'Assumptions'!$G$17+3*'Assumptions'!$G$18"]]; be.getRange("B6").formulas=[["=-B5*'Assumptions'!$B$10"]]; be.getRange("B7").formulas=[["=SUM(B5:B6)"]]; be.getRange("B8").formulas=[["=-(6*'Assumptions'!$G$16*'Assumptions'!$H$16+3*'Assumptions'!$G$17*'Assumptions'!$H$17+3*'Assumptions'!$G$18*'Assumptions'!$H$18)"]]; be.getRange("B9").formulas=[["=SUM(B7:B8)"]]; be.getRange("B10").formulas=[["=B9/B5"]]; be.getRange("B11").formulas=[["=-'Operating Model'!C13"]]; be.getRange("B12").formulas=[["=B11/B10"]]; be.getRange("B13").formulas=[["=B12/(B5/12)"]];
be.getRange("C5:C13").values=[["Post-July category mix before annual growth"],["2% planning reserve"],["Gross revenue less bad debt"],["15% / 20% / 30% category cost rates"],["Net revenue less direct costs"],["Contribution divided by gross revenue"],["January 2027 recurring budget"],["Monthly gross revenue required to cover fixed costs"],["Approximate client equivalents"]]; be.getRange("B5:B9").format.numberFormat=moneyFmt; be.getRange("B10").format.numberFormat=pctFmt; be.getRange("B11:B12").format.numberFormat=moneyFmt; be.getRange("B13").format.numberFormat="0.0"; be.getRange("A:A").format.columnWidth=42; be.getRange("B:B").format.columnWidth=20; be.getRange("C:C").format.columnWidth=48;

// Sales Funnel
const sf=wb.worksheets.add("Sales Funnel"); title(sf,"SVT Nexus — Enterprise Sales Funnel Support","G");
sf.getRange("A4:E4").values=[["Funnel metric","2027","2028","2029","Planning basis"]]; header(sf,"A4:E4");
sf.getRange("A5:A13").values=[["Qualified leads"],["Demos / discovery"],["Paid or documented pilots"],["New clients"],["Ending clients"],["Lead-to-demo conversion"],["Demo-to-pilot conversion"],["Pilot-to-client conversion"],["Sales & marketing spend per new client"]];
sf.getRange("B5:D9").values=[[240,180,180],[72,54,54],[24,18,18],[12,6,6],[12,18,24]];
for(let j=0;j<3;j++){ const c=col(j+2); sf.getRange(`${c}10`).formulas=[[`=${c}6/${c}5`]]; sf.getRange(`${c}11`).formulas=[[`=${c}7/${c}6`]]; sf.getRange(`${c}12`).formulas=[[`=${c}8/${c}7`]]; sf.getRange(`${c}13`).formulas=[[`=-SUM('Operating Model'!${j===0?'C':j===1?'O':'AA'}7:${j===0?'N':j===1?'Z':'AL'}7)/${c}8`]]; }
sf.getRange("E5:E13").values=[["Management pipeline target; replace with CRM evidence"],["30% lead-to-demo assumption"],["One-third of demos"],["50% pilot-to-client conversion"],["Base Case operating capacity"],["Analytical safeguard"],["Analytical safeguard"],["Analytical safeguard"],["Includes enterprise team, events and pilot programs"]];
sf.getRange("B10:D12").format.numberFormat=pctFmt; sf.getRange("B13:D13").format.numberFormat=moneyFmt; sf.getRange("A:A").format.columnWidth=40; sf.getRange("B:D").format.columnWidth=16; sf.getRange("E:E").format.columnWidth=52;
sf.mergeCells("A15:E15"); sf.getRange("A15").values=[["No pipeline count is represented as existing evidence. Management should reconcile this planning funnel to CRM records, dated proposals, LOIs/MOUs, and definitive contracts before investor use."]]; sf.getRange("A15:E15").format={fill:"#FFF4E5",font:{italic:true,color:"#7A2E0E"},wrapText:true};

// Tax and Section 163(j)
const tx=wb.worksheets.add("Tax & 163j"); title(tx,"SVT Nexus — Simplified Tax and Section 163(j) Stress Test","F");
tx.getRange("A4:E4").values=[["Tax metric","2026","2027","2028","2029"]]; header(tx,"A4:E4");
tx.getRange("A5:A11").values=[["Simplified ATI / operating income"],["Total business interest expense"],["30% ATI capacity"],["Current-year deductible interest"],["Ending disallowed-interest carryforward"],["Simplified taxable income"],["Tax provision at 26%"]];
const taxYears=[["B","B"],["C","N"],["O","Z"],["AA","AL"]];
for(let j=0;j<4;j++){ const c=col(j+2),[x,y]=taxYears[j]; tx.getRange(`${c}5`).formulas=[[`=MAX(0,SUM('Income Statement'!${x}8:${y}8))`]]; tx.getRange(`${c}6`).formulas=[[`=-SUM('Income Statement'!${x}9:${y}9)`]]; tx.getRange(`${c}7`).formulas=[[`=${c}5*30%`]]; tx.getRange(`${c}8`).formulas=[[`=IF('Assumptions'!$B$29=1,MIN(${c}6,${c}7),${c}6)`]]; tx.getRange(`${c}9`).formulas=[[j===0?`=${c}6-${c}8`:`=${col(j+1)}9+${c}6-${c}8`]]; tx.getRange(`${c}10`).formulas=[[`=MAX(0,${c}5-${c}8)`]]; tx.getRange(`${c}11`).formulas=[[`=${c}10*'Assumptions'!$B$9`]]; }
tx.getRange("B5:E11").format.numberFormat=moneyFmt; tx.mergeCells("A13:E15"); tx.getRange("A13").values=[["Planning safeguard only. Section 163(j) generally limits deductible business interest to business interest income plus 30% of adjusted taxable income and floor-plan financing interest when applicable. Certain small businesses may be exempt. Entity status, gross receipts, ATI adjustments, carryforwards, and PIK/OID treatment require tax-adviser review. Source: https://www.irs.gov/newsroom/questions-and-answers-about-the-limitation-on-the-deduction-for-business-interest-expense"]]; tx.getRange("A13:E15").format={fill:"#FFF4E5",font:{italic:true,color:"#7A2E0E"},wrapText:true,verticalAlignment:"top"}; tx.getRange("A:A").format.columnWidth=44; tx.getRange("B:E").format.columnWidth=18;

// Compliance Roadmap
const co=wb.worksheets.add("Compliance Roadmap"); title(co,"SVT Nexus — Offering, Accounting and Governance Roadmap","F");
co.getRange("A4:F4").values=[["Area","Requirement / issue","Version 3 treatment","Owner","Priority","Primary source"]]; header(co,"A4:F4");
co.getRange("A5:F12").values=[["Rule 506(c)","All purchasers accredited; reasonable verification steps","Working exemption only; counsel confirmation required","Securities counsel","Immediate","https://www.sec.gov/resources-small-businesses/exempt-offerings/general-solicitation-rule-506c"],["Investor verification","Document-based or qualified-professional verification methods","Not performed by financial model","Issuer / counsel","Immediate","https://www.sec.gov/resources-small-businesses/capital-raising-building-blocks/assessing-accredited-investors-under-regulation-d"],["Form D","Generally due within 15 days after first sale","Calendar action; filing not represented as completed","Securities counsel","Immediate","https://www.sec.gov/resources-small-businesses/capital-raising-building-blocks/what-form-d"],["PPM package","Memo is not a PPM; risk factors and subscription documents required","Prominent limitation retained","Securities counsel","Immediate","https://www.sec.gov/resources-small-businesses/exempt-offerings/general-solicitation-rule-506c"],["ASC 606","Contract, performance obligations, variable consideration and timing","Linear forecast is planning-only","Accounting adviser","High","https://storage.fasb.org/Rev_Rec_Implementation_QAs.pdf"],["Convertible accounting","Debt classification and embedded features require analysis","Cash/PIK shown; derivative value not recorded","Accounting adviser","High","https://storage.fasb.org/ASU_2020-06.pdf"],["Section 163(j)","Potential business-interest deduction limitation","Stress test added; exemption not concluded","Tax adviser","High","https://www.irs.gov/newsroom/questions-and-answers-about-the-limitation-on-the-deduction-for-business-interest-expense"],["Data room","Pipeline evidence, LOIs/MOUs and contracts","Sales funnel explicitly labeled unsupported until reconciled","Management","High","Internal management evidence"]];
co.getRange("A:A").format.columnWidth=20; co.getRange("B:C").format.columnWidth=48; co.getRange("D:E").format.columnWidth=18; co.getRange("F:F").format.columnWidth=55; co.getRange("A4:F12").format.wrapText=true; co.freezePanes.freezeRows(4);

// Investor Summary last, but display first conceptually
const s=wb.worksheets.add("Investor Summary"); title(s,"SVT Nexus — Version 3 Investor Financial Summary","J");
s.getRange("A4:E4").values=[["Metric","2026","2027","2028","2029"]]; header(s,"A4:E4");
s.getRange("A5:A15").values=[["Convertible Note Proceeds"],["Gross Revenue"],["Net Revenue"],["Gross Contribution"],["Operating Expenses"],["Operating Income"],["Interest Expense (accrued)"],["Income Tax Provision"],["Net Income"],["Ending Cash"],["Outstanding Note Principal"]];
const yearRanges=[["B","B"],["C","N"],["O","Z"],["AA","AL"]];
for(let j=0;j<4;j++){ const c=col(j+2), [x,y]=yearRanges[j]; s.getRange(`${c}5`).formulas=[[`=SUM('Cash Flow'!${x}11:${y}11)`]]; s.getRange(`${c}6`).formulas=[[`=SUM('Revenue Model'!${x}10:${y}10)`]]; s.getRange(`${c}7`).formulas=[[`=SUM('Revenue Model'!${x}12:${y}12)`]]; s.getRange(`${c}8`).formulas=[[`=SUM('Revenue Model'!${x}14:${y}14)`]]; s.getRange(`${c}9`).formulas=[[`=SUM('Operating Model'!${x}13:${y}13)`]]; s.getRange(`${c}10`).formulas=[[`=SUM('Income Statement'!${x}8:${y}8)`]]; s.getRange(`${c}11`).formulas=[[`=SUM('Income Statement'!${x}9:${y}9)`]]; s.getRange(`${c}12`).formulas=[[`=SUM('Income Statement'!${x}11:${y}11)`]]; s.getRange(`${c}13`).formulas=[[`=SUM('Income Statement'!${x}12:${y}12)`]]; s.getRange(`${c}14`).formulas=[[`='Cash Flow'!${y}15`]]; s.getRange(`${c}15`).formulas=[[`='Cash Flow'!${y}18`]]; }
s.getRange("A17:E17").values=[["Scenario","2027 Revenue","Target Attainment","2027 Clients","Status"]]; header(s,"A17:E17"); s.getRange("A18:A20").formulas=[["='Scenario Analysis'!A5"],["='Scenario Analysis'!A6"],["='Scenario Analysis'!A7"]]; s.getRange("B18:B20").formulas=[["='Scenario Analysis'!D5"],["='Scenario Analysis'!D6"],["='Scenario Analysis'!D7"]]; s.getRange("C18:C20").formulas=[["='Scenario Analysis'!E5"],["='Scenario Analysis'!E6"],["='Scenario Analysis'!E7"]]; s.getRange("D18:D20").formulas=[["='Scenario Analysis'!B5"],["='Scenario Analysis'!B6"],["='Scenario Analysis'!B7"]]; s.getRange("E18:E20").values=[["Stress case"],["Primary forecast"],["Aspirational target"]];
s.getRange("G4:J4").values=[["Key safeguard","Model treatment","Investor relevance","Disclosure status"]]; header(s,"G4:J4");
s.getRange("G5:J12").values=[
 ["Hybrid coupon","4% cash + 5% PIK","Preserves cash; PIK increases note balance","Proposed"],["Milestone funding","$1.25M Phase 1 + $1.75M Phase 2","Phase 2 depends on $1.0M ARR run-rate","Proposed"],["Conversion terms","20% discount / $12M cap / $5M trigger","No conversion event forecast through 2029","Illustrative"],["Client growth","12 / 18 / 24 ending clients","Links growth capital to operating scale","Implemented"],["Sales funnel","Leads → demos → pilots → clients","Requires CRM and contract evidence","Implemented"],["Operating cash flow","Shown excluding financing","Separates economics from fundraising","Implemented"],["Section 163(j)","30% ATI stress test","Small-business exception not concluded","Implemented"],["Professional review","PPM, note, ASC 606/815 and tax","Final documents remain subject to advisers","Required"]];
s.mergeCells("G14:J16"); s.getRange("G14").values=[["Forward-looking statement: These projections are management estimates, not guarantees. They assume successful fundraising, client acquisition, pricing, collections, cost control, and continued operations. Actual results may differ materially. Rule 506(c), note terms, tax treatment, and final PPM disclosures require qualified legal and accounting review."]]; s.getRange("G14:J16").format={fill:"#FFF4E5",font:{italic:true,color:"#7A2E0E"},wrapText:true,verticalAlignment:"top"};
s.getRange("B5:E15").format.numberFormat=moneyFmt; s.getRange("B18:B20").format.numberFormat=moneyFmt; s.getRange("C18:C20").format.numberFormat=pctFmt; for(const r of [8,10,13,14,15]) section(s,`A${r}:E${r}`); s.getRange("A:A").format.columnWidth=34; s.getRange("B:E").format.columnWidth=16; s.getRange("F:F").format.columnWidth=3; s.getRange("G:G").format.columnWidth=25; s.getRange("H:I").format.columnWidth=31; s.getRange("J:J").format.columnWidth=18; s.freezePanes.freezeRows(4);

// Global polish
for(const sh of [a,cr,rev,op,note,inc,cf,u,sc,be,sf,tx,co,s]){
  const used=sh.getUsedRange(); used.format.font={name:"Aptos",size:10}; used.format.verticalAlignment="center";
}
await wb.comments.setSelf({displayName:"User"});
wb.comments.addThread({cell:a.getRange("B6")},"Proposed 4% cash coupon. The separate 5% PIK rate is shown in B24; together they preserve the 9% total contractual yield assumption before effective-interest adjustments.");
wb.comments.addThread({cell:a.getRange("B8")},"Illustrative conversion terms are disclosed, but no qualifying financing or conversion event is forecast through 2029.");
wb.comments.addThread({cell:a.getRange("B16")},"Management target is shown separately from the Base Case and is not treated as contracted revenue.");

// Compact verification and preview set
const check=await wb.inspect({kind:"table",range:"'Investor Summary'!A1:J20",include:"values,formulas",tableMaxRows:25,tableMaxCols:12}); console.log(check.ndjson);
const errors=await wb.inspect({kind:"match",searchTerm:"#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A",options:{useRegex:true,maxResults:300},summary:"final formula error scan"}); console.log(errors.ndjson);
for(const [name,range] of [["Investor Summary","A1:J20"],["Assumptions","A1:H29"],["Client Ramp","A1:M21"],["Revenue Model","A1:AL14"],["Operating Model","A1:AL13"],["Convertible Note","A1:AO24"],["Income Statement","A1:AL12"],["Cash Flow","A1:AL18"],["Use of Proceeds","A1:D22"],["Scenario Analysis","A1:F13"],["Break-Even","A1:C13"],["Sales Funnel","A1:E15"],["Tax & 163j","A1:E15"],["Compliance Roadmap","A1:F12"]]){
 const img=await wb.render({sheetName:name,range,scale:1,format:"png"}); await fs.writeFile(`preview_${name.replaceAll(" ","_")}.png`,new Uint8Array(await img.arrayBuffer()));
}
const output=await SpreadsheetFile.exportXlsx(wb); await output.save(OUT); console.log(`SAVED ${OUT}`);
