import { DOMRenderer } from '../dom-renderer';
import { BaseSystemInterface } from '../base-system-interfaces';

/**
 * The Coolant System interface provides monitoring and maintenance of the ship's coolant
 */
export class CoolantSystemInterface extends BaseSystemInterface {
    private coolantPressure: number = 76; // Start below maintenance threshold of 80%
    private coolantTemperature: number = 42; // Celsius
    private flowRate: number = 82; // Percentage of optimal
    private filterStatus: number = 65; // Percentage of filter life remaining
    private isFilterReplaced: boolean = false;
    private areValvesAligned: boolean = false;
    private isPressureRegulated: boolean = false;
    private primaryValveValue: number = 70;
    private bypassRegulatorValue: number = 50;
    private secondaryValveValue: number = 60;
    
    constructor() {
        super(
            'Coolant System',
            'Controls coolant flow to the main reactor.',
            'A series of color-coded valves and pipes that regulate the flow of coolant through the reactor system. A small pressure gauge nearby reads 76%, and a maintenance reminder is blinking on the adjacent display. The system appears functional but due for servicing.',
            false,
            ['coolant valves', 'coolant system', 'coolant', 'pipes', 'valves'],
            ['examine', 'look at', 'adjust', 'check', 'repair', 'use', 'access', 'interact']
        );
    }
    
    /**
     * Renders the coolant system interface
     */
    renderInterface(renderer: DOMRenderer): () => void {
        renderer.clearOutput();
        
        // Set the terminal container to system mode for expanded view
        const terminalContainer = document.querySelector('.terminal-container');
        if (terminalContainer) {
            terminalContainer.classList.add('system-mode');
        }
        
        this.renderCoolantInterface(renderer);
        
        // Return a function that will be called when exiting the interface
        return () => {
            console.log("Exiting coolant system interface");
            
            // Remove the system mode class when exiting
            if (terminalContainer) {
                terminalContainer.classList.remove('system-mode');
            }
        };
    }
    
    /**
     * Renders the coolant system status and controls
     */
    private renderCoolantInterface(renderer: DOMRenderer): void {
        // Check if we're re-rendering an existing interface
        const existingContent = document.querySelector('.terminal-content');
        const isUpdate = !!existingContent && document.body.contains(existingContent);
        
        // Update the header text to match the mockup
        const headerText = document.querySelector('.terminal-header-text');
        if (headerText) {
            headerText.textContent = 'ENGINE COOLANT SYSTEM v1.08';
        }
        
        // Create the main interface container
        const container = document.createElement('div');
        container.className = 'terminal-content';
        container.id = 'coolant-interface-container';
        
        // Add warning message if needed
        if (this.coolantPressure < 80 || !this.isPressureRegulated) {
            const warningDiv = document.createElement('div');
            warningDiv.className = 'coolant-warning';
            warningDiv.textContent = 'WARNING: Coolant pressure is below optimal range. Recommended adjustment required.';
            container.appendChild(warningDiv);
        }
        
        // Create the system diagram (simplified version)
        const systemDiagram = document.createElement('div');
        systemDiagram.className = 'system-diagram';
        systemDiagram.innerHTML = `
            <div class="system-component">REACTOR CORE</div>
            <div class="connection-line"></div>
            <div class="connection-node"></div>
            <div class="connection-line"></div>
            <div class="system-component">PRIMARY HEAT EXCHANGER</div>
            <div class="connection-line"></div>
            <div class="connection-node"></div>
            <div class="connection-line"></div>
            <div class="system-component">DISTRIBUTION MANIFOLD</div>
        `;
        container.appendChild(systemDiagram);
        
        // Create the coolant system grid layout as in the mockup
        const coolantSystem = document.createElement('div');
        coolantSystem.className = 'coolant-system';
        
        // Calculate temperature display values
        const tempK = 273 + this.coolantTemperature; // Convert to Kelvin
        const tempPercent = Math.min(100, Math.max(0, this.coolantTemperature / 100 * 100));
        
        coolantSystem.innerHTML = `
            <div class="system-label">INLET PRESSURE:</div>
            <div class="system-component">
                <div class="coolant-pipe">
                    <div class="coolant-flow" style="animation-duration: ${3 - this.coolantPressure/100}s;"></div>
                </div>
            </div>
            <div class="system-value ${this.coolantPressure < 80 ? 'system-warning' : ''}">${this.coolantPressure}% <span style="color: var(--terminal-dim);">${this.coolantPressure < 80 ? '(BELOW OPTIMAL)' : ''}</span></div>
            
            <div class="system-label">FLOW RATE:</div>
            <div class="system-component">
                <div class="coolant-pipe">
                    <div class="coolant-flow" style="animation-duration: ${3 - this.flowRate/100}s;"></div>
                </div>
            </div>
            <div class="system-value ${this.flowRate < 85 ? 'system-warning' : ''}">${this.flowRate}%</div>
            
            <div class="system-label">ENGINE TEMP:</div>
            <div class="system-component">
                <div class="temperature-gauge">
                    <div class="temperature-indicator" style="--temp-value: ${tempPercent}%;"></div>
                    <div class="temperature-value" style="--temp-value: ${tempPercent}%;">${tempK}K</div>
                </div>
            </div>
            <div class="system-value ${this.coolantTemperature > 40 ? 'system-warning' : ''}">${this.coolantTemperature > 40 ? `+${this.coolantTemperature - 30}K ABOVE NOMINAL` : 'NOMINAL'}</div>
            
            <div class="system-label">FILTER STATUS:</div>
            <div class="system-component">
                <div class="coolant-pipe">
                    <div class="coolant-flow" style="animation-duration: ${4 - this.filterStatus/100}s;"></div>
                </div>
            </div>
            <div class="system-value ${this.filterStatus < 70 ? 'system-warning' : ''}">${this.filterStatus}% <span style="color: var(--terminal-dim);">${this.filterStatus < 70 ? '(LOW)' : ''}</span></div>
        `;
        container.appendChild(coolantSystem);
        
        // Create valve controls
        const valveControls = document.createElement('div');
        valveControls.className = 'valve-controls';
        valveControls.innerHTML = `
            <div class="valve-control">
                <div class="valve-label">PRIMARY INLET VALVE</div>
                <div class="valve-slider-container">
                    <input type="range" class="valve-slider" id="primary-valve" min="0" max="100" value="${this.primaryValveValue}">
                    <div class="valve-slider-bg" style="--value: ${this.primaryValveValue}%;"></div>
                    <div class="valve-value">${this.primaryValveValue}%</div>
                </div>
            </div>
            
            <div class="valve-control">
                <div class="valve-label">BYPASS REGULATOR</div>
                <div class="valve-slider-container">
                    <input type="range" class="valve-slider" id="bypass-regulator" min="0" max="100" value="${this.bypassRegulatorValue}">
                    <div class="valve-slider-bg" style="--value: ${this.bypassRegulatorValue}%;"></div>
                    <div class="valve-value">${this.bypassRegulatorValue}%</div>
                </div>
            </div>
            
            <div class="valve-control">
                <div class="valve-label">SECONDARY OUTLET VALVE</div>
                <div class="valve-slider-container">
                    <input type="range" class="valve-slider" id="secondary-valve" min="0" max="100" value="${this.secondaryValveValue}">
                    <div class="valve-slider-bg" style="--value: ${this.secondaryValveValue}%;"></div>
                    <div class="valve-value">${this.secondaryValveValue}%</div>
                </div>
            </div>
        `;
        container.appendChild(valveControls);
        
        // Create button bar
        const buttonBar = document.createElement('div');
        buttonBar.className = 'button-bar';
        buttonBar.innerHTML = `
            <button class="action-button" id="flush-system">FLUSH SYSTEM</button>
            <button class="action-button" id="run-diagnostic">RUN DIAGNOSTICS</button>
            <button class="action-button primary-button" id="apply-changes">APPLY CHANGES</button>
            <button class="action-button" id="exit-system">RETURN TO ENGINE ROOM</button>
        `;
        container.appendChild(buttonBar);
        
        // Status notification area for messages
        const statusNotification = document.createElement('div');
        statusNotification.id = 'coolant-status-notification';
        statusNotification.className = 'coolant-status-notification';
        container.appendChild(statusNotification);
        
        // Footer with hints
        const footer = document.createElement('div');
        footer.className = 'terminal-footer';
        footer.innerHTML = `
            <div class="status-text">Last maintenance: ${this.isFilterReplaced ? '0' : '37'} hours ago</div>
            <div class="action-hint">Adjusting inlet valve to 85% may stabilize pressure</div>
        `;
        container.appendChild(footer);
        
        // Handle different rendering strategies based on whether this is an update or initial render
        if (isUpdate) {
            // Replace the existing content instead of appending
            existingContent.replaceWith(container);
        } else {
            // Initial render, use the normal updateOutput
            renderer.updateOutput(container.outerHTML);
        }
        
        // After the HTML is added to the DOM, attach event handlers
        setTimeout(() => {
            // Attach valve slider handlers
            const primaryValveSlider = document.getElementById('primary-valve') as HTMLInputElement;
            const bypassRegulatorSlider = document.getElementById('bypass-regulator') as HTMLInputElement;
            const secondaryValveSlider = document.getElementById('secondary-valve') as HTMLInputElement;
            
            if (primaryValveSlider) {
                primaryValveSlider.addEventListener('input', (e) => {
                    const target = e.target as HTMLInputElement;
                    const value = parseInt(target.value);
                    this.primaryValveValue = value;
                    const bg = primaryValveSlider.parentElement?.querySelector('.valve-slider-bg') as HTMLElement;
                    const valueDisplay = primaryValveSlider.parentElement?.querySelector('.valve-value') as HTMLElement;
                    if (bg) bg.style.setProperty('--value', `${value}%`);
                    if (valueDisplay) valueDisplay.textContent = `${value}%`;
                });
            }
            
            if (bypassRegulatorSlider) {
                bypassRegulatorSlider.addEventListener('input', (e) => {
                    const target = e.target as HTMLInputElement;
                    const value = parseInt(target.value);
                    this.bypassRegulatorValue = value;
                    const bg = bypassRegulatorSlider.parentElement?.querySelector('.valve-slider-bg') as HTMLElement;
                    const valueDisplay = bypassRegulatorSlider.parentElement?.querySelector('.valve-value') as HTMLElement;
                    if (bg) bg.style.setProperty('--value', `${value}%`);
                    if (valueDisplay) valueDisplay.textContent = `${value}%`;
                });
            }
            
            if (secondaryValveSlider) {
                secondaryValveSlider.addEventListener('input', (e) => {
                    const target = e.target as HTMLInputElement;
                    const value = parseInt(target.value);
                    this.secondaryValveValue = value;
                    const bg = secondaryValveSlider.parentElement?.querySelector('.valve-slider-bg') as HTMLElement;
                    const valueDisplay = secondaryValveSlider.parentElement?.querySelector('.valve-value') as HTMLElement;
                    if (bg) bg.style.setProperty('--value', `${value}%`);
                    if (valueDisplay) valueDisplay.textContent = `${value}%`;
                });
            }
            
            // Button handlers
            const flushSystemBtn = document.getElementById('flush-system');
            const runDiagnosticBtn = document.getElementById('run-diagnostic');
            const applyChangesBtn = document.getElementById('apply-changes');
            const exitSystemBtn = document.getElementById('exit-system');
            
            if (flushSystemBtn) {
                flushSystemBtn.addEventListener('click', () => {
                    this.filterStatus = 85;
                    this.showNotification('System flushed. Filter performance improved to 85%.');
                    // Use update method instead of full re-render
                    this.updateCoolantInterface();
                });
            }
            
            if (runDiagnosticBtn) {
                runDiagnosticBtn.addEventListener('click', () => {
                    const issues = [];
                    if (!this.isFilterReplaced) issues.push('filter replacement');
                    if (!this.areValvesAligned) issues.push('valve alignment');
                    if (!this.isPressureRegulated) issues.push('pressure regulation');
                    
                    if (issues.length === 0) {
                        this.showNotification('Diagnostic complete. All systems operating within normal parameters.');
                        this.coolantTemperature = 38;
                    } else {
                        this.showNotification(`Diagnostic complete. The following issues require attention: ${issues.join(', ')}.`);
                    }
                    
                    // Use update method instead of full re-render
                    this.updateCoolantInterface();
                });
            }
            
            if (applyChangesBtn) {
                applyChangesBtn.addEventListener('click', () => {
                    // Check valve configurations
                    if (this.primaryValveValue >= 80 && this.primaryValveValue <= 90 &&
                        this.bypassRegulatorValue >= 45 && this.bypassRegulatorValue <= 55 &&
                        this.secondaryValveValue >= 55 && this.secondaryValveValue <= 65) {
                        this.areValvesAligned = true;
                        this.flowRate = 95;
                        
                        if (this.primaryValveValue >= 85 && this.primaryValveValue <= 90) {
                            this.isPressureRegulated = true;
                            this.coolantPressure = 92;
                        } else {
                            this.coolantPressure = 85;
                        }
                        
                        this.showNotification('Valve settings applied. System performance has improved.');
                    } else {
                        this.showNotification('Valve settings applied, but configuration is not optimal.', true);
                        
                        // Make some improvements anyway
                        this.coolantPressure = Math.min(90, this.coolantPressure + 5);
                        this.flowRate = Math.min(90, this.flowRate + 3);
                    }
                    
                    // Recalculate temperature based on system state
                    if (this.isPressureRegulated && this.areValvesAligned) {
                        this.coolantTemperature = Math.max(35, this.coolantTemperature - 3);
                    }
                    
                    // Use update method instead of full re-render
                    this.updateCoolantInterface();
                });
            }
            
            if (exitSystemBtn) {
                exitSystemBtn.addEventListener('click', () => {
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
            
        }, 100); // Short delay to ensure the DOM is updated
    }
    
    /**
     * Updates specific parts of the coolant interface without full re-rendering
     */
    private updateCoolantInterface(): void {
        // Update pressure display
        const pressureValue = document.querySelector('.system-label:nth-of-type(1) + .system-component + .system-value');
        if (pressureValue) {
            pressureValue.className = `system-value ${this.coolantPressure < 80 ? 'system-warning' : ''}`;
            pressureValue.innerHTML = `${this.coolantPressure}% <span style="color: var(--terminal-dim);">${this.coolantPressure < 80 ? '(BELOW OPTIMAL)' : ''}</span>`;
        }
        
        // Update flow rate display
        const flowRateValue = document.querySelector('.system-label:nth-of-type(2) + .system-component + .system-value');
        if (flowRateValue) {
            flowRateValue.className = `system-value ${this.flowRate < 85 ? 'system-warning' : ''}`;
            flowRateValue.textContent = `${this.flowRate}%`;
        }
        
        // Update temperature displays
        const tempK = 273 + this.coolantTemperature;
        const tempPercent = Math.min(100, Math.max(0, this.coolantTemperature / 100 * 100));
        
        const tempIndicator = document.querySelector('.temperature-indicator') as HTMLElement;
        const tempValueDisplay = document.querySelector('.temperature-value') as HTMLElement;
        const tempStatusValue = document.querySelector('.system-label:nth-of-type(3) + .system-component + .system-value');
        
        if (tempIndicator) tempIndicator.style.setProperty('--temp-value', `${tempPercent}%`);
        if (tempValueDisplay) {
            tempValueDisplay.style.setProperty('--temp-value', `${tempPercent}%`);
            tempValueDisplay.textContent = `${tempK}K`;
        }
        if (tempStatusValue) {
            tempStatusValue.className = `system-value ${this.coolantTemperature > 40 ? 'system-warning' : ''}`;
            tempStatusValue.textContent = this.coolantTemperature > 40 ? 
                `+${this.coolantTemperature - 30}K ABOVE NOMINAL` : 'NOMINAL';
        }
        
        // Update filter status
        const filterValue = document.querySelector('.system-label:nth-of-type(4) + .system-component + .system-value');
        if (filterValue) {
            filterValue.className = `system-value ${this.filterStatus < 70 ? 'system-warning' : ''}`;
            filterValue.innerHTML = `${this.filterStatus}% <span style="color: var(--terminal-dim);">${this.filterStatus < 70 ? '(LOW)' : ''}</span>`;
        }
        
        // Update animation speeds for flow indicators
        const inletFlow = document.querySelector('.system-label:nth-of-type(1) + .system-component .coolant-flow') as HTMLElement;
        const flowRateFlow = document.querySelector('.system-label:nth-of-type(2) + .system-component .coolant-flow') as HTMLElement;
        const filterFlow = document.querySelector('.system-label:nth-of-type(4) + .system-component .coolant-flow') as HTMLElement;
        
        if (inletFlow) inletFlow.style.animationDuration = `${3 - this.coolantPressure/100}s`;
        if (flowRateFlow) flowRateFlow.style.animationDuration = `${3 - this.flowRate/100}s`;
        if (filterFlow) filterFlow.style.animationDuration = `${4 - this.filterStatus/100}s`;
        
        // Update footer status
        const lastMaintenance = document.querySelector('.status-text');
        if (lastMaintenance) {
            lastMaintenance.textContent = `Last maintenance: ${this.isFilterReplaced ? '0' : '37'} hours ago`;
        }
        
        // Update or remove warning message
        const existingWarning = document.querySelector('.coolant-warning');
        if (this.coolantPressure < 80 || !this.isPressureRegulated) {
            if (!existingWarning) {
                const container = document.getElementById('coolant-interface-container');
                if (container) {
                    const warningDiv = document.createElement('div');
                    warningDiv.className = 'coolant-warning';
                    warningDiv.textContent = 'WARNING: Coolant pressure is below optimal range. Recommended adjustment required.';
                    container.prepend(warningDiv);
                }
            }
        } else if (existingWarning) {
            existingWarning.remove();
        }
    }
    
    /**
     * Shows a notification in the coolant interface without full page re-render
     */
    private showNotification(message: string, isWarning: boolean = false): void {
        const statusNotification = document.getElementById('coolant-status-notification');
        if (statusNotification) {
            // Create notification element
            const notification = document.createElement('div');
            notification.className = `coolant-interface-notification ${isWarning ? 'notification-warning' : ''}`;
            notification.textContent = message;
            
            // Add to the notification area
            statusNotification.appendChild(notification);
            
            // Fade out and remove after a delay
            setTimeout(() => {
                notification.style.opacity = '0';
                setTimeout(() => {
                    notification.remove();
                }, 1000);
            }, 5000);
        }
    }
}