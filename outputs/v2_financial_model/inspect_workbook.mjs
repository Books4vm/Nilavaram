import { FileBlob, SpreadsheetFile } from "@oai/artifact-tool";
import fs from "node:fs/promises";

const input = await FileBlob.load("SVT_Nexus_Financial_Model_V1_Source.xlsx");
const workbook = await SpreadsheetFile.importXlsx(input);
const sheets = await workbook.inspect({ kind: "sheet", include: "id,name" });
console.log(sheets.ndjson);
const ranges = {"Investor Summary":"A1:H15","Assumptions":"A1:H29","Revenue Model":"A1:AL11","Operating Model":"A1:AL13","Cash Flow":"A1:AL14"};
for (const name of Object.keys(ranges)) {
  try {
    const table = await workbook.inspect({ kind: "table", range: `'${name}'!${ranges[name]}`, include: "values,formulas", tableMaxRows: 80, tableMaxCols: 52 });
    console.log(`\n--- ${name} ---\n${table.ndjson}`);
    const img = await workbook.render({ sheetName: name, autoCrop: "all", scale: 1, format: "png" });
    await fs.writeFile(`source_${name.replaceAll(" ", "_")}.png`, new Uint8Array(await img.arrayBuffer()));
  } catch (error) {
    console.log(`ERROR ${name}: ${error}`);
  }
}
