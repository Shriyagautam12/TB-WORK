import { parse } from 'csv-parse/sync';
import { readFile } from 'node:fs/promises';
import { setTimeout } from 'node:timers/promises';

// Disable SSL check if needed (ONLY for testing)
process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = "0";

const CSV_FILE_PATH: string = './diff20.csv';
const API_URL: string = 'https://forms.nikshay.in/dev-bxxftybqxmvyskk/differentiatedtbcare/submission';
const REQUEST_INTERVAL: number = 1000; // 1 second between requests

// Helper to format date in IST timezone (keeps ISO +05:30)
function formatISTDate(date: Date): string {
  // Convert to ISO then append +05:30 rather than 'Z'
  const iso = new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString();
  // iso is like 2025-11-29T10:00:00.000Z -> remove Z and append +05:30
  return iso.replace('Z', '+05:30');
}

function toOrdinal(n: number): string {
  const s = ["th", "st", "nd", "rd"], v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

function normalizeMonthValue(raw: any): { kind: 'baseline' | 'month' | 'unknown', monthNum?: number } {
  if (raw == null) return { kind: 'unknown' };
  const txt = String(raw).trim();
  const collapsed = txt.toLowerCase().replace(/[\s\-_]+/g, "");
  if (collapsed === 'baseline' || collapsed === 'basline' || collapsed === 'base' || collapsed === 'baselinevisit') {
    return { kind: 'baseline' };
  }
  const num = Number(txt);
  if (!Number.isNaN(num) && Number.isFinite(num)) {
    const monthInt = Math.max(1, Math.floor(num));
    return { kind: 'month', monthNum: monthInt };
  }
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
    const ordinal = toOrdinal(m);
    let suffix = '';
    if (ordinal.endsWith('st')) suffix = 'st';
    else if (ordinal.endsWith('nd')) suffix = 'nd';
    else if (ordinal.endsWith('rd')) suffix = 'rd';
    else suffix = 'th';
    const assessmentType = `followUp${m}${suffix}Month`;
    const label = `Follow- up (${ordinal} Month)`;
    return { assessmentType, label };
  }
  // fallback
  return { assessmentType: 'baseline', label: 'Baseline' };
}

function getRandomInRange(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// --- Updated buildPayload: reads values from row, fallbacks to (example) defaults or sensible values ---
function buildPayload(row: any) {
  const now = new Date();

  // If CSV has explicit fields like hierarchyId, dateOfReporting, addedBy, etc., use them; otherwise use defaults
  const hierarchyId = String(row.hierarchyId ?? row.HIERARCHYID ?? row.hierarchy_id ?? "314409");
  const dateOfReporting = (row.dateOfReporting || row.DateOfReporting || row['Date Of Reporting'])
    ? String(row.dateOfReporting || row.DateOfReporting || row['Date Of Reporting']).split('T')[0]
    : formatISTDate(now).split('T')[0];

  const addedBy = row.addedBy || row.AddedBy || row.added_by || "tbu-upalg20";
  const patientName = (row.patientName || row.NAME || row.Name || row.name || "Unknown Patient").toString().trim();

  // Accept explicit dateOfAssessment if present, else now
  const dateOfAssessmentRaw = row.dateOfAssessment || row.DateOfAssessment || row['Date Of Assessment'];
  const dateOfAssessment = dateOfAssessmentRaw
    ? String(dateOfAssessmentRaw)
    : formatISTDate(now);

  // Accept explicit dateOfTbDiagnosis if present else try Treatment_Initiation_Date else example fallback
  const dateOfTbDiagnosisRaw = row.dateOfTbDiagnosis || row.DateOfTbDiagnosis || row.Treatment_Initiation_Date || row['Treatment_Initiation_Date'] || row['Treatment_Initiation Date'];
  const dateOfTbDiagnosis = dateOfTbDiagnosisRaw ? String(dateOfTbDiagnosisRaw) : formatISTDate(new Date('2025-09-22'));

  // assessmentType: prefer explicit field, else derive from Month column
  let assessmentType = row.assessmentType || row.AssessmentType || row.assessment_type;
  let assessmentLabel = undefined;
  if (!assessmentType) {
    const { assessmentType: atype, label } = getAssessmentFromMonth(row.Month ?? row.MONTH ?? row.month);
    assessmentType = atype;
    assessmentLabel = label;
  } else {
    // normalize label if provided
    assessmentLabel = (row.metadata && row.metadata.selectData && row.metadata.selectData.assessmentType && row.metadata.selectData.assessmentType.label)
      || row.assessmentLabel || row.AssessmentLabel || `Baseline`;
  }

  // STS / formFilledByPhi... field
  const stsValue = (row.STS && String(row.STS).trim()) || (row.sts && String(row.sts).trim()) || "STS";

  // Height & weight handling
  // Accept HIGHT / HEIGHT / height in cm OR heightInMetres (meters)
  let heightInCm = Number(row.HIGHT ?? row.HEIGHT ?? row.Height ?? row.heightInCm ?? row.heightInMetres ?? row.heightInMetre ?? row.height);
  if (isNaN(heightInCm) || heightInCm === 0) {
    // if user gave meters (like 1.69), convert
    const maybeMeters = Number(row.heightInMetres ?? row.heightInMetre ?? row.heightMeters);
    if (!Number.isNaN(maybeMeters) && maybeMeters > 0 && maybeMeters < 3) {
      heightInCm = Math.round(maybeMeters * 100);
    } else {
      // fallback random
      heightInCm = getRandomInRange(148, 170);
    }
  }

  let weightInKg = Number(row.WEIGHT ?? row.Weight ?? row.weightInKg ?? row.weight);
  if (isNaN(weightInKg) || weightInKg === 0) {
    weightInKg = getRandomInRange(36, 56);
  }

  // compute BMI; ensure non-zero height
  const heightMeters = (heightInCm / 100) || 1;
  const bmi = +(weightInKg / (heightMeters ** 2)).toFixed(6);

  // patientId and age
  const patientId = Number(row["NIKSHAY ID"] ?? row.nikshayId ?? row.patientId ?? row.patientID ?? row.patient_id) || Number(row.patientIdFromPayload) || 0;
  const age = Number(row.AGE ?? row.Age ?? row.age) || 0;

  // Vital signs: prefer CSV values, otherwise use example/defaults
  const pulseRate = Number(row.pulseRate ?? row.PULSE ?? row.Pulse) || Number(row.PulseRate) || 95 || 89;
  const temperatureInDegreeCelsius = Number(row.temperatureInDegreeCelsius ?? row.TEMP_C ?? row.temperatureC ?? row.temperature) || Number(row.temperatureInC) || 98.7 || 100;
  const bloodPressureSystolicValue = Number(row.bpsystolic ?? row.bpsystolicvalue ?? row.BLOOD_PRESSURE_SYSTOLIC ?? row.bloodPressureSystolicValue) || Number(row.bpSystolic) || 80 || 78;
  const bloodPressureDiastolicValue = Number(row.bpdiastolic ?? row.bpdiastolicvalue ?? row.BLOOD_PRESSURE_DIASTOLIC ?? row.bloodPressureDiastolicValue) || Number(row.bpDiastolic) || 110 || 97;
  const respiratoryRate = Number(row.respiratoryRate ?? row.RESPIRATORY_RATE ?? row.RR) || 15 || 26;
  const oxygenSaturation = Number(row.oxygenSaturation ?? row.SpO2 ?? row.OXYGEN_SATURATION) || 94 || 96;

  // Scores: allow CSV override, else sensible default or compute where possible
  const pulseRateScore = (row.pulseRateScore !== undefined) ? Number(row.pulseRateScore) : (pulseRate > 100 ? 1 : 0);
  const temperatureScore = (row.temperatureScore !== undefined) ? Number(row.temperatureScore) : (temperatureInDegreeCelsius >= 100.4 ? 1 : 0);
  const respiratoryScore = (row.respiratoryScore !== undefined) ? Number(row.respiratoryScore) : (respiratoryRate > 24 ? 2 : 0);
  const oxygenSaturationScore = (row.oxygenSaturationScore !== undefined) ? Number(row.oxygenSaturationScore) : (oxygenSaturation < 95 ? 1 : 0);
  const bmiScore = (row.bmiScore !== undefined) ? Number(row.bmiScore) : (bmi < 18.5 ? 1 : 0);

  // Build final payload using values above; keep other fields you had as defaults
  const payload = {
    data: {
      hierarchyId: String(hierarchyId),
      dateOfReporting: String(dateOfReporting),
      addedBy: String(addedBy),
      patientName: patientName,
      dateOfAssessment: String(dateOfAssessment),
      dateOfTbDiagnosis: String(dateOfTbDiagnosis),

      assessmentType: String(assessmentType), // dynamic

      formFilledByPhiLabTechStsStlsTbhv: stsValue,

      // Scoring/vitals — prefer csv values (we already computed fallback variables)
      pulseRateScore: pulseRateScore,
      temperature: "inF", // keep original literal if API expects it
      heightUoM: "centimetres",
      temperatureScore: temperatureScore,
      bpScore: row.bpScore ?? "",
      respiratoryScore: respiratoryScore,
      oxygenSaturationScore: oxygenSaturationScore,
      bmi: bmi,
      bmiScore: bmiScore,
      muacScore: row.muacScore ?? "",
      pedalOedemaScore: row.pedalOedemaScore ?? "",
      generalConditionScore: row.generalConditionScore ?? "",
      icterusScore: row.icterusScore ?? "",
      hemoglobinScore: row.hemoglobinScore ?? "",
      wbcScore: row.wbcScore ?? "",
      neutrophilsScore: row.neutrophilsScore ?? "",
      lymphocytesScore: row.lymphocytesScore ?? "",
      monocytesScore: row.monocytesScore ?? "",
      basophilsScore: row.basophilsScore ?? "",
      eosinophilsScore: row.eosinophilsScore ?? "",
      rbsScore: row.rbsScore ?? "",
      hivScore: row.hivScore ?? "",
      chestXrayScore: row.chestXrayScore ?? "",
      haemoptysisScore: row.haemoptysisScore ?? "",
      sCreatinineScore: row.sCreatinineScore ?? "",
      sBilirubineScore: row.sBilirubineScore ?? "",
      sgptScore: row.sgptScore ?? "",

      // Empty string fields from working payload
      pedalOedema: row.pedalOedema ?? "",
      generalCondition: row.generalCondition ?? "",
      drowsyUnconsciousComatoseIcterus: row.drowsyUnconsciousComatoseIcterus ?? "",
      differentialWhiteCellCountErrorTag: row.differentialWhiteCellCountErrorTag ?? "",
      differentialWhiteCellValidationCheck: row.differentialWhiteCellValidationCheck ?? "Validation not Required",
      hiv: row.hiv ?? "",
      chestXRay: row.chestXRay ?? "",
      haemoptysis: row.haemoptysis ?? "",
      calculateRiskLevel: (row.calculateRiskLevel !== undefined) ? Boolean(row.calculateRiskLevel) : false,
      doctorsOpinionForReferral: row.doctorsOpinionForReferral ?? "",
      submit: (row.submit !== undefined) ? Boolean(row.submit) : true,

      // Patient details
      patientId: Number(patientId) || 0,
      age: Number(age) || 0,

      // Vital signs
      pulseRate: Number(pulseRate),
      temperatureInDegreeCelsius: Number(temperatureInDegreeCelsius),
      bloodPressureSystolicValue: Number(bloodPressureSystolicValue),
      bloodPressureDiastolicValue: Number(bloodPressureDiastolicValue),
      respiratoryRate: Number(respiratoryRate),
      oxygenSaturation: Number(oxygenSaturation),

      // Height & weight — API appears to expect centimetres in heightInMetres on earlier payload; set both explicitly
      heightInMetres: +heightInCm, // keep your previous field name but value in CM (to match your earlier API)
      heightInCentimetres: +heightInCm,
      weightInKg: +weightInKg,
      bmi: +bmi
    },
    metadata: {
      selectData: {
        assessmentType: {
          label: assessmentLabel || (row.metadata?.selectData?.assessmentType?.label ?? "Baseline")
        }
      },
      timezone: row.metadata?.timezone ?? "Asia/Calcutta",
      offset: Number(row.metadata?.offset ?? 330),
      origin: row.metadata?.origin ?? "https://reports.nikshay.in",
      referrer: row.metadata?.referrer ?? "",
      browserName: row.metadata?.browserName ?? "Netscape",
      userAgent: row.metadata?.userAgent ?? "Mozilla/5.0 (X11; Linux aarch64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 CrKey/1.54.250320",
      pathName: row.metadata?.pathName ?? "/FormIO/DifferentiatedTBCare",
      onLine: row.metadata?.onLine ?? true
    },
    state: row.state ?? "submitted",
    "_vnote": row._vnote ?? ""
  };

  return payload;
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

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
