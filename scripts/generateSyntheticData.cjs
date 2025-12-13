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
const clientIdMap = new Map();
let clientCounter = 0;

function generateClientId() {
  return crypto.randomBytes(8).toString('hex');
}

// Generate a pool of ~100 unique clients per clinician
const clientPools = {};
CLINICIANS.forEach(c => {
  clientPools[c.id] = [];
  const numClients = 80 + Math.floor(Math.random() * 40); // 80-120 clients per clinician
  for (let i = 0; i < numClients; i++) {
    clientPools[c.id].push(generateClientId());
  }
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

console.log('\nGenerating synthetic payment data...');

const paymentRecords = [];

// Generate data from Feb 2023 to Dec 2025 (matching original data range)
const startDate = new Date('2023-02-01');
const endDate = new Date('2025-12-04');

// Calculate total days
const totalDays = Math.floor((endDate - startDate) / (1000 * 60 * 60 * 24));
const recordsPerDay = Math.ceil(recordCount / totalDays);

console.log(`Generating ~${recordsPerDay} records per day over ${totalDays} days`);

// Distribution weights for clinicians (senior clinicians see more clients)
const clinicianWeights = {
  '1': 1.3,  // Sarah Chen - Clinical Director, highest volume
  '2': 1.2,  // Maria Rodriguez - Senior Therapist
  '3': 1.0,  // Priya Patel - Therapist
  '4': 0.8,  // James Kim - Associate (newer)
  '5': 0.7,  // Michael Johnson - Associate (newest)
};

function getRandomClinician() {
  const totalWeight = CLINICIANS.reduce((sum, c) => sum + (clinicianWeights[c.id] || 1), 0);
  let random = Math.random() * totalWeight;
  for (const clinician of CLINICIANS) {
    random -= (clinicianWeights[clinician.id] || 1);
    if (random <= 0) return clinician;
  }
  return CLINICIANS[0];
}

// Generate records day by day
let currentDate = new Date(startDate);
let generatedCount = 0;

while (currentDate <= endDate && generatedCount < recordCount) {
  // Skip weekends (less sessions)
  const dayOfWeek = currentDate.getDay();
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

  // Vary sessions per day
  let sessionsToday = isWeekend
    ? Math.floor(Math.random() * 3) // 0-2 on weekends
    : Math.floor(recordsPerDay * 0.7 + Math.random() * recordsPerDay * 0.6); // Vary around average

  // Cap to not exceed total
  sessionsToday = Math.min(sessionsToday, recordCount - generatedCount);

  for (let i = 0; i < sessionsToday; i++) {
    const clinician = getRandomClinician();
    const clientPool = clientPools[clinician.id];
    const clientId = clientPool[Math.floor(Math.random() * clientPool.length)];
    const cptCode = getRandomCptCode();
    const amount = getAmountForCpt(cptCode);

    // Appointment date is current date, payment is usually next day
    const appointmentDate = new Date(currentDate);
    const datePaid = addDays(appointmentDate, 1);

    // Small chance of refund (negative amount)
    const isRefund = Math.random() < 0.005; // 0.5% refunds

    paymentRecords.push({
      clinicianId: clinician.id,
      clinician: clinician.name,
      datePaid: formatDate(datePaid),
      appointmentDate: formatDate(appointmentDate),
      cptCode: cptCode,
      clientId: clientId,
      amount: isRefund ? -amount : amount,
    });

    generatedCount++;
  }

  currentDate = addDays(currentDate, 1);
}

// Add a few product sales (empty appointment date)
const productSales = Math.floor(recordCount * 0.002); // 0.2% are product sales
for (let i = 0; i < productSales && generatedCount < recordCount; i++) {
  const clinician = getRandomClinician();
  const clientPool = clientPools[clinician.id];
  const clientId = clientPool[Math.floor(Math.random() * clientPool.length)];

  const saleDate = new Date(startDate.getTime() + Math.random() * (endDate - startDate));

  paymentRecords.push({
    clinicianId: clinician.id,
    clinician: clinician.name,
    datePaid: formatDate(saleDate),
    appointmentDate: '',
    cptCode: 'Product',
    clientId: clientId,
    amount: Math.round((50 + Math.random() * 150) / 5) * 5,
  });

  generatedCount++;
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
