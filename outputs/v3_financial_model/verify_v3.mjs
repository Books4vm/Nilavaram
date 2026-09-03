import { FileBlob, SpreadsheetFile } from "@oai/artifact-tool";
const wb=await SpreadsheetFile.importXlsx(await FileBlob.load("SVT_Nexus_Financial_Model_V3.xlsx"));
for(const range of ["'Investor Summary'!A4:J20","'Assumptions'!A4:D29","'Convertible Note'!A18:AO24","'Use of Proceeds'!A4:D22","'Sales Funnel'!A4:E15","'Tax & 163j'!A4:E15"]){
 const x=await wb.inspect({kind:"table",range,include:"values,formulas",tableMaxRows:35,tableMaxCols:50}); console.log(x.ndjson);
}
const e=await wb.inspect({kind:"match",searchTerm:"#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A",options:{useRegex:true,maxResults:300},summary:"V3 post-export formula error scan"}); console.log(e.ndjson);
