import { SpecializedInteractableObject } from './specialized-object';
import { IShipSystem } from '../../systems/base-system';
import { TimeSkipInterface } from '../../interfaces/components/time-skip-interface';
import { InterfaceManager } from '../../managers/interface-manager';

/**
 * Time Skip Terminal - Allows advancing game time rapidly
 */
export class TimeSkipTerminal extends SpecializedInteractableObject {
    private isTimeSkipping: boolean = false;
    private skipDuration: number = 4; // Default: 4 hours
    private elapsedTime: number = 0;
    private simulationSpeed: number = 20; // Default: 20x normal speed
    private systemProjections: Map<string, SystemProjection> = new Map();
    private shipSystems: Map<string, IShipSystem> = new Map();
    protected interfaceManager: InterfaceManager | null = null;
    
    constructor() {
        super(
            'Time Skip Terminal',
            'Controls for advancing ship time.',
            'A specialized terminal allowing for accelerated time passage while the ship\'s automated systems handle routine operations. The display shows various time increments and projected system statuses.',
            false, // Not portable
            ['time skip', 'skip terminal', 'time terminal', 'time controls'],
            ['examine', 'look at', 'use', 'access', 'activate']
        );
    }
    
    /**
     * Set the ship systems this terminal can monitor
     */
    setShipSystems(systems: Map<string, IShipSystem>): void {
        this.shipSystems = systems;
        this.updateProjections();
    }
    
    /**
     * Set the interface manager to use when activating the terminal
     */
    setInterfaceManager(interfaceManager: InterfaceManager): void {
        this.interfaceManager = interfaceManager;
    }
    
    /**
     * Handle specialized interactions with the time skip terminal
     */
    protected handleSpecializedInteraction(verb: string): string | null {
        verb = verb.toLowerCase();
        
        if (verb === 'use' || verb === 'access' || verb === 'activate') {
            if (this.interfaceManager) {
                const timeManager = this.interfaceManager.getTimeManager();
                const cssLoader = this.interfaceManager.getCSSLoader();
                
                if (timeManager && cssLoader) {
                    // Create the time skip interface
                    const timeSkipInterface = new TimeSkipInterface(
                        document.getElementById('app') || document.body,
                        timeManager,
                        this.interfaceManager.renderer,
                        cssLoader
                    );
                    
                    // Set the interface manager on the time skip interface
                    timeSkipInterface.setInterfaceManager(this.interfaceManager);
                    
                    // Show the time skip interface
                    this.interfaceManager.showSystemInterface(timeSkipInterface);
                    return null; // Interface has been shown, don't return a message
                } else {
                    return "The time skip terminal appears to be offline. Try again later.";
                }
            } else {
                // Use the description method
                return this.getTimeSkipDescription();
            }
        }
        
        return null; // Not handled by specialized behavior
    }
    
    /**
     * Start a time skip
     * @param hours The number of hours to skip
     * @param speed The simulation speed (multiplier for normal time)
     */
    startTimeSkip(hours: number, speed: number = 20): boolean {
        if (this.isTimeSkipping) {
            return false; // Already time skipping
        }
        
        this.skipDuration = hours;
        this.elapsedTime = 0;
        this.simulationSpeed = speed;
        this.isTimeSkipping = true;
        this.updateProjections();
        
        return true;
    }
    
    /**
     * Pause the current time skip
     */
    pauseTimeSkip(): boolean {
        if (!this.isTimeSkipping) {
            return false;
        }
        
        // This would pause the time skip simulation
        return true;
    }
    
    /**
     * Resume a paused time skip
     */
    resumeTimeSkip(): boolean {
        if (!this.isTimeSkipping) {
            return false;
        }
        
        // This would resume the time skip simulation
        return true;
    }
    
    /**
     * Cancel the current time skip
     */
    cancelTimeSkip(): boolean {
        if (!this.isTimeSkipping) {
            return false;
        }
        
        this.isTimeSkipping = false;
        return true;
    }
    
    /**
     * Complete the time skip (called when simulation is finished)
     */
    completeTimeSkip(): SystemChangeResult[] {
        if (!this.isTimeSkipping) {
            return [];
        }
        
        this.isTimeSkipping = false;
        
        // Calculate final system states
        const results: SystemChangeResult[] = [];
        
        this.systemProjections.forEach((projection, systemId) => {
            const system = this.shipSystems.get(systemId);
            if (system) {
                // In a full implementation, we would apply the projected changes to the actual system
                results.push({
                    systemId,
                    systemName: system.name,
                    initialStatus: projection.initialStatus,
                    finalStatus: projection.projectedStatus,
                    alerts: [...projection.projectedAlerts]
                });
            }
        });
        
        return results;
    }
    
    /**
     * Update system projections based on current skip duration
     */
    private updateProjections(): void {
        this.systemProjections.clear();
        
        this.shipSystems.forEach((system, systemId) => {
            // Create initial projection
            const projection: SystemProjection = {
                systemId,
                initialStatus: system.status,
                projectedStatus: this.calculateProjectedStatus(system),
                projectedAlerts: this.calculateProjectedAlerts(system)
            };
            
            this.systemProjections.set(systemId, projection);
        });
    }
    
    /**
     * Calculate projected status for a system after time skip
     */
    private calculateProjectedStatus(system: IShipSystem): number {
        // Basic degradation model - this would be more complex in a full implementation
        const degradationRate = system.isActive ? 0.5 : 0.1; // % per hour
        return Math.max(0, system.status - (degradationRate * this.skipDuration));
    }
    
    /**
     * Calculate projected alerts for a system after time skip
     */
    private calculateProjectedAlerts(system: IShipSystem): ProjectedAlert[] {
        const alerts: ProjectedAlert[] = [];
        const currentStatus = system.status;
        
        // Predict when system might hit warning threshold (80%)
        if (currentStatus > 80) {
            const degradationRate = system.isActive ? 0.5 : 0.1; // % per hour
            const hoursToWarning = (currentStatus - 80) / degradationRate;
            
            if (hoursToWarning < this.skipDuration) {
                alerts.push({
                    message: `${system.name} drops below optimal levels`,
                    severity: 'warning',
                    timeOffset: hoursToWarning
                });
            }
        }
        
        // Predict when system might hit critical threshold (50%)
        if (currentStatus > 50) {
            const degradationRate = system.isActive ? 0.5 : 0.1; // % per hour
            const hoursToCritical = (currentStatus - 50) / degradationRate;
            
            if (hoursToCritical < this.skipDuration) {
                alerts.push({
                    message: `${system.name} reaches critical levels`,
                    severity: 'critical',
                    timeOffset: hoursToCritical
                });
            }
        }
        
        return alerts;
    }
    
    /**
     * Get a description of the time skip terminal
     */
    private getTimeSkipDescription(): string {
        if (this.isTimeSkipping) {
            return `The Time Skip Terminal is currently active, simulating ship operations at ${this.simulationSpeed}x normal speed. ${this.formatElapsedTime()} have passed out of the requested ${this.skipDuration} hours.`;
        } else {
            return `The Time Skip Terminal displays options for accelerated time passage: 1 hour, 4 hours, 8 hours, or a custom duration. This allows you to skip ahead while the ship's automated systems handle routine operations.`;
        }
    }
    
    /**
     * Format elapsed time as hours:minutes:seconds
     */
    private formatElapsedTime(): string {
        const hours = Math.floor(this.elapsedTime);
        const minutes = Math.floor((this.elapsedTime - hours) * 60);
        const seconds = Math.floor(((this.elapsedTime - hours) * 60 - minutes) * 60);
        
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    
    /**
     * Advance the simulation by a small time increment
     * @param deltaTime Time in hours to advance
     */
    advanceSimulation(deltaTime: number): void {
        if (!this.isTimeSkipping) {
            return;
        }
        
        this.elapsedTime += deltaTime;
        
        // Check if we've reached the end of the skip
        if (this.elapsedTime >= this.skipDuration) {
            this.completeTimeSkip();
        }
    }
    
    /**
     * Check if time is currently being skipped
     */
    isSkippingTime(): boolean {
        return this.isTimeSkipping;
    }
    
    /**
     * Get the current time skip duration in hours
     */
    getSkipDuration(): number {
        return this.skipDuration;
    }
    
    /**
     * Get the elapsed time in hours
     */
    getElapsedTime(): number {
        return this.elapsedTime;
    }
    
    /**
     * Get the simulation speed multiplier
     */
    getSimulationSpeed(): number {
        return this.simulationSpeed;
    }
    
    /**
     * Get all system projections
     */
    getSystemProjections(): Map<string, SystemProjection> {
        return new Map(this.systemProjections);
    }
}

/**
 * Interface for a projected system state
 */
export interface SystemProjection {
    systemId: string;
    initialStatus: number;
    projectedStatus: number;
    projectedAlerts: ProjectedAlert[];
}

/**
 * Interface for a projected alert during time skip
 */
export interface ProjectedAlert {
    message: string;
    severity: 'warning' | 'critical';
    timeOffset: number; // Hours into the time skip when this alert occurs
}

/**
 * Interface for the result of a time skip on a system
 */
export interface SystemChangeResult {
    systemId: string;
    systemName: string;
    initialStatus: number;
    finalStatus: number;
    alerts: ProjectedAlert[];
}