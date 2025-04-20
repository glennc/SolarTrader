import { BaseTerminalInterface } from './base-terminal';
import { IShipSystem } from '../../systems/base-system';
import { SystemDiagnosticsInterface } from '../systems/system-diagnostics-interface';
import { InterfaceManager } from '../../managers/interface-manager';

/**
 * Bridge Terminal Interface
 * Provides access to navigation, communications, and ship status features
 */
export class BridgeTerminalInterface extends BaseTerminalInterface {
    private currentView: 'main' | 'status' | 'navigation' | 'communications' | 'diagnostics' = 'main';
    private shipSystems: Map<string, IShipSystem> = new Map();
    private systemDiagnosticsInterface: SystemDiagnosticsInterface | null = null;
    private interfaceManager: InterfaceManager | null = null;
    
    constructor() {
        super('bridge-terminal', 'Bridge Terminal');
    }
    
    /**
     * Set the ship systems that this terminal can access
     */
    setShipSystems(systems: Map<string, IShipSystem>): void {
        this.shipSystems = systems;
    }
    
    /**
     * Set the system diagnostics interface reference
     */
    setSystemDiagnosticsInterface(diagnosticsInterface: SystemDiagnosticsInterface): void {
        this.systemDiagnosticsInterface = diagnosticsInterface;
    }
    
    /**
     * Set the interface manager reference
     */
    setInterfaceManager(manager: InterfaceManager): void {
        this.interfaceManager = manager;
    }
    
    /**
     * Render the terminal interface
     */
    renderTerminal(): void {
        if (!this.renderer) return;
        
        // Clear the output area
        this.renderer.clearOutput();
        
        // Expand terminal for full view
        this.expandTerminalContainer();
        
        // Update the header
        this.updateTerminalHeader('BRIDGE TERMINAL');
        
        // Render the appropriate view
        switch (this.currentView) {
            case 'main':
                this.renderMainMenu();
                break;
            case 'status':
                this.renderShipStatus();
                break;
            case 'navigation':
                this.renderNavigationControl();
                break;
            case 'communications':
                this.renderCommunications();
                break;
            case 'diagnostics':
                this.renderSystemDiagnostics();
                break;
        }
    }
    
    /**
     * Handle terminal-specific commands
     */
    handleTerminalCommand(command: string): boolean {
        const lowerCommand = command.toLowerCase();
        
        // Main menu commands
        if (this.currentView === 'main') {
            if (lowerCommand === '1' || lowerCommand === 'status' || lowerCommand === 'ship status') {
                this.currentView = 'status';
                this.renderTerminal();
                return true;
            }
            else if (lowerCommand === '2' || lowerCommand === 'navigation' || lowerCommand === 'nav') {
                this.currentView = 'navigation';
                this.renderTerminal();
                return true;
            }
            else if (lowerCommand === '3' || lowerCommand === 'comms' || lowerCommand === 'communications') {
                this.currentView = 'communications';
                this.renderTerminal();
                return true;
            }
            else if (lowerCommand === '4' || lowerCommand === 'diagnostics' || lowerCommand === 'system diagnostics') {
                this.currentView = 'diagnostics';
                this.renderTerminal();
                return true;
            }
        }
        // Commands for navigation view
        else if (this.currentView === 'navigation') {
            if (lowerCommand === 'back' || lowerCommand === 'main' || lowerCommand === 'menu') {
                this.currentView = 'main';
                this.renderTerminal();
                return true;
            }
            // Add navigation-specific commands here
        }
        // Commands for communications view
        else if (this.currentView === 'communications') {
            if (lowerCommand === 'back' || lowerCommand === 'main' || lowerCommand === 'menu') {
                this.currentView = 'main';
                this.renderTerminal();
                return true;
            }
            // Add communications-specific commands here
        }
        // Commands for ship status view
        else if (this.currentView === 'status') {
            if (lowerCommand === 'back' || lowerCommand === 'main' || lowerCommand === 'menu') {
                this.currentView = 'main';
                this.renderTerminal();
                return true;
            }
            // Add status-specific commands here
        }
        // Commands for diagnostics view
        else if (this.currentView === 'diagnostics') {
            if (lowerCommand === 'back' || lowerCommand === 'main' || lowerCommand === 'menu') {
                this.currentView = 'main';
                this.renderTerminal();
                return true;
            }
            // Add diagnostics-specific commands here
        }
        
        return false;
    }
    
    /**
     * Exit the terminal
     */
    override exitTerminal(): void {
        // Reset to main view for next time
        this.currentView = 'main';
        
        // Call parent method to handle exit
        super.exitTerminal();
    }
    
    /**
     * Render the main menu
     */
    private renderMainMenu(): void {
        if (!this.renderer) return;
        
        // Create navigation status section
        const navStatus = document.createElement('div');
        navStatus.className = 'nav-status';
        navStatus.innerHTML = `
            <div class="terminal-section-header">NAVIGATION STATUS</div>
            <div class="terminal-row">
                <span class="terminal-label">STATUS:</span>
                <span class="terminal-value terminal-value--highlight">In Transit</span>
            </div>
            <div class="terminal-row">
                <span class="terminal-label">DESTINATION:</span>
                <span class="terminal-value">Alpha Centauri</span>
            </div>
            <div class="terminal-row">
                <span class="terminal-label">ETA:</span>
                <span class="terminal-value">4d 7h 23m</span>
            </div>
        `;
        
        this.renderer.updateOutput(navStatus.outerHTML);
        
        // Render main menu options
        this.renderMenu([
            { id: 'status', label: 'Ship Status Details' },
            { id: 'navigation', label: 'Navigation Control' },
            { id: 'communications', label: 'Communications' },
            { id: 'diagnostics', label: 'System Diagnostics' }
        ]);
        
        // Add footer hint
        const footer = document.createElement('div');
        footer.className = 'terminal-footer';
        footer.innerHTML = `
            <div class="status-text">Type a number or name to select an option</div>
            <div class="action-hint">Type 'exit' to leave terminal</div>
        `;
        
        this.renderer.updateOutput(footer.outerHTML);
    }
    
    /**
     * Render the ship status screen
     */
    private renderShipStatus(): void {
        if (!this.renderer) return;
        
        const statusContent = document.createElement('div');
        statusContent.className = 'terminal-content';
        
        // System status section
        const systemStatus = document.createElement('div');
        systemStatus.className = 'terminal-section';
        systemStatus.innerHTML = `
            <div class="terminal-section-header">SYSTEM STATUS</div>
        `;
        
        // Add system status bars
        const systemsToDisplay = [
            { id: 'power', name: 'POWER', cssClass: 'power' },
            { id: 'life-support', name: 'LIFE SUPPORT', cssClass: 'life-support' },
            { id: 'propulsion', name: 'ENGINES', cssClass: 'engines' }
        ];
        
        systemsToDisplay.forEach(system => {
            const shipSystem = this.shipSystems.get(system.id);
            const status = shipSystem ? shipSystem.status : 0;
            
            const row = document.createElement('div');
            row.className = 'terminal-row';
            row.innerHTML = `
                <span class="terminal-label">${system.name}:</span>
                <div class="terminal-bar-container">
                    <div class="terminal-bar terminal-bar--${system.cssClass}" style="width: ${status}%"></div>
                    <span class="terminal-bar-value">${Math.round(status)}%</span>
                </div>
            `;
            
            systemStatus.appendChild(row);
        });
        
        statusContent.appendChild(systemStatus);
        
        // Resources section
        const resources = document.createElement('div');
        resources.className = 'terminal-section';
        resources.innerHTML = `
            <div class="terminal-section-header">RESOURCES</div>
            <div class="terminal-row">
                <span class="terminal-label">FUEL:</span>
                <div class="terminal-bar-container">
                    <div class="terminal-bar terminal-bar--fuel" style="width: 65%"></div>
                    <span class="terminal-bar-value">65%</span>
                </div>
            </div>
            <div class="terminal-row">
                <span class="terminal-label">CARGO:</span>
                <div class="terminal-bar-container">
                    <div class="terminal-bar terminal-bar--cargo" style="width: 100%"></div>
                    <span class="terminal-bar-value">100%</span>
                </div>
            </div>
            <div class="terminal-row">
                <span class="terminal-label">SUPPLIES:</span>
                <div class="terminal-bar-container">
                    <div class="terminal-bar terminal-bar--cargo" style="width: 82%"></div>
                    <span class="terminal-bar-value">82%</span>
                </div>
            </div>
        `;
        
        statusContent.appendChild(resources);
        
        // Ship diagram
        const shipDiagram = document.createElement('div');
        shipDiagram.className = 'ship-diagram';
        shipDiagram.innerHTML = `
                      /\\
                     /  \\
                    /____\\
               _,--/______\\--._
             /____/        \\____\\
           /____/            \\____\\
          /____/              \\____\\
         /____/______________/\\____\\
        /________________________\\
          |____________________|
                /_    _\\
               /__|  |__\\
        `;
        
        statusContent.appendChild(shipDiagram);
        
        // Legend
        const legend = document.createElement('div');
        legend.className = 'ship-status-legend';
        legend.innerHTML = `
            <div class="legend-item">
                <div class="legend-color legend-color-normal"></div>
                <span>Normal</span>
            </div>
            <div class="legend-item">
                <div class="legend-color legend-color-warning"></div>
                <span>Warning</span>
            </div>
            <div class="legend-item">
                <div class="legend-color legend-color-danger"></div>
                <span>Critical</span>
            </div>
        `;
        
        statusContent.appendChild(legend);
        
        // Back option
        const backOption = document.createElement('div');
        backOption.className = 'terminal-option';
        backOption.textContent = 'Return to main menu';
        backOption.addEventListener('click', () => {
            this.currentView = 'main';
            this.renderTerminal();
        });
        
        statusContent.appendChild(backOption);
        
        this.renderer.updateOutput(statusContent.outerHTML);
    }
    
    /**
     * Render the navigation control screen
     */
    private renderNavigationControl(): void {
        if (!this.renderer) return;
        
        const navigationContent = document.createElement('div');
        navigationContent.className = 'terminal-content';
        navigationContent.innerHTML = `
            <div class="terminal-section-header">NAVIGATION CONTROL</div>
            <div class="nav-map">
                <div class="star-map">
                    <!-- Simplified star map representation -->
                    <div class="star" style="top: 30%; left: 20%;">
                        <div class="star-dot star-sol"></div>
                        <div class="star-label">Sol</div>
                    </div>
                    <div class="star" style="top: 45%; left: 60%;">
                        <div class="star-dot star-destination"></div>
                        <div class="star-label">Alpha Centauri</div>
                    </div>
                    <div class="ship-position" style="top: 40%; left: 40%;"></div>
                    <div class="nav-line" style="width: 40%; transform: rotate(15deg); top: 40%; left: 20%;"></div>
                </div>
            </div>
            
            <div class="terminal-section">
                <div class="terminal-section-header">JOURNEY DETAILS</div>
                <div class="terminal-row">
                    <span class="terminal-label">ORIGIN:</span>
                    <span class="terminal-value">Sol System (Earth)</span>
                </div>
                <div class="terminal-row">
                    <span class="terminal-label">DESTINATION:</span>
                    <span class="terminal-value">Alpha Centauri</span>
                </div>
                <div class="terminal-row">
                    <span class="terminal-label">DISTANCE:</span>
                    <span class="terminal-value">4.37 light years</span>
                </div>
                <div class="terminal-row">
                    <span class="terminal-label">JOURNEY TIME:</span>
                    <span class="terminal-value">12.5 days</span>
                </div>
                <div class="terminal-row">
                    <span class="terminal-label">ELAPSED:</span>
                    <span class="terminal-value">8.3 days</span>
                </div>
                <div class="terminal-row">
                    <span class="terminal-label">REMAINING:</span>
                    <span class="terminal-value">4.2 days</span>
                </div>
            </div>
            
            <div class="terminal-option back-option" id="back-to-main">Return to main menu</div>
        `;
        
        this.renderer.updateOutput(navigationContent.outerHTML);
        
        // Add event listener for back button
        setTimeout(() => {
            const backButton = document.getElementById('back-to-main');
            if (backButton) {
                backButton.addEventListener('click', () => {
                    this.currentView = 'main';
                    this.renderTerminal();
                });
            }
        }, 100);
    }
    
    /**
     * Render the communications screen
     */
    private renderCommunications(): void {
        if (!this.renderer) return;
        
        const commsContent = document.createElement('div');
        commsContent.className = 'terminal-content';
        commsContent.innerHTML = `
            <div class="terminal-section-header">COMMUNICATIONS</div>
            
            <div class="comms-status">
                <div class="status-indicator active"></div>
                <div class="status-text">COMMS SYSTEM ACTIVE - NO INCOMING TRANSMISSIONS</div>
            </div>
            
            <div class="message-log">
                <div class="terminal-section-header">MESSAGE LOG</div>
                <div class="message-entry">
                    <div class="message-header">
                        <span class="message-timestamp">Cycle 126, Shift 2</span>
                        <span class="message-sender">FROM: Solar System Traffic Control</span>
                    </div>
                    <div class="message-body">
                        Confirming departure clearance for Alpha Centauri route. Maintain standard protocol
                        for regular position updates. Safe travels.
                    </div>
                </div>
                
                <div class="message-entry">
                    <div class="message-header">
                        <span class="message-timestamp">Cycle 034, Shift 1</span>
                        <span class="message-sender">FROM: Cargo Consortium</span>
                    </div>
                    <div class="message-body">
                        Delivery confirmation #AC-29876 for medical supplies to Alpha Centauri Colony.
                        Priority level: Standard. Bonus payment upon early arrival.
                    </div>
                </div>
            </div>
            
            <div class="terminal-section">
                <div class="terminal-section-header">AVAILABLE CHANNELS</div>
                <div class="comms-channel">1. Emergency Beacon (RESTRICTED)</div>
                <div class="comms-channel">2. Solar System Traffic Control (OUT OF RANGE)</div>
                <div class="comms-channel">3. Alpha Centauri Colony (OUT OF RANGE)</div>
                <div class="comms-channel">4. General Merchant Frequency</div>
            </div>
            
            <div class="terminal-option back-option" id="back-to-main">Return to main menu</div>
        `;
        
        this.renderer.updateOutput(commsContent.outerHTML);
        
        // Add event listener for back button
        setTimeout(() => {
            const backButton = document.getElementById('back-to-main');
            if (backButton) {
                backButton.addEventListener('click', () => {
                    this.currentView = 'main';
                    this.renderTerminal();
                });
            }
        }, 100);
    }
    
    /**
     * Render the system diagnostics screen
     */
    private renderSystemDiagnostics(): void {
        if (!this.renderer) return;
        
        const diagnosticsContent = document.createElement('div');
        diagnosticsContent.className = 'terminal-content';
        diagnosticsContent.innerHTML = `
            <div class="terminal-section-header">SYSTEM DIAGNOSTICS</div>
            
            <div class="diagnostics-summary">
                <div class="summary-box">
                    <div class="summary-value">3</div>
                    <div class="summary-label">Systems Requiring Attention</div>
                </div>
                <div class="summary-box">
                    <div class="summary-value">7</div>
                    <div class="summary-label">Systems Nominal</div>
                </div>
                <div class="summary-box">
                    <div class="summary-value">0</div>
                    <div class="summary-label">Critical Issues</div>
                </div>
            </div>
            
            <div class="system-list">
                <div class="system-item warning">
                    <div class="system-name">Engine Coolant System</div>
                    <div class="system-status">76% - Maintenance Required</div>
                    <div class="system-action">INSPECT</div>
                </div>
                <div class="system-item warning">
                    <div class="system-name">Life Support Filters</div>
                    <div class="system-status">68% - Replacement Due</div>
                    <div class="system-action">INSPECT</div>
                </div>
                <div class="system-item warning">
                    <div class="system-name">Power Cell 2</div>
                    <div class="system-status">72% - Efficiency Degraded</div>
                    <div class="system-action">INSPECT</div>
                </div>
                <div class="system-item normal">
                    <div class="system-name">Navigation System</div>
                    <div class="system-status">98% - Nominal</div>
                    <div class="system-action">INSPECT</div>
                </div>
                <div class="system-item normal">
                    <div class="system-name">Communications Array</div>
                    <div class="system-status">95% - Nominal</div>
                    <div class="system-action">INSPECT</div>
                </div>
            </div>
            
            <div class="terminal-options">
                <div class="terminal-option full-diagnostics-option" id="open-full-diagnostics">
                    OPEN FULL DIAGNOSTICS PANEL
                </div>
                <div class="terminal-option back-option" id="back-to-main">
                    RETURN TO MAIN MENU
                </div>
            </div>
        `;
        
        this.renderer.updateOutput(diagnosticsContent.outerHTML);
        
        // Add event listeners after DOM update
        setTimeout(() => {
            // Back button event listener
            const backButton = document.getElementById('back-to-main');
            if (backButton) {
                backButton.addEventListener('click', () => {
                    this.currentView = 'main';
                    this.renderTerminal();
                });
            }
            
            // Full diagnostics panel button
            const fullDiagnosticsButton = document.getElementById('open-full-diagnostics');
            if (fullDiagnosticsButton) {
                fullDiagnosticsButton.addEventListener('click', () => {
                    this.openFullDiagnosticsPanel();
                });
            }
            
            // Make system items clickable
            document.querySelectorAll('.system-action').forEach(actionButton => {
                actionButton.addEventListener('click', () => {
                    // For demonstration purposes, just open the full diagnostics panel
                    this.openFullDiagnosticsPanel();
                });
            });
        }, 100);
    }
    
    /**
     * Opens the full system diagnostics panel interface
     */
    private openFullDiagnosticsPanel(): void {
        // Exit the terminal interface first
        this.exitTerminal();
        
        // Launch the system diagnostics interface if available
        if (this.systemDiagnosticsInterface && this.interfaceManager) {
            this.interfaceManager.showSystemInterface(this.systemDiagnosticsInterface);
        } else {
            console.error('System diagnostics interface or interface manager not set up correctly');
        }
    }
}