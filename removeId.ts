#!/usr/bin/env bun

import { readFileSync, writeFileSync } from "node:fs";
import { parse } from "csv-parse/sync";

/**
 * Simple CSV stringifier
 * - Preserves column order
 * - Handles quoting, commas, newlines, and double-quotes
 */
function csvStringify(rows: any[], headers: string[]): string {
  const escapeCell = (value: any) => {
    const str = value == null ? "" : String(value);
    if (/[,"\n]/.test(str)) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const headerLine = headers.join(",");
  const dataLines = rows.map(row =>
    headers.map(h => escapeCell(row[h] ?? "")).join(",")
  );

  return [headerLine, ...dataLines].join("\n");
}

async function main() {
  const removePath = "./remove.csv";     // <-- your remove file
  const updatePath = "./update.csv";     // <-- your update file
  const outputPath = "./hey.csv";

  // Read CSV files
  const removeRaw = readFileSync(removePath, "utf8");
  const updateRaw = readFileSync(updatePath, "utf8");

  const removeRows = parse(removeRaw, { columns: true, skip_empty_lines: true });
  const updateRows = parse(updateRaw, { columns: true, skip_empty_lines: false });

  // Collect all ID values from remove CSV
  const removeSet = new Set<string>();
  removeRows.forEach(row => {
    Object.values(row).forEach(v => {
      const s = String(v).trim();
      if (s !== "") removeSet.add(s);
    });
  });

  // Auto detect ID column in update CSV
  const headers = Object.keys(updateRows[0]);
  let bestCol = "";
  let bestCount = 0;

  headers.forEach(col => {
    let count = 0;
    updateRows.forEach(row => {
      if (removeSet.has(String(row[col]).trim())) count++;
    });
    if (count > bestCount) {
      bestCount = count;
      bestCol = col;
    }
  });

  console.log("Detected ID column:", bestCol);

  // Filter rows
  const filtered = updateRows.filter(row => {
    const val = String(row[bestCol] ?? "").trim();
    return !removeSet.has(val);
  });

  // Write output CSV
  writeFileSync(outputPath, csvStringify(filtered, headers), "utf8");

  console.log(`Done. Removed ${updateRows.length - filtered.length} rows.`);
  console.log(`Saved filtered CSV → ${outputPath}`);
}

main();
