import { DiagnosticsState } from '../models/diagnostics-state';

/**
 * Renders the overview view of the diagnostics interface
 */
export class OverviewView {
    private state: DiagnosticsState;
    
    constructor(state: DiagnosticsState) {
        this.state = state;
    }
    
    /**
     * Renders the overview view content
     */
    render(): string {
        return `
            <div class="system-overview">
                ${this.renderSystemCards()}
            </div>
            
            ${this.renderMaintenanceSection()}
            
            <div class="system-logs">
                <div class="logs-header">
                    <span>RECENT SYSTEM EVENTS</span>
                    <span>LAST 24 HOURS</span>
                </div>
                <div class="logs-container">
                    ${this.renderSystemLogs(false)}
                </div>
            </div>
        `;
    }
    
    /**
     * Renders the system status cards
     */
    private renderSystemCards(): string {
        return `
            <div class="system-card">
                <div class="system-card-header">
                    <span>POWER SYSTEMS</span>
                    <span class="system-status status-good">OPTIMAL</span>
                </div>
                
                <div class="meter-label">
                    <span>REACTOR OUTPUT</span>
                    <span class="meter-value">87%</span>
                </div>
                <div class="system-meter">
                    <div class="meter-fill meter-fill-good" style="width: 87%"></div>
                </div>
                
                <div class="meter-label">
                    <span>DISTRIBUTION</span>
                    <span class="meter-value">92%</span>
                </div>
                <div class="system-meter">
                    <div class="meter-fill meter-fill-good" style="width: 92%"></div>
                </div>
                
                <div class="system-details">
                    <div class="detail-item">
                        <span class="detail-label">CORE TEMP</span>
                        <span class="detail-value">345K</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">EFFICIENCY</span>
                        <span class="detail-value">94.3%</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">CAPACITY</span>
                        <span class="detail-value">7.2 MWh</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">NEXT MAINT.</span>
                        <span class="detail-value">12d 5h</span>
                    </div>
                </div>
            </div>
            
            <div class="system-card">
                <div class="system-card-header">
                    <span>PROPULSION</span>
                    <span class="system-status status-warning">ATTENTION</span>
                </div>
                
                <div class="meter-label">
                    <span>ENGINE EFFICIENCY</span>
                    <span class="meter-value">76%</span>
                </div>
                <div class="system-meter">
                    <div class="meter-fill meter-fill-warning" style="width: 76%"></div>
                </div>
                
                <div class="meter-label">
                    <span>THRUST OUTPUT</span>
                    <span class="meter-value">82%</span>
                </div>
                <div class="system-meter">
                    <div class="meter-fill meter-fill-good" style="width: 82%"></div>
                </div>
                
                <div class="system-details">
                    <div class="detail-item">
                        <span class="detail-label">DRIVE TEMP</span>
                        <span class="detail-value warning">358K</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">COOLANT</span>
                        <span class="detail-value warning">76%</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">FUEL USAGE</span>
                        <span class="detail-value">1.7 kg/h</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">NEXT MAINT.</span>
                        <span class="detail-value warning">7h</span>
                    </div>
                </div>
            </div>
            
            <div class="system-card">
                <div class="system-card-header">
                    <span>LIFE SUPPORT</span>
                    <span class="system-status status-good">NOMINAL</span>
                </div>
                
                <div class="meter-label">
                    <span>OXYGEN LEVELS</span>
                    <span class="meter-value">96%</span>
                </div>
                <div class="system-meter">
                    <div class="meter-fill meter-fill-good" style="width: 96%"></div>
                </div>
                
                <div class="meter-label">
                    <span>RECYCLING SYS</span>
                    <span class="meter-value">93%</span>
                </div>
                <div class="system-meter">
                    <div class="meter-fill meter-fill-good" style="width: 93%"></div>
                </div>
                
                <div class="system-details">
                    <div class="detail-item">
                        <span class="detail-label">CABIN TEMP</span>
                        <span class="detail-value">294K</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">HUMIDITY</span>
                        <span class="detail-value">41%</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">CO₂ LEVEL</span>
                        <span class="detail-value">0.34%</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">NEXT MAINT.</span>
                        <span class="detail-value">8d 12h</span>
                    </div>
                </div>
            </div>
        `;
    }
    
    /**
     * Renders the maintenance section with individual alert items
     */
    private renderMaintenanceSection(): string {
        if (this.state.maintenanceItems.length === 0) {
            return '';
        }
        
        let maintenanceHTML = '';
        
        for (const item of this.state.maintenanceItems) {
            const alertId = `maintenance-alert-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
            
            maintenanceHTML += `
                <div class="maintenance-alert" id="${alertId}">
                    <div class="maintenance-alert-content">
                        <div class="alert-inline">
                            <div class="warning-icon">!</div>
                            <span class="alert-system">${item.system}:</span>
                            <span class="alert-details">${item.issue}</span>
                            <span class="alert-urgency">${item.urgency} Priority</span>
                        </div>
                    </div>
                    <div class="dismiss-button" data-alert-id="${alertId}">✕</div>
                </div>`;
        }
        
        return maintenanceHTML;
    }
    
    /**
     * Renders system logs as HTML
     */
    public renderSystemLogs(fullHistory: boolean = false): string {
        if (this.state.systemLogs.length === 0) {
            return '<div class="log-entry"><span class="log-message">No logs to display</span></div>';
        }
        
        let logsHTML = '';
        const logs = fullHistory ? this.state.systemLogs : this.state.systemLogs.slice(0, 6); // Limit for overview
        
        for (const log of logs) {
            logsHTML += `
                <div class="log-entry">
                    <span class="log-timestamp">${log.timestamp}</span>
                    <span class="log-message ${log.type === 'warning' ? 'log-warning' : 
                                            log.type === 'error' ? 'log-error' : 
                                            log.type === 'success' ? 'log-success' : ''}">${log.message}</span>
                </div>`;
        }
        
        return logsHTML;
    }
}