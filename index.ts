import { parse } from 'csv-parse/sync';
import { readFile } from 'node:fs/promises';
import { setTimeout } from 'node:timers/promises';

process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = "0";

const CSV_FILE_PATH: string = './data.csv';
const API_URL: string = 'https://www.nikshay.in/api/patients/AddIndiaTB';
const REQUEST_INTERVAL: number = 150;

interface Hierarchy {
    Id: number;
    Level: number;
    Name: string;
    Type: string;
    Code: string;
    ParentId: number;
    DrugRegimen: string;
    HasMERM: boolean;
    CountryCode: string;
    Level1Id: number;
    Level1Name: string;
    Level1Type: string;
    Level2Id: number;
    Level2Name: string;
    Level2Type: string;
    Level3Id: number;
    Level3Name: string;
    Level3Type: string;
    Level4Id: number;
    Level4Name: string;
    Level4Type: string;
    Level5Id: number;
    Level5Name: string | null;
    Level5Type: string | null;
    Level6Id: number | null;
    Level6Name: string | null;
    Level6Type: string | null;
    ExtraData: string;
    GeoLocation: { Geography: { CoordinateSystemId: number; WellKnownText: string; } };
    ShowChildrenInPatientList: boolean;
    HasChildren: boolean;
}

const currentHierarchy: Hierarchy = {
    Id: 632261,
    Level: 5,
    Name: "PHC NAURANGABAD",
    Type: "PHI",
    Code: "001",
    ParentId: 629061,
    DrugRegimen: "UNKNOWN",
    HasMERM: false,
    CountryCode: "IND",
    Level1Id: 1,
    Level1Name: "India",
    Level1Type: "COUNTRY",
    Level2Id: 36,
    Level2Name: "Uttar Pradesh",
    Level2Type: "STATE",
    Level3Id: 679,
    Level3Name: "ALIGARH",
    Level3Type: "DISTRICT",
    Level4Id: 629061,
    Level4Name: "NAURANGABAD",
    Level4Type: "TU",
    Level5Id: 0,
    Level5Name: null,
    Level5Type: null,
    Level6Id: null,
    Level6Name: null,
    Level6Type: null,
    ExtraData: '',
    GeoLocation: { Geography: { CoordinateSystemId: 4326, WellKnownText: "POINT (0 0)" } },
    ShowChildrenInPatientList: false,
    HasChildren: false,
};

interface PatientData {
    TypeOfPatient: string;
    Stage: string;
    RegistrationDate: string;
    SelectedHierarchyId: number;
    FirstName: string;
    LastName: string;
    FathersName: string;
    Age: number;
    Gender: string;
    PrimaryPhone: string;
    SecondaryPhone1: string;
    SecondaryPhone2: string;
    SecondaryPhone3: string;
    Address: string;
    Ward: string;
    Taluka: string;
    Landmark: string;
    ResidenceHierarchyId: number;
    ResidenceHierarchyAll: number[];
    CurrentHierarchyId: number;
    CurrentHierarchy: Hierarchy;
    Pincode: string;
    Area: string;
    MaritalStatus: string;
    Occupation: string;
    SocioeconomicStatus: string;
    KeyPopulation: string;
    VaccinationDate: string;
    Symptom: string;
    HIVStatus: string;
    ContactPersonPhone: string;
    ContactPersonName: string;
    ContactPersonAddress: string;
    parentEpisodeId: string;
    IsPossibleDuplicate: string;
    Source: string;
    SourcePatientId: string;
    TypeOfCaseFinding: string;
    InformantId: string;
    DateOfBirth: string;
    FollowUpsDone: any[];
    TbWinReferenceId: string;
}

// Function to get current date in DD-MM-YYYY format
function getCurrentDate(): string {
    const today = new Date();
    const day = String(today.getDate()).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0'); // January is 0
    const year = today.getFullYear();

    return `${day}-${month}-${year}`;
}

async function readCSV(filePath: string): Promise<string[][]> {
    try {
        const fileContent = await readFile(filePath, 'utf-8');
        return parse(fileContent, { columns: false, from_line: 716, to_line: 720 }) as string[][];
    } catch (error) {
        console.error('Error reading CSV file:', error);
        return [];
    }
}

async function postData(payload: PatientData): Promise<void> {
    console.log('Sending:', JSON.stringify(payload));
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                // 'Accept': '*/*',
                // 'Accept-Language': 'en-US,en;q=0.9',
                // 'Content-Type': 'application/json; charset=UTF-8',
                // 'Origin': 'https://nikshay.in',
                // 'Referer': 'https://nikshay.in/',
                // 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36',
                // 'X-Requested-With': 'XMLHttpRequest',
                // 'sec-ch-ua': '"Chromium";v="134", "Not:A-Brand";v="24", "Google Chrome";v="134"',
                // 'sec-ch-ua-mobile': '?0',
                // 'sec-ch-ua-platform': '"Windows"',
                // 'sec-fetch-dest': 'empty',
                // 'sec-fetch-mode': 'cors',
                // 'sec-fetch-site': 'same-origin',
                // 'priority': 'u=1, i',

                'Accept': '*/*',
                'Accept-Encoding': 'gzip, deflate, br, zstd',
                'Accept-Language': 'en-US,en;q=0.9',
                'Connection': 'keep-alive',
                'Content-Length': '1004',
                'Content-Type': 'application/json; charset=UTF-8',

                'Host': 'www.nikshay.in',
                'Origin': 'https://www.nikshay.in',
                'Referer': 'https://www.nikshay.in/',
                'Request-Id': '|GvRjl.LjQwD',

                'Sec-Fetch-Dest': 'empty',
                'Sec-Fetch-Mode': 'cors',
                'Sec-Fetch-Site': 'same-origin',

                'User-Agent': 'Mozilla/5.0 (X11; Linux aarch64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36 CrKey/1.54.250320',

                'X-Requested-With': 'XMLHttpRequest',



                'Cookie': 'TiPMix=97.11755823157019; x-ms-routing-name=self; ai_user=c9Q7B|2025-10-02T10:27:39.438Z; _pk_id.2.2fe8=b6ce6660f9394a06.1759400860.; _pk_ses.2.2fe8=1; ASP.NET_SessionId=mgyq0s0mea1pxhdebwtrmaz2; SSOAuthorizationCookie=eyJhbGciOiJSUzI1NiJ9.eyJqdGkiOiI4NDU0NzczMCIsImlhdCI6MTc1OTQwMTQ4Miwic3ViIjoidGJ1LXVwYWxnMDEiLCJpc3MiOiJldmVyd2VsbCIsInBhc3N3b3JkUmVzZXRPbiI6IjE3NTk2MzA5OTMzNzUiLCJzc29Vc2VySWQiOiI5NDMxIiwiYXV0aG9yaXplZENsaWVudHMiOiIyOSIsImV4cCI6MTc1OTQ0NDY4Mn0.edIrSiQ1U10njx9YPP1k1S8b5hqzVclCkAReJhLzXZn9rhJ3ty6m0VnIvnsVOf5to8OvFOROhR05tbnOrisvtMcQUG-HYkWqrHjw3GYOwihxDLRVxYeKoC9kJb91tduLprms6h40j8S0-5Mj1UQWz2JnDeao61xMjE0rNeMxIq2mToTvZSG1p0NZ_GsvsSSqZLNMOv_yQMsbQ-2gDRxc_qWMUhOqIckem1ZNCVP9CPzECmji4mQ_TDPVLkhe6hejbXKR-jdLnr-tbgmZlCpr76FUeAQjVZZ8cqShny2XwLgsmcpPVhRUh0nGGIjkVYHXePxzQ0WirkdA69mqvNY8mw; .AspNet.ApplicationCookie=hemzQRO4uKGgapVyGl-qpXmlMBpgWJlUiRJqGvg7ljy4K6u3rysUqEsmaB7XGYJa17W0bWJKDLxrg6NGBx0lkhe77ejv_SP44yu5gDKj8H8pipbQpr2jozGkw7I-tTYUDWEfMwjTksY-mhlzbOktwA30IXv3-I6VhM3h2_u2TcU2pSYyHgM4nX2KiJ9rSX3J0bHxdAPKMrPK3BDWUdrdF73z1bImUPv_ZXTIGsR1OpNbgNtcEo-VIGMVYGvPOYtZzNKCODVfyQp739K58enSCQJVlHUjDcdc0dpjJBMuLpzYNu7VLfcqg0EDmnfo9HrEYGN4GR7WSx1U_ldi3fzwO1fBreJgfyrE8bQwZlw2SvWf89RGvFSPq9IcvJO4R2xqScN4rBtFfZLA-NVl0Kl4fMA3zykiVMZV0v--o3u7AKd-K2ijWsD6LmHtJVwCuh1845bTLNTrlg-I3HzRvwXYWEiVsK6mVzPoTgNK9y-2VpVtXPxEBTeyLBpMuwN66FoyCKqvvBKFf876ywL8WRIVdqgjvcK1FboqvnZgkPNXm0j1-ZeteLszpec6O6ynfLeFUakMxpo4JoL1ad_dfXMjX2A7KSbJ2HmHBXYkcggq1qfknQGitD-sI9jtSxGB_kIccUloNECiYdLkPZi4iLx15kT9RZWKdJAACtkHZ7i4iBSDj1S-t4i7Z0X1wAcErDXYbCIho_xBJ0qkFKFt8YXHUdmeJXY3cHCIEvBKGo8q-iAqFSABt8HMRvC0yaulzU576Lw3YjlYLUJ7LWjEEgByGGODOjZqYZylBKCp35t0InfGkVuYmrx46RRdYom7NSBP3QBcTrpHhFeMVAnBe1812-ZOWJwZ7JrFq7dKpKQkgbuHvCPehmCxri2PHA5iyHsvwcD7IBO-Kp7q37f47LVlgniN7IK9QLw7-61COfdeEhvC3RjvB00yKEjihHKsCrlrlpM4wHNpiQ5zNg1CoUvv4TpF36RfabWExJeV5o81vIq2GFjZ7Z7gFIsvUgjfevsunG3Uu-i7Zg4SQcQ9qz203ulpCLkwlPZYqef_7rC9Iq89pwKnScJKsF0_Rxtrm4ESk1YCcyShSMha5ed1SiYyo_6VX2TlkoLP4WecQ6cy3WBmjskWn5PSQWkNKz2IyMpAwWaTlj3vAN7ykEwOBTsdDgHsWOn43HZIgopAJZHkUWYMS8uUy3IL7v-Vg73HUym0D0nLrIKe86AeryOnzXsQhp5B9GirxWCdZGAwOuHLKjbYpH20btyZzNCVSvGNi5Fk4MLkW4s845Dvi-79qKYY4ola_r4K1l_fDU-86d6jeYBsN2VDWoaqEtdW3cFG7D8YSU44kx7oQNbvM5SlPbKMLn3NzabVAekwIfmvMRyCo8fYed0qHFKXy-OS_I_PZDAE3N-D0IKsyUWbX1HMFhmwNzP1mzGdQLhfB-49OaMveFvvaT13IkBX0Xn_cNk1CwxlZ0mTsiy0wR92Aij1XfB-BwqqtNEctMuxJW_47SIBP8bO1My8XMfUr01ux3ZNAAnuEEMsIgszMrvnsNDM78kDeD3cQLzWC4lRg0-IVhXA98BxVPNcyhIg5Rv5QbZ-i6FTGgRSp25nqnYkAvsp3r8Dfg; cf_clearance=aZe59gYmEh5k1jLtARDXwHblX8JHMvzLczj0CDQsOLw-1759402069-1.2.1.1-giL.kX4RTvImKnTYSqsqxD99ksgPwcNRNkWaGen2d5q0uuOt1naFBHQwmJ8aUaJtU.LDkvwYCXC62iORbpN41VodSjRRsnEA1JkuT3Knw6iY_HFVj1jsNs18LLaI7DieoqJ.NvfGJOnT9S9BPAGYhI0UreEEm0Ln3jpoFaguHRXqna9VxXD3ZLKHuguSJ3dAs01rKL.KjTO5D3VkUnwZhbt43b.3MOCLDP76EUWMLvQ; ai_session=OcKnK|1759400859496|1759402209667.8'.trim() // Replace with actual cookies
            },
            credentials: 'include',
            body: JSON.stringify(payload)
        });

        const result = await response.json();
        console.log('Response:', result);
    } catch (error) {
        console.error('API call failed:', error);
    }
}

async function processCSV(): Promise<void> {
    const data = await readCSV(CSV_FILE_PATH);
    if (data.length === 0) return;
    // Get current date in DD-MM-YYYY format
    const currentDate = getCurrentDate();
    for (const row of data) {
        const nameParts = row[0].split(' ');
        const name: string = nameParts[0] || 'Unknown';
        const last: string = nameParts.length > 1 ? nameParts[1] : 'Unknown';
        const age: number = Number.parseInt(row[1], 10) || 0;
        const gender: string = row[2] || 'Unknown';
        let phone: string = row[3]?.toString().replace('.0', '').replace(/4/g, '2').replace(/5/g, '8').replace(/0/g, '6') || '';
        const maritalStatus: string = age > 28 ? 'Married' : 'Single';

        // Calculate birthdate for older format
        const currentYear = new Date().getFullYear();
        const birthYear = currentYear - age;
        const dateOfBirth = `01-01-${birthYear}`;

        // Match the payload format from your curl example
        const payload = {
            "TypeOfPatient": "IndiaTbPublic",
            "Stage": "PRESUMPTIVE_OPEN",
            "RegistrationDate": currentDate, // Using current date
            "SelectedHierarchyId": 632261, // Match the curl example
            "FirstName": name,
            "LastName": last,
            "FathersName": null,
            "Age": age.toString(), // String format as in curl
            "Gender": gender,
            "PrimaryPhone": phone,
            "SecondaryPhone1": null,
            "SecondaryPhone2": null,
            "SecondaryPhone3": null,
            "Address": "shrayrehman",
            "Ward": null,
            "Taluka": null,
            "Landmark": null,
            "ResidenceHierarchyId": 941857, // static from example
            "ResidenceHierarchyAll": [1, 36, 679, 11299, 538312, 941857], // static from example
            "Pincode": 202001,
            "Area": "Urban Slum",
            "MaritalStatus": maritalStatus,
            "Occupation": "Unknown",
            "SocioeconomicStatus": "Unknown",
            "KeyPopulation": "Tobacco/smoker", // Updated from curl
            "VaccinationDate": null,
            "Symptom": "Fever,", // Updated from curl
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
            "DateOfBirth": dateOfBirth,
            "FollowUpsDone": [],
            "TbWinReferenceId": null
        };

        await postData(payload);
        await setTimeout(REQUEST_INTERVAL);
    }
}

processCSV();
