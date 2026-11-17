#!/usr/bin/env node

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, "..");
const SRC_DIR = path.join(ROOT, "src");

// Exclude copy registry definition itself from flagging its own blacklist
const EXCLUDED_FILES = new Set([
  path.normalize(path.join(SRC_DIR, "lib", "copy-registry.ts")),
]);

const violations = [];

function checkText(text, filePath) {
  const lines = text.split("\n");

  lines.forEach((lineText, index) => {
    const lineNum = index + 1;

    // 1. Check "مضمون 100%"
    if (lineText.includes("مضمون 100%")) {
      violations.push({
        file: filePath,
        line: lineNum,
        term: "مضمون 100%",
        snippet: lineText.trim(),
      });
    }

    // 2. Check "حسابات حقيقية"
    if (lineText.includes("حسابات حقيقية")) {
      violations.push({
        file: filePath,
        line: lineNum,
        term: "حسابات حقيقية",
        snippet: lineText.trim(),
      });
    }

    // 3. Check "الفعلي"
    if (lineText.includes("الفعلي")) {
      violations.push({
        file: filePath,
        line: lineNum,
        term: "الفعلي",
        snippet: lineText.trim(),
      });
    }

    // 4. Check "ضمان" / "مضمونة"
    if (
      lineText.includes("لضمان") ||
      lineText.includes("مضمونة") ||
      (lineText.includes("ضمان") && !lineText.includes("بدون ضمان"))
    ) {
      violations.push({
        file: filePath,
        line: lineNum,
        term: "ضمان / مضمونة",
        snippet: lineText.trim(),
      });
    }

    // 5. Check "مدقق" / "التدقيق"
    if (lineText.includes("مدقق") || lineText.includes("التدقيق")) {
      violations.push({
        file: filePath,
        line: lineNum,
        term: "مدقق / التدقيق",
        snippet: lineText.trim(),
      });
    }

    // 6. Check "معتمد" / "المعتمد" / "اعتماد" / "معتمدة" / "المعتمدة" - Allow credit hours ("ساعات معتمدة" / "الساعات المعتمدة")
    if (
      lineText.includes("معتمد") ||
      lineText.includes("المعتمد") ||
      lineText.includes("معتمدة") ||
      lineText.includes("المعتمدة") ||
      lineText.includes("اعتماد")
    ) {
      // Clean out allowed credit hours references
      const cleaned = lineText
        .replace(/ساعات\s+معتمدة/g, "")
        .replace(/الساعات\s+المعتمدة/g, "")
        .replace(/ساعاتٍ\s+معتمدة/g, "")
        .replace(/ساعة\s+معتمدة/g, "")
        .replace(/ساعةً\s+معتمدة/g, "");

      if (
        cleaned.includes("معتمد") ||
        cleaned.includes("المعتمد") ||
        cleaned.includes("معتمدة") ||
        cleaned.includes("المعتمدة") ||
        cleaned.includes("اعتماد")
      ) {
        violations.push({
          file: filePath,
          line: lineNum,
          term: "معتمد / اعتماد / معتمدة",
          snippet: lineText.trim(),
        });
      }
    }
  });
}

function walkDir(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== "node_modules" && entry.name !== ".next") {
        walkDir(fullPath);
      }
    } else if (
      entry.isFile() &&
      /\.(tsx?|jsx?|json)$/.test(entry.name) &&
      !EXCLUDED_FILES.has(path.normalize(fullPath))
    ) {
      // Don't scan raw mock json datasets that are static reference fixtures unless necessary
      if (
        entry.name.includes("faculties_public") ||
        entry.name.includes("faculties_tco")
      ) {
        continue;
      }
      const content = fs.readFileSync(fullPath, "utf-8");
      checkText(content, path.relative(ROOT, fullPath));
    }
  }
}

walkDir(SRC_DIR);

if (violations.length > 0) {
  console.error(`\x1b[31m[FAILED] Found ${violations.length} banned term violations in source code:\x1b[0m\n`);
  violations.forEach((v) => {
    console.error(` - ${v.file}:${v.line} -> [${v.term}]`);
    console.error(`   "${v.snippet}"\n`);
  });
  process.exit(1);
} else {
  console.log("\x1b[32m[PASSED] Zero banned terms detected. All legal compliance checks passed.\x1b[0m");
  process.exit(0);
}
