/**
 * Base interface for all ship systems
 * This provides the common API that all systems must implement
 */
export interface IShipSystem {
    /** Unique identifier for the system */
    readonly id: string;
    
    /** Human-readable name of the system */
    readonly name: string;
    
    /** Current operational status as a percentage (0-100) */
    readonly status: number;
    
    /** Whether the system is currently active */
    readonly isActive: boolean;
    
    /** Whether the system requires maintenance */
    readonly needsMaintenance: boolean;
    
    /** Activate the system */
    activate(): void;
    
    /** Deactivate the system */
    deactivate(): void;
    
    /** Perform system update based on game time */
    update(deltaTime: number): void;
    
    /** Get detailed status information */
    getStatusReport(): SystemStatusReport;
    
    /** Perform maintenance on the system */
    performMaintenance(): boolean;
}

/**
 * Status report for a ship system
 */
export interface SystemStatusReport {
    /** Current operational status as a percentage (0-100) */
    status: number;
    
    /** Whether the system is currently active */
    isActive: boolean;
    
    /** Whether the system requires maintenance */
    needsMaintenance: boolean;
    
    /** Efficiency of the system (0-100) */
    efficiency: number;
    
    /** Additional status messages */
    messages: string[];
    
    /** Any active alerts or warnings */
    alerts: SystemAlert[];
}

/**
 * Alert levels for ship systems
 */
export enum AlertLevel {
    NORMAL = "normal",
    WARNING = "warning",
    CRITICAL = "critical"
}

/**
 * Alert information for ship systems
 */
export interface SystemAlert {
    level: AlertLevel;
    message: string;
}

/**
 * Base implementation of a ship system
 * This provides common functionality that all systems share
 */
export abstract class BaseShipSystem implements IShipSystem {
    readonly id: string;
    readonly name: string;
    
    protected _status: number = 100;
    protected _isActive: boolean = false;
    protected _needsMaintenance: boolean = false;
    protected _efficiency: number = 100;
    protected _alerts: SystemAlert[] = [];
    protected _degradationRate: number = 0.01; // How quickly the system degrades per time unit
    
    constructor(id: string, name: string) {
        this.id = id;
        this.name = name;
    }
    
    get status(): number {
        return this._status;
    }
    
    get isActive(): boolean {
        return this._isActive;
    }
    
    get needsMaintenance(): boolean {
        return this._needsMaintenance || this._status < 80;
    }
    
    activate(): void {
        this._isActive = true;
    }
    
    deactivate(): void {
        this._isActive = false;
    }
    
    /**
     * Update the system state based on elapsed time
     * This handles generic degradation that all systems experience
     * Specific systems can override or extend this
     */
    update(deltaTime: number): void {
        if (this._isActive) {
            // Systems only degrade when active
            this._status = Math.max(0, this._status - (this._degradationRate * deltaTime));
            
            // Update efficiency based on status
            this._efficiency = this.calculateEfficiency();
            
            // Update maintenance needs
            this._needsMaintenance = this._status < 80;
            
            // Update alerts based on status
            this.updateAlerts();
        }
    }
    
    getStatusReport(): SystemStatusReport {
        return {
            status: this._status,
            isActive: this._isActive,
            needsMaintenance: this.needsMaintenance,
            efficiency: this._efficiency,
            messages: this.getStatusMessages(),
            alerts: [...this._alerts]
        };
    }
    
    performMaintenance(): boolean {
        // Basic implementation - restores system to 100%
        // Specific systems may override this with more complex logic
        this._status = 100;
        this._needsMaintenance = false;
        this._efficiency = this.calculateEfficiency();
        this.updateAlerts();
        return true;
    }
    
    /**
     * Calculate system efficiency based on status
     * This is a simple default implementation
     * Specific systems can override this for more complex calculations
     */
    protected calculateEfficiency(): number {
        return this._status;
    }
    
    /**
     * Get system-specific status messages
     * This should be implemented by specific system classes
     */
    protected abstract getStatusMessages(): string[];
    
    /**
     * Update system alerts based on current status
     */
    protected updateAlerts(): void {
        this._alerts = [];
        
        if (this._status < 50) {
            this._alerts.push({
                level: AlertLevel.CRITICAL,
                message: `${this.name} at critical levels (${Math.round(this._status)}%)`
            });
        } else if (this._status < 80) {
            this._alerts.push({
                level: AlertLevel.WARNING,
                message: `${this.name} requires maintenance (${Math.round(this._status)}%)`
            });
        }
    }
}