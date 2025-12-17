// =============================================================================
// SYNTHETIC DATA GENERATOR
// =============================================================================
// Generates synthetic payment data using the master clinician list.
// Run with: node scripts/generateSyntheticData.cjs
// =============================================================================

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Read the master clinician list from clinicians.ts
// We parse it manually since this is a CJS script
const cliniciansPath = path.join(__dirname, '..', 'data', 'clinicians.ts');
const cliniciansContent = fs.readFileSync(cliniciansPath, 'utf-8');

// Extract clinicians from the TypeScript file
const CLINICIANS = [];
const clinicianMatches = cliniciansContent.matchAll(/\{\s*id:\s*'(\d+)',\s*name:\s*'([^']+)',\s*shortName:\s*'([^']+)',/g);
for (const match of clinicianMatches) {
  CLINICIANS.push({
    id: match[1],
    name: match[2],
    shortName: match[3],
  });
}

console.log(`Loaded ${CLINICIANS.length} clinicians from master list:`);
CLINICIANS.forEach(c => console.log(`  ${c.id}: ${c.name} (${c.shortName})`));

if (CLINICIANS.length === 0) {
  console.error('ERROR: No clinicians found in clinicians.ts');
  process.exit(1);
}

// Read the existing payment data to get structure and record count
const paymentDataPath = path.join(__dirname, '..', 'data', 'paymentData.ts');
const existingContent = fs.readFileSync(paymentDataPath, 'utf-8');

// Count existing records
const recordCount = (existingContent.match(/"clinicianId":/g) || []).length;
console.log(`\nExisting payment data has ${recordCount} records`);

// We'll generate the same number of records, distributed across our 5 clinicians

// =============================================================================
// DATA GENERATION HELPERS
// =============================================================================

// Generate random client IDs (consistent per client)
function generateClientId() {
  return crypto.randomBytes(8).toString('hex');
}

// Client model: Each client has a start date, frequency, and optional end date (churn)
// This creates realistic client patterns where clients have regular sessions
const clientModels = {};

// Session frequency types
const FREQUENCY_WEIGHTS = [
  { type: 'weekly', daysInterval: 7, weight: 50 },      // 50% see clients weekly
  { type: 'biweekly', daysInterval: 14, weight: 35 },   // 35% biweekly
  { type: 'monthly', daysInterval: 28, weight: 15 },    // 15% monthly
];

function getRandomFrequency() {
  const totalWeight = FREQUENCY_WEIGHTS.reduce((sum, f) => sum + f.weight, 0);
  let random = Math.random() * totalWeight;
  for (const freq of FREQUENCY_WEIGHTS) {
    random -= freq.weight;
    if (random <= 0) return freq;
  }
  return FREQUENCY_WEIGHTS[0];
}

// Generate realistic client pools with session patterns
// Each clinician has ~25-35 active clients at any time, but ~100-150 total over 3 years
const startDate = new Date('2023-02-01');
const endDate = new Date('2025-12-31'); // Full year of 2025
const totalMonths = Math.round((endDate - startDate) / (1000 * 60 * 60 * 24 * 30));

CLINICIANS.forEach(c => {
  clientModels[c.id] = [];

  // Clinician caseload settings
  const targetActiveCaseload = c.id === '1' ? 30 : c.id === '2' ? 26 : c.id === '3' ? 24 : c.id === '4' ? 22 : 20;
  const monthlyNewClients = c.id === '5' ? 1.5 : c.id === '4' ? 2 : 2.5; // Newer clinicians get fewer referrals
  const monthlyChurnRate = 0.03; // ~3% monthly churn (typical for therapy)

  // Generate clients over time with realistic patterns
  let currentDate = new Date(startDate);
  let activeClients = [];

  while (currentDate <= endDate) {
    const month = currentDate.getMonth();
    const year = currentDate.getFullYear();

    // Calculate how many active clients we have this month
    activeClients = activeClients.filter(client => {
      if (client.endDate && client.endDate <= currentDate) return false;
      return true;
    });

    // Add new clients if below target caseload
    const clientsNeeded = Math.max(0, targetActiveCaseload - activeClients.length);
    const newClientsThisMonth = Math.min(clientsNeeded, Math.round(monthlyNewClients + Math.random() * 2));

    for (let i = 0; i < newClientsThisMonth; i++) {
      const clientStartDate = new Date(year, month, 1 + Math.floor(Math.random() * 28));
      const frequency = getRandomFrequency();

      // Determine if/when client will churn (some clients stay forever, some leave after a few months)
      // Target: ~25-35% annual cohort churn for a well-run practice
      let clientEndDate = null;
      const churnRoll = Math.random();
      if (churnRoll < 0.08) {
        // 8% leave within 1-3 months (early churn - didn't find fit)
        clientEndDate = new Date(clientStartDate);
        clientEndDate.setMonth(clientEndDate.getMonth() + 1 + Math.floor(Math.random() * 2));
      } else if (churnRoll < 0.18) {
        // 10% leave within 4-12 months (completed short-term therapy)
        clientEndDate = new Date(clientStartDate);
        clientEndDate.setMonth(clientEndDate.getMonth() + 4 + Math.floor(Math.random() * 8));
      } else if (churnRoll < 0.30) {
        // 12% leave within 1-2 years (completed medium-term therapy)
        clientEndDate = new Date(clientStartDate);
        clientEndDate.setMonth(clientEndDate.getMonth() + 12 + Math.floor(Math.random() * 12));
      }
      // 70% stay long-term (ongoing therapy or beyond our data range)

      // Make sure end date doesn't exceed our data range
      if (clientEndDate && clientEndDate > endDate) {
        clientEndDate = null;
      }

      const client = {
        id: generateClientId(),
        startDate: clientStartDate,
        endDate: clientEndDate,
        frequency: frequency,
        clinicianId: c.id,
      };

      clientModels[c.id].push(client);
      activeClients.push(client);
    }

    // Some existing clients churn randomly (beyond predetermined end dates)
    for (const client of activeClients) {
      if (!client.endDate && Math.random() < monthlyChurnRate * 0.3) {
        client.endDate = new Date(year, month, 1 + Math.floor(Math.random() * 28));
      }
    }

    // Move to next month
    currentDate.setMonth(currentDate.getMonth() + 1);
  }

  console.log(`  ${c.name}: ${clientModels[c.id].length} total clients over 3 years`);
});

// CPT codes with realistic distribution
const CPT_CODES = [
  { code: '90834', weight: 60 },  // 45-min individual therapy (most common)
  { code: '90837', weight: 20 },  // 60-min individual therapy
  { code: '90847', weight: 10 },  // Family therapy
  { code: '90791', weight: 5 },   // Diagnostic evaluation
  { code: '90834-95', weight: 3 }, // Telehealth modifier
  { code: '90837-95', weight: 2 }, // Telehealth modifier
];

function getRandomCptCode() {
  const totalWeight = CPT_CODES.reduce((sum, c) => sum + c.weight, 0);
  let random = Math.random() * totalWeight;
  for (const cpt of CPT_CODES) {
    random -= cpt.weight;
    if (random <= 0) return cpt.code;
  }
  return CPT_CODES[0].code;
}

// Amount ranges based on CPT code
function getAmountForCpt(cptCode) {
  const baseCode = cptCode.replace('-95', '');
  const ranges = {
    '90834': { min: 180, max: 220 },
    '90837': { min: 220, max: 280 },
    '90847': { min: 200, max: 260 },
    '90791': { min: 250, max: 350 },
  };
  const range = ranges[baseCode] || { min: 180, max: 220 };
  const amount = range.min + Math.random() * (range.max - range.min);
  return Math.round(amount / 5) * 5; // Round to nearest 5
}

// Date helpers
function formatDate(date) {
  return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear().toString().slice(-2)}`;
}

function addDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

// =============================================================================
// GENERATE PAYMENT RECORDS
// =============================================================================

console.log('\nGenerating synthetic payment data based on client session patterns...');

const paymentRecords = [];

// Generate sessions for each client based on their frequency
CLINICIANS.forEach(clinician => {
  const clients = clientModels[clinician.id];

  clients.forEach(client => {
    // Generate sessions from client start to end (or data end)
    let sessionDate = new Date(client.startDate);
    const clientEndDate = client.endDate || endDate;
    const intervalDays = client.frequency.daysInterval;

    // Add some variation to session intervals (+/- 2 days)
    while (sessionDate <= clientEndDate) {
      // Skip weekends
      const dayOfWeek = sessionDate.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        const cptCode = getRandomCptCode();
        const amount = getAmountForCpt(cptCode);
        const datePaid = addDays(sessionDate, 1);

        // Small chance of refund (0.5%)
        const isRefund = Math.random() < 0.005;

        // Small chance of no-show/cancellation (skip record) - 8%
        if (Math.random() > 0.08) {
          paymentRecords.push({
            clinicianId: clinician.id,
            clinician: clinician.name,
            datePaid: formatDate(datePaid),
            appointmentDate: formatDate(sessionDate),
            cptCode: cptCode,
            clientId: client.id,
            amount: isRefund ? -amount : amount,
          });
        }
      }

      // Move to next session with some variation
      const variance = Math.floor(Math.random() * 5) - 2; // -2 to +2 days
      sessionDate = addDays(sessionDate, intervalDays + variance);
    }
  });
});

// Add a few product sales (empty appointment date)
const productSales = Math.floor(paymentRecords.length * 0.002); // 0.2% are product sales
for (let i = 0; i < productSales; i++) {
  const clinician = CLINICIANS[Math.floor(Math.random() * CLINICIANS.length)];
  const clients = clientModels[clinician.id];
  const client = clients[Math.floor(Math.random() * clients.length)];

  const saleDate = new Date(startDate.getTime() + Math.random() * (endDate - startDate));

  paymentRecords.push({
    clinicianId: clinician.id,
    clinician: clinician.name,
    datePaid: formatDate(saleDate),
    appointmentDate: '',
    cptCode: 'Product',
    clientId: client.id,
    amount: Math.round((50 + Math.random() * 150) / 5) * 5,
  });
}

// Sort by date paid
paymentRecords.sort((a, b) => {
  const parseDate = (d) => {
    if (!d) return new Date(0);
    const [m, day, y] = d.split('/');
    return new Date(2000 + parseInt(y), parseInt(m) - 1, parseInt(day));
  };
  return parseDate(a.datePaid) - parseDate(b.datePaid);
});

console.log(`Generated ${paymentRecords.length} payment records`);

// Count unique clients
const uniqueClients = new Set(paymentRecords.map(r => r.clientId));
console.log(`Unique clients: ${uniqueClients.size}`);

// Count by clinician
const byClinician = {};
paymentRecords.forEach(r => {
  byClinician[r.clinician] = (byClinician[r.clinician] || 0) + 1;
});
console.log('\nRecords by clinician:');
Object.entries(byClinician).sort((a, b) => b[1] - a[1]).forEach(([name, count]) => {
  console.log(`  ${name}: ${count} (${(count / paymentRecords.length * 100).toFixed(1)}%)`);
});

// =============================================================================
// GENERATE OUTPUT FILE
// =============================================================================

// Build CLINICIANS array for paymentData.ts (simplified version)
const cliniciansForPayment = CLINICIANS.map(c => ({
  id: c.id,
  name: c.name,
}));

const output = `// Auto-generated synthetic data for demo purposes
// Generated: ${new Date().toISOString()}
// This is synthetic data - all names and identifiers are fictional
// Clinician names match the master list in data/clinicians.ts

export interface PaymentRecord {
  clinicianId: string;
  clinician: string;
  datePaid: string;
  appointmentDate: string;
  cptCode: string;
  clientId: string;
  amount: number;
}

export interface PaymentClinician {
  id: string;
  name: string;
}

// Practice settings
export const PRACTICE_SETTINGS = {
  capacity: 23,
  currentOpenings: 18,
  attendance: {
    showRate: 0.71,
    clientCancelled: 0.24,
    lateCancelled: 0.03,
    clinicianCancelled: 0.03,
    rebookRate: 0.83,
  },
  outstandingNotesPercent: 0.22,
  churnWindowDays: 30,
};

// Clinicians (matches master list in data/clinicians.ts)
export const CLINICIANS: PaymentClinician[] = ${JSON.stringify(cliniciansForPayment, null, 2)};

// Payment records
export const PAYMENT_DATA: PaymentRecord[] = ${JSON.stringify(paymentRecords, null, 2)};
`;

fs.writeFileSync(paymentDataPath, output);
console.log(`\nSuccessfully wrote ${paymentDataPath}`);
console.log(`File size: ${(output.length / 1024 / 1024).toFixed(2)} MB`);
