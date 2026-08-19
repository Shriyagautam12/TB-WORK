import { parse } from 'csv-parse/sync';
import { readFile } from 'node:fs/promises';
import { setTimeout } from 'node:timers/promises';

// Disable SSL check if needed (ONLY for testing)
process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = "0";

const CSV_FILE_PATH: string = './new2.csv';
const EPISODE_API_URL: string = 'https://www.nikshay.in/Api/Patients/EpisodeDetails';
const DISPENSATION_API_URL: string = 'https://www.nikshay.in/API/Dispensation/AddDispensation/';
const REQUEST_INTERVAL: number = 2000; // 2 seconds between requests

// ⚠️ UPDATE THESE COOKIES - Get fresh cookies from your browser
const COOKIES = 'ai_user=c9Q7B|2025-10-02T10:27:39.438Z; _pk_id.2.2fe8=b6ce6660f9394a06.1759400860.; TiPMix=15.205775726803317; x-ms-routing-name=self; ASP.NET_SessionId=1i0qx4n2bx15xmjxu2nj5spx; cf_clearance=GqyinkywS5wHaxsqkAUkBRabrLWqO8MpAqlPKGV6_tc-1782623841-1.2.1.1-0yaWY.qHWcYc4jq64QZQIG5xj17mMaCK.NRfOgl1k5yCiXim_TVTNw8Euyv8y1DfSW6Nb6yTqe6kgQoh0qHrN_QOfjUPyiG3cIhdtSwliVbHkM93z139D8KOecFIRqtl1W2t1K7LKcSXpD6j3ZEl_V7WRiJssildJ4hcFBRI12oW.a5QHGoUfksDON3HEmd_B.IKsI5veVFM4Q_neQ1YMCiAgaQGQvc_u82Yzndi.ezqfBceCXcAPAkw0K4iAdwvHmn44eDMRdIS68RQVvJoTUf9TBJY9S5pqQ7oKXzD.pcZJsLjn4KFWBlRC0qZz7EWOQszQUyklpWI5bXxVwHSMg; _pk_ref.2.2fe8=%5B%22%22%2C%22%22%2C1782623842%2C%22https%3A%2F%2Fsso.nikshay.in%2Fv1%2Fsso%2Flogin%3FreturnUrl%3Dhttps%3A%2F%2Fwww.nikshay.in%2FHome%26clientId%3D29%22%5D; _pk_ses.2.2fe8=1; SSOAuthorizationCookie=eyJhbGciOiJSUzI1NiJ9.eyJqdGkiOiIxMTczMTY0NjciLCJpYXQiOjE3ODI2MjM4NzcsInN1YiI6InRidS11cGFsZzIxIiwiaXNzIjoiZXZlcndlbGwiLCJwYXNzd29yZFJlc2V0T24iOiIxNzgzNjYxMDAwNzQ5Iiwic3NvVXNlcklkIjoiMTIzODEzIiwiYXV0aG9yaXplZENsaWVudHMiOiIyOSIsImV4cCI6MTc4MjY2NzA3N30.OnhSl5bqpDcjOrE8Y6ykRvxiJQOwybwun0rKohV8sqhtSScKv54mbmht7pAeu8FUdjVX3nUf_fIQpNnkkEdpdtPCmYI3EXvnXY-X7D0A_NRoHXobB9HFaFch95EJFkJ41zrAoUsKVBSMZs64SEQypDAxjsHwWz5cV--bhaimt6kkz9aFeBhwTU29QONPnaB5DgZi-euYPMV6ZbCLJP_xoV4BMQJUKxYH_iAAl_8Ubg3JHIEefhixPejsUQKlG0pGrB6Meq_ag1_HxQ8cvYp5KZ4KhdbJj_2NKLVM7ia1m-6f0KO9aFK-qC-335ciMDwt5aI2hOu9TyqmnIAugEiSgw; .AspNet.ApplicationCookie=zw3l4kceMifGPOq-Y9KXJ4RTb5WvYCYEQMAOn84r4Vla-CeoIN6t-8tpHrX5gX9fd8VbqxBttgxkJeh_LXa72iXWHDRbsoorXbt2Jzr6Xr0vAAZgwG2qyctcJYloEa4wJBW4do0mA_DzZdnomFwXw2vZcSTWcPD-DgaDwD9ma839ZGsfDbR_Zh-UNn02fA4YHkoKPDAN6UOKdrayjeZ6xVgRRRvrBtHLqv0dIaO6KBEohXA2IbTsIjo-wIiUqNGWcv7Z1pk-qqj4m6uXfhdDI0a9Jnzv-VixtZG3pMVTTaxZqQAmhHaWIbDitFsZExGAjiMp8XbYVCqFmi9cYOqiLdf2n-6nMyTVPJmi__ze7_fKlRoU31tU9oav5hjGxIxRxukUS0g0QYqef6I7W_n5aB5X2F7J-skt4-6q0C5vRXzB0vV01-USR5gGi3FACgZ2z0xNjfYBsLHkgUEwx9a3EjCPDJaNpRy9M8ohTuNBBJmPr5udLXz_2GoBXn26wJ4RS76k9YX6zRm-PFpRHic-lNxHtP5zP8VxGdF7pPanYfwqCtmzrv5RvmZVzHtr1r7-qCjwd0OCJt_Uw_rsafKJqgipichnKalfJxtSszR1Up4x03J1fsNjBwt6FxaLvkj14he5ULXuq13L3ZiR926kZnQV5RjXv84a34OafGFm3581MRb2ep8tAmK1BDAzpv_DLtqjIbVvLA0TKt0LWos6znLPWTT1J-QSBJVJAw0jbv9mlJyMdJghAG1vn_hq8f3yW8OF5I5y1CfsAOePy9ERaWSXl296tDrto7Llksb2bvjAKOq5eNtjGqsfCCHlgrjO-L8bK_hvMCCcqXlxczg9w7A8vdeHn626tkHUPQ8SsJaTuqCn-SExLlJfVBLqYZQWhs4ev7aOue-787g7m5PX49ILyBKCtwfojepXvKr6d47aRqiYJ2JdSRu0bwiHaI3FAI7npT8hctqjN7IcEqpcY9daCp1VDSP2jhREui1FofsKI7IpUEdFzvPD-qeDjloSASbQ2uMZMgyUXsTycXzXs2iVhX4m4dGDR3MI7u9FAE4CY0peSGWb_HUrKPk17SxYq8qep865BJJXLNDTfYj9-G7Ey0BhYPafJOzRpkecu1J4g9y6h2QXYX3ZcmKmiA_XdUXCcu_EH_RaiKh86SipYfA8cLwNGE2JQNRgeDFlxwESfdfsJB1RuvQRvpvvQgnKvqM7aUhODyIb9Gr77n16pqZ75Pb0PCyd0JuBuUtQSnnMBrq2O2lvc39kHRxFnblHWWB7LP6ZpI6c_itsvVsKASeSf3xBIanc8THE0DfLCvL50_WH3xzU0PfZeS0CJcipsHA9rwLWdjd970-JLOsWjev3OG2tx-JXkSspyn139vuMNqGqND8u81vIZqBmIbG5RZUAgVge-2GYiM52hPZam4jXoZHGSImqQt6ygBJePPzSyBoSS4Y9wlUn_TeXi6SjE1raM3ospCYNg7Fv3ToPP8XetgAVDKiLpliMnim01MDZFvurMuP7GJGTbmvpIS279gsiGL8lC5puVH-wlfmDKFZYyYdYqwK7gvDvw6qVghG2MiPvX83NOHC2PY2KFeBlC-rzGhrxwND887SQK_c0-lnC-DySljAC5CvY4bihNSc; ai_session=9fVM8|1782623840723|1782624265139.9';

interface EpisodeDetails {
  Id: number;
  TBTreatmentStartDate: string;
  Weight: number;
  RegimenType: string;
  TreatmentPhase: string;
}

// Helper to convert DD-MM-YYYY to YYYY-MM-DD
function convertDateFormat(ddmmyyyy: string): string {
  const parts = ddmmyyyy.split('-');
  if (parts.length === 3) {
    return `${parts[2]}-${parts[1]}-${parts[0]}`;
  }
  return ddmmyyyy;
}

// Helper to get weight band based on weight and regimen
function getWeightBand(weight: number, regimenType: string): string {
  if (regimenType.includes('DSTB')) {
    if (weight >= 50 && weight <= 64) return 'DSTB: Adult: 50-64 Kg';
    if (weight >= 65 && weight <= 70) return 'DSTB: Adult: 65-70 Kg';
    if (weight >= 71) return 'DSTB: Adult: Above 70 Kg';
    if (weight >= 40 && weight <= 49) return 'DSTB: Adult: 40-49 Kg';
    if (weight >= 35 && weight <= 39) return 'DSTB: Adult: 35-49 Kg';
    if (weight >= 30 && weight <= 34) return 'DSTB: Adult: 30-39 Kg';
  }
  return 'DSTB: Adult: 50-64 Kg'; // default
}

// Fetch episode details for a patient
async function fetchEpisodeDetails(patientId: number): Promise<EpisodeDetails | null> {
  try {
    const timestamp = Date.now();
    const url = `${EPISODE_API_URL}?id=${patientId}&_=${timestamp}`;
    
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json, text/javascript, */*; q=0.01',
        'Accept-Language': 'en-US,en;q=0.9',
        'Connection': 'keep-alive',
        'Cookie': COOKIES.trim(),
        'Referer': 'https://www.nikshay.in/',
        'User-Agent': 'Mozilla/5.0 (X11; Linux aarch64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36',
        'X-Requested-With': 'XMLHttpRequest'
      }
    });

    if (!res.ok) {
      if (res.status === 401) {
        console.error(`❌ Authentication failed! Your cookies have EXPIRED. Please update the COOKIES constant with fresh cookies from your browser.`);
      } else {
        console.error(`❌ Failed to fetch episode details for patient ${patientId}: Status ${res.status}`);
      }
      return null;
    }

    const data = await res.json();
    return data as EpisodeDetails;
  } catch (err: any) {
    console.error(`❌ Error fetching episode details for patient ${patientId}:`, err.message);
    return null;
  }
}

// Build dispensation payload
function buildDispensationPayload(episodeDetails: EpisodeDetails) {
  const treatmentStartDate = convertDateFormat(
    episodeDetails.TBTreatmentStartDate
  );

  return {
    DateOfPrescription: treatmentStartDate,
    IssuedDate: treatmentStartDate,
    Weight: String(episodeDetails.Weight),
    TypeOfRegimen: episodeDetails.RegimenType,
    Phase: episodeDetails.TreatmentPhase,
    WeightBand: getWeightBand(
      episodeDetails.Weight,
      episodeDetails.RegimenType
    ),

ProductList: [
  {
    Source: "NTEP",
    ProductConfigId: {
      Value: "3FDC CP (A)  (H75,R150 & E275)",
      Key: 21610,
      Source: "NTEP",
      UnitOfMeasurement: "Blister",
      ProductId: 732
    },
    UnitOfMeasurement: "Blister",
    BatchNumber: {
      Value: "R-58340(31-05-2027)",
      Key: "R-58340",
      AvailableQuantity: 480,
      ExpiryDate: "31-05-2027 00:00:00"
    },
    ExpiryDate: "31-05-2027 00:00:00",
    AvailableQuantity: 480,
    NumberOfUnitsIssued: "12"
  }
],

    DrugDispensedForDays: "112",
    DosingStartDate: treatmentStartDate,

    FacilityState: {
      Value: "Uttar Pradesh",
      Key: 36
    },
    FacilityDistrict: {
      Value: "Aligarh",
      Key: 679
    },
    FacilityType: {
      Value: "PHI",
      Key: "PHI"
    },
    IssuingFacility: {
      Value: "PHC NAURANGABAD",
      Key: 632261
    }
  };
}

// Post dispensation data
async function postDispensation(patientId: number, payload: any, rowIndex: number) {
  try {
    const url = `${DISPENSATION_API_URL}?patientId=${patientId}`;
    
    console.log(`   📤 Posting dispensation...`);
    
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'en-US,en;q=0.9',
        'Connection': 'keep-alive',
        'Content-Type': 'application/json',
        'Cookie': COOKIES,
        'Referer': 'https://www.nikshay.in/',
        'User-Agent': 'Mozilla/5.0 (X11; Linux aarch64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36'
      },
      body: JSON.stringify(payload)
    });

    const responseText = await res.text();
    
    if (!res.ok) {
      console.error(`❌ Row ${rowIndex} Failed: Status ${res.status}`);
      console.error(`   Response: ${responseText}`);
      return false;
    } else {
      try {
        const responseData = JSON.parse(responseText);
        console.log(`   📥 API Response:`, JSON.stringify(responseData, null, 2));
        
        if (responseData.Success === false) {
          console.error(`❌ Row ${rowIndex} API returned error: ${responseData.Error || 'Unknown error'}`);
          return false;
        }
        
        console.log(`✅ Row ${rowIndex} Submitted - Patient ID: ${patientId} | Weight: ${payload.Weight}kg | Regimen: ${payload.TypeOfRegimen}`);
        return true;
      } catch {
        console.log(`   📥 Response: ${responseText}`);
        console.log(`✅ Row ${rowIndex} Submitted - Patient ID: ${patientId}`);
        return true;
      }
    }
  } catch (err: any) {
    console.error(`❌ Row ${rowIndex} Error:`, err.message);
    return false;
  }
}

// Read CSV
async function readCSV(filePath: string) {
  const fileContent = await readFile(filePath, 'utf8');
  return parse(fileContent, {
    columns: true,
    skip_empty_lines: true,
    trim: true
  });
}

// Main function
async function main() {
  console.log('🚀 Starting Dispensation Script\n');
  console.log('Reading CSV file...');
  const records = await readCSV(CSV_FILE_PATH);
  console.log(`Found ${records.length} records\n`);

  let successCount = 0;
  let failCount = 0;
  let skipCount = 0;

  for (let i = 0; i < records.length; i++) {
    const row = records[i];

    // Extract patient ID
    const patientIdRaw = row.PatientId ?? row.PATIENTID ?? row.patientId;
    const patientId = Number(String(patientIdRaw).trim());

    if (!patientId || Number.isNaN(patientId)) {
      console.error(`❌ Row ${i + 1}: Invalid patient ID "${patientIdRaw}"`);
      skipCount++;
      continue;
    }

    try {
      console.log(`\n[${i + 1}/${records.length}] Processing Patient ID: ${patientId}`);

      // Step 1: Fetch episode details
      const episode = await fetchEpisodeDetails(patientId);
      
      if (!episode) {
        console.error(`❌ Row ${i + 1}: Could not fetch episode details - skipping`);
        failCount++;
        await setTimeout(REQUEST_INTERVAL);
        continue;
      }

      console.log(`   ℹ️  Episode: Weight=${episode.Weight}kg, StartDate=${episode.TBTreatmentStartDate}, Regimen=${episode.RegimenType}`);

      // Step 2: Build payload
      const payload = buildDispensationPayload(episode);

      // Step 3: Post dispensation
      const success = await postDispensation(patientId, payload, i + 1);
      
      if (success) {
        successCount++;
      } else {
        failCount++;
      }

    } catch (err: any) {
      console.error(`❌ Row ${i + 1} Exception:`, err.message);
      failCount++;
    }

    // Rate limiting
    await setTimeout(REQUEST_INTERVAL);
  }

  console.log('\n' + '='.repeat(60));
  console.log('📊 Processing Summary:');
  console.log(`   ✅ Success: ${successCount}`);
  console.log(`   ❌ Failed: ${failCount}`);
  console.log(`   ⏭️  Skipped: ${skipCount}`);
  console.log(`   📝 Total: ${records.length}`);
  console.log('='.repeat(60));
  console.log('\n🎉 Processing complete!');
}

main();