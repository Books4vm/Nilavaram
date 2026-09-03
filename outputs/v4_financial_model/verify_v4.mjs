import { FileBlob, SpreadsheetFile } from "@oai/artifact-tool";
const wb=await SpreadsheetFile.importXlsx(await FileBlob.load("SVT_Nexus_Financial_Model_V4.xlsx"));
for(const range of ["'Investor Summary'!A4:J20","'Revenue Model'!A3:N14","'Operating Model'!A3:N13","'Sales Funnel'!A4:E15","'Tax & 163j'!A4:E11","'Convertible Note'!A18:AO24"]){
 const x=await wb.inspect({kind:"table",range,include:"values,formulas",tableMaxRows:30,tableMaxCols:50}); console.log(x.ndjson);
}
const e=await wb.inspect({kind:"match",searchTerm:"#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A",options:{useRegex:true,maxResults:300},summary:"V4 formula error scan"}); console.log(e.ndjson);
