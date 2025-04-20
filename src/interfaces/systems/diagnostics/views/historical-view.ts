import { DiagnosticsState } from '../models/diagnostics-state';

/**
 * Renders the historical view of the diagnostics interface
 */
export class HistoricalView {
    private state: DiagnosticsState;
    
    constructor(state: DiagnosticsState) {
        this.state = state;
    }
    
    /**
     * Renders the historical view content
     */
    render(): string {
        return `
            <div class="system-logs">
                <div class="logs-header">
                    <span>SYSTEM EVENT HISTORY</span>
                    <span>ALL RECORDS</span>
                </div>
                <div class="logs-container">
                    ${this.renderSystemLogs(true)}
                </div>
            </div>
            
            <div class="diagnostic-section">
                <div class="diagnostic-header">HISTORICAL TRENDS</div>
                <div class="diagnostic-grid">
                    <div class="diagnostic-item">
                        <div class="diagnostic-title">POWER CONSUMPTION</div>
                        <div class="diagnostic-value good">STABLE</div>
                        <div class="diagnostic-details">NO SIGNIFICANT CHANGES</div>
                    </div>
                    
                    <div class="diagnostic-item">
                        <div class="diagnostic-title">COOLANT SYSTEM</div>
                        <div class="diagnostic-value warning">DECLINING</div>
                        <div class="diagnostic-details">-8% OVER 72 HOURS</div>
                    </div>
                    
                    <div class="diagnostic-item">
                        <div class="diagnostic-title">ENGINE EFFICIENCY</div>
                        <div class="diagnostic-value warning">FLUCTUATING</div>
                        <div class="diagnostic-details">±7% VARIANCE</div>
                    </div>
                    
                    <div class="diagnostic-item">
                        <div class="diagnostic-title">LIFE SUPPORT</div>
                        <div class="diagnostic-value good">STABLE</div>
                        <div class="diagnostic-details">WITHIN NORMAL RANGE</div>
                    </div>
                </div>
            </div>
            
            <div class="maintenance-required">
                <div class="maintenance-header">
                    <div class="warning-icon">!</div>
                    <span>HISTORICAL MAINTENANCE RECORD</span>
                </div>
                <ul class="maintenance-list">
                    <li class="maintenance-item">
                        Life support filters replaced 
                        <span class="maintenance-details">T-24:12:05</span>
                    </li>
                    <li class="maintenance-item">
                        Coolant system flushed
                        <span class="maintenance-details">T-72:45:18</span>
                    </li>
                    <li class="maintenance-item">
                        Power distribution optimized
                        <span class="maintenance-details">T-96:30:22</span>
                    </li>
                    <li class="maintenance-item">
                        Engine calibration performed
                        <span class="maintenance-details">T-168:15:47</span>
                    </li>
                </ul>
            </div>
        `;
    }
    
    /**
     * Renders system logs as HTML
     */
    private renderSystemLogs(fullHistory: boolean = true): string {
        if (this.state.systemLogs.length === 0) {
            return '<div class="log-entry"><span class="log-message">No logs to display</span></div>';
        }
        
        let logsHTML = '';
        const logs = this.state.systemLogs;
        
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