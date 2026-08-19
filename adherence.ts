import { parse } from 'csv-parse/sync';
import { readFile } from 'node:fs/promises';
import { setTimeout } from 'node:timers/promises';

// Disable SSL check if needed (ONLY for testing)
process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = "0";

// ===============================
// 🔧 CONFIGURATION
// ===============================
const CSV_FILE_PATH = './diff1.csv';
const API_URL = 'https://registryservice.nikshay.in/v1/user/episode/edit-doses';
const REQUEST_INTERVAL = 1000; // 1 second between requests

// 📅 DATE RANGE CONFIGURATION
const FROM_DATE = '2025-07-30'; // Format: YYYY-MM-DD
const TO_DATE = '2025-09-27';   // Format: YYYY-MM-DD

const COOKIE_HEADER = `ai_user=c9Q7B|2025-10-02T10:27:39.438Z; _pk_id.2.2fe8=b6ce6660f9394a06.1759400860.; TiPMix=19.036316002924337; x-ms-routing-name=self; ASP.NET_SessionId=j1p51fi3dzcfamzlpcye2ghg; SSOAuthorizationCookie=eyJhbGciOiJSUzI1NiJ9.eyJqdGkiOiI4OTE5Njg4NCIsImlhdCI6MTc2MjY3NDk0NCwic3ViIjoidGJ1LXVwYWxnMjEiLCJpc3MiOiJldmVyd2VsbCIsInBhc3N3b3JkUmVzZXRPbiI6IjE3NjI3NDk2MTQxMDgiLCJzc29Vc2VySWQiOiIxMjM4MTMiLCJhdXRob3JpemVkQ2xpZW50cyI6IjI5IiwiZXhwIjoxNzYyNzE4MTQ0fQ.Zvj8PaAEyOqJggA8Sltq8tFjhwk0zCkUG8SCm_-kBh38ACDCELKysnUmY0PKloVQWOfPzydrE1teK4-FnTZ2hATg4SopsU46dPfbxNeGerko6WCY6Iu1WD7h8z7y7tmTEs0G62aSaIuUzBMopdvoBDnWdYR6xleUiXOj9mG6MWpzeU65ldhl8YOVjQX9Hzukez3I7IjrHzLXrN4KRNwdu4MpI7JEW9N5UTpZaIbbTtR06UScBSMii-P0UJFlh_FSIDGnGFhcvDB3hgpo594mn62KyBlPq9znymyEcCLVKZuuZhJ-VpytW0WUkHz4OqnyAuIWbfa2PCo70Qr86YQYow; .AspNet.ApplicationCookie=SEZSNVfgWzWVxwh51BIFh6cof0dVNb1kkAShVjE-PGsuoIuDveoQT1HG30mmcX8NkgE7-wSpnk5kZwl-ai-vYeplSF3V4rbBHhNoPdg3nblNbcG9ZOsbMYhybALjdxdgjUPdnI072bPYSCjIafjH3BLXpbQwRrPK0zfbE9jPr7JU0vXONc1fBPfIBMaieYhLIFsUXSlGUr2V6yUd39i8gdwRVmuyW4Z2ZbHOIREVgCeF2lJqncBqPf_PRs28SgF59QfjTH-H34G62T0QSkyxoASmsFrYafHtQOANNHAzw6a7CGvly3XgDtED2MbmrXn0IYnMgtuj_etil2C8BZL-3y1fwMdSvZwnWLZ_oHpjVLnj-MTJfM4WT6-FneWivuWdhWgEV4-fynl12cmTjWtWO_weeHzhbCUOOplDYBJY-L5qwB4W9V7ST1z0r9yl8wNlftuYST0VYXpIxfdGI2OzCYNcx2N08WjAfVLrjy-6sG13QlXRuOTiXcinRLcMdIJSsX5jMBfaPRPYPxzxFoty50Y0_s-xNIEQZXu5MKU-cYyQ10F8DY-Xd1MiJN7w6ZKAWRipf8FLDSGmy8pV73Cyddlqtb02JKGDW90y_s_T3MovNV9DK1Im85m78ReG4iFqDn0FpWhFbPwofXtzYEkcWhsfI_Blm36N86BGKlsEZZrmR6WCCCXihv8eOjMlA6agkIdjjscbBWVM_qwhQMP0121GV27Bz9zsb8NgrtYTnWNQs8RwLgbE8JhflriRC6_GYdN2TEhhbRcTirXXS3PcV5YWW4Q7NoDo6a0OUab-G_zoCcEuG-6BcVgLZdbgsB0YOvKNFOVe8X15x6ML-Mz22uCcuayJAT2KrigvoFHmdUMSbmA2doM-DlucGim0LKIh4E3e5GTf4MraE8IY8NJ8fUqlIh6ALps_SaiKRnZXxbEw4wUpLoVyJ44t2FJ4bnNa7DQU0OCyqgRz2wp-TgdlD2yaSQ5W9ggItup245yRCOVwrR1GgNgt-PUJ9UDtfhawtNiY22fQT1Lw3M7l1Mkpajy_I70oS-FWNAYczaIX-uZhHtQmTBcXBE20TaotKT21bLRSNKVUfoUqSnb6Qjlu2uqpleej_N3BmC6C-s1P5yTiZzD30MYQPrCp7J5QCrLbo4DQ1r28sNAYBpdsQiDqdBZYCXNg9JTp7ntKwOFbW06pxpEJ3IG5fB0MtnakaMDTqnOeA3EY1Ub0ZXO7Ej0-vuyNrKCLEzoe7c3phuTMbDY7qG1GLL83Y9d_bqPB4KFgeBfQ8ipweMEre4CoHe6HvSJVdcfD6MJavSgkrMwQqsrVj-HlxQYVNxMYwuTO9ZuQoJya1L89Li64O7B3mU0X9BqZVsgOOObeDD3EoxD9bSkWkkhL1hTf45JfjoOfz-Kq7-T11lWGW7QMkl5D5e_OWFB9z5ZhM-QQ1VWpY2zLCC_ymUlDMneZhYW7bgLWRBIx1GtbchHN4s4g95wL72xcsHVmIHgNwV5yWIRLc9rb99HeIizB06zw7K7kHZAKgYKGNadFy9flsc8P4Jf9ieGpPL0hmlqe6vWarVlJ0W9Xij3lYXp8Q1hXDbiMLo40Omx7DCZF_5VkZQz5cH3aJuapeA; ai_session=sgQD+|1762677221277.2|1762677221277.2; _pk_ref.2.2fe8=%5B%22%22%2C%22%22%2C1762677221%2C%22https%3A%2F%2Fwww.google.com%2F%22%5D; _pk_ses.2.2fe8=1; cf_clearance=5C6jXqi1B0YT4Ak21U.kKp41cADH6Hc_NxN_wzEvxro-1762677221-1.2.1.1-_mpx8rRNVkd9DsuRFnzvANZBKMlzwvaNdof7q5fQomxa4a_vM3wwuFNj9GogVlL1cCXQKXH3uCwZbuzCPrnyKdq7V0oRaWLY.qbdxAhLoD0GJKzhm8e6.N25WdcOulA7F0WNEgbI2Ww1UQmeDNkMTATm1aJvewV9d6HL_u12kD8HHclFE.6vMox4l0M0z384_K3UsAQxDjrEPvIvJ8rf98001LIuTjPLQhA6N6ZbgD0`;

// ===============================
// 🧮 HELPERS
// ===============================

// Parse CSV file
async function readCSV(filePath: string) {
  const fileContent = await readFile(filePath, 'utf8');
  return parse(fileContent, {
    columns: true,
    skip_empty_lines: true,
    trim: true
  });
}

// Generate all date strings between fromDate and toDate (inclusive)
function getDatesBetween(fromDate: string, toDate: string): string[] {
  const dates: string[] = [];
  const start = new Date(fromDate);
  const end = new Date(toDate);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    throw new Error(`Invalid date range: ${fromDate} → ${toDate}`);
  }

  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    dates.push(new Date(d).toISOString().split('.')[0] + '.000Z');
  }

  return dates;
}

// Build payload for each episode
function buildPayload(episodeId: number, dates: string[]) {
  return {
    episodeId,
    dates,
    addedNote: "",
    code: "MANUAL",
    addDoses: true,
    monitoringMethod: "None"
  };
}

// Send PUT request
async function sendRequest(payload: any, rowIndex: number) {
  try {
    const res = await fetch(API_URL, {
      method: 'PUT',
      headers: {
        'Accept': '*/*',
        'Accept-Encoding': 'gzip, deflate, br, zstd',
        'Accept-Language': 'en-US,en;q=0.9',
        'Connection': 'keep-alive',
        'Content-Type': 'application/json; charset=UTF-8',
        'Origin': 'https://www.nikshay.in',
        'Referer': 'https://www.nikshay.in/',
        'Cookie': COOKIE_HEADER.trim(),
      },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const text = await res.text();
      console.error(`❌ Row ${rowIndex} failed - HTTP ${res.status}`);
      console.error(`Response: ${text}`);
      console.error(`Payload: ${JSON.stringify(payload, null, 2)}\n`);
    } else {
      const data = await res.json().catch(() => ({}));
      console.log(`✅ Row ${rowIndex} success - Episode ${payload.episodeId} (${payload.dates.length} dates)`);
    }
  } catch (err: any) {
    console.error(`❌ Row ${rowIndex} error: ${err.message}`);
  }
}

// ===============================
// 🚀 MAIN FUNCTION
// ===============================
async function main() {
  console.log('📖 Reading CSV...');
  const records = await readCSV(CSV_FILE_PATH);
  console.log(`Found ${records.length} records.`);
  console.log(`📅 Using date range: ${FROM_DATE} to ${TO_DATE}\n`);

  // Pre-calculate dates once (same for all episodes)
  const dates = getDatesBetween(FROM_DATE, TO_DATE);
  console.log(`Generated ${dates.length} dates to add.\n`);

  for (let i = 0; i < records.length; i++) {
    const row = records[i];
    
    try {
      // Support multiple column name formats
      const episodeId = Number(
        row["NIKSHAY ID"] ||
        row["EPISODE ID"] || 
        row["episodeId"] || 
        row["Episode ID"] ||
        row["episode_id"]
      );

      if (!episodeId || isNaN(episodeId)) {
        console.error(`⚠️ Row ${i + 1} skipped - Invalid or missing Episode ID.`);
        continue;
      }

      const payload = buildPayload(episodeId, dates);

      console.log(`➡️ Processing Row ${i + 1}/${records.length} - Episode ${episodeId}`);
      await sendRequest(payload, i + 1);
      
      // Wait before next request
      if (i < records.length - 1) {
        await setTimeout(REQUEST_INTERVAL);
      }
    } catch (err: any) {
      console.error(`❌ Skipping row ${i + 1}: ${err.message}`);
    }
  }

  console.log('\n✅ Processing complete!');
}

// Run script
main();