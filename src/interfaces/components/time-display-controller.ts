import { TimeManager } from '../../managers/time-manager';
import { TimeDisplay } from './time-display';
import { DOMRenderer } from '../dom-renderer';

/**
 * Controller that manages standardized time displays across different interfaces.
 * This ensures consistent time formatting and behavior throughout the game.
 */
export class TimeDisplayController {
  private static instance: TimeDisplayController | null = null;
  private timeManager: TimeManager;
  private domRenderer: DOMRenderer;
  private activeDisplays: Map<string, TimeDisplay> = new Map();
  
  /**
   * Creates a new TimeDisplayController
   */
  private constructor(timeManager: TimeManager, domRenderer: DOMRenderer) {
    this.timeManager = timeManager;
    this.domRenderer = domRenderer;
    
    // Listen for time skips to update all displays
    this.timeManager.onTimeChange(() => {
      this.updateAllDisplays();
    });
  }
  
  /**
   * Gets or creates the singleton instance
   */
  public static getInstance(timeManager?: TimeManager, domRenderer?: DOMRenderer): TimeDisplayController {
    if (!TimeDisplayController.instance) {
      if (!timeManager || !domRenderer) {
        throw new Error('TimeDisplayController.getInstance requires timeManager and domRenderer on first call');
      }
      TimeDisplayController.instance = new TimeDisplayController(timeManager, domRenderer);
    }
    return TimeDisplayController.instance;
  }
  
  /**
   * Creates a standardized time display in the specified container
   * @param containerId The ID of the container element
   * @param options Display options
   * @returns The created TimeDisplay instance
   */
  public createTimeDisplay(
    container: HTMLElement, 
    options: {
      id?: string; 
      showEta?: boolean;
      showDayCycle?: boolean;
      etaCalculator?: () => string | null;
      size?: 'default' | 'small' | 'large';
    } = {}
  ): TimeDisplay {
    const id = options.id || `time-display-${Date.now()}`;
    
    // Create time display
    const timeDisplay = new TimeDisplay(
      container,
      this.timeManager,
      this.domRenderer,
      options.showEta ?? true,
      options.showDayCycle ?? true
    );
    
    // Set ETA calculator if provided
    if (options.etaCalculator) {
      timeDisplay.setEtaCalculator(options.etaCalculator);
    }
    
    // Add size class if specified
    if (options.size && options.size !== 'default') {
      const timeElement = container.querySelector('.terminal-time');
      if (timeElement) {
        timeElement.classList.add(options.size);
      }
    }
    
    // Store the display
    this.activeDisplays.set(id, timeDisplay);
    
    return timeDisplay;
  }
  
  /**
   * Removes a time display
   * @param id The ID of the display to remove
   */
  public removeTimeDisplay(id: string): void {
    const display = this.activeDisplays.get(id);
    if (display) {
      display.destroy();
      this.activeDisplays.delete(id);
    }
  }
  
  /**
   * Updates all active time displays
   */
  private updateAllDisplays(): void {
    this.activeDisplays.forEach(display => {
      display.update();
    });
  }
  
  /**
   * Creates a simple time element that can be inserted anywhere
   * @param className Additional CSS classes
   * @returns An HTML element with the current time that auto-updates
   */
  public createTimeElement(className: string = ''): HTMLElement {
    const timeElement = document.createElement('div');
    timeElement.className = `terminal-time ${className}`;
    
    // Set initial time
    const currentTime = this.timeManager.getElapsedTime();
    timeElement.textContent = currentTime.formatted;
    
    // Setup auto-update
    const updateId = setInterval(() => {
      const updatedTime = this.timeManager.getElapsedTime();
      timeElement.textContent = updatedTime.formatted;
    }, 1000);
    
    // Store the interval ID for cleanup
    (timeElement as any).updateIntervalId = updateId;
    
    return timeElement;
  }
  
  /**
   * Cleans up a previously created time element
   */
  public destroyTimeElement(element: HTMLElement): void {
    const intervalId = (element as any).updateIntervalId;
    if (intervalId) {
      clearInterval(intervalId);
      (element as any).updateIntervalId = null;
    }
  }
}