import { TimeSkipState } from '../models/time-skip-state';
import { TimeFormatter } from '../../time-formatter';

/**
 * System monitor view for the time skip interface
 */
export class SystemMonitorView {
  private state: TimeSkipState;
  
  /**
   * Creates a new SystemMonitorView.
   * @param state Reference to the TimeSkipState
   */
  constructor(state: TimeSkipState) {
    this.state = state;
  }
  
  /**
   * Updates the system values display.
   */
  updateSystemValues(): void {
    // Update system value displays
    Object.keys(this.state.shipSystemStates).forEach(key => {
      const element = document.getElementById(`system-${key}`);
      if (element) {
        // Round to nearest whole number for display
        const displayValue = Math.round(this.state.shipSystemStates[key]);
        element.textContent = `${displayValue}%`;
        
        // Update warning class
        if (displayValue < 80) {
          element.classList.add('stat-warn');
        } else {
          element.classList.remove('stat-warn');
        }
      }
    });
    
    // Update alert display
    this.updateAlertDisplay();
  }
  
  /**
   * Updates the alert display.
   */
  updateAlertDisplay(): void {
    const alertsCard = document.getElementById('projected-alerts-card');
    if (!alertsCard) return;
    
    // Clear existing alert rows (but keep the header)
    const header = alertsCard.querySelector('.stat-card-header');
    alertsCard.innerHTML = '';
    if (header) {
      alertsCard.appendChild(header);
    }
    
    // If no alerts, show a completely different structure for "ALERT STATUS: NORMAL"
    if (this.state.projectedAlerts.length === 0) {
      // Create a completely different structure for normal status display
      const normalStatusContainer = document.createElement('div');
      normalStatusContainer.style.display = 'flex';
      normalStatusContainer.style.justifyContent = 'space-between';
      normalStatusContainer.style.alignItems = 'center';
      normalStatusContainer.style.padding = '5px 0';
      normalStatusContainer.style.margin = '10px 0';
      normalStatusContainer.style.borderBottom = '1px dashed var(--terminal-dim, #115566)';
      
      const statusLabelSpan = document.createElement('span');
      statusLabelSpan.textContent = 'ALERT STATUS:';
      statusLabelSpan.style.color = 'var(--terminal-text, #33ccff)';
      statusLabelSpan.style.fontWeight = 'bold';
      statusLabelSpan.style.minWidth = '120px';
      statusLabelSpan.style.display = 'inline-block';
      
      const statusValueSpan = document.createElement('span');
      statusValueSpan.textContent = 'NORMAL';
      statusValueSpan.style.color = 'var(--terminal-highlight, #55ffaa)';
      statusValueSpan.style.fontWeight = 'bold';
      
      normalStatusContainer.appendChild(statusLabelSpan);
      normalStatusContainer.appendChild(statusValueSpan);
      
      alertsCard.appendChild(normalStatusContainer);
      return;
    }
    
    // Add each alert in a consistently styled container
    this.state.projectedAlerts.forEach(alert => {
      // For triggered alerts, create a special alert status display
      if (alert.triggered) {
        const alertStatus = document.createElement('div');
        alertStatus.className = 'alert-status';
        
        // Use proper status text rendering without trying to access undefined message property
        const statusText = `${alert.system} ${alert.status}`;
        
        // Create a text span to hold the status
        const statusSpan = document.createElement('span');
        statusSpan.className = 'alert-status-text';
        statusSpan.textContent = statusText;
        
        // Append status text to the alert container
        alertStatus.appendChild(statusSpan);
        
        // Add to the card
        alertsCard.appendChild(alertStatus);
      } else {
        // Standard row for upcoming alerts
        const row = document.createElement('div');
        row.className = 'stat-row';
        
        const label = document.createElement('span');
        label.className = 'stat-label';
        label.textContent = alert.system + ':';
        row.appendChild(label);
        
        const value = document.createElement('span');
        value.className = 'stat-value';
        
        if (alert.status === 'WARNING') {
          value.classList.add('stat-warn');
        } else if (alert.status === 'DANGER') {
          value.classList.add('stat-danger');
        }
        
        // Format the alert time as hours and minutes
        const hours = Math.floor(alert.triggerMinute / 60);
        const minutes = alert.triggerMinute % 60;
        
        // Use standardized time formatter
        value.textContent = TimeFormatter.formatAlertTime(hours, minutes, alert.status);
        
        row.appendChild(value);
        alertsCard.appendChild(row);
      }
    });
  }
  
  /**
   * Starts the star streak animation.
   */
  startStarStreaks(): void {
    // Get the star field element
    const starField = document.getElementById('starField');
    if (!starField) return;
    
    // Clear any existing animation
    starField.innerHTML = '';
    
    // Create initial stars
    for (let i = 0; i < 30; i++) {
      this.createStarStreak(starField);
    }
    
    // Create ongoing stars
    const intervalId = window.setInterval(() => {
      this.createStarStreak(starField);
    }, 50);
    
    // Store the interval ID to clear it later
    (starField as any).intervalId = intervalId;
  }
  
  /**
   * Stops the star streak animation.
   */
  stopStarStreaks(): void {
    const starField = document.getElementById('starField');
    if (!starField) return;
    
    // Clear the animation interval
    const intervalId = (starField as any).intervalId;
    if (intervalId) {
      clearInterval(intervalId);
      (starField as any).intervalId = null;
    }
    
    // Remove all existing streaks
    starField.innerHTML = '';
  }
  
  /**
   * Creates a star streak element.
   */
  private createStarStreak(starField: HTMLElement): void {
    const streak = document.createElement('div');
    streak.className = 'star-streak';
    
    // Random position
    const top = Math.random() * 100;
    streak.style.top = `${top}%`;
    streak.style.right = '0';
    
    // Random animation duration
    const duration = 0.3 + Math.random() * 0.5;
    streak.style.animationDuration = `${duration}s`;
    
    // Random width & opacity
    const width = 15 + Math.random() * 30;
    const opacity = 0.5 + Math.random() * 0.5;
    streak.style.width = `${width}px`;
    streak.style.opacity = `${opacity}`;
    
    // Add to star field
    starField.appendChild(streak);
    
    // Remove after animation completes
    setTimeout(() => {
      if (streak.parentNode === starField) {
        streak.remove();
      }
    }, duration * 1000);
  }
}