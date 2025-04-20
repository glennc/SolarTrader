import { DiagnosticsState } from '../models/diagnostics-state';
import { DiagnosticFormatter } from './diagnostic-formatter';

/**
 * Service that handles the diagnostic scan process
 */
export class DiagnosticScanner {
    private state: DiagnosticsState;
    private scanInterval: number | null = null;
    private totalSystems = 5;
    private totalSubsystems = 24;
    private scanDuration = 10; // seconds
    
    constructor(state: DiagnosticsState) {
        this.state = state;
    }
    
    /**
     * Starts the diagnostic scan process
     * @param callbacks Callbacks for UI updates during scanning
     */
    startScanProcess(callbacks: ScanCallbacks): void {
        if (this.state.isDiagnosticRunning) return;
        
        this.state.isDiagnosticRunning = true;
        
        // Initialize counters for scan simulation
        let systemsChecked = 0;
        let subsystemsChecked = 0;
        let issuesDetected = 0;
        let timeElapsed = 0;
        let currentSection = 0;
        const sections = ['power', 'propulsion', 'life-support', 'navigation', 'comms'];
        
        // Add initial scan log entry
        if (callbacks.onLogEntry) {
            callbacks.onLogEntry(`${DiagnosticFormatter.formatScanTime(0)} Initializing diagnostic scan sequence...`, 'info');
        }
        
        // Update scan progress in real-time
        this.scanInterval = window.setInterval(() => {
            timeElapsed += 1;
            
            // Calculate progress based on elapsed time
            const progress = Math.min(timeElapsed / this.scanDuration, 1);
            systemsChecked = Math.floor(progress * this.totalSystems);
            subsystemsChecked = Math.floor(progress * this.totalSubsystems);
            
            // Select the section currently being scanned
            if (systemsChecked > currentSection && currentSection < sections.length) {
                // Mark previous section as completed
                if (callbacks.onSectionComplete) {
                    callbacks.onSectionComplete(sections[currentSection]);
                }
                
                currentSection = Math.min(systemsChecked, sections.length - 1);
                
                // Add entry to scan log
                if (callbacks.onLogEntry) {
                    callbacks.onLogEntry(
                        `${DiagnosticFormatter.formatScanTime(timeElapsed)} Analyzing ${sections[currentSection].replace('-', ' ')} systems...`,
                        'info'
                    );
                }
                
                // If we hit the propulsion section, simulate an issue detection
                if (sections[currentSection] === 'propulsion' && issuesDetected === 0) {
                    issuesDetected = 1;
                    setTimeout(() => {
                        if (callbacks.onLogEntry) {
                            callbacks.onLogEntry(
                                `${DiagnosticFormatter.formatScanTime(timeElapsed + 0.5)} WARNING: Propulsion efficiency below optimal parameters`,
                                'warning'
                            );
                        }
                        
                        if (callbacks.onIssueDetected) {
                            callbacks.onIssueDetected(issuesDetected);
                        }
                    }, 500);
                }
            }
            
            // Update UI metrics
            if (callbacks.onMetricsUpdate) {
                callbacks.onMetricsUpdate({
                    systemsChecked,
                    totalSystems: this.totalSystems,
                    subsystemsChecked,
                    totalSubsystems: this.totalSubsystems,
                    timeElapsed: DiagnosticFormatter.formatScanTime(timeElapsed),
                    progress: progress * 100
                });
            }
            
            // End scan when complete
            if (timeElapsed >= this.scanDuration) {
                this.clearScanInterval();
                this.completeScan(callbacks);
            }
        }, 1000);
    }
    
    /**
     * Cancels an in-progress diagnostic scan
     */
    cancelScanProcess(callbacks: ScanCallbacks): void {
        if (!this.state.isDiagnosticRunning) return;
        
        this.clearScanInterval();
        this.state.isDiagnosticRunning = false;
        
        if (callbacks.onLogEntry) {
            callbacks.onLogEntry(`${DiagnosticFormatter.formatScanTime(0)} Scan cancelled by user`, 'error');
        }
        
        // Notify scan completed (cancelled)
        if (callbacks.onScanCompleted) {
            setTimeout(() => callbacks.onScanCompleted(false), 1500);
        }
    }
    
    /**
     * Completes the scan process
     */
    private completeScan(callbacks: ScanCallbacks): void {
        this.state.isDiagnosticRunning = false;
        this.state.lastDiagnosticRun = new Date();
        
        // Add completion log entries
        if (callbacks.onLogEntry) {
            callbacks.onLogEntry(`${DiagnosticFormatter.formatScanTime(0)} Scan complete. All systems analyzed.`, 'success');
            callbacks.onLogEntry(`${DiagnosticFormatter.formatScanTime(0)} Generating diagnostic report...`, 'info');
        }
        
        // Add to system logs
        this.state.addSystemLog('Diagnostic scan completed', 'success');
        
        // Complete all sections
        if (callbacks.onAllSectionsComplete) {
            callbacks.onAllSectionsComplete();
        }
        
        // Notify scan completed successfully
        if (callbacks.onScanCompleted) {
            setTimeout(() => callbacks.onScanCompleted(true), 2000);
        }
    }
    
    /**
     * Clears the scan interval if it exists
     */
    private clearScanInterval(): void {
        if (this.scanInterval !== null) {
            clearInterval(this.scanInterval);
            this.scanInterval = null;
        }
    }
}

/**
 * Interface for callbacks during the scan process
 */
export interface ScanCallbacks {
    onLogEntry?: (message: string, type: 'info' | 'warning' | 'error' | 'success') => void;
    onMetricsUpdate?: (metrics: ScanMetrics) => void;
    onSectionComplete?: (section: string) => void;
    onAllSectionsComplete?: () => void;
    onIssueDetected?: (count: number) => void;
    onScanCompleted?: (success: boolean) => void;
}

/**
 * Interface for scan metrics data
 */
export interface ScanMetrics {
    systemsChecked: number;
    totalSystems: number;
    subsystemsChecked: number;
    totalSubsystems: number;
    timeElapsed: string;
    progress: number;
}