import { TimeSkipState } from '../models/time-skip-state';
import { TimeSkipService } from '../services/time-skip-service';

/**
 * Time controls view for the time skip interface
 */
export class TimeControlsView {
  private state: TimeSkipState;
  private timeSkipService: TimeSkipService;
  private onUpdateCallback: () => void;
  
  /**
   * Creates a new TimeControlsView.
   * @param state Reference to the TimeSkipState
   * @param timeSkipService Reference to the TimeSkipService
   * @param onUpdate Callback when controls are updated
   */
  constructor(
    state: TimeSkipState,
    timeSkipService: TimeSkipService,
    onUpdate: () => void
  ) {
    this.state = state;
    this.timeSkipService = timeSkipService;
    this.onUpdateCallback = onUpdate;
  }
  
  /**
   * Renders the time controls view.
   */
  render(): HTMLElement {
    const container = document.createElement('div');
    container.className = 'time-controls-container';
    
    // Create tab buttons for switching between acceleration modes
    const tabsContainer = document.createElement('div');
    tabsContainer.className = 'time-controls-tabs';
    
    const targetModeTab = document.createElement('button');
    targetModeTab.className = 'tab-button';
    targetModeTab.textContent = 'TARGET TIME';
    if (this.state.useTargetTime) targetModeTab.classList.add('active');
    
    const continuousModeTab = document.createElement('button');
    continuousModeTab.className = 'tab-button';
    continuousModeTab.textContent = 'CONTINUOUS';
    if (!this.state.useTargetTime) continuousModeTab.classList.add('active');
    
    targetModeTab.addEventListener('click', () => {
      this.state.setUseTargetTime(true);
      targetModeTab.classList.add('active');
      continuousModeTab.classList.remove('active');
      this.updateControlsDisplay(controlsContainer);
      this.onUpdateCallback();
    });
    
    continuousModeTab.addEventListener('click', () => {
      this.state.setUseTargetTime(false);
      continuousModeTab.classList.add('active');
      targetModeTab.classList.remove('active');
      this.updateControlsDisplay(controlsContainer);
      this.onUpdateCallback();
    });
    
    tabsContainer.appendChild(targetModeTab);
    tabsContainer.appendChild(continuousModeTab);
    container.appendChild(tabsContainer);
    
    // Container for the actual controls (will change based on selected mode)
    const controlsContainer = document.createElement('div');
    controlsContainer.className = 'time-controls';
    container.appendChild(controlsContainer);
    
    // Initial render based on current mode
    this.updateControlsDisplay(controlsContainer);
    
    return container;
  }
  
  /**
   * Updates the displayed controls based on the current mode
   * @param container The container to update
   */
  private updateControlsDisplay(container: HTMLElement): void {
    // Clear existing controls
    container.innerHTML = '';
    
    if (this.state.useTargetTime) {
      this.renderTargetTimeControls(container);
    } else {
      this.renderAccelerationControls(container);
    }
  }
  
  /**
   * Renders controls for target time mode
   */
  private renderTargetTimeControls(container: HTMLElement): void {
    // Add section label
    const sectionLabel = document.createElement('div');
    sectionLabel.className = 'section-label';
    sectionLabel.textContent = 'SKIP DURATION:';
    container.appendChild(sectionLabel);
    
    // Skip duration buttons
    const buttonsContainer = document.createElement('div');
    buttonsContainer.className = 'button-group';
    
    // Add time skip buttons for each predefined option
    this.state.skipOptions.forEach(hours => {
      const button = document.createElement('button');
      button.className = 'time-skip-button';
      button.textContent = `${hours} HOUR${hours !== 1 ? 'S' : ''}`;
      
      // Set the active state for default selection
      if (hours === this.state.selectedSkipHours) {
        button.classList.add('active');
      }
      
      button.addEventListener('click', () => {
        this.selectSkipHours(hours);
        
        // Update button states
        const allButtons = buttonsContainer.querySelectorAll('.time-skip-button');
        allButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
      });
      
      buttonsContainer.appendChild(button);
    });
    
    // Add custom time button
    const customButton = document.createElement('button');
    customButton.className = 'time-skip-button';
    customButton.textContent = 'CUSTOM';
    customButton.addEventListener('click', () => this.showCustomSkipDialog());
    buttonsContainer.appendChild(customButton);
    
    container.appendChild(buttonsContainer);
    
    // Add speed selection
    this.addSpeedSelection(container);
  }
  
  /**
   * Renders controls for continuous acceleration mode
   */
  private renderAccelerationControls(container: HTMLElement): void {
    // Add section label
    const sectionLabel = document.createElement('div');
    sectionLabel.className = 'section-label';
    sectionLabel.textContent = 'TIME ACCELERATION:';
    container.appendChild(sectionLabel);
    
    // Add acceleration factor selection
    this.addSpeedSelection(container);
    
    // Add explanation
    const explanation = document.createElement('div');
    explanation.className = 'control-explanation';
    explanation.textContent = 'Time will continue to flow at the selected rate until paused or canceled.';
    container.appendChild(explanation);
  }
  
  /**
   * Adds speed/acceleration factor selection controls
   */
  private addSpeedSelection(container: HTMLElement): void {
    // Speed section
    const speedLabel = document.createElement('div');
    speedLabel.className = 'section-label';
    speedLabel.textContent = 'SPEED:';
    container.appendChild(speedLabel);
    
    // Speed buttons
    const speedContainer = document.createElement('div');
    speedContainer.className = 'button-group';
    
    // Add buttons for each acceleration factor
    this.state.accelerationOptions.forEach(factor => {
      const button = document.createElement('button');
      button.className = 'speed-button';
      button.textContent = `${factor}x`;
      
      // Set the active state for default selection
      if (factor === this.state.selectedAccelerationFactor) {
        button.classList.add('active');
      }
      
      button.addEventListener('click', () => {
        this.selectAccelerationFactor(factor);
        
        // Update button states
        const allButtons = speedContainer.querySelectorAll('.speed-button');
        allButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
      });
      
      speedContainer.appendChild(button);
    });
    
    container.appendChild(speedContainer);
  }
  
  /**
   * Updates the selected skip hours.
   */
  private selectSkipHours(hours: number): void {
    this.state.setSelectedSkipHours(hours);
    
    // Regenerate projected alerts based on the new time
    this.timeSkipService.generateProjectedAlerts(hours);
    
    // Call the update callback
    this.onUpdateCallback();
  }
  
  /**
   * Updates the selected acceleration factor.
   */
  private selectAccelerationFactor(factor: number): void {
    this.state.setAccelerationFactor(factor);
    
    // If currently in a time skip, update the running factor
    if (this.state.isSkipActive && this.timeSkipService) {
      this.timeSkipService.setTimeAcceleration(factor, () => {
        // This is the interval update callback
        this.onUpdateCallback();
      });
    }
    
    // Call the update callback
    this.onUpdateCallback();
  }
  
  /**
   * Show a dialog for custom time input.
   */
  private showCustomSkipDialog(): void {
    const customHours = window.prompt('Enter number of hours to skip (1-24):', '4');
    if (customHours === null) return;
    
    const hours = parseInt(customHours, 10);
    if (isNaN(hours) || hours < 1 || hours > 24) {
      alert('Please enter a valid number between 1 and 24.');
      return;
    }
    
    // Select the new hours
    this.selectSkipHours(hours);
    
    // Update UI to show the custom time as selected
    const allButtons = document.querySelectorAll('.time-skip-button');
    allButtons.forEach(btn => btn.classList.remove('active'));
  }
}