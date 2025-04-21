import { TimeSkipState } from '../models/time-skip-state';

/**
 * Status view for the time skip interface
 */
export class StatusView {
  private state: TimeSkipState;
  
  /**
   * Creates a new StatusView.
   * @param state Reference to the TimeSkipState
   */
  constructor(state: TimeSkipState) {
    this.state = state;
  }
  
  /**
   * Renders the status view.
   */
  render(): HTMLElement {
    const statusDisplay = document.createElement('div');
    statusDisplay.className = 'time-skip-status';
    
    // Create a wrapper for the text to prevent wrapping issues
    const statusContent = document.createElement('span');
    
    // Set appropriate status text based on state
    if (this.state.isSkipActive) {
      statusContent.innerHTML = 'TIME SKIP IN PROGRESS <span>...</span>';
    } else if (this.state.skipProgressInterval !== null) {
      statusContent.innerHTML = 'TIME SKIP PAUSED';
    } else {
      statusContent.innerHTML = `SKIP ${this.state.selectedSkipHours} HOUR${this.state.selectedSkipHours !== 1 ? 'S' : ''}?`;
    }
    
    statusDisplay.appendChild(statusContent);
    return statusDisplay;
  }
}