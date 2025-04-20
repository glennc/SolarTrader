/**
 * Centralized state management for the diagnostics interface
 */
export class DiagnosticsState {
    // UI State
    activeScanMode: 'overview' | 'detailed' | 'historical' | 'scan' = 'overview';
    
    // Diagnostic data
    lastDiagnosticRun: Date | null = null;
    isDiagnosticRunning: boolean = false;
    
    // System data models
    maintenanceItems: MaintenanceItem[] = [];
    systemLogs: SystemLog[] = [];
    
    constructor() {
        this.initializeDefaultState();
    }
    
    /**
     * Initialize with sample data
     */
    private initializeDefaultState(): void {
        // Set last diagnostic run to 4 hours ago
        const currentDate = new Date();
        this.lastDiagnosticRun = new Date(currentDate.getTime() - 1000 * 60 * 60 * 4);
        
        // Initialize sample logs
        this.systemLogs = [
            { 
                timestamp: this.formatTimestamp(new Date(currentDate.getTime() - 1000 * 60 * 60 * 2)), 
                message: 'Routine diagnostic scan completed', 
                type: 'info' 
            },
            { 
                timestamp: this.formatTimestamp(new Date(currentDate.getTime() - 1000 * 60 * 60 * 6)), 
                message: 'Coolant pressure below optimal range', 
                type: 'warning' 
            },
            { 
                timestamp: this.formatTimestamp(new Date(currentDate.getTime() - 1000 * 60 * 60 * 12)), 
                message: 'Power distribution optimized', 
                type: 'success' 
            },
            { 
                timestamp: this.formatTimestamp(new Date(currentDate.getTime() - 1000 * 60 * 60 * 24)), 
                message: 'Life support filters replaced', 
                type: 'success' 
            }
        ];
        
        // Initialize sample maintenance items
        this.maintenanceItems = [
            { system: 'Coolant System', issue: 'Filter replacement required', urgency: 'Medium' },
            { system: 'Propulsion', issue: 'Intake valve alignment', urgency: 'Low' }
        ];
    }
    
    /**
     * Gets a formatted string for when the last scan occurred
     */
    getLastScanTimeString(): string {
        return this.lastDiagnosticRun 
            ? this.formatTimeAgo(this.lastDiagnosticRun) 
            : 'Never';
    }
    
    /**
     * Adds a new system log entry
     */
    addSystemLog(message: string, type: 'info' | 'warning' | 'error' | 'success'): void {
        this.systemLogs.unshift({
            timestamp: this.formatTimestamp(new Date()),
            message,
            type
        });
    }
    
    /**
     * Removes a maintenance item by index
     */
    removeMaintenanceItem(index: number): void {
        if (index >= 0 && index < this.maintenanceItems.length) {
            this.maintenanceItems.splice(index, 1);
        }
    }
    
    /**
     * Formats a date as a timestamp string (HH:MM:SS)
     */
    private formatTimestamp(date: Date): string {
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        const seconds = date.getSeconds().toString().padStart(2, '0');
        
        return `${hours}:${minutes}:${seconds}`;
    }
    
    /**
     * Formats a date as a relative time string
     */
    private formatTimeAgo(date: Date): string {
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        
        const minutes = Math.floor(diff / (1000 * 60));
        const hours = Math.floor(diff / (1000 * 60 * 60));
        
        if (minutes < 60) {
            return `${minutes} minutes ago`;
        } else {
            return `${hours} hours ago`;
        }
    }
}

/**
 * Interface for maintenance alert items
 */
export interface MaintenanceItem {
    system: string;
    issue: string;
    urgency: string;
}

/**
 * Interface for system log entries
 */
export interface SystemLog {
    timestamp: string;
    message: string;
    type: 'info' | 'warning' | 'error' | 'success';
}