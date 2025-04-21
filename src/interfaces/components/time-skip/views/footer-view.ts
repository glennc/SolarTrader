import { TimeSkipState } from '../models/time-skip-state';

/**
 * Footer view for the time skip interface
 */
export class FooterView {
  private state: TimeSkipState;
  private onStartCallback: () => void;
  private onPauseCallback: () => void;
  private onCancelCallback: () => void;
  private onDetailsCallback: () => void;
  
  /**
   * Creates a new FooterView.
   * @param state Reference to the TimeSkipState
   * @param timeSkipService Reference to the TimeSkipService (not used directly in this view)
   * @param onStart Callback for start button
   * @param onPause Callback for pause button
   * @param onCancel Callback for cancel button
   * @param onDetails Callback for details button
   * @param onExit Callback for exit button (not used directly in this view)
   */
  constructor(
    state: TimeSkipState,
    _timeSkipService: any,
    onStart: () => void,
    onPause: () => void,
    onCancel: () => void,
    onDetails: () => void,
    _onExit: () => void
  ) {
    this.state = state;
    this.onStartCallback = onStart;
    this.onPauseCallback = onPause;
    this.onCancelCallback = onCancel;
    this.onDetailsCallback = onDetails;
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
      status.textContent = 'SYSTEM STATUS: AUTOMATED MAINTENANCE ACTIVE';
    } else if (this.state.skipProgressInterval !== null) {
      status.textContent = 'SYSTEM STATUS: PAUSED';
    } else {
      status.textContent = 'SYSTEM STATUS: READY';
    }
    
    footer.appendChild(status);
    
    const controls = document.createElement('div');
    controls.className = 'footer-controls';
    
    // Start/Pause button
    const startButton = document.createElement('span');
    startButton.id = 'start-button';
    
    if (this.state.isSkipActive) {
      startButton.textContent = 'PAUSE';
      startButton.addEventListener('click', this.onPauseCallback);
    } else if (this.state.skipProgressInterval !== null) {
      startButton.textContent = 'RESUME';
      startButton.addEventListener('click', this.onStartCallback);
    } else {
      startButton.textContent = 'START';
      startButton.addEventListener('click', this.onStartCallback);
    }
    
    controls.appendChild(startButton);
    
    // Cancel button
    const cancelButton = document.createElement('span');
    cancelButton.textContent = 'CANCEL';
    cancelButton.addEventListener('click', this.onCancelCallback);
    controls.appendChild(cancelButton);
    
    // Details button
    const detailsButton = document.createElement('span');
    detailsButton.textContent = 'DETAILS';
    detailsButton.addEventListener('click', this.onDetailsCallback);
    controls.appendChild(detailsButton);
    
    footer.appendChild(controls);
    
    return footer;
  }
}