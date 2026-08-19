import { parse } from 'csv-parse/sync';
import { readFile } from 'node:fs/promises';
import { setTimeout } from 'node:timers/promises';

process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = "0";

const CSV_FILE_PATH = './diff009.csv';
const API_URL = 'https://forms.nikshay.in/dev-bxxftybqxmvyskk/differentiatedtbcare/submission';
const REQUEST_INTERVAL = 1000;

/* ---------- Helpers ---------- */

function formatIST(date: Date) {
  const iso = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
    .toISOString();
  return iso.replace('Z', '+05:30');
}

function csvDateToIST(dateStr: string) {
  const d = new Date(dateStr);
  return formatIST(d);
}

/* ---------- Payload Builder ---------- */

function buildPayload(row: any) {
  const now = new Date();

  const height = Number(row.Height) || 0;
  const weight = Number(row.Weight) || 0;

  const bmi =
    height && weight
      ? +(weight / ((height / 100) ** 2)).toFixed(6)
      : 0;

  return {
    data: {
      hierarchyId: "314381",
      dateOfReporting: formatIST(now).split('T')[0],
      addedBy: "tbu-upalg09",

      patientName: row.Patient_Name?.trim() || "",
      dateOfAssessment: row["Tr In Date"]
        ? csvDateToIST(row["Tr In Date"])
        : formatIST(now),

      dateOfTbDiagnosis: row.Diag_Date
        ? csvDateToIST(row.Diag_Date)
        : formatIST(now),

      assessmentType: "baseline",
      formFilledByPhiLabTechStsStlsTbhv: "",

      pulseRateScore: 0,
      temperature: "inF",
      heightUoM: "centimetres",

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

      temperatureScore: 1,
      bpScore: "",
      respiratoryScore: 2,
      oxygenSaturationScore: 0,

      bmi: bmi,
      bmiScore: bmi && bmi < 18.5 ? 1 : 0,

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

      patientId: Number(row.ID) || 0,
      age: Number(row.Age) || 0,

      pulseRate: Number(row.pulseRate)|| 89,
      temperatureInDegreeCelsius: 98.6,
      bloodPressureSystolicValue: Number(row.bps),
      bloodPressureDiastolicValue: Number(row.bpd),
      respiratoryRate: Number(row.respiratory),
      oxygenSaturation: Number(row.spo2)|| 98,

      weightInKg: weight || 0,
      heightInMetres: height || 0
    },

    metadata: {
      selectData: {
        assessmentType: { label: "Baseline" }
      },
      timezone: "Asia/Calcutta",
      offset: 330,
      origin: "https://reports.nikshay.in",
      referrer: "",
      browserName: "Netscape",
      userAgent:
        "Mozilla/5.0 (X11; Linux aarch64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36",
      pathName: "/FormIO/DifferentiatedTBCare",
      onLine: true
    },

    state: "submitted",
    _vnote: ""
  };
}

/* ---------- CSV Reader ---------- */

async function readCSV(path: string) {
  const content = await readFile(path, 'utf8');
  return parse(content, {
    columns: true,
    skip_empty_lines: true,
    trim: true
  });
}

/* ---------- API Call ---------- */

async function postData(payload: any, index: number) {
  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      console.error(`❌ Row ${index} failed`, await res.text());
    } else {
      console.log(
        `✅ Row ${index} submitted | ${payload.data.patientName}`
      );
    }
  } catch (e: any) {
    console.error(`❌ Row ${index} error`, e.message);
  }
}

/* ---------- Main ---------- */

async function main() {
  const rows = await readCSV(CSV_FILE_PATH);
  console.log(`Found ${rows.length} records\n`);

  for (let i = 0; i < rows.length; i++) {
    const payload = buildPayload(rows[i]);
    await postData(payload, i + 1);
    await setTimeout(REQUEST_INTERVAL);
  }

  console.log('\n✅ All records processed');
}

main();
