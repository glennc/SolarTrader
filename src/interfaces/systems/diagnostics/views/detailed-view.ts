import { DiagnosticsState } from '../models/diagnostics-state';

/**
 * Renders the detailed view of the diagnostics interface
 */
export class DetailedView {
    constructor(private readonly state: DiagnosticsState) {
        // Constructor receives state for future implementation
    }
    
    /**
     * Renders the detailed view content
     */
    render(): string {
        // Currently using mock data, will use this.state in future updates
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        void this.state; // Reference state to avoid unused parameter warning
        return `
            <div class="diagnostic-section">
                <div class="diagnostic-header">ENGINE SUBSYSTEM DIAGNOSTICS</div>
                <div class="diagnostic-grid">
                    <div class="diagnostic-item">
                        <div class="diagnostic-title">COOLANT PRESSURE</div>
                        <div class="diagnostic-value warning">76%</div>
                        <div class="diagnostic-details">12% BELOW NOMINAL</div>
                    </div>
                    
                    <div class="diagnostic-item">
                        <div class="diagnostic-title">COOLANT TEMPERATURE</div>
                        <div class="diagnostic-value warning">312K</div>
                        <div class="diagnostic-details">+7K ABOVE NOMINAL</div>
                    </div>
                    
                    <div class="diagnostic-item">
                        <div class="diagnostic-title">FLOW RATE</div>
                        <div class="diagnostic-value good">48 L/min</div>
                        <div class="diagnostic-details">WITHIN NORMAL RANGE</div>
                    </div>
                    
                    <div class="diagnostic-item">
                        <div class="diagnostic-title">FILTER SATURATION</div>
                        <div class="diagnostic-value warning">83%</div>
                        <div class="diagnostic-details">REPLACEMENT ADVISED</div>
                    </div>
                </div>
            </div>
            
            <div class="diagnostic-section">
                <div class="diagnostic-header">POWER DISTRIBUTION DIAGNOSTICS</div>
                <div class="diagnostic-grid">
                    <div class="diagnostic-item">
                        <div class="diagnostic-title">MAIN BUS LOAD</div>
                        <div class="diagnostic-value good">64%</div>
                        <div class="diagnostic-details">WITHIN NORMAL RANGE</div>
                    </div>
                    
                    <div class="diagnostic-item">
                        <div class="diagnostic-title">AUX BUS LOAD</div>
                        <div class="diagnostic-value good">42%</</div>
                        <div class="diagnostic-details">WITHIN NORMAL RANGE</div>
                    </div>
                    
                    <div class="diagnostic-item">
                        <div class="diagnostic-title">BRIDGE SYSTEMS</div>
                        <div class="diagnostic-value good">100%</</div>
                        <div class="diagnostic-details">FULLY OPERATIONAL</div>
                    </div>
                    
                    <div class="diagnostic-item">
                        <div class="diagnostic-title">POWER EFFICIENCY</div>
                        <div class="diagnostic-value good">94.3%</</</div>
                        <div class="diagnostic-details">+2.1% ABOVE BASELINE</div>
                    </div>
                </div>
            </div>
            
            <div class="diagnostic-section">
                <div class="diagnostic-header">LIFE SUPPORT DIAGNOSTICS</div>
                <div class="diagnostic-grid">
                    <div class="diagnostic-item">
                        <div class="diagnostic-title">O₂ GENERATION</div>
                        <div class="diagnostic-value good">98%</</div>
                        <div class="diagnostic-details">OPTIMAL</div>
                    </div>
                    
                    <div class="diagnostic-item">
                        <div class="diagnostic-title">CO₂ SCRUBBERS</div>
                        <div class="diagnostic-value good">94%</</div>
                        <div class="diagnostic-details">WITHIN NORMAL RANGE</div>
                    </div>
                    
                    <div class="diagnostic-item">
                        <div class="diagnostic-title">WATER RECYCLING</div>
                        <div class="diagnostic-value good">91%</</div>
                        <div class="diagnostic-details">WITHIN NORMAL RANGE</div>
                    </div>
                    
                    <div class="diagnostic-item">
                        <div class="diagnostic-title">RADIATION SHIELDING</div>
                        <div class="diagnostic-value good">99.7%</</div>
                        <div class="diagnostic-details">OPTIMAL</div>
                    </div>
                </div>
            </div>
        `;
    }
}