import { DiagnosticsState } from '../models/diagnostics-state';
import { DiagnosticScanner, ScanCallbacks } from '../services/diagnostic-scanner';

/**
 * Renders the scan view of the diagnostics interface
 */
export class ScanView {
    private state: DiagnosticsState;
    private scanner: DiagnosticScanner;
    
    constructor(state: DiagnosticsState, scanner: DiagnosticScanner) {
        this.state = state;
        this.scanner = scanner;
    }
    
    /**
     * Renders the scan view content
     */
    render(): string {
        return `
            <div class="scan-screen">
                <div class="scan-status-container">
                    <div class="scan-status">
                        <h2>DIAGNOSTIC SCAN ${this.state.isDiagnosticRunning ? 'IN PROGRESS' : 'READY'}</h2>
                        <div class="scan-progress-container">
                            <div class="scan-progress-text">${this.state.isDiagnosticRunning ? 'SCANNING SHIP SYSTEMS...' : 'READY TO INITIATE'}</div>
                            ${this.state.isDiagnosticRunning ? '<div class="scan-progress-bar"><div class="scan-progress-fill"></div></div>' : ''}
                        </div>
                    </div>
                </div>
                
                <div class="scan-visualization">
                    <div class="scan-ship-diagram">
                        <div class="ship-outline">
                            <div class="ship-section" data-section="power">
                                <div class="section-label">POWER</div>
                                <div class="section-status ${this.state.isDiagnosticRunning ? 'scanning' : ''}"></div>
                            </div>
                            <div class="ship-section" data-section="propulsion">
                                <div class="section-label">PROPULSION</div>
                                <div class="section-status ${this.state.isDiagnosticRunning ? 'scanning' : ''}"></div>
                            </div>
                            <div class="ship-section" data-section="life-support">
                                <div class="section-label">LIFE SUPPORT</div>
                                <div class="section-status ${this.state.isDiagnosticRunning ? 'scanning' : ''}"></div>
                            </div>
                            <div class="ship-section" data-section="navigation">
                                <div class="section-label">NAVIGATION</div>
                                <div class="section-status ${this.state.isDiagnosticRunning ? 'scanning' : ''}"></div>
                            </div>
                            <div class="ship-section" data-section="comms">
                                <div class="section-label">COMMS</div>
                                <div class="section-status ${this.state.isDiagnosticRunning ? 'scanning' : ''}"></div>
                            </div>
                            <div class="scan-beam ${this.state.isDiagnosticRunning ? 'active' : ''}"></div>
                        </div>
                    </div>
                    
                    <div class="scan-details">
                        <div class="scan-detail-header">DIAGNOSTIC DETAILS</div>
                        <div class="scan-metrics">
                            <div class="scan-metric">
                                <div class="metric-label">Systems Checked</div>
                                <div class="metric-value" id="systems-checked">${this.state.isDiagnosticRunning ? '<span class="counting">0</span>/5' : '0/5'}</div>
                            </div>
                            <div class="scan-metric">
                                <div class="metric-label">Subsystems Analyzed</div>
                                <div class="metric-value" id="subsystems-checked">${this.state.isDiagnosticRunning ? '<span class="counting">0</span>/24' : '0/24'}</div>
                            </div>
                            <div class="scan-metric">
                                <div class="metric-label">Issues Detected</div>
                                <div class="metric-value" id="issues-detected">${this.state.isDiagnosticRunning ? '<span class="pending">SCANNING...</span>' : '0'}</div>
                            </div>
                            <div class="scan-metric">
                                <div class="metric-label">Time Elapsed</div>
                                <div class="metric-value" id="scan-time">${this.state.isDiagnosticRunning ? '<span class="counting">00:00</span>' : '00:00'}</div>
                            </div>
                        </div>
                        
                        <div class="scan-log">
                            <div class="scan-log-header">SCAN LOG</div>
                            <div class="scan-log-content" id="scan-log-content">
                                ${this.state.isDiagnosticRunning ? 
                                    `<div class="log-entry">Initializing diagnostic scan sequence...</div>
                                     <div class="log-entry">Connecting to ship mainframe...</div>
                                     <div class="log-entry">Beginning system analysis...</div>` : 
                                    '<div class="log-entry"><span class="log-message">Diagnostic scan ready to initiate</span></div>'}
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="scan-controls">
                    ${this.state.isDiagnosticRunning ? 
                        '<button class="scan-button cancel-button" id="cancel-scan-button">CANCEL SCAN</button>' : 
                        '<button class="scan-button start-button" id="start-scan-button">INITIATE SCAN</button>'}
                    <button class="scan-button return-button" id="return-button">RETURN TO OVERVIEW</button>
                </div>
            </div>
        `;
    }
    
    /**
     * Attaches event handlers for scan view interactions
     */
    attachEventHandlers(callbacks: ScanViewCallbacks): void {
        // Start scan button
        const startScanButton = document.getElementById('start-scan-button');
        if (startScanButton) {
            startScanButton.addEventListener('click', () => {
                this.startScan(callbacks);
            });
        }
        
        // Cancel scan button
        const cancelScanButton = document.getElementById('cancel-scan-button');
        if (cancelScanButton) {
            cancelScanButton.addEventListener('click', () => {
                this.cancelScan(callbacks);
            });
        }
        
        // Return to overview button
        const returnButton = document.getElementById('return-button');
        if (returnButton) {
            returnButton.addEventListener('click', () => {
                if (callbacks.onReturnToOverview) {
                    callbacks.onReturnToOverview();
                }
            });
        }
    }
    
    /**
     * Starts the scan process
     */
    private startScan(callbacks: ScanViewCallbacks): void {
        // Set up callbacks for the scanner
        const scanCallbacks: ScanCallbacks = {
            onLogEntry: (message, type) => {
                this.addScanLogEntry(message, type);
            },
            onMetricsUpdate: (metrics) => {
                this.updateScanMetrics(metrics);
            },
            onSectionComplete: (section) => {
                this.markSectionComplete(section);
            },
            onAllSectionsComplete: () => {
                this.markAllSectionsComplete();
            },
            onIssueDetected: (count) => {
                this.updateIssuesDetected(count);
            },
            onScanCompleted: (success) => {
                if (callbacks.onScanComplete) {
                    callbacks.onScanComplete(success);
                }
            }
        };
        
        // Start the scan
        this.scanner.startScanProcess(scanCallbacks);
        
        // Update UI to reflect scanning state
        if (callbacks.onScanStart) {
            callbacks.onScanStart();
        }
    }
    
    /**
     * Cancels an active scan
     */
    private cancelScan(callbacks: ScanViewCallbacks): void {
        const scanCallbacks: ScanCallbacks = {
            onLogEntry: (message, type) => {
                this.addScanLogEntry(message, type);
            },
            onScanCompleted: (success) => {
                if (callbacks.onScanComplete) {
                    callbacks.onScanComplete(success);
                }
            }
        };
        
        this.scanner.cancelScanProcess(scanCallbacks);
    }
    
    /**
     * Adds an entry to the scan log
     */
    private addScanLogEntry(message: string, type: 'info' | 'warning' | 'error' | 'success' = 'info'): void {
        const logContainer = document.getElementById('scan-log-content');
        if (!logContainer) return;
        
        const logEntry = document.createElement('div');
        logEntry.className = `log-entry ${type}`;
        logEntry.innerHTML = message;
        
        logContainer.appendChild(logEntry);
        logContainer.scrollTop = logContainer.scrollHeight;
    }
    
    /**
     * Updates the scan metrics display
     */
    private updateScanMetrics(metrics: {
        systemsChecked: number,
        totalSystems: number,
        subsystemsChecked: number,
        totalSubsystems: number,
        timeElapsed: string,
        progress: number
    }): void {
        // Update systems checked
        const systemsCheckedElement = document.getElementById('systems-checked');
        if (systemsCheckedElement) {
            systemsCheckedElement.innerHTML = `<span class="counting">${metrics.systemsChecked}</span>/${metrics.totalSystems}`;
        }
        
        // Update subsystems checked
        const subsystemsCheckedElement = document.getElementById('subsystems-checked');
        if (subsystemsCheckedElement) {
            subsystemsCheckedElement.innerHTML = `<span class="counting">${metrics.subsystemsChecked}</span>/${metrics.totalSubsystems}`;
        }
        
        // Update time elapsed
        const timeElement = document.getElementById('scan-time');
        if (timeElement) {
            timeElement.innerHTML = `<span class="counting">${metrics.timeElapsed}</span>`;
        }
        
        // Update progress bar
        const progressBar = document.querySelector('.scan-progress-fill');
        if (progressBar && progressBar instanceof HTMLElement) {
            progressBar.style.width = `${metrics.progress}%`;
        }
    }
    
    /**
     * Updates the issues detected count
     */
    private updateIssuesDetected(count: number): void {
        const issuesElement = document.getElementById('issues-detected');
        if (issuesElement) {
            issuesElement.innerHTML = `<span class="warning">${count}</span>`;
        }
    }
    
    /**
     * Marks a section as complete in the ship visualization
     */
    private markSectionComplete(section: string): void {
        const sectionElement = document.querySelector(`.ship-section[data-section="${section}"] .section-status`);
        if (sectionElement) {
            sectionElement.classList.remove('scanning');
            sectionElement.classList.add('complete');
        }
    }
    
    /**
     * Marks all sections as complete in the ship visualization
     */
    private markAllSectionsComplete(): void {
        document.querySelectorAll('.ship-section .section-status').forEach(section => {
            section.classList.remove('scanning');
            section.classList.add('complete');
        });
        
        // Update scan status
        const statusElement = document.querySelector('.scan-status h2');
        if (statusElement) {
            statusElement.textContent = 'DIAGNOSTIC SCAN COMPLETE';
        }
        
        // Add glow effect to the ship diagram
        const shipOutline = document.querySelector('.ship-outline');
        if (shipOutline) {
            shipOutline.classList.add('scan-complete');
        }
    }
}

/**
 * Interface for scan view callback functions
 */
export interface ScanViewCallbacks {
    onScanStart?: () => void;
    onScanComplete?: (success: boolean) => void;
    onReturnToOverview?: () => void;
}