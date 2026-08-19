import axios from "axios";
import fs from "fs";
import { parse } from "csv-parse/sync";

process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = "0";

const INPUT_FILE = "./ids.csv";
const REQUEST_INTERVAL_MS = 200;

const GET_URL = "https://www.nikshay.in/Api/Patients/BasicDetails";
const POST_URL = "https://www.nikshay.in/api/Patients/TreatmentDetails";

const COOKIE = `ai_user=c9Q7B|2025-10-02T10:27:39.438Z; _pk_id.2.2fe8=b6ce6660f9394a06.1759400860.; TiPMix=6.553688166597316; x-ms-routing-name=self; ASP.NET_SessionId=pq0pmtkbgv1uicid0xed1mu0; _pk_ref.2.2fe8=%5B%22%22%2C%22%22%2C1773758471%2C%22https%3A%2F%2Fsso.nikshay.in%2Fv1%2Fsso%2Flogin%3FreturnUrl%3Dhttps%3A%2F%2Fwww.nikshay.in%2FHome%26clientId%3D29%22%5D; _pk_ses.2.2fe8=1; SSOAuthorizationCookie=eyJhbGciOiJSUzI1NiJ9.eyJqdGkiOiIxMDY4Mjc1MTIiLCJpYXQiOjE3NzM3NTg1MDAsInN1YiI6InRidS11cGFsZzIxIiwiaXNzIjoiZXZlcndlbGwiLCJwYXNzd29yZFJlc2V0T24iOiIxNzc1ODIzMjMzNDc0Iiwic3NvVXNlcklkIjoiMTIzODEzIiwiYXV0aG9yaXplZENsaWVudHMiOiIyOSIsImV4cCI6MTc3MzgwMTcwMH0.Tnn5RayPWtrdWAxA17C-mpHZ12JXQI086sqObBgoq5kzfD9W7OcTO7gicyZ-4yAlJYQvPdsSbLYpeaDKNtgQshmo5XxFCzoTKroeTRaoTA4g1uwoElDC0yEoaOJdIgQjukaD4ec0OGPiHkMIJVLUIWbXZabuEZL4zJ_EyhUboXPzvrDctqMuGNWLDOFcZ34PhjfAGQP9A4QUyBjQQPwtC4vSPzcA9-jVh6x7sOqKzahkEPU1a547PRVrPi9Uxl4HfFB0dhJ4PX9sa6Huqzn52NRe45LEtgmUx9Dz9tqiiN_dqFoRNoGO8KtAEQWFrha2zL0r6qhm5uZEIiU2SpXHww; .AspNet.ApplicationCookie=3rBXVPsJouop1OTgCPGkk-ovBFgs542ymh6Bz0zjCiirbdxmT1HKjU_8ezB_EdQyFHAKLk5P_GfgkTP3EHkubdknygMfQZdxK0EPQffIQMfvA2KVti4Abt1qTb2GRJz2Ag8K8GJsxhJ5pfoQhLFzaPf6OVp25w5cNDpu-js2MnEEJFG3Hw-ahSpMhg8wgHe2fDFOfbZzltAc-zhRcZ7bU13ftGb3OJ0MPHTqAZv-hfeUaqj4pnWm3OUrDol-qaFk9t-TBwZWsPBYIgp6T_doIBHIZGoV6Kn901qIrRhDkn2AjLfAlVk9PRc-9FWoI5-zqq1AdFRWOr2GnL1O9qU0GWbihdFtzD-EZdbcCOxr7W_l41-jNnVORWSBFu_4WirwxPHo7UdXlX4Or8VUJCckvGJkQ1fS1WRY03SmEAg4Z7LINmWoP8wlruThuMswuYE06yovZMCecsnuRixn5PAxRykZYE3h9GmimF_MMEQ7bdjaRDUdAn7xBrLedKuA3iLnjW7m0rEf_JsmF8VkSz14KK_k8QFOC1Cuj0JB2jau-iSiobZkLIf3vrTmUgOr4hSrj4kFlGuKEnJUaKgR9ZZIbShO5Ememv6mEktBQuYwQdTxex9LsbVcX4XqvNGL_Hwmnb12dj9LKwV3IPyB5nrSbS4dSzyFEBP19V6WEuzLskI0l0XrgFyL7MsWCs6DM42bAOWlhQffoB1rIkZRnd2-6HEbX2_fcDNbh7himyD_A3_fJNZKfyiIPVASsDBCWe10AFDMOReXai_m9Ygf_oK_qsUdnllnlGIYmIQrxsCEJOcc30s8KeFJ4aZ8vcv6JPrl7UkuOQR1ohwIBD-RuHXBjnbowb5kZXqseTXaAAkppJBogpD_HiQPHLjkuPfH_bH2AlJKNYvFi4-DHddofSZ9mTmSTjJCN5r-QhODScJ18Gda4bOW2nmGVE0NcrWMj6LN-cI-lPNopsADVFrptEGmguBL_PLwrLMs2cs3ZBaeY9F44OLNz3-67JcycGIjS71U0pmbNZ-hjCGIDUV-vgSiCylLzcNL6tJeGc-5WsnEUR7N2eTtRnWNZdn4atEdYbYzmbUJmunvjn4bTZi_WG_QXA4yCw-Qu3gVx_1VpyZH6LV-ZbMTZwS-cyCaUsD9Br9Ek--9LzYjRIdUF-0X7kemPVYODPAhhkglzXBC1DR0_sVSli_LXWa_x24DYbqo1s0tXhM4bD7JqR5P0PPARUuZhT76iTZdoyTgJWikLKUoP7PyMH_ybC1kk5zAmXKBnfJBYzMRkIcp2s8VoXjE2Rid5YPjYlGez63GHcKI_MC_7E_xDRhMnqHXMmzys7azglJNWgDXtD8yCGSpmaORZcmDke4d18AvhxwqUPzUFgtu2sgkqM6Vnk75rJmaI6QDUSu9nvgedjXo0fYeSGtpBvxRSclzItbvrN1KU4DWPoWEqSDru4O4HsLE34Apb2-RccmO7fSynEoSS2sFqTTPfiuvB0wsQT1rSfhrhrmjZR9x5o6WuuZ9_xQCkOFbAQjd-osSCvbKPIosAq3yxiGXWYNQB5E6AZHpnramWWyKSAYFDvhnsWnGsIWsw6fHWgTT0l_y7t7TqhJvpAxGscD4nyN8516HGy8oihLwHt9Le50ByHI; ai_session=0ccMF|1773758471347|1773758658018.4; cf_clearance=N_idEJxYcoGG6n0PKCwbPd6vYWT6ce2r8Rxsz9fhLUE-1773758658-1.2.1.1-q63.gWlkkzcxLDdyPhqFUq.ROPUcE354W0Zuo2LoJMb3S8GiFloYe_P68o0BgJ42UU.U.GhJvivCuhR_Yhw.XVZM3LtkjjWjXNkrtUE2483P3kgBjlaO8ARS7w_ZtCcWvOw8sV3ZdKIOl9L7.POAD4o3PD9iJOzjhWVzbEa_nfcLbQA069WlebxVVPT06F.Btv4J7jFP9fUigTE.g40RJaz2wYzGrr3FFfY4sKSK1ntnSSb9.gTgUTI4kEyPRDwIiK6Rh7mAm9aNhjzC397.8Xs6Vd98nU_vHzX.yVbDgHr2VxmxO2W0CnKpphPl7c9oJeDsz6aP1PYG4dxP2fpQOQ`;

/**
 * Read IDs from CSV
 */
function readIds(filePath: string): string[] {
  if (!fs.existsSync(filePath)) {
    console.warn("⚠️ ids.csv not found, using fallback ID");
    return ["117691443"];
  }

  const content = fs.readFileSync(filePath, "utf8");
  const records = parse(content, { columns: true, skip_empty_lines: true });

  return records.map((r: any) => String(r.Id).trim()).filter(Boolean);
}

/**
 * Sleep helper
 */
function sleep(ms: number) {
  return new Promise((res) => setTimeout(res, ms));
}

/**
 * Parse DD-MM-YYYY → Date
 */
function parseDDMMYYYY(dateStr: string): Date {
  const [dd, mm, yyyy] = dateStr.split("-");
  return new Date(`${yyyy}-${mm}-${dd}`);
}

/**
 * GET Patient Details
 */
async function getPatient(id: string) {
  const res = await axios.get(`${GET_URL}?id=${id}`, {
    headers: {
      Cookie: COOKIE.trim(),
      "X-Requested-With": "XMLHttpRequest",
      Accept: "application/json",
    },
    timeout: 20000,
  });

  return res.data; // ✅ correct (NOT res.data.data)
}

/**
 * Random Helpers
 */
function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomDateWithin15Days(baseDateStr: string) {
  const base = parseDDMMYYYY(baseDateStr);

  const offset = randomInt(0, 15);
  const newDate = new Date(base);
  newDate.setDate(base.getDate() + offset);

  return newDate.toISOString().split("T")[0]; // YYYY-MM-DD
}

/**
 * Build Payload
 */
function buildPayload(patientId: string, enrollmentDate: string) {
  const height = randomInt(140, 180);
  const weight = randomInt(40, 90);
  const tptDate = randomDateWithin15Days(enrollmentDate);

  return {
    EpisodeId: patientId,
    TypeOfTreatment: {
      Value: "TPT (TB Prevention Therapy)",
      Key: "TPT (TB Prevention Therapy)",
    },
    HierarchyMapCurrent: "632261",

    InitialWeight: String(weight),
    Height: String(height),

    SiteOfDisease: null,
    ExtraPulmonarySite: null,

    DateOfTBTreatmentInitiation: null,
    TreatmentPhase: "IP",
    EndOfIP: null,

    DateofTPTInitiation: tptDate,

    HasDSTBTest: null,
    DateOfDSTBDiagnosis: null,
    BasisOfDSTBDiagnosis: null,

    HasDRTBTest: null,
    DateOfDRTBDiagnosis: null,
    BasisOfDRTBDiagnosis: null,

    HasLTBITest: null,
    DateOfLTBIDiagnosis: null,
    BasisOfLTBIDiagnosis: null,

    DSTBNotificationTestId: null,
    DRTBNotificationTestId: null,
    LTBINotificationTestId: null,

    AdherenceTechnology: {
      Value: "None",
      Key: "None",
    },

    MermSerialNoObj: null,
    AdherenceDispensationCorrelation: "False",
    TypeOfDot: "Community Treatment Supporter",

    LastSeen: null,
    BatteryLevel: null,

    DSTBRegimen: null,
    DRTBRegimen: null,

    TPTRegimen: {
      Key: "3HP",
      Value: "3HP",
    },
  };
}

/**
 * POST Treatment Details
 */
async function postTreatment(patientId: string, payload: any) {
  const res = await axios.post(
    `${POST_URL}?patientId=${patientId}`,
    payload,
    {
      headers: {
        Cookie: COOKIE,
        "Content-Type": "application/json",
        Accept: "application/json, text/plain, */*",
        "X-Requested-With": "XMLHttpRequest",
        Referer: "https://www.nikshay.in/",
        Origin: "https://www.nikshay.in",
        "User-Agent": "Mozilla/5.0",
      },
      timeout: 20000,
    }
  );

  return res.data;
}

/**
 * MAIN
 */
async function main() {
  const ids = readIds(INPUT_FILE);

  console.log(`Processing ${ids.length} patients...\n`);

  for (const id of ids) {
    try {
      console.log(`Processing ID: ${id}`);

      const patient = await getPatient(id);

      // ✅ Direct object (no nesting)
      const enrollmentDateRaw =
        patient?.RegistrationDate ||
        patient?.registrationDate;

      console.log("Enrollment:", enrollmentDateRaw);

      // ✅ Correct check
      if (!enrollmentDateRaw) {
        console.warn(`❌ No enrollment date for ${id}`);
        continue;
      }

      const payload = buildPayload(id, enrollmentDateRaw);

      console.log("Payload:", payload);

      const res = await postTreatment(id,payload);

      console.log("✅ Success:", res);
    } catch (err: any) {
      console.error(
        `❌ Error for ${id}:`,
        err?.response?.data || err.message
      );
    }

    await sleep(REQUEST_INTERVAL_MS);
  }

  console.log("\n🎯 DONE");
}

main();