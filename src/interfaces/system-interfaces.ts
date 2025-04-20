import { InteractableObject, BaseInteractableObject } from '../core/interactable-object';
import { DOMRenderer } from '../interfaces/dom-renderer';
import { InterfaceManager } from '../managers/interface-manager';

/**
 * Interface for objects that can display a dedicated system interface
 * This extends the basic InteractableObject with the ability to show a specialized interface
 */
export interface SystemInterface {
    /**
     * Renders this system's interface to the DOM
     * @param renderer The DOM renderer to use
     * @returns A function to call when exiting the interface
     */
    renderInterface(renderer: DOMRenderer): () => void;
}

/**
 * Base class for system interfaces in the ship
 */
export abstract class BaseSystemInterface extends BaseInteractableObject implements SystemInterface {
    protected interfaceManager: InterfaceManager | null = null;
    
    /**
     * Sets the interface manager reference
     */
    setInterfaceManager(manager: InterfaceManager): void {
        this.interfaceManager = manager;
    }
    
    /**
     * Renders this system's interface to the DOM
     * This must be implemented by specific system interfaces
     * @param renderer The DOM renderer to use
     * @returns A function to call when exiting the interface
     */
    abstract renderInterface(renderer: DOMRenderer): () => void;
    
    /**
     * Override the default interact method to handle using the system
     */
    interact(verb: string): string {
        verb = verb.toLowerCase();
        
        if (verb === 'examine' || verb === 'look at') {
            return this.description;
        }
        
        if (verb === 'use' || verb === 'access' || verb === 'interact') {
            if (this.interfaceManager) {
                this.interfaceManager.showSystemInterface(this);
                return `You access the ${this.name}.`;
            } else {
                return `You try to use the ${this.name}, but nothing happens.`;
            }
        }
        
        if (!this.supportedInteractions.includes(verb)) {
            return `You can't ${verb} the ${this.name}.`;
        }
        
        return `You ${verb} the ${this.name}.`;
    }
}

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
        
        this.renderCoolantInterface(renderer);
        
        // Return a function that will be called when exiting the interface
        return () => {
            console.log("Exiting coolant system interface");
            // Any cleanup code would go here
        };
    }
    
    /**
     * Renders the coolant system status and controls
     */
    private renderCoolantInterface(renderer: DOMRenderer): void {
        // Create the main interface container
        const container = document.createElement('div');
        container.className = 'system-interface coolant-interface';
        
        // Header
        const header = document.createElement('div');
        header.className = 'interface-header';
        header.innerHTML = `
            <h1>COOLANT SYSTEM MAINTENANCE</h1>
            <div class="system-status ${this.getSystemStatusClass()}">
                STATUS: ${this.getSystemStatus()}
            </div>
        `;
        container.appendChild(header);
        
        // Main display area with gauges and readouts
        const mainDisplay = document.createElement('div');
        mainDisplay.className = 'interface-main-display';
        mainDisplay.innerHTML = `
            <div class="gauge-container">
                <div class="gauge">
                    <div class="gauge-label">PRESSURE</div>
                    <div class="gauge-value ${this.coolantPressure < 80 ? 'warning' : ''}">${this.coolantPressure}%</div>
                    <div class="gauge-bar">
                        <div class="gauge-fill" style="width: ${this.coolantPressure}%"></div>
                    </div>
                    <div class="gauge-range">0% ──────── 50% ──────── 100%</div>
                </div>
                
                <div class="gauge">
                    <div class="gauge-label">TEMPERATURE</div>
                    <div class="gauge-value ${this.coolantTemperature > 45 ? 'warning' : ''}">${this.coolantTemperature}°C</div>
                    <div class="gauge-bar">
                        <div class="gauge-fill" style="width: ${this.coolantTemperature}%"></div>
                    </div>
                    <div class="gauge-range">0°C ─────── 50°C ─────── 100°C</div>
                </div>
                
                <div class="gauge">
                    <div class="gauge-label">FLOW RATE</div>
                    <div class="gauge-value ${this.flowRate < 85 ? 'warning' : ''}">${this.flowRate}%</div>
                    <div class="gauge-bar">
                        <div class="gauge-fill" style="width: ${this.flowRate}%"></div>
                    </div>
                    <div class="gauge-range">0% ──────── 50% ──────── 100%</div>
                </div>
                
                <div class="gauge">
                    <div class="gauge-label">FILTER STATUS</div>
                    <div class="gauge-value ${this.filterStatus < 70 ? 'warning' : ''}">${this.filterStatus}%</div>
                    <div class="gauge-bar">
                        <div class="gauge-fill" style="width: ${this.filterStatus}%"></div>
                    </div>
                    <div class="gauge-range">0% ──────── 50% ──────── 100%</div>
                </div>
            </div>
            
            <div class="diagnostic-info">
                <div class="diagnostic-header">SYSTEM DIAGNOSTIC</div>
                <div class="diagnostic-item ${!this.isFilterReplaced ? 'issue' : 'normal'}">
                    Filter Status: ${this.isFilterReplaced ? 'Replaced' : 'Requires Replacement'}
                </div>
                <div class="diagnostic-item ${!this.areValvesAligned ? 'issue' : 'normal'}">
                    Valve Alignment: ${this.areValvesAligned ? 'Optimal' : 'Sub-optimal'}
                </div>
                <div class="diagnostic-item ${!this.isPressureRegulated ? 'issue' : 'normal'}">
                    Pressure Regulation: ${this.isPressureRegulated ? 'Stable' : 'Needs Adjustment'}
                </div>
            </div>
        `;
        container.appendChild(mainDisplay);
        
        // Control panel
        const controlPanel = document.createElement('div');
        controlPanel.className = 'interface-controls';
        
        // Create action buttons
        const actions = [
            { id: 'replace-filter', label: 'REPLACE FILTER', completed: this.isFilterReplaced },
            { id: 'align-valves', label: 'ALIGN VALVES', completed: this.areValvesAligned },
            { id: 'regulate-pressure', label: 'REGULATE PRESSURE', completed: this.isPressureRegulated },
            { id: 'run-diagnostic', label: 'RUN DIAGNOSTIC', completed: false }
        ];
        
        actions.forEach(action => {
            const button = document.createElement('button');
            button.id = action.id;
            button.className = `control-button ${action.completed ? 'completed' : ''}`;
            button.textContent = action.label;
            
            // Add click handlers for each action
            button.addEventListener('click', () => {
                this.handleAction(action.id, renderer);
            });
            
            controlPanel.appendChild(button);
        });
        
        // Exit button
        const exitButton = document.createElement('button');
        exitButton.className = 'control-button exit-button';
        exitButton.textContent = 'EXIT SYSTEM';
        exitButton.addEventListener('click', () => {
            if (this.interfaceManager) {
                this.interfaceManager.returnToFirstPerson();
            }
        });
        
        // Also listen for keyboard input specifically for exit
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') {
                if (this.interfaceManager) {
                    this.interfaceManager.returnToFirstPerson();
                }
            }
        }, { once: true }); // Use once: true so it's removed after first use
        
        controlPanel.appendChild(exitButton);
        
        container.appendChild(controlPanel);
        
        // Add the interface to the output
        renderer.updateOutput(container.outerHTML);
        
        // After the HTML is added to the DOM, reattach the event listener
        // This is necessary because innerHTML/outerHTML removes event listeners
        setTimeout(() => {
            const exitButtonInDOM = document.querySelector('.exit-button');
            if (exitButtonInDOM) {
                exitButtonInDOM.addEventListener('click', () => {
                    if (this.interfaceManager) {
                        this.interfaceManager.returnToFirstPerson();
                    }
                });
            }
        }, 0);
    }
    
    /**
     * Handle button actions in the interface
     */
    private handleAction(actionId: string, renderer: DOMRenderer): void {
        switch (actionId) {
            case 'replace-filter':
                this.isFilterReplaced = true;
                this.filterStatus = 100;
                renderer.displayNotification('Coolant filter successfully replaced. Filter status now at 100%.');
                break;
                
            case 'align-valves':
                this.areValvesAligned = true;
                this.flowRate = 95;
                renderer.displayNotification('Coolant valves aligned for optimal flow. Flow rate improved to 95%.');
                break;
                
            case 'regulate-pressure':
                this.isPressureRegulated = true;
                this.coolantPressure = 92;
                renderer.displayNotification('Pressure successfully regulated. Coolant pressure now at 92%.');
                break;
                
            case 'run-diagnostic':
                const issues = [];
                if (!this.isFilterReplaced) issues.push('filter replacement');
                if (!this.areValvesAligned) issues.push('valve alignment');
                if (!this.isPressureRegulated) issues.push('pressure regulation');
                
                if (issues.length === 0) {
                    renderer.displayNotification('Diagnostic complete. All systems operating within normal parameters.');
                    // Update temperature if everything else is fixed
                    this.coolantTemperature = 38;
                } else {
                    renderer.displayNotification(`Diagnostic complete. The following issues require attention: ${issues.join(', ')}.`);
                }
                break;
        }
        
        // Refresh the interface after action
        this.renderCoolantInterface(renderer);
        
        // If all maintenance tasks are complete, show a success message
        if (this.isFilterReplaced && this.areValvesAligned && this.isPressureRegulated) {
            renderer.displayNotification('All maintenance tasks complete. Coolant system now operating at optimal efficiency.', false);
        }
    }
    
    /**
     * Get the system status text
     */
    private getSystemStatus(): string {
        if (this.isFilterReplaced && this.areValvesAligned && this.isPressureRegulated) {
            return 'OPTIMAL';
        } else if (this.isFilterReplaced || this.areValvesAligned || this.isPressureRegulated) {
            return 'MAINTENANCE IN PROGRESS';
        } else {
            return 'MAINTENANCE REQUIRED';
        }
    }
    
    /**
     * Get the CSS class for system status
     */
    private getSystemStatusClass(): string {
        if (this.isFilterReplaced && this.areValvesAligned && this.isPressureRegulated) {
            return 'status-optimal';
        } else if (this.isFilterReplaced || this.areValvesAligned || this.isPressureRegulated) {
            return 'status-warning';
        } else {
            return 'status-alert';
        }
    }
}