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
    const controls = document.createElement('div');
    controls.className = 'time-controls';
    
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
        const allButtons = controls.querySelectorAll('.time-skip-button');
        allButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
      });
      
      controls.appendChild(button);
    });
    
    // Add custom time button
    const customButton = document.createElement('button');
    customButton.className = 'time-skip-button';
    customButton.textContent = 'CUSTOM';
    customButton.addEventListener('click', () => this.showCustomSkipDialog());
    controls.appendChild(customButton);
    
    return controls;
  }
  
  /**
   * Updates the selected skip time.
   */
  private selectSkipHours(hours: number): void {
    this.state.setSelectedSkipHours(hours);
    
    // Regenerate projected alerts based on the new time
    this.timeSkipService.generateProjectedAlerts(hours);
    
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
  }
}