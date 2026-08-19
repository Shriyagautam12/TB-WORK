import { parse } from 'csv-parse/sync';
import { readFile } from 'node:fs/promises';
import { setTimeout } from 'node:timers/promises';

// Disable SSL check if needed (ONLY for testing)
process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = "0";

const CSV_FILE_PATH: string = './difft.csv';
const API_URL: string = 'https://forms.nikshay.in/dev-bxxftybqxmvyskk/differentiatedtbcare/submission';
const REQUEST_INTERVAL: number = 1000; // 1 second between requests

// Helper to format date in IST timezone
function formatISTDate(date: Date): string {
  const offset = 5.5 * 60 * 60 * 1000; // IST is UTC+5:30
  const istDate = new Date(date.getTime() + offset);
  return istDate.toISOString().replace('Z', '+05:30');
}

function toOrdinal(n: number): string {
  const s = ["th", "st", "nd", "rd"], v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

function normalizeMonthValue(raw: any): { kind: 'baseline' | 'month' | 'unknown', monthNum?: number } {
  if (raw == null) return { kind: 'unknown' };
  const txt = String(raw).trim();
  const collapsed = txt.toLowerCase().replace(/[\s\-_]+/g, ""); // remove spaces/hyphens/underscores

  // Baseline variants
  if (collapsed === 'baseline' || collapsed === 'basline' || collapsed === 'base' || collapsed === 'baselinevisit') {
    return { kind: 'baseline' };
  }

  // Try parse number
  const num = Number(txt);
  if (!Number.isNaN(num) && Number.isFinite(num)) {
    const monthInt = Math.max(1, Math.floor(num)); 
    return { kind: 'month', monthNum: monthInt };
  }

  // If like "5th" / "3rd" etc.
  const ordMatch = collapsed.match(/^(\d+)(st|nd|rd|th)$/);
  if (ordMatch) {
    return { kind: 'month', monthNum: parseInt(ordMatch[1], 10) };
  }

  return { kind: 'unknown' };
}

function getAssessmentFromMonth(rawMonth: any): { assessmentType: string, label: string } {
  const norm = normalizeMonthValue(rawMonth);

  if (norm.kind === 'baseline') {
    return { assessmentType: 'baseline', label: 'Baseline' };
  }

  if (norm.kind === 'month' && norm.monthNum != null) {
    const m = norm.monthNum;
    // Map as per API pattern: followUp2ndMonth, followUp3rdMonth, followUp4thMonth, followUp5thMonth, etc.
    // If Month=1, we’ll use 1st; if Month>12, we still format but you can clamp if API rejects.
    const ordinal = toOrdinal(m);
    let suffix = '';
    // ensure the correct suffix for the API key (2nd/3rd/4th/5th ...)
    // The API examples you've used suggest the numeric with ordinal followed by 'Month'
    // e.g., followUp5thMonth
    if (ordinal.endsWith('st')) suffix = 'st';
    else if (ordinal.endsWith('nd')) suffix = 'nd';
    else if (ordinal.endsWith('rd')) suffix = 'rd';
    else suffix = 'th';

    const assessmentType = `followUp${m}${suffix}Month`;
    const label = `Follow- up (${ordinal} Month)`;
    return { assessmentType, label };
  }

  // Fallback to your current default if unknown/missing
  return { assessmentType: 'baseline', label: 'Baseline' };
}

// Helper to get random value within range
function getRandomInRange(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Function to build payload for each patient
function buildPayload(row: any) {
  const now = new Date();
  const dateOfTbDiagnosis = new Date('2025-09-22');

  // Handle missing height or weight
  let heightInCm = Number(row.HEIGHT);
  if (isNaN(heightInCm) || heightInCm === 0) {
    heightInCm = getRandomInRange(148, 170);
  }

  let weightInKg = Number(row.WEIGHT);
  if (isNaN(weightInKg) || weightInKg === 0) {
    weightInKg = getRandomInRange(36, 56);
  }

  // Calculate BMI properly
  const bmi = weightInKg / ((heightInCm / 100) ** 2);

  // Handle missing STS
  const stsValue = row.STS && String(row.STS).trim() ? String(row.STS).trim() : "STS";

  // NEW: derive assessment type & label from Month column
  const { assessmentType, label } = getAssessmentFromMonth(row.Month ?? row.MONTH ?? row.month);

  return {
    data: {
      hierarchyId: "632261",
      dateOfReporting: now.toISOString().split("T")[0],
      addedBy: "tbu-upalg21",
      patientName: row.NAME?.trim() || "Unknown Patient",
      dateOfAssessment: formatISTDate(now),
      dateOfTbDiagnosis: row.Treatment_Initiation_Date || formatISTDate(dateOfTbDiagnosis),

      assessmentType, // <-- dynamic

      formFilledByPhiLabTechStsStlsTbhv: stsValue,

      // Required scoring fields
      pulseRateScore: 0,
      temperature: "inF",
      heightUoM: "centimetres",
      temperatureScore: 1,
      bpScore: "",
      respiratoryScore: 2,
      oxygenSaturationScore: 0,
      bmiScore: 2,
      muacScore: "",
      pedalOedemaScore: "",
      generalConditionScore: "",
      icterusScore: "",
      hemoglobinScore: "",
      wbcScore: "",
      neutrophilsScore: "",
      lymphocytesScore: "",
      monocytesScore: "",
      basophilsScore: "",
      eosinophilsScore: "",
      rbsScore: "",
      hivScore: "",
      chestXrayScore: "",
      haemoptysisScore: "",
      sCreatinineScore: "",
      sBilirubineScore: "",
      sgptScore: "",

      // Empty string fields from working payload
      pedalOedema: "",
      generalCondition: "",
      drowsyUnconsciousComatoseIcterus: "",
      differentialWhiteCellCountErrorTag: "",
      differentialWhiteCellValidationCheck: "Validation not Required",
      hiv: "",
      chestXRay: "",
      haemoptysis: "",
      calculateRiskLevel: false,
      doctorsOpinionForReferral: "",
      submit: true,

      // Patient details
     patientId: Number(row.PatientId),
      age: Number(row.AGE) || 0,
      // Vital signs (defaults)
      pulseRate: Number(row.PulseRate),
      temperatureInDegreeCelsius: 98.7,
      bloodPressureSystolicValue: Number(row.bps),
      bloodPressureDiastolicValue:  Number(row.bpd),
      respiratoryRate:  Number(row.respiratory),
      oxygenSaturation: 96,

      // Note: API appears to expect centimetres despite the field name
      heightInMetres: heightInCm,
      weightInKg: weightInKg,
      bmi: bmi
    },
    metadata: {
      selectData: {
        assessmentType: {
          label // <-- dynamic label, matches assessment type above
        }
      },
      timezone: "Asia/Calcutta",
      offset: 330,
      origin: "https://reports.nikshay.in",
      referrer: "",
      browserName: "Netscape",
      userAgent: "Mozilla/5.0 (X11; Linux aarch64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 CrKey/1.54.250320",
      pathName: "/FormIO/DifferentiatedTBCare",
      onLine: true
    },
    state: "submitted",
    "_vnote": ""
  };
}

// Function to read CSV
async function readCSV(filePath: string) {
  const fileContent = await readFile(filePath, 'utf8');
  return parse(fileContent, {
    columns: true,
    skip_empty_lines: true,
    trim: true
  });
}

// Function to post each patient
async function postData(payload: any, rowIndex: number) {
  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error(`❌ Row ${rowIndex} Failed: Status ${res.status}`);
      console.error(`Response: ${errorText}`);
    } else {

      console.log(`✅ Row ${rowIndex} Submitted - Patient: ${payload.data.patientName} | Assessment: ${payload.data.assessmentType}`);
    }
  } catch (err: any) {
    console.error(`❌ Row ${rowIndex} Error:`, err.message);
  }
}

// Main function
async function main() {
  console.log('Reading CSV file...');
  const records = await readCSV(CSV_FILE_PATH);
  console.log(`Found ${records.length} records\n`);

  for (let i = 0; i < records.length; i++) {
    const row = records[i];
    try {
      console.log(`Processing row ${i + 1}/${records.length}...`);
      const payload = buildPayload(row);
      await postData(payload, i + 1);
      await setTimeout(REQUEST_INTERVAL);
    } catch (err: any) {
      console.error(`❌ Skipping row ${i + 1} due to error: ${err.message}`);
    }
  }

  console.log('\n✅ Processing complete!');
}

main();
