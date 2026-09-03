import { FileBlob, SpreadsheetFile } from "@oai/artifact-tool";
const input=await FileBlob.load("SVT_Nexus_Financial_Model_V2.xlsx");
const wb=await SpreadsheetFile.importXlsx(input);
for(const range of ["'Investor Summary'!A4:E20","'Assumptions'!A4:H21","'Convertible Note'!A18:AO22","'Use of Proceeds'!A4:D16","'Break-Even'!A4:C13"]){
 const x=await wb.inspect({kind:"table",range,include:"values,formulas",tableMaxRows:30,tableMaxCols:50}); console.log(x.ndjson);
}
const e=await wb.inspect({kind:"match",searchTerm:"#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A",options:{useRegex:true,maxResults:300},summary:"post-export error scan"}); console.log(e.ndjson);
