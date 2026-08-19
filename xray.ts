import { parse } from 'csv-parse/sync';
import { readFile } from 'node:fs/promises';
import { setTimeout } from 'node:timers/promises';

// Disable SSL check if needed (ONLY for testing)
process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = "0";

const CSV_FILE_PATH: string = './xray.csv';
const API_URL: string = 'https://www.nikshay.in/API/TestResults/AddDiagnosticsTest';
const REQUEST_INTERVAL: number = 1000; // 2 seconds between requests

// Your authentication cookie - UPDATE THIS with your current cookie
const AUTH_COOKIE = `TiPMix=73.1034977273385; x-ms-routing-name=self; ASP.NET_SessionId=uoferh0pydppc2xzuk5dq1fq; cf_clearance=CNN4zb5db6ltXXJxVKVh3K4TF4bIqqQFB0EPNmer0Iw-1784654103-1.2.1.1-SFCnuYynOYoqDpuy77TtATRcLBDwjKFmj._LeyYGlykj5C2iqqHbLGCpnWpidJxy1Fdb9WUUOJyDo3XjiZTTbjGcUX0vFt6hRA9MBdnGAKq0Tua1qDEJ56Ibe.jUPwsLo8XkTfc5LluWOaYKp3U5s4UxkG4qp5By0AfbQzprXK_PIuDOqnGkNsIGFRZQNUHu4wdazaF8j.neF.rZ5f_VIPg2qvP1n8.cBA1cKFkckEHx7fd9ghXXitqLj6r8L77W5Ob0nB9M6xh3YhGe828_S.0uM6mZIR_M8nNUj7KP09Uosxwl3nmH4ChJC4Zbh.4STMB3Ekplmym6WHVLyD.yuw; ai_user=SDia|2026-07-21T17:15:04.599Z; SSOAuthorizationCookie=eyJhbGciOiJSUzI1NiJ9.eyJqdGkiOiIxMjA2MjIwNTgiLCJpYXQiOjE3ODQ2NTQxNTIsInN1YiI6InRidS11cGFsZzA5IiwiaXNzIjoiZXZlcndlbGwiLCJwYXNzd29yZFJlc2V0T24iOiIxNzg1OTEwMzc1MTk4Iiwic3NvVXNlcklkIjoiMzE1MDUiLCJhdXRob3JpemVkQ2xpZW50cyI6IjI5IiwiZXhwIjoxNzg0Njk3MzUyfQ.b7qNYMosevlJ_5bRrCaTipNppYu4RuiNt8krdEfM_xK5aUC6o5Q4Vl6yKYaUcFEQ_3YPlYj2qrGLOotbVP4WJZ_LkmzslrMnARGBwI7kfaVWALn4F1_rfpxZsnY-d2OqW0HffPibnyEKbw_41nS7rdIwP4lPvyNoxm29-Gstg5XKsknpMEN47TcCqgwA1ES8FRVCDx7rFIDXsGxniNr2DFAMqFOSCiw3JttPegjqazG4dF3ZSElKYYsEuau0AEMnz6PEvlaY-yMnY_9R9bYZfSOnGWN9IeRvN3P8AO7PN47_ILtsaWGKquMhqiyJ9yaU9qgFPv5v5blefCbYWN_q6g; .AspNet.ApplicationCookie=To97YdI5q1hcNmJi6AXPYPfdYxdRlyZCDGcF1XcE8WOg4uPskeaH0aCqSPOMstVtYtfbizQXg5RFi-2Fagg-pQ9rKZySrzQ0BaV6wSSIILrD8iODuTM6hjK4b2BhMyK5-DT9dlWk9zS0bU_OXuEQYoId0nSOeTXpMh_cYif14qhIwaCFmxwmAr_OCehx5g07poLE4pDHxGHSfFczUUb4_vuzth-BhQuPx4_KyIYPtddvAuvIG5Kvi2kx-Z_uqOwoXrdf20jfG4n-6nNABcJLdfqK_zUx755Hf8xvQ0YqOR9jHnqoexmaF3GF4wRAV1sQK6q8sLnxbJ5s5y_0eUTUP2gjR6lBtZR93fXN198_m5KtJ0z9HEQVsBwl5G4_wuFhe9nd8_ptjQ16DmMZdcKCR6Ve7Xwu-cXDBuINeMFoL-Szg2ojMzGvabg-oN9a-hVouHtlXMs0Z50k7CjRbg-hEiYwa77UJIGKAGAdIs9rfTUv_5EfZ2AdEKNtrD5oh6zbUMznif7IJgZfXAP8-3LEL6ZY1Z5r7iHiOXkCiKRuEemyOvT3oHlumLIU7skfXDP8JN9upBnwiheE6K_oUN-3oEcHaYJ32ON9bzbcyNEFYTNJtdse90XU44zceDGdFZzW0VU-pH8LJ2T0wnEFa_SWkptYq9ytgt9hacPgHPVY9voVIUKpTkrW9elqCssu80LqpyejjwHZD8EZq2RvdyZCCDPSoTyKm-vjZQnLKjZmmvOit6SIo9wOrLNQ0TPhgQrvd3MYfIUvcjMLV6XXO5p4nABQaZJgpa83wj9FpsfKNPkLS8gaWhU58sytmffbv7Ye_1UCq2YSB8ngm5PQG1RRm86SHxSOOOK1PXgOC2vv2U-6ua5DVTH9fmJ19dyYQEzzdz3cULtZ1ETHYYWIh9hVDha-YNyKSQz4RqmWBqpOaHJMdkw98_uGcRhwvvber1lLbGATYcTajcvjT3c4n2FftzBGpEhBXYbeo8dtlxNN1vpAy5eC8IEhzALTg7vbOSoIo9uGu_GSCw6Ebzkvj62F0vt2WYJPWYS_T3uqwyOJtPW8OQTBPbyBKMiV8t2um_fS0_XKaW4lPO-qNiAXebmudzirs9tWy--b9AiHtUf9gA9CDjLwvucLiD8ZkwTtcLFIGXPpB9fB9bM_3lsZ_dCZVOX-gAvRYo_Ft7qPR_Dz0kw2idQFw61zMXYmjgJXqJ_d05Yu-1H-BAXybt-hBmdSfzC4TO9W5k3iUcicf3JKK60vfYdxl9NHbe5sdB7mg8ndyqkD6IIf5o43B7TF5Jr-gjcFOsODNsuJQ472pk9WMCHB97401PKgXWmtZXkctIm3SR8zVJnYVA8xbCMntZRaae6WPVcKJBxRz3kZZlBH-XO01QmiuPD6igPRWxGmG0d3yEzmXd2ull72w6nramRewFDPY8hbs4n4u0kWdhmXQ3rIbc_fTqYp7Y4ZWCnhozJAtLqGsNuK8YxO1O2N4bc__xJfwg1f-uUsCrur-OTYawIFUyMEpD6bMRL-YjDrpWaJIJ_NmbZafBqNAmBaWbWSP6fc2Ka4X7D_xMzag40JcvOb_H1snuLiSf7FTGrzXJpzhAUwuaMorPSGTzgZUqZ4aw; ai_session=PfGmP|1784654104600|1784654175769.5`;

// Function to build payload - only PatientId changes, rest stays the same
function buildPayload(patientId: string) {
  return {
    "ReasonForTesting": "TB Screening",
    "PredominantSymptom": "Fever",
    "PredominantSymptomDuration": "26",
    "HCPVisits": "2",
    "TypeOfCase": "New",
    "MonthsOfTreatment": null,
    "MonthsSinceEpisode": null,
    "DiagnosisOfTB": [],
    "FollowUpReasonDSTB": null,
    "TypeOfPresumptiveDRTB": [],
    "CulturePositiveMonth": null,
    "FollowUpReasonDRTB": null,
    "FollowUpReasonDRTBMonth": null,
    "TestType": "Chest X Ray",

    "TestingFacilityState": {
      "Value": "Uttar Pradesh",
      "Key": 36,
      "Level": 4
    },
    "TestingFacilityDistrict": {
      "Value": "ALIGARH",
      "Key": 679,
      "Level": 4
    },
    "TestingFacility":{
    "Value": "HHXC_UPNN01",
    "Key": 1935530
},

    "SampleAvailability": "Absent",
    "ResultAvailability": "Present",

    "TestSampleDetails": [
      {
        "SampleMappingOption": "Add New Sample",
        "SampleSpecimenType": "Sputum",
        "SampleSpecimenTypeIfOther": null,
        "SampleSputumCollectionDetail": null,
        "SampleDescription": null,
        "SampleCollectionDate": null,
        "SampleCollectionTime": null,
        "SampleCollectionSiteState": {
          "Value": "Uttar Pradesh",
          "Key": 36,
          "Level": 4
        },
        "SampleCollectionSiteDistrict": {
          "Value": "ALIGARH",
          "Key": 679,
          "Level": 4
        }
      }
    ],

    "LabSerialNumber": null,
    "ResultSampleId": null,
    "IndurationSize": null,

    "ResultDateTested": "23-03-2026",
    "ResultDateReported": "25-03-2026",
    "ResultReportedBy": "DR",

    "FLLPA_AddMutationDetails": "Skip",
    "SLLPA_AddMutationDetails": "Skip",

    "FinalInterpretation": "Normal",
    "Remarks": null,

    // ✅ Missing fields added
    "CBNAAT_MTB_XDR_Result": null,
    "Isoniazid": null,
    "Fluoroquinolone": null,
    "Amikacin": null,
    "Kanamycin": null,
    "Capreomycin": null,
    "Ethionamide": null,
    "ChestXRayResult": null,

    "PatientId": patientId
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

// Function to post diagnostic test data
async function postDiagnosticTest(payload: any, rowIndex: number) {
  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Accept': 'application/json, text/plain, */*',
        'Accept-Encoding': 'gzip, deflate, br, zstd',
        'Accept-Language': 'en-US,en;q=0.9',
        'Connection': 'keep-alive',
        'Content-Type': 'application/json;charset=UTF-8',
        'Cookie': AUTH_COOKIE.trim(),
        'Host': 'www.nikshay.in',
        'Origin': 'https://www.nikshay.in',
        'Referer': 'https://www.nikshay.in/',
        'Sec-Fetch-Dest': 'empty',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Site': 'same-origin',
        'User-Agent': 'Mozilla/5.0 (X11; Linux aarch64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 CrKey/1.54.250320'
      },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error(`❌ Row ${rowIndex} Failed: Status ${res.status}`);
      console.error(`Response: ${errorText}`);
      console.log(`Failed Patient ID: ${payload.PatientId}`);
    } else {
      const data = await res.json();
      console.log(`✅ Row ${rowIndex} Submitted - Patient ID: ${payload.PatientId}`);
      console.log(`Response:`, data);
    }
  } catch (err: any) {
    console.error(`❌ Row ${rowIndex} Error:`, err.message);
  }
}

// Main function
async function main() {
  console.log('🚀 Starting Diagnostic Test Submission...\n');
  console.log('Reading CSV file...');
  
  const records = await readCSV(CSV_FILE_PATH);
  console.log(`Found ${records.length} patient records\n`);

  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < records.length; i++) {
    const row = records[i];
    try {
      const patientId = row["NIKSHAY ID"] || row["PatientId"] || row["patientId"];
      
      if (!patientId) {
        console.error(`❌ Row ${i + 1}: No Patient ID found, skipping...`);
        failCount++;
        continue;
      }

      console.log(`\n📋 Processing row ${i + 1}/${records.length}...`);
      const payload = buildPayload(patientId.toString());
      await postDiagnosticTest(payload, i + 1);
      successCount++;
      
      // Wait before next request
      if (i < records.length - 1) {
        console.log(`⏳ Waiting ${REQUEST_INTERVAL}ms before next request...`);
        await setTimeout(REQUEST_INTERVAL);
      }
    } catch (err: any) {
      console.error(`❌ Row ${i + 1} Error: ${err.message}`);
      failCount++;
    }
  }

  console.log('\n' + '='.repeat(50));
  console.log('📊 SUMMARY');
  console.log('='.repeat(50));
  console.log(`Total Records: ${records.length}`);
  console.log(`✅ Successful: ${successCount}`);
  console.log(`❌ Failed: ${failCount}`);
  console.log('='.repeat(50));
}

// Run the script
main().catch(console.error);