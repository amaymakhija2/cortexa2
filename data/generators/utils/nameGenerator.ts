// =============================================================================
// NAME GENERATOR
// =============================================================================
// Generates realistic, diverse names for clients and other entities.
// =============================================================================

import { RandomFn, randomChoice, randomHex } from './random';

// =============================================================================
// FIRST NAMES (200+ diverse names)
// =============================================================================

export const FIRST_NAMES = [
  // Common American names
  'James', 'Mary', 'Robert', 'Patricia', 'John', 'Jennifer', 'Michael', 'Linda',
  'David', 'Elizabeth', 'William', 'Barbara', 'Richard', 'Susan', 'Joseph', 'Jessica',
  'Thomas', 'Sarah', 'Christopher', 'Karen', 'Charles', 'Lisa', 'Daniel', 'Nancy',
  'Matthew', 'Betty', 'Anthony', 'Margaret', 'Mark', 'Sandra', 'Donald', 'Ashley',
  'Steven', 'Kimberly', 'Paul', 'Emily', 'Andrew', 'Donna', 'Joshua', 'Michelle',
  'Kenneth', 'Dorothy', 'Kevin', 'Carol', 'Brian', 'Amanda', 'George', 'Melissa',
  'Timothy', 'Deborah', 'Ronald', 'Stephanie', 'Edward', 'Rebecca', 'Jason', 'Sharon',

  // Modern popular names
  'Emma', 'Liam', 'Olivia', 'Noah', 'Ava', 'Oliver', 'Isabella', 'Elijah',
  'Sophia', 'Lucas', 'Mia', 'Mason', 'Charlotte', 'Logan', 'Amelia', 'Alexander',
  'Harper', 'Ethan', 'Evelyn', 'Jacob', 'Abigail', 'Aiden', 'Luna', 'Jackson',
  'Chloe', 'Sebastian', 'Penelope', 'Mateo', 'Layla', 'Jack', 'Riley', 'Owen',
  'Zoey', 'Theodore', 'Nora', 'Levi', 'Lily', 'Henry', 'Eleanor', 'Leo',
  'Hannah', 'Jayden', 'Lillian', 'Wyatt', 'Addison', 'Gabriel', 'Aubrey', 'Julian',

  // Hispanic/Latino names
  'Sofia', 'Santiago', 'Valentina', 'Matias', 'Camila', 'Diego', 'Lucia', 'Alejandro',
  'Maria', 'Carlos', 'Ana', 'Miguel', 'Isabella', 'Luis', 'Gabriela', 'Jose',
  'Elena', 'Juan', 'Rosa', 'Antonio', 'Carmen', 'Francisco', 'Adriana', 'Ricardo',

  // African American names
  'Aaliyah', 'Jayden', 'Imani', 'Malik', 'Zara', 'Darius', 'Nia', 'Andre',
  'Kiara', 'DeShawn', 'Jasmine', 'Terrell', 'Destiny', 'Jamal', 'Brianna', 'Marcus',
  'Taylor', 'Xavier', 'Alexis', 'Isaiah', 'Kennedy', 'Tyrone', 'Aisha', 'Darren',

  // Asian names
  'Wei', 'Mei', 'Jin', 'Lin', 'Yuki', 'Kenji', 'Sakura', 'Hiroshi',
  'Anh', 'Linh', 'Minh', 'Thanh', 'Priya', 'Raj', 'Ananya', 'Arjun',
  'Seo-yeon', 'Min-jun', 'Ji-woo', 'Hyun', 'Akiko', 'Takeshi', 'Hana', 'Ryu',

  // Middle Eastern names
  'Fatima', 'Omar', 'Layla', 'Ahmed', 'Zahra', 'Hassan', 'Amira', 'Ali',
  'Nadia', 'Yusuf', 'Sara', 'Ibrahim', 'Leila', 'Khalid', 'Maryam', 'Tariq',

  // European names
  'Anna', 'Nikolas', 'Elena', 'Dimitri', 'Svetlana', 'Ivan', 'Natasha', 'Sergei',
  'Ingrid', 'Lars', 'Astrid', 'Erik', 'Freya', 'Magnus', 'Sienna', 'Marco',
  'Giulia', 'Lorenzo', 'Chiara', 'Matteo', 'Francesca', 'Luca', 'Alessia', 'Giovanni',

  // Additional diverse names
  'Aaliya', 'Bodhi', 'Cora', 'Declan', 'Eloise', 'Felix', 'Genevieve', 'Hugo',
  'Iris', 'Jasper', 'Kira', 'Landon', 'Margot', 'Nico', 'Ophelia', 'Phoenix',
  'Quinn', 'Rowan', 'Stella', 'Theo', 'Uma', 'Vincent', 'Willa', 'Xander',
  'Yara', 'Zane', 'Adelaide', 'Bennett', 'Clara', 'Dawson', 'Esme', 'Finn',
];

// =============================================================================
// LAST NAMES (200+ diverse names)
// =============================================================================

export const LAST_NAMES = [
  // Common American names
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis',
  'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas',
  'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson', 'White',
  'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson', 'Walker', 'Young',
  'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores',
  'Green', 'Adams', 'Nelson', 'Baker', 'Hall', 'Rivera', 'Campbell', 'Mitchell',
  'Carter', 'Roberts', 'Gomez', 'Phillips', 'Evans', 'Turner', 'Diaz', 'Parker',

  // European surnames
  'O\'Brien', 'O\'Connor', 'Murphy', 'Kelly', 'Sullivan', 'Walsh', 'Kennedy', 'Ryan',
  'Schmidt', 'Schneider', 'Fischer', 'Weber', 'Meyer', 'Wagner', 'Becker', 'Hoffmann',
  'Rossi', 'Russo', 'Ferrari', 'Esposito', 'Romano', 'Colombo', 'Ricci', 'Marino',
  'Dubois', 'Laurent', 'Bernard', 'Moreau', 'Simon', 'Michel', 'Leroy', 'Roux',
  'Johansson', 'Andersson', 'Lindberg', 'Eriksson', 'Nilsson', 'Larsson', 'Olsson', 'Persson',

  // Hispanic/Latino surnames
  'Morales', 'Reyes', 'Cruz', 'Ortiz', 'Gutierrez', 'Chavez', 'Ramos', 'Vargas',
  'Castillo', 'Jimenez', 'Ruiz', 'Moreno', 'Mendoza', 'Alvarez', 'Romero', 'Herrera',
  'Medina', 'Aguilar', 'Garza', 'Castro', 'Vazquez', 'Guerrero', 'Santos', 'Delgado',

  // Asian surnames
  'Kim', 'Park', 'Choi', 'Jung', 'Kang', 'Lee', 'Han', 'Yoon',
  'Wang', 'Li', 'Zhang', 'Liu', 'Chen', 'Yang', 'Huang', 'Wu',
  'Patel', 'Shah', 'Kumar', 'Singh', 'Sharma', 'Gupta', 'Reddy', 'Kapoor',
  'Tanaka', 'Watanabe', 'Yamamoto', 'Nakamura', 'Kobayashi', 'Saito', 'Suzuki', 'Sato',
  'Tran', 'Le', 'Pham', 'Vo', 'Hoang', 'Dang', 'Bui', 'Do',

  // Middle Eastern surnames
  'Khan', 'Ahmed', 'Ali', 'Hassan', 'Hussein', 'Mohammad', 'Ibrahim', 'Abbas',
  'Nasser', 'Khalil', 'Saleh', 'Rahman', 'Malik', 'Sheikh', 'Syed', 'Hasan',

  // African surnames
  'Okonkwo', 'Adeyemi', 'Obi', 'Nwosu', 'Chukwu', 'Afolabi', 'Mensah', 'Asante',
  'Diallo', 'Ba', 'Traore', 'Kone', 'Camara', 'Toure', 'Diop', 'Ndiaye',

  // Additional common surnames
  'Bennett', 'Wood', 'Barnes', 'Ross', 'Henderson', 'Coleman', 'Jenkins', 'Perry',
  'Powell', 'Long', 'Patterson', 'Hughes', 'Flores', 'Washington', 'Butler', 'Simmons',
  'Foster', 'Gonzales', 'Bryant', 'Alexander', 'Russell', 'Griffin', 'Diaz', 'Hayes',
  'Myers', 'Ford', 'Hamilton', 'Graham', 'Sullivan', 'Wallace', 'Woods', 'Cole',
  'West', 'Jordan', 'Owens', 'Reynolds', 'Fisher', 'Ellis', 'Harrison', 'Gibson',
  'McDonald', 'Cruz', 'Marshall', 'Ortiz', 'Gomez', 'Murray', 'Freeman', 'Wells',
];

// =============================================================================
// NAME GENERATION FUNCTIONS
// =============================================================================

/**
 * Generates a random full name (first + last)
 *
 * @param random - Random function to use
 * @returns Full name string
 */
export function generateClientName(random: RandomFn): string {
  const firstName = randomChoice(FIRST_NAMES, random);
  const lastName = randomChoice(LAST_NAMES, random);
  return `${firstName} ${lastName}`;
}

/**
 * Generates initials from a full name
 *
 * @param name - Full name (e.g., "John Smith")
 * @returns Initials (e.g., "JS")
 */
export function generateInitials(name: string): string {
  const parts = name.split(' ').filter(p => p.length > 0);
  if (parts.length === 0) return '';
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

/**
 * Generates a unique client ID (16 character hex string)
 *
 * @param random - Random function to use
 * @returns Unique ID string
 */
export function generateClientId(random: RandomFn): string {
  return randomHex(16, random);
}

/**
 * Generates a random email from a name
 *
 * @param firstName - First name
 * @param lastName - Last name
 * @param random - Random function to use
 * @returns Email address
 */
export function generateEmail(firstName: string, lastName: string, random: RandomFn): string {
  const domains = ['gmail.com', 'yahoo.com', 'outlook.com', 'icloud.com', 'hotmail.com', 'mail.com'];
  const domain = randomChoice(domains, random);
  const separator = randomChoice(['.', '_', ''], random);
  const suffix = Math.random() < 0.3 ? Math.floor(random() * 99).toString() : '';

  return `${firstName.toLowerCase()}${separator}${lastName.toLowerCase()}${suffix}@${domain}`;
}

/**
 * Generates a random phone number (US format)
 *
 * @param random - Random function to use
 * @returns Phone number string
 */
export function generatePhone(random: RandomFn): string {
  const areaCode = Math.floor(200 + random() * 800).toString();
  const exchange = Math.floor(200 + random() * 800).toString();
  const subscriber = Math.floor(1000 + random() * 9000).toString();
  return `(${areaCode}) ${exchange}-${subscriber}`;
}

/**
 * Parses a full name into first and last name
 *
 * @param fullName - Full name string
 * @returns Object with firstName and lastName
 */
export function parseName(fullName: string): { firstName: string; lastName: string } {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 0) {
    return { firstName: '', lastName: '' };
  }
  if (parts.length === 1) {
    return { firstName: parts[0], lastName: '' };
  }
  return {
    firstName: parts[0],
    lastName: parts.slice(1).join(' '),
  };
}

/**
 * Gets just the last name from a full name
 *
 * @param fullName - Full name string
 * @returns Last name
 */
export function getLastName(fullName: string): string {
  const parts = fullName.trim().split(/\s+/);
  return parts.length > 0 ? parts[parts.length - 1] : '';
}

/**
 * Gets just the first name from a full name
 *
 * @param fullName - Full name string
 * @returns First name
 */
export function getFirstName(fullName: string): string {
  const parts = fullName.trim().split(/\s+/);
  return parts.length > 0 ? parts[0] : '';
}

/**
 * Formats a clinician name with credential
 *
 * @param firstName - First name
 * @param lastName - Last name
 * @param credential - Credential type (PhD, LCSW, etc.)
 * @returns Formatted name (e.g., "Dr. Sarah Chen" or "Sarah Chen, LCSW")
 */
export function formatClinicianName(
  firstName: string,
  lastName: string,
  credential: string
): string {
  if (['PhD', 'PsyD'].includes(credential)) {
    return `Dr. ${firstName} ${lastName}`;
  }
  return `${firstName} ${lastName}, ${credential}`;
}

/**
 * Generates a short clinician name for display
 *
 * @param firstName - First name
 * @param lastName - Last name
 * @returns Short name (e.g., "S. Chen")
 */
export function generateShortName(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}. ${lastName}`;
}
