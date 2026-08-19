import { parse } from 'csv-parse/sync';
import { readFile, appendFile } from 'node:fs/promises';
import { setTimeout } from 'node:timers/promises';

process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = "0";

const INPUT_CSV = './final2.csv';
const OUTPUT_CSV = './patient_ids.csv';
const API_URL = 'https://www.nikshay.in/api/patients/AddIndiaTB';
const REQUEST_INTERVAL = 200;

const Cookie = 'ai_user=c9Q7B|2025-10-02T10:27:39.438Z; _pk_id.2.2fe8=b6ce6660f9394a06.1759400860.; TiPMix=5.385305354620085; x-ms-routing-name=self; _pk_ref.2.2fe8=%5B%22%22%2C%22%22%2C1776784508%2C%22https%3A%2F%2Fsso.nikshay.in%2Fv1%2Fsso%2Flogin%3FreturnUrl%3Dhttps%3A%2F%2Fwww.nikshay.in%2FHome%26clientId%3D29%22%5D; _pk_ses.2.2fe8=1; cf_clearance=2NQk0ArP8.9mhvBfulsK1RmbzXFX252KSM0sZ3jFXDQ-1776784553-1.2.1.1-1yUtEBHF3yoTuOor2Y80d77TcsXmiFvZzmkIZR8XdnOi5pU7ITvHdKwxGMSWAtTrNDXVcO2SbOXwLF1gXfUQtQEwUHEOqHz3QPRNVcsQg6ppJyhCbAoEc6EuYkE_Z6VBUwWOHmBjaTqAXzAU7pJznlCLbzi.lRFijOr_pTjHQ_FgXKOD5ArLgtJRlvtXEugS.gfy0NxAadqVVXHVpW.l0a_6ZkWvcemCFJlz_wy04qdDlDZ2plV2ACyl7ZbuDHQeafSo0J9DlgbNsW_gksqdD3rBga3GstWdJ7oJ9HJLb.pt1n0y24yjs9D4hCLvI4siuXTbX5_IKMiZwQdD4z8JqA; ASP.NET_SessionId=ni02sg0hdgf0d3owfuiexx3h; SSOAuthorizationCookie=eyJhbGciOiJSUzI1NiJ9.eyJqdGkiOiIxMDk3OTc5MDkiLCJpYXQiOjE3NzY3ODQ2MTksInN1YiI6InBoaS11cGFsZzIxLTAwNyIsImlzcyI6ImV2ZXJ3ZWxsIiwicGFzc3dvcmRSZXNldE9uIjoiMTc3ODA0NTczMDQ2MSIsInNzb1VzZXJJZCI6IjE5NjkyODYiLCJhdXRob3JpemVkQ2xpZW50cyI6IjI5IiwiZXhwIjoxNzc2ODI3ODE5fQ.c5b8gW1Bh2ctaGgn1Cjc2hRXgr8iWWkJ6DzQ3w2Cj4L2vUPrjCZxuKfDNYlnSo4ZDoQy8TGaJWwX4DL8OxbkCsXbjPqpqyVrYcuNfYPoKFHugz-fzpX8iO86nnf4eIaR3cWvYg-ddjWKeeHyzd1eejOe8hsUNzJe-fjywp4XNyf8FSb6m4S-VYr2Coxc_waZ42SHui59e0su2LSUqhKp8JtzC8t88UyzHZRwKUB38Pi0jaaN4IU2iFjPoi412lx6WkISluUhHxgHxzJLdRbeBlJ_3ebU66GdJqp2VaXQK_sywMMoSU4qYqgH7_fEcZp0pK4Eqv6l790hEdMk8yYb5w; .AspNet.ApplicationCookie=pqdcjXDmQfBIpfgdWBxzZ2NJ7xus93KyDFh0G7_TABNqWs4Vx_4OmylhNewRlR4aqC2I5KcufqBR0-6sfEOj1aNJZLhOuaVxLOqbMVqR9Q8bdmjaygaNdanfmYPBM3NcISEXlGHoUn12GZ35pM0ko9QuNoARdS_Rd0eH2TVSkIaZoMED7c7qFyDnHjToDd1sRj0-qRiiJDM-k8k7Nh5TanbScBqnGWUELXOHWhlB_EYyIwpgj8tKEjZinUzbh2hMrM0RUMpeP9EvuBPY4OdNBF66qfsdPdhIoQKcopoMdvU12V0OPJmCoVrH_ZASVTLPI_3Xsz9-lu63qw4N6UWBiQVuwMxeMqYgXl1IbO9NUdigE0EGm1hcN5rquzwb47k9Lga_FGz8RdaCKIlloxMqbpbqrePIVOU0ZZ-Y3rAwMEbmR4VwdiHHCxuA--UzgDy7IDrzMesai3_Ld84TFFaMz00pDi0STIlgW0Y87m_51aFWfhtUYAZIXgYedCHsZjktyIt5QEswaTDncb_Zr6EIbxuGZ6zvPcHEtjlEFUTeJ80SLeJpVl0R0cYPQGcmtgVXmWiFwWn0MF9jQt_mzchPzL8PohbgyNcop0HnE6BW02iXmIO4tsAlCnEpMBzblosZQic8UowOIDuB1xIV4OHAuPZC-ewN_qdga_GP3jA5i_naa_-n7gMUYo4yP2otxcq54lWZ0CLVuU5JL-3jEoe9539gMzlV2UPp9pi47m3vLpDhhSAIqfiCruKs0VdkElBKQ1r3F8hJQ7WPI7MkjWkedVIXLYEtT4elZEtDf2RK8mQnoVzjJhzxtAsVIHo_k1mRykHLjTi7CVvoZUxucCOLh82LAT83htBqKfcdc0jz_D8PKif1nP-EtbbiBTCcwroLn9nRNNZ4Mya5nG-jfSK18NZLff4v_RCQePTXpgLHot1FI5Eag7oDxW3HjTRnlMaEaApjgw1_YqnknI39xBsvByIykWt9Fg3raULRs6SGPITuYrtTqIu6MiI9I09lxyip3V6f6YED9RiqTcQg0PwFok_QM9pG6LJVsOHitBvTkpHIq4rtNsi60FV54_3t1ebTPik5N3BmF5Ay2C7DV9fGAyOtJH3nKlZwkKi-H-0pxc_nJ3-P7qF2_bqiTEOon8rRKe3hub5YSMUKsrJedD8hoCDpcmiW6y-9fEGePTxJEbiVEBuSz35vp59k3vkwF4_YV1X0A9OB-KirOXcRw7m_WWSu51TjG2kFA3CS_WH04rlgUa45oijBgP2s6pz2stYrhDJmkNN-jELtpaPniCxfOsy-A9H5-tvBnuAVpdCG9Eb-mcj8jQp-wUdlg_lfzkM_qn0ry3NtNKIMrX8A0Aug7VKS42O1Yfe6lCwWdXNf1DWf126XgJphYyRBRpYm2PBztSUF-olyP2hTumVYnkdcknK2LSYZuFYPrQaSeuqCmo1R-ij73Qn2xqJgtNQLg5kjkD2G9XCMEu3otkwXFAm6Z3HaoWldenAe2SmYd0c32z9B7G0C6oWfWTYOoFuNEkKIROT9hxzTfQaahTZwd46k0vTqQ0ekMeIivJQNgQWn-uIwhorUh08V8kwsG4B_OJ0lU-FZ8NBhRU9lFkunHWPuLrCvverKldsyQ8D9Rr478hU; ai_session=PR3PQ|1776784507936|1776785093618.4';

// ✅ Headers
const HEADERS = {
    'Accept': '*/*',
    'Content-Type': 'application/json; charset=UTF-8',
    'User-Agent': 'Mozilla/5.0',
    'X-Requested-With': 'XMLHttpRequest',
    'Cookie': Cookie.trim()
};

// ✅ Gender mapping
function mapGender(g: string) {
    g = g?.trim().toLowerCase();

    if (g === 'male' || g === 'm') return 'Male';
    if (g === 'female' || g === 'f') return 'Female';

    return 'Male'; // default fallback
}

// ✅ Handle duplicate phone
function fixDuplicatePhone(phone: string, usedPhones: Set<string>) {
    let newPhone = phone.trim();

    while (usedPhones.has(newPhone)) {
        const randomDigit = Math.floor(Math.random() * 10);
        newPhone = newPhone.slice(0, -1) + randomDigit;
    }

    usedPhones.add(newPhone);
    return newPhone;
}

// ✅ Capitalize
function capitalize(str: string) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

// ✅ Name split
function splitName(full: string) {
    const parts = full?.trim().toLowerCase().split(/\s+/);

    return {
        first: capitalize(parts[0] || 'Unknown'),
        last: parts.length > 1 ? capitalize(parts.slice(1).join(' ')) : 'Ji'
    };
}

// ✅ Date
function getDate() {
    const d = new Date();
    return `${String(d.getDate()).padStart(2,'0')}-${String(d.getMonth()+1).padStart(2,'0')}-${d.getFullYear()}`;
}

// ✅ DOB
function getDOB(age: number) {
    const year = new Date().getFullYear() - age;
    return `01-01-${year}`;
}

// ✅ Read CSV
async function readCSV() {
    const file = await readFile(INPUT_CSV, 'utf-8');
    return parse(file, { columns: true, skip_empty_lines: true });
}

// ✅ Save output
async function savePatientId(rowNo: string, patientId: number) {
    await appendFile(OUTPUT_CSV, `${rowNo},${patientId}\n`);
}

// ✅ API call
async function postData(payload: any) {
    const res = await fetch(API_URL, {
        method: 'POST',
        headers: HEADERS,
        body: JSON.stringify(payload)
    });

    return await res.json();
}

// ✅ Main
async function main() {
    const usedPhones = new Set<string>();
    const rows = await readCSV();

    await appendFile(OUTPUT_CSV, "RowNo,PatientId\n");

    let rowNo = 1;

    for (const row of rows) {
        try {
            // ✅ Only skip if name missing
            if (!row.Name) {
                console.log("⚠️ Skipping invalid row:", row);
                continue;
            }

            const { first, last } = splitName(row.Name);

            // ✅ Extract Age + Gender from "Age/Sex"
            let age = 30;
            let gender = 'Male';

            if (row["Age/Sex"]) {
                const val = row["Age/Sex"].toString().trim();

                if (val.includes('/')) {
                    const [a, g] = val.split('/');
                    age = parseInt(a) || 30;
                    gender = mapGender(g);
                } else {
                    gender = mapGender(val);
                }
            }

            // ✅ Phone handling
            let phone = String(row.Phone || '').replace(/\D/g, '');

            if (!phone || phone.length !== 10) {
                phone = Math.floor(1000000000 + Math.random() * 9000000000).toString();
            }

            const fixedPhone = fixDuplicatePhone(phone, usedPhones);

            // ✅ Address fallback
            const address = row.Address && row.Address.trim()
                ? row.Address
                : "Surendra Nagar";

            const payload = {
                "TypeOfPatient": "IndiaTbPublic",
                "Stage": "PRESUMPTIVE_OPEN",
                "RegistrationDate": getDate(),
                "SelectedHierarchyId": 1886271,

                "FirstName": first,
                "LastName": last,
                "FathersName": null,
                "Age": age.toString(),
                "Gender": gender,
                "PrimaryPhone": fixedPhone,

                "SecondaryPhone1": null,
                "SecondaryPhone2": null,
                "SecondaryPhone3": null,

                "Address": address,
                "Ward": null,
                "Taluka": null,
                "Landmark": null,

                "ResidenceHierarchyId": 1401897,
                "ResidenceHierarchyAll": [1,36,679,629061,632261,1401897],

                "Pincode": "202001",
                "Area": "Urban Slum",
                "MaritalStatus": "Unknown",
                "Occupation": "Laborers in mining, construction, manufecturing and transport",
                "SocioeconomicStatus": "Unknown",
                "KeyPopulation": "Urban Slum",

                "VaccinationDate": null,
                "Symptom": "Cough for more than 2 weeks,",
                "HIVStatus": "Unknown",

                "ContactPersonPhone": null,
                "ContactPersonName": null,
                "ContactPersonAddress": null,

                "parentEpisodeId": null,
                "IsPossibleDuplicate": false,
                "Source": null,
                "SourcePatientId": null,

                "TypeOfCaseFinding": "Active (Active Case Finding)",
                "InformantId": null,

                "DateOfBirth": getDOB(age),
                "FollowUpsDone": [],
                "TbWinReferenceId": null,

                "caste": "others"
            };

            console.log(`📤 Sending Row ${rowNo}:`, payload);

            const response = await postData(payload);

            if (response?.Success) {
                const patientId = response.PatientId;
                console.log("✅ Success:", patientId);

                await savePatientId(rowNo.toString(), patientId);
            } else {
                console.log("❌ Failed:", response);
            }

            rowNo++;
            await setTimeout(REQUEST_INTERVAL);

        } catch (err) {
            console.error("🔥 Error:", err);
        }
    }
}

main();