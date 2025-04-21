import { SleepPodState } from '../models/sleep-pod-state';
import { SleepService } from '../services/sleep-service';

/**
 * View for selecting and displaying sleep duration
 */
export class SleepDurationView {
  private state: SleepPodState;
  private sleepService: SleepService;
  private onDurationChange: () => void;
  
  constructor(
    state: SleepPodState, 
    sleepService: SleepService,
    onDurationChange: () => void
  ) {
    this.state = state;
    this.sleepService = sleepService;
    this.onDurationChange = onDurationChange;
  }
  
  /**
   * Creates the sleep duration element.
   */
  render(): HTMLElement {
    const sleepDuration = document.createElement('div');
    sleepDuration.className = 'sleep-duration';
    
    const header = document.createElement('div');
    header.className = 'control-header';
    header.textContent = 'SLEEP DURATION';
    sleepDuration.appendChild(header);
    
    // Duration preset buttons
    const presets = document.createElement('div');
    presets.className = 'duration-presets';
    
    const hourOptions = [2, 4, 6, 8];
    hourOptions.forEach(hours => {
      const preset = document.createElement('div');
      preset.className = 'duration-preset';
      if (hours === this.state.sleepConfig.selectedHours) {
        preset.classList.add('active');
      }
      preset.textContent = `${hours} HOURS`;
      preset.addEventListener('click', () => this.selectDuration(hours));
      presets.appendChild(preset);
    });
    
    sleepDuration.appendChild(presets);
    
    // Custom duration input
    const customDuration = document.createElement('div');
    customDuration.className = 'custom-duration';
    
    const customLabel = document.createElement('span');
    customLabel.className = 'custom-duration-label';
    customLabel.textContent = 'CUSTOM:';
    customDuration.appendChild(customLabel);
    
    const customInput = document.createElement('input');
    customInput.type = 'text';
    customInput.className = 'custom-duration-input';
    customInput.placeholder = 'Enter hours...';
    customInput.value = this.state.sleepConfig.selectedHours.toString();
    
    customInput.addEventListener('input', (e) => {
      const value = parseFloat((e.target as HTMLInputElement).value);
      if (!isNaN(value) && value > 0 && value <= 24) {
        this.selectCustomDuration(value);
      }
    });
    
    customDuration.appendChild(customInput);
    sleepDuration.appendChild(customDuration);
    
    // Estimated recovery row
    const recoveryRow = document.createElement('div');
    recoveryRow.className = 'status-row';
    recoveryRow.style.marginTop = '15px';
    
    const recoveryLabel = document.createElement('span');
    recoveryLabel.className = 'status-label';
    recoveryLabel.textContent = 'ESTIMATED RECOVERY:';
    recoveryRow.appendChild(recoveryLabel);
    
    const recoveryValue = document.createElement('span');
    recoveryValue.id = 'estimated-recovery';
    recoveryValue.className = 'status-value optimal';
    recoveryValue.textContent = this.state.calculateRecovery(this.state.sleepConfig.selectedHours);
    recoveryRow.appendChild(recoveryValue);
    
    sleepDuration.appendChild(recoveryRow);
    
    // Wake time row
    const wakeRow = document.createElement('div');
    wakeRow.className = 'status-row';
    
    const wakeLabel = document.createElement('span');
    wakeLabel.className = 'status-label';
    wakeLabel.textContent = 'WAKE TIME:';
    wakeRow.appendChild(wakeLabel);
    
    const wakeValue = document.createElement('span');
    wakeValue.id = 'wake-time';
    wakeValue.className = 'status-value';
    
    // Calculate wake time based on current time
    const wakeTime = this.sleepService.calculateWakeTime(this.state.sleepConfig.selectedHours);
    wakeValue.textContent = wakeTime;
    
    wakeRow.appendChild(wakeValue);
    sleepDuration.appendChild(wakeRow);
    
    return sleepDuration;
  }
  
  /**
   * Selects a preset sleep duration.
   * @param hours Number of hours to sleep
   */
  private selectDuration(hours: number): void {
    this.sleepService.selectDuration(hours);
    this.updateDurationSelection();
    this.updateWakeTimeDisplay();
    this.updateRecoveryDisplay();
    
    // Notify parent component that duration changed
    if (this.onDurationChange) {
      this.onDurationChange();
    }
  }
  
  /**
   * Selects a custom sleep duration.
   * @param hours Number of hours to sleep
   */
  private selectCustomDuration(hours: number): void {
    this.sleepService.selectDuration(hours);
    this.updateDurationSelection();
    this.updateWakeTimeDisplay();
    this.updateRecoveryDisplay();
    
    // Notify parent component that duration changed
    if (this.onDurationChange) {
      this.onDurationChange();
    }
  }
  
  /**
   * Updates the UI to reflect the currently selected duration.
   */
  private updateDurationSelection(): void {
    // Update preset buttons
    const presets = document.querySelectorAll('.duration-preset');
    presets.forEach(preset => {
      preset.classList.remove('active');
      const hours = parseInt(preset.textContent?.split(' ')[0] || '0');
      if (hours === this.state.sleepConfig.selectedHours) {
        preset.classList.add('active');
      }
    });
    
    // Update custom input
    const customInput = document.querySelector('.custom-duration-input') as HTMLInputElement;
    if (customInput) {
      customInput.value = this.state.sleepConfig.selectedHours.toString();
    }
  }
  
  /**
   * Updates the wake time display based on the selected duration.
   */
  private updateWakeTimeDisplay(): void {
    const wakeTime = this.sleepService.calculateWakeTime(this.state.sleepConfig.selectedHours);
    const wakeTimeElement = document.getElementById('wake-time');
    if (wakeTimeElement) {
      wakeTimeElement.textContent = wakeTime;
    }
  }
  
  /**
   * Updates the recovery display based on the selected duration.
   */
  private updateRecoveryDisplay(): void {
    const recovery = this.state.calculateRecovery(this.state.sleepConfig.selectedHours);
    const recoveryElement = document.getElementById('estimated-recovery');
    if (recoveryElement) {
      recoveryElement.textContent = recovery;
    }
  }
}