import { TimeManager } from '../../../../managers/time-manager';
import { TimeDisplayController } from '../../time-display-controller';
import { DOMRenderer } from '../../../dom-renderer';
import { TimeSkipService } from '../services/time-skip-service';

/**
 * Header view for the time skip interface
 */
export class HeaderView {
  private timeManager: TimeManager;
  private timeElement: HTMLElement | null = null;
  private watchElement: HTMLElement | null = null;
  private timeUpdateInterval: number | null = null;
  private skipToWatchButton: HTMLElement | null = null;
  private timeSkipService: TimeSkipService | null = null;
  
  // Ship watch schedule (traditional naval watches adapted for space)
  private readonly WATCHES = [
    { name: "FIRST WATCH", start: 20, end: 0 },
    { name: "MIDDLE WATCH", start: 0, end: 4 },
    { name: "MORNING WATCH", start: 4, end: 8 },
    { name: "FORENOON WATCH", start: 8, end: 12 },
    { name: "AFTERNOON WATCH", start: 12, end: 16 },
    { name: "EVENING WATCH", start: 16, end: 20 }
  ];
  
  /**
   * Creates a new HeaderView.
   * @param timeManager Reference to the game's TimeManager
   * @param domRenderer Optional renderer reference for time display
   * @param timeSkipService Optional service for time skip functionality
   */
  constructor(
    timeManager: TimeManager, 
    private domRenderer?: DOMRenderer,
    timeSkipService?: TimeSkipService
  ) {
    this.timeManager = timeManager;
    this.timeSkipService = timeSkipService || null;
  }
  
  /**
   * Updates the current time skip service reference and adds the UI update callback function
   * @param service The time skip service
   * @param updateCallback Callback to update the interface
   */
  setTimeSkipService(service: TimeSkipService, updateCallback?: () => void): void {
    this.timeSkipService = service;
    
    // Update button state if it exists
    if (this.skipToWatchButton) {
      this.skipToWatchButton.classList.remove('disabled');
      
      // Update the click handler if we have a new callback
      if (updateCallback) {
        // Remove old handler
        const newButton = this.skipToWatchButton.cloneNode(true);
        if (this.skipToWatchButton.parentNode) {
          this.skipToWatchButton.parentNode.replaceChild(newButton, this.skipToWatchButton);
        }
        this.skipToWatchButton = newButton as HTMLElement;
        
        // Add new handler with the update callback
        this.skipToWatchButton.addEventListener('click', () => {
          if (this.timeSkipService) {
            this.timeSkipService.skipToNextWatch(() => {
              // This interval update function will update the UI in the TimeSkipInterface
              // Update elapsed time display
              const timeElapsed = document.querySelector('.time-elapsed');
              if (timeElapsed) {
                const formattedTime = this.timeSkipService!.getFormattedElapsedTime();
                timeElapsed.textContent = `TIME ELAPSED: ${formattedTime}`;
              }
              
              // Update time speed indicator
              const timeSpeed = document.querySelector('.time-speed');
              if (timeSpeed) {
                timeSpeed.textContent = '(SIMULATING AT 30x NORMAL SPEED)';
              }
              
              // Update any other time-sensitive interface elements
              if (updateCallback) {
                updateCallback();
              }
            });
          }
        });
      }
    }
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
    
    // Create a container for time displays and controls
    const timeContainer = document.createElement('div');
    timeContainer.className = 'header-time-container';
    timeContainer.style.display = 'flex';
    timeContainer.style.flexDirection = 'column';
    timeContainer.style.alignItems = 'flex-end';
    
    // Create watch indicator
    this.watchElement = document.createElement('div');
    this.watchElement.className = 'terminal-watch';
    this.watchElement.style.fontSize = '0.9em';
    this.watchElement.style.opacity = '0.9';
    this.watchElement.textContent = 'FIRST WATCH · DAY 1';
    timeContainer.appendChild(this.watchElement);
    
    // Create time element using TimeDisplayController if domRenderer is available
    // Otherwise fall back to the manual implementation
    if (this.domRenderer) {
      try {
        const controller = TimeDisplayController.getInstance(this.timeManager, this.domRenderer);
        this.timeElement = controller.createTimeElement();
        timeContainer.appendChild(this.timeElement);
      } catch (error) {
        // Fall back to manual time display if controller isn't properly initialized
        this.createManualTimeDisplay(timeContainer);
      }
    } else {
      this.createManualTimeDisplay(timeContainer);
    }
    
    // Create a row for buttons
    const buttonRow = document.createElement('div');
    buttonRow.style.display = 'flex';
    buttonRow.style.marginTop = '5px';
    buttonRow.style.gap = '8px';
    
    // Add "Skip to Next Watch" button
    this.skipToWatchButton = document.createElement('button');
    this.skipToWatchButton.className = 'terminal-button small';
    this.skipToWatchButton.textContent = 'SKIP TO NEXT WATCH';
    this.skipToWatchButton.style.fontSize = '0.8em';
    this.skipToWatchButton.style.padding = '4px 8px';
    
    // Disable button if service isn't available
    if (!this.timeSkipService) {
      this.skipToWatchButton.classList.add('disabled');
    }
    
    this.skipToWatchButton.addEventListener('click', () => {
      if (this.timeSkipService) {
        this.timeSkipService.skipToNextWatch();
      }
    });
    
    buttonRow.appendChild(this.skipToWatchButton);
    timeContainer.appendChild(buttonRow);
    
    header.appendChild(timeContainer);
    
    // Start watch updates
    this.startWatchUpdates();
    
    return header;
  }
  
  /**
   * Creates a time display manually (fallback method)
   */
  private createManualTimeDisplay(container: HTMLElement): void {
    const timeElement = document.createElement('div');
    timeElement.className = 'terminal-time';
    
    // Use the time manager to get the current formatted time
    const currentTime = this.timeManager.getElapsedTime();
    timeElement.textContent = currentTime.formatted;
    
    // Update the time every second
    const intervalId = window.setInterval(() => {
      const updatedTime = this.timeManager.getElapsedTime();
      timeElement.textContent = updatedTime.formatted;
    }, 1000);
    
    // Store for cleanup
    (timeElement as any).updateIntervalId = intervalId;
    this.timeElement = timeElement;
    
    container.appendChild(timeElement);
  }
  
  /**
   * Starts regular updates of the watch display
   */
  private startWatchUpdates(): void {
    // Initial update
    this.updateWatchDisplay();
    
    // Update every second
    this.timeUpdateInterval = window.setInterval(() => {
      this.updateWatchDisplay();
    }, 1000);
  }
  
  /**
   * Updates the watch display based on current game time
   */
  private updateWatchDisplay(): void {
    if (!this.watchElement) return;
    
    const currentHour = this.timeManager.getCurrentHour();
    const currentDay = this.timeManager.getCurrentDay() + 1; // Display day 1 instead of day 0
    
    // Find the current watch
    let currentWatch = this.WATCHES[0]; // Default
    
    for (const watch of this.WATCHES) {
      if (watch.start <= watch.end) {
        // Normal watch span (e.g., 4-8)
        if (currentHour >= watch.start && currentHour < watch.end) {
          currentWatch = watch;
          break;
        }
      } else {
        // Watch spans midnight (e.g., 20-0)
        if (currentHour >= watch.start || currentHour < watch.end) {
          currentWatch = watch;
          break;
        }
      }
    }
    
    this.watchElement.textContent = `${currentWatch.name} · DAY ${currentDay}`;
  }
  
  /**
   * Cleans up resources.
   */
  destroy(): void {
    if (this.timeElement) {
      // If using TimeDisplayController
      if (this.domRenderer) {
        try {
          const controller = TimeDisplayController.getInstance();
          controller.destroyTimeElement(this.timeElement);
        } catch (error) {
          // Fall back to manual cleanup
          const intervalId = (this.timeElement as any).updateIntervalId;
          if (intervalId) {
            clearInterval(intervalId);
          }
        }
      } else {
        // Manual cleanup
        const intervalId = (this.timeElement as any).updateIntervalId;
        if (intervalId) {
          clearInterval(intervalId);
        }
      }
      this.timeElement = null;
    }
    
    // Clean up watch update interval
    if (this.timeUpdateInterval) {
      clearInterval(this.timeUpdateInterval);
      this.timeUpdateInterval = null;
    }
  }
}