import fs from "node:fs/promises";
import { SpreadsheetFile, Workbook } from "@oai/artifact-tool";

const sourcePath = "launch/pinterest-release/pinterest-pin-plan.json";
const outputPath = "launch/pinterest-release/pinterest-pin-plan.xlsx";
const previewPath = "launch/pinterest-release/pinterest-pin-plan-preview.png";
const rows = JSON.parse(await fs.readFile(sourcePath, "utf8"));
const workbook = Workbook.create();

const summary = workbook.worksheets.add("Summary");
summary.showGridLines = false;
summary.getRange("A1:F1").merge();
summary.getRange("A1").values = [["Pinterest Release Plan"]];
summary.getRange("A2:F2").merge();
summary.getRange("A2").values = [["99 original Pins across Birthday and Crochet, ready for Pinterest CSV bulk upload."]];
summary.getRange("A4:B8").values = [
  ["Metric", "Count"],
  ["All Pins", rows.length],
  ["Crochet Pins", rows.filter((row) => row.channel === "crochet").length],
  ["Birthday Pins", rows.filter((row) => row.channel === "birthday").length],
  ["Unique destinations", new Set(rows.map((row) => row.slug)).size],
];
summary.getRange("D4:F8").values = [
  ["Workflow", "Use", "Status"],
  ["1", "Upload the matching CSV", "Ready"],
  ["2", "Confirm board names in Pinterest", "Check once"],
  ["3", "Keep the scheduled publish dates", "30 per day"],
  ["4", "Review URLs after the site deploy", "Required"],
];
summary.getRange("A10:F10").merge();
summary.getRange("A10").values = [["Scheduled at 30 Pins per day across the full day from September 4, 2026. Upload the combined CSV once, or upload the two channel files—never both."]];

const plan = workbook.worksheets.add("Pin Plan");
plan.showGridLines = false;
const headers = ["Channel","Slug","Variant","Creative format","Title","Pinterest board","Description","Destination link","Media URL","Publish date","Keywords","QA status"];
const values = rows.map((row) => [row.channel,row.slug,row.variant,row.format || "utility_static",row.title,row.board,row.description,row.link,row.mediaUrl,row.publishDate,row.keywords,"Ready"]);
plan.getRangeByIndexes(0,0,values.length + 1,headers.length).values = [headers,...values];
plan.tables.add(`A1:L${values.length + 1}`, true, "PinterestPinPlan");
plan.freezePanes.freezeRows(1);
plan.getRange(`A2:A${values.length + 1}`).dataValidation = { rule: { type: "list", values: ["birthday","crochet"] } };
plan.getRange(`L2:L${values.length + 1}`).dataValidation = { rule: { type: "list", values: ["Ready","Scheduled","Published","Needs review"] } };

const headerFormat = { fill: "#263a34", font: { color: "#ffffff", bold: true }, verticalAlignment: "center", wrapText: true };
summary.getRange("A1:F1").format = { fill: "#263a34", font: { color: "#ffffff", bold: true, size: 20 }, verticalAlignment: "center" };
summary.getRange("A2:F2").format = { fill: "#e7eee8", font: { color: "#263a34", italic: true }, wrapText: true };
summary.getRange("A4:B4").format = headerFormat;
summary.getRange("D4:F4").format = headerFormat;
summary.getRange("A10:F10").format = { fill: "#fff2d8", font: { color: "#4b3b24" }, wrapText: true };
summary.getRange("A1:F10").format.borders = { preset: "outside", style: "thin", color: "#cbd5ce" };
summary.getRange("A1:F10").format.rowHeight = 24;
summary.getRange("A1:F1").format.rowHeight = 38;
summary.getRange("A10:F10").format.rowHeight = 52;
summary.getRange("A:F").format.columnWidth = 22;
summary.getRange("D:D").format.columnWidth = 11;
summary.getRange("E:E").format.columnWidth = 42;
summary.getRange("F:F").format.columnWidth = 18;

plan.getRange("A1:L1").format = headerFormat;
plan.getRange("A1:L1").format.rowHeight = 34;
plan.getRange(`A2:L${values.length + 1}`).format = { verticalAlignment: "top", wrapText: true };
plan.getRange(`A1:L${values.length + 1}`).format.borders = { preset: "all", style: "thin", color: "#e3e7e4" };
plan.getRange("A:A").format.columnWidth = 12;
plan.getRange("B:B").format.columnWidth = 30;
plan.getRange("C:C").format.columnWidth = 9;
plan.getRange("D:D").format.columnWidth = 18;
plan.getRange("E:E").format.columnWidth = 36;
plan.getRange("F:F").format.columnWidth = 27;
plan.getRange("G:G").format.columnWidth = 54;
plan.getRange("H:I").format.columnWidth = 46;
plan.getRange("J:J").format.columnWidth = 19;
plan.getRange("K:K").format.columnWidth = 35;
plan.getRange("L:L").format.columnWidth = 16;
plan.getRange(`A2:L${values.length + 1}`).format.rowHeight = 52;

await fs.mkdir("launch/pinterest-release", { recursive: true });
const output = await SpreadsheetFile.exportXlsx(workbook);
await output.save(outputPath);
const preview = await workbook.render({ sheetName: "Summary", autoCrop: "all", scale: 1, format: "png" });
await fs.writeFile(previewPath, new Uint8Array(await preview.arrayBuffer()));
const inspection = await workbook.inspect({ kind: "sheet,table,region", maxChars: 3000, tableMaxRows: 4, tableMaxCols: 6 });
process.stdout.write(`${inspection.ndjson}\nCreated ${outputPath}\n`);
