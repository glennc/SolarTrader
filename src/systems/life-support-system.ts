import { BaseShipSystem, AlertLevel } from './base-system';

/**
 * Life Support System for the ship
 * Manages oxygen generation, temperature regulation, and water recycling
 */
export class LifeSupportSystem extends BaseShipSystem {
    private _oxygenLevel: number = 100;     // Oxygen level (0-100%)
    private _temperature: number = 21;      // Temperature in celsius (optimal: 19-23)
    private _waterQuality: number = 100;    // Water recycling quality (0-100%)
    private _filterStatus: number = 100;    // Status of air/water filters (0-100%)
    
    // Resource consumption rates (units per time unit)
    private _oxygenConsumptionRate: number = 0.05;  
    private _waterConsumptionRate: number = 0.02;
    
    constructor() {
        super('life-support', 'Life Support');
        this._degradationRate = 0.01; // Life support degrades at standard rate
    }
    
    /**
     * Get current oxygen level
     */
    get oxygenLevel(): number {
        return this._oxygenLevel;
    }
    
    /**
     * Get current temperature
     */
    get temperature(): number {
        return this._temperature;
    }
    
    /**
     * Get water quality 
     */
    get waterQuality(): number {
        return this._waterQuality;
    }
    
    /**
     * Get filter status
     */
    get filterStatus(): number {
        return this._filterStatus;
    }
    
    /**
     * Check if temperature is within optimal range
     */
    get isTemperatureOptimal(): boolean {
        return this._temperature >= 19 && this._temperature <= 23;
    }
    
    /**
     * Check if oxygen levels are critical
     */
    get isOxygenCritical(): boolean {
        return this._oxygenLevel < 50;
    }
    
    /**
     * Activate the life support system
     */
    override activate(): void {
        super.activate();
        
        // When starting up, begin restoring levels
        this._oxygenLevel = Math.min(100, this._oxygenLevel + 20);
    }
    
    /**
     * Update life support system state
     */
    override update(deltaTime: number): void {
        if (this._isActive) {
            // Calculate effective efficiency
            const effectiveEfficiency = this._efficiency / 100;
            
            // Filter degradation occurs regardless of system status
            this._filterStatus = Math.max(0, this._filterStatus - (0.005 * deltaTime));
            
            // Oxygen consumption and production
            // Consumption happens regardless of system status
            this._oxygenLevel = Math.max(0, this._oxygenLevel - (this._oxygenConsumptionRate * deltaTime));
            
            // Production only when system is active
            if (this._isActive) {
                // Oxygen production is affected by efficiency and filter status
                const oxygenProduction = 0.08 * deltaTime * effectiveEfficiency * (this._filterStatus / 100);
                this._oxygenLevel = Math.min(100, this._oxygenLevel + oxygenProduction);
            }
            
            // Water quality is affected by filter status
            this._waterQuality = 100 * (this._filterStatus / 100) * effectiveEfficiency;
            
            // Temperature regulation - tries to maintain optimal temperature (21°C)
            // When efficiency drops, temperature control becomes less precise
            if (effectiveEfficiency > 0.8) {
                // Good efficiency - maintain optimal temperature
                this._temperature = 21;
            } else {
                // Poor efficiency - temperature drifts away from optimal
                const randomDrift = (Math.random() * 2 - 1) * (1 - effectiveEfficiency) * 0.5;
                this._temperature += randomDrift;
                
                // Keep temperature in a reasonable range
                this._temperature = Math.max(15, Math.min(30, this._temperature));
            }
        } else {
            // When inactive, oxygen levels decrease
            this._oxygenLevel = Math.max(0, this._oxygenLevel - (this._oxygenConsumptionRate * 2 * deltaTime));
            
            // Temperature drifts toward ambient (space is cold!)
            this._temperature = this._temperature > 10 ? this._temperature - (0.1 * deltaTime) : this._temperature;
        }
        
        // Call base update which handles basic degradation
        super.update(deltaTime);
    }
    
    /**
     * Replace filters in the life support system
     */
    replaceFilters(): boolean {
        this._filterStatus = 100;
        
        // Replacing filters also boosts system status a bit
        this._status = Math.min(100, this._status + 10);
        
        this._efficiency = this.calculateEfficiency();
        this.updateAlerts();
        return true;
    }
    
    /**
     * Perform maintenance on the life support system
     */
    override performMaintenance(): boolean {
        // Maintenance includes filter replacement
        this.replaceFilters();
        
        // And general system repairs
        const statusBefore = this._status;
        this._status = Math.min(100, this._status + 40); // Significant improvement but might not reach 100%
        this._needsMaintenance = false;
        this._efficiency = this.calculateEfficiency();
        this.updateAlerts();
        
        return this._status > statusBefore;
    }
    
    /**
     * Calculate efficiency based on status and filter condition
     */
    protected override calculateEfficiency(): number {
        // Life support efficiency is affected by both system status and filter status
        return this._status * 0.7 + this._filterStatus * 0.3;
    }
    
    /**
     * Get status messages specific to the life support system
     */
    protected override getStatusMessages(): string[] {
        const messages: string[] = [];
        
        messages.push(`Oxygen Level: ${Math.round(this._oxygenLevel)}%`);
        messages.push(`Temperature: ${this._temperature.toFixed(1)}°C`);
        messages.push(`Water Quality: ${Math.round(this._waterQuality)}%`);
        messages.push(`Filter Status: ${Math.round(this._filterStatus)}%`);
        
        if (this._filterStatus < 40) {
            messages.push("WARNING: Air/water filters need replacement");
        }
        
        if (!this.isTemperatureOptimal) {
            messages.push(`WARNING: Temperature outside optimal range`);
        }
        
        return messages;
    }
    
    /**
     * Update alerts for life support system
     */
    protected override updateAlerts(): void {
        super.updateAlerts();
        
        // Add oxygen level alerts
        if (this._oxygenLevel < 30) {
            this._alerts.push({
                level: AlertLevel.CRITICAL,
                message: `Oxygen level critical: ${Math.round(this._oxygenLevel)}%`
            });
        } else if (this._oxygenLevel < 60) {
            this._alerts.push({
                level: AlertLevel.WARNING,
                message: `Oxygen level low: ${Math.round(this._oxygenLevel)}%`
            });
        }
        
        // Add filter status alerts
        if (this._filterStatus < 20) {
            this._alerts.push({
                level: AlertLevel.CRITICAL,
                message: `Air/water filters critically degraded: ${Math.round(this._filterStatus)}%`
            });
        } else if (this._filterStatus < 40) {
            this._alerts.push({
                level: AlertLevel.WARNING,
                message: `Air/water filters need replacement: ${Math.round(this._filterStatus)}%`
            });
        }
        
        // Add temperature alerts
        if (this._temperature < 17 || this._temperature > 25) {
            this._alerts.push({
                level: AlertLevel.WARNING,
                message: `Temperature outside safe range: ${this._temperature.toFixed(1)}°C`
            });
        }
    }
}