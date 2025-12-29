// =============================================================================
// DEMO DATA GENERATOR - MAIN ENTRY POINT
// =============================================================================
// This is the main entry point for the demo data generation system.
// It exports all types, configurations, utilities, and the main generator.
// =============================================================================

// Types
export * from './types';

// Configuration
export * from './config/defaultConfig';
export * from './config/validators';

// Utilities
export * from './utils/random';
export * from './utils/dateUtils';
export * from './utils/nameGenerator';

// Main generator
export { generateDemoData } from './generators/orchestrator';
