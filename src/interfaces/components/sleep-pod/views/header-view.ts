import { TimeManager } from '../../../../managers/time-manager';
import { TimeDisplayController } from '../../time-display-controller';
import { DOMRenderer } from '../../../dom-renderer';

/**
 * Header view for the sleep pod interface
 */
export class HeaderView {
  private timeManager: TimeManager;
  private timeElement: HTMLElement | null = null;
  private intervalId: number | null = null;
  
  /**
   * Creates a new header view
   * @param timeManager Reference to the game's TimeManager
   * @param domRenderer Optional renderer reference for time display
   */
  constructor(timeManager: TimeManager, private domRenderer?: DOMRenderer) {
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
    
    // Create time element using TimeDisplayController if domRenderer is available
    // Otherwise fall back to the manual implementation
    if (this.domRenderer) {
      try {
        const controller = TimeDisplayController.getInstance(this.timeManager, this.domRenderer);
        this.timeElement = controller.createTimeElement();
        header.appendChild(this.timeElement);
      } catch (error) {
        // Fall back to manual time display if controller isn't properly initialized
        this.createManualTimeDisplay(header);
      }
    } else {
      this.createManualTimeDisplay(header);
    }
    
    return header;
  }
  
  /**
   * Creates a time display manually (fallback method)
   */
  private createManualTimeDisplay(header: HTMLElement): void {
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
    
    this.timeElement = timeElement;
    header.appendChild(timeElement);
  }
  
  /**
   * Cleans up resources.
   */
  destroy(): void {
    if (this.timeElement && this.domRenderer) {
      try {
        const controller = TimeDisplayController.getInstance();
        controller.destroyTimeElement(this.timeElement);
      } catch (error) {
        // Fall back to manual cleanup
        if (this.intervalId !== null) {
          clearInterval(this.intervalId);
          this.intervalId = null;
        }
      }
    } else if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    
    this.timeElement = null;
  }
}