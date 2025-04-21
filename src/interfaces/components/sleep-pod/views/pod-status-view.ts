import { SleepPodState } from '../models/sleep-pod-state';

/**
 * View for displaying the pod status information
 */
export class PodStatusView {
  private state: SleepPodState;
  
  constructor(state: SleepPodState) {
    this.state = state;
  }
  
  /**
   * Creates the pod status element.
   */
  render(): HTMLElement {
    const podStatus = document.createElement('div');
    podStatus.className = 'sleep-pod-status';
    
    const header = document.createElement('div');
    header.className = 'control-header';
    header.textContent = 'POD STATUS';
    podStatus.appendChild(header);
    
    // Current state
    const stateRow = document.createElement('div');
    stateRow.className = 'status-row';
    
    const stateLabel = document.createElement('span');
    stateLabel.className = 'status-label';
    stateLabel.textContent = 'CURRENT STATE:';
    stateRow.appendChild(stateLabel);
    
    const stateValue = document.createElement('span');
    stateValue.className = 'status-value optimal';
    stateValue.textContent = 'READY';
    stateRow.appendChild(stateValue);
    
    podStatus.appendChild(stateRow);
    
    // Atmosphere
    const atmosphereRow = document.createElement('div');
    atmosphereRow.className = 'status-row';
    
    const atmosphereLabel = document.createElement('span');
    atmosphereLabel.className = 'status-label';
    atmosphereLabel.textContent = 'ATMOSPHERE:';
    atmosphereRow.appendChild(atmosphereLabel);
    
    const atmosphereValue = document.createElement('span');
    atmosphereValue.className = 'status-value optimal';
    atmosphereValue.textContent = `${this.state.podStatus.atmosphere}% OPTIMAL`;
    atmosphereRow.appendChild(atmosphereValue);
    
    podStatus.appendChild(atmosphereRow);
    
    // Temperature
    const tempRow = document.createElement('div');
    tempRow.className = 'status-row';
    
    const tempLabel = document.createElement('span');
    tempLabel.className = 'status-label';
    tempLabel.textContent = 'TEMPERATURE:';
    tempRow.appendChild(tempLabel);
    
    const tempValue = document.createElement('span');
    tempValue.className = 'status-value optimal';
    tempValue.textContent = `${this.state.podStatus.temperature}K (NOMINAL)`;
    tempRow.appendChild(tempValue);
    
    podStatus.appendChild(tempRow);
    
    // Field integrity
    const fieldRow = document.createElement('div');
    fieldRow.className = 'status-row';
    
    const fieldLabel = document.createElement('span');
    fieldLabel.className = 'status-label';
    fieldLabel.textContent = 'FIELD INTEGRITY:';
    fieldRow.appendChild(fieldLabel);
    
    const fieldValue = document.createElement('span');
    fieldValue.className = 'status-value optimal';
    fieldValue.textContent = `${this.state.podStatus.fieldIntegrity}%`;
    fieldRow.appendChild(fieldValue);
    
    podStatus.appendChild(fieldRow);
    
    // Player rest need
    const restRow = document.createElement('div');
    restRow.className = 'status-row';
    
    const restLabel = document.createElement('span');
    restLabel.className = 'status-label';
    restLabel.textContent = 'PLAYER NEED:';
    restRow.appendChild(restLabel);
    
    const restValue = document.createElement('span');
    restValue.id = 'player-rest-level';
    
    // Set appropriate class based on rest level
    if (this.state.playerRestLevel > 70) {
      restValue.className = 'status-value optimal';
    } else if (this.state.playerRestLevel > 40) {
      restValue.className = 'status-value warning';
    } else {
      restValue.className = 'status-value danger';
    }
    
    restValue.textContent = `REST: ${Math.round(this.state.playerRestLevel)}%`;
    restRow.appendChild(restValue);
    
    podStatus.appendChild(restRow);
    
    return podStatus;
  }
}