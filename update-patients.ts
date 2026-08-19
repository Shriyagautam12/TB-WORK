
import fs from 'fs';
import path from 'path';
import axios from 'axios';
import XLSX from 'xlsx';
import { parse } from 'csv-parse/sync';

process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = "0";
const INPUT_FILE = './hey2.csv';
const FROM_LINE = 2713;            
const TO_LINE = 8925;             
const REQUEST_INTERVAL_MS = 150; 
const ID_COLUMN_NAME = "Id";
const GET_URL = 'https://www.nikshay.in/Api/Patients/BasicDetails';
const PUT_URL = 'https://www.nikshay.in/Api/Patients/BasicDetails';

const COOKIE = `ai_user=c9Q7B|2025-10-02T10:27:39.438Z; _pk_id.2.2fe8=b6ce6660f9394a06.1759400860.; ASP.NET_SessionId=sr2blcdymgmw22ulo53dlwvn; TiPMix=31.954887548565125; x-ms-routing-name=self; _pk_ref.2.2fe8=%5B%22%22%2C%22%22%2C1773290493%2C%22https%3A%2F%2Fsso.nikshay.in%2Fv1%2Fsso%2Flogin%3FreturnUrl%3Dhttps%3A%2F%2Fwww.nikshay.in%2FHome%26clientId%3D29%22%5D; _pk_ses.2.2fe8=1; SSOAuthorizationCookie=eyJhbGciOiJSUzI1NiJ9.eyJqdGkiOiIxMDYyODIxMjkiLCJpYXQiOjE3NzMyOTA1MjIsInN1YiI6InRidS11cGFsZzIxIiwiaXNzIjoiZXZlcndlbGwiLCJwYXNzd29yZFJlc2V0T24iOiIxNzc1ODIzMjMzNDc0Iiwic3NvVXNlcklkIjoiMTIzODEzIiwiYXV0aG9yaXplZENsaWVudHMiOiIyOSIsImV4cCI6MTc3MzMzMzcyMn0.AeDUphC8zzW_X181xLf2lKE9EQ6IVz1gUm0pWIyidRWXWbKx4NelnboDUMmy8RLbvRTDUkDUW07yrIhmmHxNYyDWw4MlXJMZasFvepbSdisdgM6hNYXDCJSnazL_bwuQ9ABO7ZOQaWRlSo8WvknzsUVdKDZ9G_-dZxd_Hsjr97fxJ9MogtXDoOKpGB5kU4KmH2xBgsEtw2E6n15hgSKnhCXeCaep3YXRmMwE7CUzeO29K5oz66jxYFJFxXfGXOTHjYA84PQaUfe9a1UfKkFD2J6V5WBCrsR5YQHwJSiRCC9E87D3_L2myj6ORt_eHt_6UrvSnSbbTBsSjdfl78WU8Q; .AspNet.ApplicationCookie=vA-ETwzSZ5HsfDoZOIuB0TOhv8gEhHNi8hUK0X8lb_knxUhZe-pcdmelBIzUgPzZuUoos-2ZUu6IFgFOz2OaOh4hKN4uWq5lXJIbWxZrAJoiASV7wPbjh77WMqNillZ9_AKP_6O4j0edHU7sD9wDNreC2NfunNqjKJdxRo4YzizND62DBJXBcNffFdnVOPtrYMf19QQ0BDTQeiRbKFn3qC623EhT-cEnJFCyUcyE5UPxXrlc4n18ro7Iud7H7wn-bDK060Q_mmYhVbb6mirjCsSC3HNH-BuAvSm0slpwydaEOqPlyCBpTEZhzIlXAowzGUmp2sJAFoXhQiiwQH-kiURpeW8LccDy8LZNnt0jZvMLOiUhfggmgtS3P55btbU-pdNNlW53WJYndd5RRljD0OVTJ1bXJGk9xlINqQBqwk-Qs4SvzxoRyWrKh5IFYjnX1pw6QPtnI8kj3fLX_pqkfSiwXMkJFM5-Q2bzNx4HT8_HileAs6FaFBgsaEmLHdbApL9vK3GbMRyi9ngcER4XYLBHKfQIPd6i5f4QgjqDviaAcaIvUXmNilXDHBA0q_CiYLPgwnGzUQmEUWnoX9GmG993HRRNQjvfRdOHO1T8SIrE4OjB3xHQREN4Fn6deGVtLMYyvxSH-V_i_A98eQEWlQzs7bHIJDV9ZoImW6mGJjGeG19BtljKBwTE0Iea6ToCman4QhAgNGADvrl0-r70wWmFtGvL6Zy44iB-75zLwvXPlJ1IgttpwW0KfcCfKTzNPBIlKakv-cb4OSZnRMyDpHuz1oqgym1Qrutxb87aj30JAYh6f0kg65xIlnNXxJNgaqLVbVWa8S9eGBVhmuBHwRkAdQTU7VFE_IvSBl9-6Ba0NqIcEQNl67TsQEX5W6z2_VyjVA6TCKa5Fteu4yzkDk1eFDHbbkYATsW0CsyLzxEinDHfeSkQbvrqNGW9rjkka0Nh8BpRnY03Rq3Fz5AVMa2AwHcOLW8GTkf02U-ttdIDCKHKjtE0m_NL184HK9psJ1D77LHRczazg_72l89JMNSKpsC5u1NImZN8lYMlpWyKVaiAow-POI57wQ-BA7FDyAi0fKe5edBScq6XbUYu7LaI29Hpi8N604vXn_SQBHunCF4Rhpr3xKq1mMK60IHCYvAHXCrwNCQZ8dnh_85U9ndTzXKtJ4dujOPpRAnxgRNCJiM77U12ael7bqZrZi2S3tGqFjayV9O4esbQXdh7KBaGK6Tvz5-NbMA7vtVk822Hj5h00iS4DuiYkjARkI5zWRdOUdwlFdcV657tisLBIT6lsSvVZQI3r4yo7rpT5nYuhrfa3E_Cd16M86zE-M_iCR4cY_pCbyiNMtSOaT3TTD1eFSoUA01oxOrd-yRBz6KfN20KRUmBfUYb7w-lqcXg6_XmpFPeGwtVhgQ0NE0MbuSMFbe9rCUtx3LIjXUcqx8y4tccQTdwCUELnP3HGjZyl1LFEC5tWx4eTZ8z67sA63Pp2Zei80Nh36wmtLmqqn1vQPKj4BKV2ZrL_pfsKo3lgNx-ejWmsB481LfFZQy3HsHQ3t2kecKXpg8F5sF2ItfTi_u4agL1319YQY0V5YMXxrpmVv97y2DWlVQAlruwUA; ai_session=24gNz|1773290492361|1773290527409.9; cf_clearance=am_vL6O4gL2TIoLCO_ZqYBFckakUOwiXnz6VetN6L3M-1773290528-1.2.1.1-BdfCRtzyQrOAqZ3Bpu28Ipxz2lAU9DkfIxmI9v0Qpkvzb_OIHdz6AWEF3CXXOAjlGXapdRzXGp9vNpWwV8K9kO7uWIOOQQhEym4nD6t225kA_1TfrKdTTWOKp4nexytvYJhZpmSAsq4svaxS9dZJ.VJz21xsakRIrJt5bqcfr4ZpnsnlxiO1K3CDVPHNYFVCQKfoOk20F505yP8pgRqLe2tgKrcygX_ghZtm.v3EN18`;
function readIdsFromFileRange(filePath: string, fromLine: number, toLine: number): string[] {
  const ext = path.extname(filePath).toLowerCase();
  if (fromLine < 1 || toLine < fromLine) {
    throw new Error('Invalid from/to lines. FROM_LINE must be >=1 and TO_LINE >= FROM_LINE.');
  }

  if (ext === '.xlsx' || ext === '.xls') {
    const wb = XLSX.readFile(filePath);
    const sheetName = wb.SheetNames[0];
    const sheet = wb.Sheets[sheetName];
    // produce an array-of-arrays where each element is a row
    const rows = XLSX.utils.sheet_to_json<any[]>(sheet, { header: 1, raw: false }) as any[][];
   
    const selectedRows = rows.slice(fromLine - 1, toLine);
    if (selectedRows.length === 0) return [];

   
    const headerRow = rows[0] || [];
    let ids: string[] = [];

  
    if (fromLine === 1) {
      const headers = selectedRows[0].map((h: any) => (h === undefined || h === null ? '' : String(h).trim()));
      const idIndex = headers.findIndex(h => h.toLowerCase() === ID_COLUMN_NAME.toLowerCase());
      if (idIndex >= 0) {
        for (let r = 1; r < selectedRows.length; r++) {
          const row = selectedRows[r];
          const raw = row?.[idIndex];
          if (raw !== undefined && raw !== null && String(raw).trim() !== '') ids.push(String(raw).trim());
        }
      } else {
        for (let r = 1; r < selectedRows.length; r++) {
          const row = selectedRows[r];
          const raw = row?.[0];
          if (raw !== undefined && raw !== null && String(raw).trim() !== '') ids.push(String(raw).trim());
        }
      }
    } else {

      const headers = headerRow.map((h: any) => (h === undefined || h === null ? '' : String(h).trim()));
      const idIndex = headers.findIndex(h => h.toLowerCase() === ID_COLUMN_NAME.toLowerCase());
      if (idIndex >= 0) {
        for (const row of selectedRows) {
          const raw = row?.[idIndex];
          if (raw !== undefined && raw !== null && String(raw).trim() !== '') ids.push(String(raw).trim());
        }
      } else {
  
        for (const row of selectedRows) {
          const raw = row?.[0];
          if (raw !== undefined && raw !== null && String(raw).trim() !== '') ids.push(String(raw).trim());
        }
      }
    }

    return ids;
  } else if (ext === '.csv') {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split(/\r?\n/);
    // Use header = lines[0] (even if FROM_LINE > 1)
    const headerLine = lines[0] || '';
 
    const selectedDataLines: string[] = [];

    for (let i = fromLine - 1; i <= Math.min(toLine - 1, lines.length - 1); i++) {
      // skip empty lines
      if (lines[i] && lines[i].trim() !== '') {
        selectedDataLines.push(lines[i]);
      }
    }

    if (selectedDataLines.length === 0) return [];


    const csvToParse = [headerLine, ...selectedDataLines].join('\n');
    const records = parse(csvToParse, { columns: true, skip_empty_lines: true }) as Record<string, any>[];

    const ids: string[] = [];
    if (records.length === 0) return ids;

    if (records[0].hasOwnProperty(ID_COLUMN_NAME)) {
      for (const r of records) {
        const raw = r[ID_COLUMN_NAME];
        if (raw !== undefined && raw !== null && String(raw).trim() !== '') ids.push(String(raw).trim());
      }
    } else {
      // fallback to first column
      const firstKey = Object.keys(records[0])[0];
      for (const r of records) {
        const raw = r[firstKey];
        if (raw !== undefined && raw !== null && String(raw).trim() !== '') ids.push(String(raw).trim());
      }
    }

    return ids;
  } else {
    throw new Error('Unsupported file type. Use .xlsx/.xls or .csv');
  }
}

/**
 * Pause helper
 */
function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Make GET request for patient by id
 */
async function getPatientById(id: string) {
  const url = `${GET_URL}?id=${encodeURIComponent(id)}`;
  const resp = await axios.get(url, {
    headers: {
      Accept: 'application/json, text/javascript, */*; q=0.01',
      'X-Requested-With': 'XMLHttpRequest',
      Referer: 'https://www.nikshay.in/',
      Cookie: COOKIE.trim(),
      'User-Agent': 'Mozilla/5.0 (Node.js script)'
    },
    withCredentials: true,
    timeout: 20000
  });
  return resp.data;
}

function formEncode(value: any): string {
  if (value === undefined || value === null) return '';
  return encodeURIComponent(String(value)).replace(/%20/g, '+');
}


function safeValue(v: any): string {
  if (v === undefined || v === null) return '';
  if (typeof v === 'string') {
    const s = v.trim();
    if (s.toLowerCase() === 'null') return '';
    return s;
  }
  if (typeof v === 'number' || typeof v === 'boolean') return String(v);
  if (Array.isArray(v)) return v.map(x => safeValue(x)).filter(x => x !== '').join(',');
  if (typeof v === 'object') {
    if (v.Id !== undefined) return String(v.Id);
    if (v.id !== undefined) return String(v.id);
    if (v.Name !== undefined) return String(v.Name);
    if (v.name !== undefined) return String(v.name);
    return '';
  }
  return '';
}

/**
 * Prepare form-urlencoded body from patient object.
 */
function buildFormBodyFromPatient(obj: Record<string, any>) {
  const result: string[] = [];

  // Always include Id first
  const finalId = safeValue(obj.Id ?? obj.id ?? obj.ID ?? obj.IdString ?? obj.IdNumber ?? obj.Id);
  result.push(`Id=${formEncode(finalId)}`);

  const keysToTry = [
    'FirstName','LastName','FathersName','Age','Gender','Caste',
    'PrimaryPhone','SecondaryPhone1','SecondaryPhone2','SecondaryPhone3',
    'Address','Ward','Taluka','Landmark','Pincode','Area','MaritalStatus',
    'Occupation','SocioeconomicStatus','Symptom','KeyPopulation','ContactPersonName',
    'ContactPersonPhone','ContactPersonAddress','DateOfBirth','TypeOfCaseFinding',
    'vaccinationDate','ResidenceId',
    'ResidenceHierarchyId','ResidenceHierarchyAll','SelectedHierarchyId'
  ];

  for (const key of keysToTry) {
    if (key === 'Id') continue;
    let val = obj[key];
    val = safeValue(val);
    result.push(`${formEncode(key)}=${formEncode(val)}`);
  }

  // FORCE required values (space → +)
  result.push(`KeyPopulation=${formEncode('Contact of Known TB Patients')}`);
  result.push(`Area=${formEncode('Urban Slum')}`);

  // Join to produce x-www-form-urlencoded string
  return result.join('&');
}


/**
 * Send PUT request with application/x-www-form-urlencoded body
 */
async function updatePatient(formBody: string) {
  const resp = await axios.put(PUT_URL, formBody, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
      Accept: 'application/json, text/javascript, */*; q=0.01',
      Referer: 'https://www.nikshay.in/',
      Origin: 'https://www.nikshay.in',
      Cookie: COOKIE,
      'X-Requested-With': 'XMLHttpRequest',
      'User-Agent': 'Mozilla/5.0 (Node.js script)'
    },
    withCredentials: true,
    timeout: 20000
  });
  return resp.data;
}

/**
 * Main
 */
async function main() {
  try {
    console.log(`Reading ids from ${INPUT_FILE} lines ${FROM_LINE}..${TO_LINE}`);
    const ids = readIdsFromFileRange(INPUT_FILE, FROM_LINE, TO_LINE);
    if (ids.length === 0) {
      console.log('No IDs found in the selected range.');
      return;
    }
    console.log(`Found ${ids.length} ids in range. Starting updates...`);

    for (const id of ids) {
      try {
        console.log(`\n[${new Date().toISOString()}] Processing id: ${id}`);
        const patient = await getPatientById(id);
        if (!patient) {
          console.warn(`No data returned for id ${id}`);
          continue;
        }

        // Unwrap likely shapes
        const patientObj = patient?.data ?? patient?.patient ?? patient;
        if (!patientObj || (!patientObj.Id && !patientObj.id && !patientObj.ID)) {
          // fallback minimal object
          (patientObj as any).Id = id;
        }

        patientObj.KeyPopulation = 'Contact of Known TB Patients';
        patientObj.Area = 'Urban Slum';

        const formBody = buildFormBodyFromPatient(patientObj);
        console.log('PUT body (preview):', formBody.slice(0, 400) + (formBody.length > 400 ? '... (truncated)' : ''));
        const updateResp = await updatePatient(formBody);
        console.log('Update response:', updateResp);
      } catch (err: any) {
        console.error(`Error processing id ${id}:`, err?.response?.data ?? err.message ?? err);
      }

      await sleep(REQUEST_INTERVAL_MS);
    }

    console.log('\nAll done.');
  } catch (err) {
    console.error('Fatal error:', err);
  }
}

main();
