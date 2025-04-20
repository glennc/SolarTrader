import { BaseShipSystem, AlertLevel } from './base-system';

/**
 * Power system for the ship
 * Manages power generation, distribution, and consumption
 */
export class PowerSystem extends BaseShipSystem {
    private _outputCapacity: number = 100; // Maximum power output capacity
    private _currentOutput: number = 0;    // Current power output
    private _load: number = 0;             // Current power demand (0-100%)
    private _fuelLevel: number = 100;      // Fuel level (0-100%)
    private _overloadThreshold: number = 90; // % of capacity where overload risk begins
    
    // Power allocation to different subsystems (%)
    private _powerAllocation: Map<string, number> = new Map([
        ['life-support', 30],
        ['propulsion', 45],
        ['navigation', 15],
        ['cargo', 10],
    ]);
    
    constructor() {
        super('power', 'Power Plant');
        this._degradationRate = 0.005; // Power systems degrade more slowly than others
    }
    
    /**
     * Get current power output as a percentage of capacity
     */
    get outputPercentage(): number {
        return (this._currentOutput / this._outputCapacity) * 100;
    }
    
    /**
     * Get current fuel level
     */
    get fuelLevel(): number {
        return this._fuelLevel;
    }
    
    /**
     * Get current load percentage
     */
    get loadPercentage(): number {
        return this._load;
    }
    
    /**
     * Check if system is currently overloaded
     */
    get isOverloaded(): boolean {
        return this._load > this._overloadThreshold;
    }
    
    /**
     * Activate the power system
     */
    override activate(): void {
        super.activate();
        this._currentOutput = this._outputCapacity * (this._status / 100);
    }
    
    /**
     * Deactivate the power system
     */
    override deactivate(): void {
        super.deactivate();
        this._currentOutput = 0;
    }
    
    /**
     * Update power system state
     */
    override update(deltaTime: number): void {
        // Calculate load based on allocations
        this._load = Array.from(this._powerAllocation.values()).reduce((sum, val) => sum + val, 0);
        
        // Calculate current output based on status and capacity
        this._currentOutput = this._outputCapacity * (this._status / 100);
        
        // If overloaded, increase degradation
        if (this.isOverloaded) {
            // Power system degrades faster when overloaded
            this._status = Math.max(0, this._status - (this._degradationRate * 3 * deltaTime));
        }
        
        // Consume fuel based on output
        this._fuelLevel = Math.max(0, this._fuelLevel - (0.002 * deltaTime * (this._currentOutput / this._outputCapacity)));
        
        // If fuel is low, reduce output
        if (this._fuelLevel < 20) {
            this._currentOutput *= (this._fuelLevel / 20);
        }
        
        // Call base update which handles basic degradation
        super.update(deltaTime);
    }
    
    /**
     * Set power allocation for a specific system
     */
    setPowerAllocation(systemId: string, percentage: number): boolean {
        if (!this._powerAllocation.has(systemId)) {
            return false;
        }
        
        // Ensure percentage is in valid range
        percentage = Math.max(0, Math.min(100, percentage));
        
        this._powerAllocation.set(systemId, percentage);
        return true;
    }
    
    /**
     * Get power allocation for a specific system
     */
    getPowerAllocation(systemId: string): number {
        return this._powerAllocation.get(systemId) || 0;
    }
    
    /**
     * Get all power allocations
     */
    getAllPowerAllocations(): Map<string, number> {
        return new Map(this._powerAllocation);
    }
    
    /**
     * Add fuel to the system
     */
    refuel(amount: number): number {
        const oldLevel = this._fuelLevel;
        this._fuelLevel = Math.min(100, this._fuelLevel + amount);
        return this._fuelLevel - oldLevel; // Return amount actually added
    }
    
    /**
     * Perform maintenance on the power system
     */
    override performMaintenance(): boolean {
        // Power systems don't recover fully from maintenance
        // They recover 80% of lost status
        const statusBefore = this._status;
        this._status = Math.min(100, statusBefore + (100 - statusBefore) * 0.8);
        this._needsMaintenance = false;
        this._efficiency = this.calculateEfficiency();
        this.updateAlerts();
        
        return this._status > statusBefore;
    }
    
    /**
     * Calculate efficiency based on status and fuel level
     */
    protected override calculateEfficiency(): number {
        // Efficiency is affected by both system status and fuel level
        const fuelFactor = this._fuelLevel < 20 ? this._fuelLevel / 20 : 1;
        return this._status * fuelFactor;
    }
    
    /**
     * Get status messages specific to the power system
     */
    protected override getStatusMessages(): string[] {
        const messages: string[] = [];
        
        messages.push(`Output: ${Math.round(this.outputPercentage)}% of capacity`);
        messages.push(`Fuel Level: ${Math.round(this._fuelLevel)}%`);
        messages.push(`Power Load: ${Math.round(this._load)}%`);
        
        if (this._fuelLevel < 20) {
            messages.push("WARNING: Fuel level low");
        }
        
        if (this.isOverloaded) {
            messages.push("WARNING: System overloaded");
        }
        
        return messages;
    }
    
    /**
     * Update alerts for power system
     */
    protected override updateAlerts(): void {
        super.updateAlerts();
        
        // Add fuel level alerts
        if (this._fuelLevel < 10) {
            this._alerts.push({
                level: AlertLevel.CRITICAL,
                message: `Fuel level critical: ${Math.round(this._fuelLevel)}%`
            });
        } else if (this._fuelLevel < 25) {
            this._alerts.push({
                level: AlertLevel.WARNING,
                message: `Fuel level low: ${Math.round(this._fuelLevel)}%`
            });
        }
        
        // Add overload alerts
        if (this._load > 95) {
            this._alerts.push({
                level: AlertLevel.CRITICAL,
                message: `Power system critical overload: ${Math.round(this._load)}%`
            });
        } else if (this._load > this._overloadThreshold) {
            this._alerts.push({
                level: AlertLevel.WARNING,
                message: `Power system overloaded: ${Math.round(this._load)}%`
            });
        }
    }
}