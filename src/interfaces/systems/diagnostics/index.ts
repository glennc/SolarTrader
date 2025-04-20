/**
 * Diagnostics module
 * 
 * This barrel file exports all diagnostics components, models, and services
 * to make them accessible from a single import.
 */

// Export models
export { DiagnosticsState, type MaintenanceItem, type SystemLog } from './models/diagnostics-state';

// Export services
export { DiagnosticFormatter } from './services/diagnostic-formatter';
export { DiagnosticScanner, type ScanCallbacks, type ScanMetrics } from './services/diagnostic-scanner';

// Export views
export { OverviewView } from './views/overview-view';
export { DetailedView } from './views/detailed-view';
export { HistoricalView } from './views/historical-view';
export { ScanView, type ScanViewCallbacks } from './views/scan-view';