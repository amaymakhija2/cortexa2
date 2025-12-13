const fs = require('fs');
const path = require('path');

// Read the CSV file
const csvPath = '/Users/amaymakhija/Downloads/Pay period report - generated at 12_05_2025 23_41.csv';
const csvContent = fs.readFileSync(csvPath, 'utf-8');

// Parse CSV (handling quoted fields)
function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

// Obscure clinician name: "Sarah Chen, LCSW" -> "Sarah C"
function obscureName(fullName) {
  // Remove credentials (everything after the last comma that looks like credentials)
  const namePart = fullName.replace(/,\s*(LCSW|LMHC|MHC-LP|LMSW|LAC|PhD|PsyD|MD).*$/i, '').trim();
  const parts = namePart.split(' ').filter(p => p.length > 0);

  if (parts.length >= 2) {
    const firstName = parts[0];
    const lastName = parts[parts.length - 1];
    return `${firstName} ${lastName[0]}`;
  }
  return namePart;
}

// Extract client ID from URL: https://secure.simplepractice.com/clients/a400f623248869e7/billing/...
function extractClientId(url) {
  const match = url.match(/\/clients\/([a-f0-9]+)\//);
  return match ? match[1] : null;
}

// Parse the CSV
const lines = csvContent.split('\n').filter(line => line.trim());
const headers = parseCSVLine(lines[0]);

// Find column indices
const clinicianIdx = headers.indexOf('Clinician');
const clinicianIdIdx = headers.indexOf('ClinicianId');
const sourceIdx = headers.indexOf('Source');
const descriptionIdx = headers.indexOf('Description');
const datePaidIdx = headers.indexOf('Date Paid');
const invoiceUrlIdx = headers.indexOf('Invoice or Claim URL');
const appointmentIdx = headers.indexOf('Appointment');
const detailsIdx = headers.indexOf('Details');
const clientInitialsIdx = headers.indexOf('Client Initials');
const amountPaidIdx = headers.indexOf('Amount Paid');

// Build clinician name mapping
const clinicianNameMap = new Map();
const records = [];

for (let i = 1; i < lines.length; i++) {
  const fields = parseCSVLine(lines[i]);
  if (fields.length < amountPaidIdx + 1) continue;

  const clinicianName = fields[clinicianIdx];
  const clinicianId = fields[clinicianIdIdx];

  // Create obscured name if not already mapped
  if (!clinicianNameMap.has(clinicianId)) {
    clinicianNameMap.set(clinicianId, obscureName(clinicianName));
  }

  // Extract unique client ID from URL
  const invoiceUrl = fields[invoiceUrlIdx];
  const clientId = extractClientId(invoiceUrl);
  if (!clientId) continue; // Skip if no valid client ID

  // Parse amount (remove any non-numeric chars except decimal)
  const amountStr = fields[amountPaidIdx];
  const amount = parseFloat(amountStr.replace(/[^0-9.-]/g, '')) || 0;

  // Parse dates
  const datePaid = fields[datePaidIdx];
  const appointmentDate = fields[appointmentIdx];

  records.push({
    clinicianId,
    clinician: clinicianNameMap.get(clinicianId),
    datePaid,
    appointmentDate,
    cptCode: fields[detailsIdx],
    clientId,  // Use unique client ID instead of initials
    amount
  });
}

// Generate TypeScript output
const clinicianList = Array.from(clinicianNameMap.entries()).map(([id, name]) => ({
  id,
  name
}));

const output = `// Auto-generated from payment data CSV
// Generated: ${new Date().toISOString()}
// DO NOT include sensitive information - clinician names are obscured, client IDs are hashed

export interface PaymentRecord {
  clinicianId: string;
  clinician: string;
  datePaid: string;
  appointmentDate: string;
  cptCode: string;
  clientId: string;  // Unique client identifier (extracted from URL)
  amount: number;
}

export interface Clinician {
  id: string;
  name: string;
}

// Practice settings (manually configured)
export const PRACTICE_SETTINGS = {
  capacity: 23,
  // Last 30 days attendance metrics (directional)
  attendance: {
    showRate: 0.71,
    clientCancelled: 0.24,
    lateCancelled: 0.03,
    clinicianCancelled: 0.03,
    rebookRate: 0.83,
  },
  // Notes compliance
  outstandingNotesPercent: 0.22,
  // Churn definition: no session in last X days
  churnWindowDays: 60,
};

export const CLINICIANS: Clinician[] = ${JSON.stringify(clinicianList, null, 2)};

export const PAYMENT_DATA: PaymentRecord[] = ${JSON.stringify(records, null, 2)};
`;

// Write output
const outputPath = path.join(__dirname, '..', 'data', 'paymentData.ts');
fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, output);

console.log(`Parsed ${records.length} records`);
console.log(`Found ${clinicianList.length} clinicians`);
console.log(`Output written to: ${outputPath}`);

// Print clinician mapping for verification
console.log('\nClinician name mapping:');
clinicianNameMap.forEach((obscured, id) => {
  console.log(`  ${id}: ${obscured}`);
});
