import { TimeSkipState } from '../models/time-skip-state';
import { TimeSkipService } from '../services/time-skip-service';

/**
 * Footer view for the time skip interface
 */
export class FooterView {
  private state: TimeSkipState;
  private timeSkipService: TimeSkipService;
  private onStartCallback: () => void;
  private onPauseCallback: () => void;
  private onCancelCallback: () => void;
  private onDetailsCallback: () => void;
  private onExitCallback: () => void;
  
  /**
   * Creates a new FooterView.
   * @param state Reference to the TimeSkipState
   * @param timeSkipService Reference to the TimeSkipService
   * @param onStart Callback for start button
   * @param onPause Callback for pause button
   * @param onCancel Callback for cancel button
   * @param onDetails Callback for details button
   * @param onExit Callback for exit button
   */
  constructor(
    state: TimeSkipState,
    timeSkipService: TimeSkipService,
    onStart: () => void,
    onPause: () => void,
    onCancel: () => void,
    onDetails: () => void,
    onExit: () => void
  ) {
    this.state = state;
    this.timeSkipService = timeSkipService;
    this.onStartCallback = onStart;
    this.onPauseCallback = onPause;
    this.onCancelCallback = onCancel;
    this.onDetailsCallback = onDetails;
    this.onExitCallback = onExit;
  }
  
  /**
   * Renders the footer view.
   */
  render(): HTMLElement {
    const footer = document.createElement('div');
    footer.className = 'terminal-footer';
    
    const status = document.createElement('div');
    status.className = 'footer-status';
    
    // Set status text based on current state
    if (this.state.isSkipActive) {
      if (this.state.useTargetTime) {
        status.textContent = 'SYSTEM STATUS: TIME SKIP IN PROGRESS';
      } else {
        status.textContent = 'SYSTEM STATUS: TIME ACCELERATION ACTIVE';
      }
    } else if (this.state.skipProgressInterval !== null) {
      status.textContent = 'SYSTEM STATUS: PAUSED';
    } else {
      status.textContent = 'SYSTEM STATUS: READY';
    }
    
    // Add additional information about the active time process
    if (this.state.isSkipActive) {
      const skipDetails = document.createElement('div');
      skipDetails.className = 'skip-details';
      skipDetails.textContent = this.timeSkipService.getSkipDescription();
      status.appendChild(skipDetails);
    }
    
    footer.appendChild(status);
    
    const controls = document.createElement('div');
    controls.className = 'footer-controls';
    
    // Start/Pause/Resume button
    const startButton = document.createElement('span');
    startButton.id = 'start-button';
    
    if (this.state.isSkipActive) {
      startButton.textContent = 'PAUSE';
      startButton.addEventListener('click', this.onPauseCallback);
    } else if (this.state.skipProgressInterval !== null) {
      startButton.textContent = 'RESUME';
      startButton.addEventListener('click', this.onStartCallback);
    } else {
      // Button text should reflect the current mode
      if (this.state.useTargetTime) {
        startButton.textContent = 'START SKIP';
      } else {
        startButton.textContent = 'START ACCELERATION';
      }
      startButton.addEventListener('click', this.onStartCallback);
    }
    
    controls.appendChild(startButton);
    
    // Cancel/Return button
    const cancelButton = document.createElement('span');
    cancelButton.id = 'cancel-button';
    
    if (this.state.isSkipActive || this.state.skipProgressInterval !== null) {
      cancelButton.textContent = 'CANCEL';
      cancelButton.addEventListener('click', this.onCancelCallback);
    } else {
      cancelButton.textContent = 'RETURN TO SHIP';
      cancelButton.addEventListener('click', this.onExitCallback);
    }
    
    controls.appendChild(cancelButton);
    
    // Details button
    const detailsButton = document.createElement('span');
    detailsButton.textContent = 'DETAILS';
    detailsButton.addEventListener('click', this.onDetailsCallback);
    controls.appendChild(detailsButton);
    
    // Add an explicit exit button that's always visible
    const exitButton = document.createElement('span');
    exitButton.textContent = 'EXIT';
    exitButton.classList.add('exit-button');
    exitButton.style.color = 'var(--terminal-warning, #ffcc00)'; // Make it stand out
    exitButton.addEventListener('click', this.onExitCallback);
    controls.appendChild(exitButton);
    
    footer.appendChild(controls);
    
    return footer;
  }
}