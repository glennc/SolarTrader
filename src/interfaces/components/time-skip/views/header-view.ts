import { TimeManager } from '../../../../managers/time-manager';

/**
 * Header view for the time skip interface
 */
export class HeaderView {
  private timeManager: TimeManager;
  private intervalId: number | null = null;
  
  /**
   * Creates a new HeaderView.
   * @param timeManager Reference to the game's TimeManager
   */
  constructor(timeManager: TimeManager) {
    this.timeManager = timeManager;
  }
  
  /**
   * Renders the header view.
   */
  render(): HTMLElement {
    const header = document.createElement('div');
    header.className = 'terminal-header';
    
    const headerText = document.createElement('div');
    headerText.className = 'terminal-header-text';
    headerText.textContent = 'TIME SKIP CONTROL SYSTEM v2.19';
    header.appendChild(headerText);
    
    const timeElement = document.createElement('div');
    timeElement.className = 'terminal-time';
    
    // Use the time manager to get the current formatted time
    const currentTime = this.timeManager.getElapsedTime();
    timeElement.textContent = currentTime.formatted;
    
    // Update the time every second
    this.intervalId = window.setInterval(() => {
      const updatedTime = this.timeManager.getElapsedTime();
      timeElement.textContent = updatedTime.formatted;
    }, 1000);
    
    header.appendChild(timeElement);
    
    return header;
  }
  
  /**
   * Cleans up resources.
   */
  destroy(): void {
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
}