import { BaseSystemInterface } from '../base-system-interfaces';
import { Ship } from '../../core/ship';

// Import components from our new modular architecture
import {
    DiagnosticsState,
    DiagnosticScanner,
    OverviewView,
    DetailedView,
    HistoricalView,
    ScanView,
    ScanViewCallbacks
} from './diagnostics';

/**
 * The System Diagnostics Interface provides comprehensive monitoring of all ship systems
 * This class coordinates between different views and handles high-level UI interactions
 */
export class SystemDiagnosticsInterface extends BaseSystemInterface {
    private state: DiagnosticsState;
    private scanner: DiagnosticScanner;
    
    constructor() {
        super(
            'System Diagnostics Panel',
            'Provides comprehensive diagnostic information for all ship systems.',
            'A sophisticated terminal with multiple displays showing the status of various ship systems. The screen shows colorful graphs and status indicators. There\'s a "SYSTEM DIAGNOSTICS" label at the top of the panel.',
            false,
            ['diagnostics', 'system panel', 'status monitor', 'diagnostics panel'],
            ['examine', 'look at', 'use', 'access', 'interact']
        );
        
        // Initialize state and scanner
        this.state = new DiagnosticsState();
        this.scanner = new DiagnosticScanner(this.state);
    }
    
    /**
     * Sets the ship reference to access ship systems data
     */
    setShip(_ship: Ship): void {
        // Currently not using the ship reference, but keeping the method
        // for future implementations that may need ship data
    }
    
    /**
     * Renders the system diagnostics interface
     */
    renderInterface(): () => void {
        // Load the system interfaces CSS
        this.loadInterfaceCSS('/css/system-interfaces.css', 'system-interfaces');
        
        // Set the terminal container to system mode for expanded view
        const terminalContainer = document.querySelector('.terminal-container');
        if (terminalContainer) {
            terminalContainer.classList.add('system-mode');
        }
        
        // Get the terminal output element where we'll render our interface
        const terminalOutput = document.querySelector('.terminal-output');
        if (terminalOutput) {
            terminalOutput.innerHTML = '';
        }
        
        // Create the interface directly without using a DOMRenderer
        this.renderDiagnosticsInterfaceDirectly();
        
        // Return a function that will be called when exiting the interface
        return () => {
            console.log("Exiting system diagnostics interface");
            
            // Remove the system mode class when exiting
            if (terminalContainer) {
                terminalContainer.classList.remove('system-mode');
            }
            
            // Unload the CSS when exiting
            this.unloadInterfaceCSS();
        };
    }
    
    /**
     * Renders the diagnostic panel interface directly to the DOM without a renderer
     */
    private renderDiagnosticsInterfaceDirectly(): void {
        // Check if we're re-rendering an existing interface
        const existingContent = document.querySelector('.terminal-content');
        const isUpdate = !!existingContent && document.body.contains(existingContent);
        
        // Update the header text
        const headerText = document.querySelector('.terminal-header-text');
        if (headerText) {
            headerText.textContent = 'SYSTEM DIAGNOSTICS PANEL v2.34';
        }
        
        // Calculate mission time (placeholder)
        const missionTimeDisplay = 'T+02:04:37:12';
        
        // Update the time display
        const headerTime = document.querySelector('.terminal-time');
        if (headerTime) {
            headerTime.textContent = missionTimeDisplay;
        } else {
            // Create time element if it doesn't exist
            const terminalHeader = document.querySelector('.terminal-header');
            if (terminalHeader) {
                const timeElement = document.createElement('div');
                timeElement.className = 'terminal-time';
                timeElement.textContent = missionTimeDisplay;
                terminalHeader.appendChild(timeElement);
            }
        }
        
        // Create the main interface container
        const container = document.createElement('div');
        container.className = 'terminal-content system-diagnostics';
        container.id = 'diagnostics-interface-container';
        
        // Create the diagnostics panel content based on the current mode
        container.innerHTML = this.getDiagnosticsContent();
        
        // Handle different rendering strategies based on whether this is an update or initial render
        if (isUpdate) {
            // Replace the existing content instead of appending
            existingContent.replaceWith(container);
        } else {
            // Initial render, add to terminal output
            const terminalOutput = document.querySelector('.terminal-output');
            if (terminalOutput) {
                terminalOutput.innerHTML = '';
                terminalOutput.appendChild(container);
            }
        }
        
        // Attach event handlers after DOM update
        setTimeout(() => this.attachEventHandlers(), 100);
    }
    
    /**
     * Generates the HTML content for the diagnostics interface based on the current mode
     */
    private getDiagnosticsContent(): string {
        let contentHTML = '';
        
        // Common header section
        contentHTML += `
            <div class="diagnostics-panels">
                <div class="diagnostics-header">
                    <div class="diagnostics-title">FULL SYSTEM DIAGNOSTIC SCAN</div>
                    <div class="diagnostics-controls">
                        <button class="diagnostics-button ${this.state.activeScanMode === 'overview' ? 'active' : ''}">OVERVIEW</button>
                        <button class="diagnostics-button ${this.state.activeScanMode === 'detailed' ? 'active' : ''}">DETAILED</button>
                        <button class="diagnostics-button ${this.state.activeScanMode === 'historical' ? 'active' : ''}">HISTORICAL</button>
                        <button class="diagnostics-button ${this.state.activeScanMode === 'scan' ? 'active' : ''}">RUN NEW SCAN</button>
                    </div>
                </div>`;
        
        // Content based on the active mode using our view components
        if (this.state.activeScanMode === 'overview') {
            contentHTML += new OverviewView(this.state).render();
        } else if (this.state.activeScanMode === 'detailed') {
            contentHTML += new DetailedView(this.state).render();
        } else if (this.state.activeScanMode === 'historical') {
            contentHTML += new HistoricalView(this.state).render();
        } else if (this.state.activeScanMode === 'scan') {
            contentHTML += new ScanView(this.state, this.scanner).render();
        }
        
        // Common footer section
        contentHTML += `
                <div class="terminal-footer">
                    <div class="footer-status">
                        Last scan: ${this.state.getLastScanTimeString()}
                    </div>
                    <div class="footer-controls">
                        <span data-action="help">HELP</span>
                        <span data-action="export">EXPORT</span>
                        <span data-action="exit">EXIT</span>
                    </div>
                </div>
            </div>`;
        
        return contentHTML;
    }
    
    /**
     * Attaches event handlers for diagnostics interface interactions
     */
    private attachEventHandlers(): void {
        // Button handlers for mode switching
        document.querySelectorAll('.diagnostics-button').forEach(button => {
            button.addEventListener('click', (e) => {
                const target = e.target as HTMLElement;
                const mode = target.textContent?.trim().toLowerCase();
                
                // Remove active class from all buttons
                document.querySelectorAll('.diagnostics-button').forEach(btn => 
                    btn.classList.remove('active'));
                
                // Add active class to clicked button
                target.classList.add('active');
                
                if (mode === 'overview') {
                    this.state.activeScanMode = 'overview';
                    this.updateDiagnosticsContent();
                } else if (mode === 'detailed') {
                    this.state.activeScanMode = 'detailed';
                    this.updateDiagnosticsContent();
                } else if (mode === 'historical') {
                    this.state.activeScanMode = 'historical';
                    this.updateDiagnosticsContent();
                } else if (mode === 'run new scan') {
                    this.runDiagnostic();
                }
            });
        });
        
        // Exit button
        const exitButton = document.querySelector('.footer-controls span[data-action="exit"]');
        if (exitButton) {
            exitButton.addEventListener('click', () => {
                if (this.interfaceManager) {
                    this.interfaceManager.returnToFirstPerson();
                }
            });
        }
        
        // Also listen for escape key to exit
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') {
                if (this.interfaceManager) {
                    this.interfaceManager.returnToFirstPerson();
                }
            }
        }, { once: true });
        
        // Attach specific handlers for scan view if active
        if (this.state.activeScanMode === 'scan') {
            const scanView = new ScanView(this.state, this.scanner);
            const scanCallbacks: ScanViewCallbacks = {
                onScanStart: () => {
                    this.updateDiagnosticsContent();
                },
                onScanComplete: (success) => {
                    // After scan completes, switch back to overview
                    setTimeout(() => {
                        this.state.activeScanMode = 'overview';
                        this.updateDiagnosticsContent();
                    }, success ? 2000 : 1500);
                },
                onReturnToOverview: () => {
                    this.state.activeScanMode = 'overview';
                    this.updateDiagnosticsContent();
                }
            };
            scanView.attachEventHandlers(scanCallbacks);
        }
        
        // Attach handlers for maintenance alert dismiss buttons
        document.querySelectorAll('.dismiss-button').forEach(button => {
            button.addEventListener('click', (e) => {
                const target = e.target as HTMLElement;
                const alertId = target.getAttribute('data-alert-id');
                
                if (alertId) {
                    // Find the alert element
                    const alertElement = document.getElementById(alertId);
                    if (alertElement) {
                        // Remove the alert with a fade-out animation
                        alertElement.style.opacity = '0';
                        alertElement.style.transition = 'opacity 0.3s ease';
                        
                        // Remove from DOM after animation completes
                        setTimeout(() => {
                            alertElement.remove();
                            
                            // Find which maintenance item this was
                            const systemName = alertElement.querySelector('.alert-system')?.textContent?.replace(':', '');
                            if (systemName) {
                                // Find the index of this item in the maintenance items array
                                const index = this.state.maintenanceItems.findIndex(
                                    item => item.system === systemName
                                );
                                
                                // Remove this item from the maintenance items array
                                if (index >= 0) {
                                    this.state.removeMaintenanceItem(index);
                                }
                                
                                // Add a log entry for the dismissed alert
                                this.state.addSystemLog(`Maintenance alert for ${systemName} acknowledged`, 'info');
                                
                                // If in overview mode, update the logs display
                                if (this.state.activeScanMode === 'overview') {
                                    const logsContainer = document.querySelector('.logs-container');
                                    if (logsContainer) {
                                        logsContainer.innerHTML = new OverviewView(this.state).renderSystemLogs();
                                    }
                                }
                            }
                        }, 300);
                    }
                }
            });
        });
    }
    
    /**
     * Updates the interface content without full re-render
     */
    private updateDiagnosticsContent(): void {
        const container = document.getElementById('diagnostics-interface-container');
        if (!container) return;
        
        // Create a new container with updated content
        const updatedContainer = document.createElement('div');
        updatedContainer.className = 'terminal-content system-diagnostics';
        updatedContainer.id = 'diagnostics-interface-container';
        updatedContainer.innerHTML = this.getDiagnosticsContent();
        
        // Replace the existing container
        container.replaceWith(updatedContainer);
        
        // Reattach event handlers
        this.attachEventHandlers();
    }
    
    /**
     * Simulates running a diagnostic scan
     */
    private runDiagnostic(): void {
        if (this.state.isDiagnosticRunning) return;
        
        // Change to scan mode
        this.state.activeScanMode = 'scan';
        this.updateDiagnosticsContent();
    }
}