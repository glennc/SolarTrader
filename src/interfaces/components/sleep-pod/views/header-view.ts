import { TimeManager } from '../../../../managers/time-manager';

/**
 * Header view for the sleep pod interface
 */
export class HeaderView {
  private timeManager: TimeManager;
  
  constructor(timeManager: TimeManager) {
    this.timeManager = timeManager;
  }
  
  /**
   * Creates the terminal header element.
   */
  render(): HTMLElement {
    const header = document.createElement('div');
    header.className = 'terminal-header';
    
    const headerText = document.createElement('div');
    headerText.className = 'terminal-header-text';
    headerText.textContent = 'SLEEP POD CONTROL SYSTEM v2.15';
    header.appendChild(headerText);
    
    const timeElement = document.createElement('div');
    timeElement.className = 'terminal-time';
    
    // Use the time manager to get the current formatted time
    const currentTime = this.timeManager.getElapsedTime();
    timeElement.textContent = currentTime.formatted;
    
    // Update the time every second
    setInterval(() => {
      const updatedTime = this.timeManager.getElapsedTime();
      timeElement.textContent = updatedTime.formatted;
    }, 1000);
    
    header.appendChild(timeElement);
    
    return header;
  }
}