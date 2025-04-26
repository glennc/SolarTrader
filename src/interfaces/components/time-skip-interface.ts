import { TimeManager } from '../../managers/time-manager';
import { DOMRenderer } from '../dom-renderer';
import { DOMCSSLoader } from '../dom-css-loader';
import { SystemInterface } from '../base-system-interfaces';
import { TimeDisplay } from '../components/time-display';
import { InterfaceManager } from '../../managers/interface-manager';

// Import components from the new modular architecture
import {
  TimeSkipState,
  TimeSkipService,
  HeaderView,
  TimeControlsView,
  StatusView,
  MainDisplayView,
  SystemMonitorView,
  FooterView
} from './time-skip';

/**
 * Time skip interface that allows the player to skip ahead in game time
 * while monitoring ship systems during the skip.
 */
export class TimeSkipInterface implements SystemInterface {
  private timeManager: TimeManager;
  private container: HTMLElement;
  private contentArea: HTMLElement | null = null;
  private timeDisplay: TimeDisplay | null = null;
  private cssLoader: DOMCSSLoader;
  private interfaceManager: InterfaceManager | null = null;
  
  // Modular components
  private state: TimeSkipState;
  private timeSkipService: TimeSkipService;
  
  /**
   * Creates a new TimeSkipInterface.
   * @param container The HTML element to render the interface into
   * @param timeManager Reference to the game's TimeManager
   * @param domRenderer Reference to the DOMRenderer for DOM operations
   * @param cssLoader Reference to the DOMCSSLoader for loading CSS styles
   */
  constructor(
    container: HTMLElement,
    timeManager: TimeManager,
    private domRenderer: DOMRenderer,
    cssLoader: DOMCSSLoader
  ) {
    this.timeManager = timeManager;
    this.container = container;
    this.cssLoader = cssLoader;
    
    // Initialize state with default system values
    this.state = new TimeSkipState({
      power: 87,
      engines: 76,
      lifeSupport: 93,
      fuel: 65
    });
    
    // Initialize time skip service
    this.timeSkipService = new TimeSkipService(
      this.timeManager,
      this.state,
      () => this.onTimeSkipComplete(),
      (progress) => this.onTimeSkipProgress(progress)
    );
  }
  
  /**
   * Set the CSS Loader for this interface
   */
  setCssLoader(cssLoader: DOMCSSLoader): void {
    this.cssLoader = cssLoader;
  }
  
  /**
   * Set the time manager for this interface
   */
  setTimeManager(timeManager: TimeManager): void {
    this.timeManager = timeManager;
  }
  
  /**
   * Renders the time skip interface.
   * @returns A cleanup function to remove the interface
   */
  renderInterface(): () => void {
    console.log('Rendering TimeSkipInterface');
    
    // Load CSS for this interface
    this.cssLoader.loadCSS('/css/components/time-display.css', 'time-display');
    this.cssLoader.loadCSS('/css/components/time-skip-interface.css', 'time-skip-interface');
    
    // Hide the location header to avoid overlap with Time Skip interface
    // This is specific to this interface and won't affect diagnostics screen
    const locationElements = document.querySelectorAll('.location-header, .location-display, .terminal-header');
    locationElements.forEach(element => {
      if (element) {
        (element as HTMLElement).style.display = 'none';
      }
    });
    
    // Create terminal container
    const terminalContainer = document.createElement('div');
    terminalContainer.className = 'terminal';
    
    // Create terminal inner container
    const terminalInner = document.createElement('div');
    terminalInner.className = 'terminal-inner';
    
    // Create terminal header using HeaderView with the timeSkipService
    const headerView = new HeaderView(
      this.timeManager,
      this.domRenderer,
      this.timeSkipService
    );
    
    // Add the header to the interface
    terminalInner.appendChild(headerView.render());
    
    // Set up the skipToWatch functionality with update callback
    headerView.setTimeSkipService(this.timeSkipService, () => this.updateInterface());
    
    // Create content area
    this.contentArea = document.createElement('div');
    this.contentArea.className = 'terminal-content';
    
    // Create time skip display container
    const timeSkipDisplay = document.createElement('div');
    timeSkipDisplay.className = 'time-skip-display';
    
    // Add time controls using TimeControlsView
    const timeControlsView = new TimeControlsView(
      this.state,
      this.timeSkipService,
      () => this.updateInterface()
    );
    timeSkipDisplay.appendChild(timeControlsView.render());
    
    // Add skip status display using StatusView
    const statusView = new StatusView(this.state);
    timeSkipDisplay.appendChild(statusView.render());
    
    // Add main display area using MainDisplayView
    const mainDisplayView = new MainDisplayView(
      this.state,
      this.timeSkipService
    );
    timeSkipDisplay.appendChild(mainDisplayView.render());
    
    // Create time elapsed and speed displays
    const timeElapsed = document.createElement('div');
    timeElapsed.className = 'time-elapsed';
    timeElapsed.textContent = 'TIME ELAPSED: 00:00:00';
    timeSkipDisplay.appendChild(timeElapsed);
    
    const timeSpeed = document.createElement('div');
    timeSpeed.className = 'time-speed';
    timeSpeed.textContent = '(SELECT TIME TO START)';
    timeSkipDisplay.appendChild(timeSpeed);
    
    // Add all to content area
    this.contentArea.appendChild(timeSkipDisplay);
    terminalInner.appendChild(this.contentArea);
    
    // Add footer using FooterView
    const footerView = new FooterView(
      this.state,
      this.timeSkipService,
      () => this.startTimeSkip(),
      () => this.pauseTimeSkip(),
      () => this.cancelTimeSkip(),
      () => this.showSystemDetails(),
      () => this.exitInterface()
    );
    terminalInner.appendChild(footerView.render());
    
    // Add everything to the terminal container
    terminalContainer.appendChild(terminalInner);
    
    // Add to the main container
    this.container.innerHTML = '';
    this.container.appendChild(terminalContainer);
    
    /* Remove the redundant time display component since we have it in the header
    const timeDisplayContainer = document.createElement('div');
    timeDisplayContainer.className = 'time-display-container';
    this.contentArea.appendChild(timeDisplayContainer);
    
    this.timeDisplay = new TimeDisplay(
      timeDisplayContainer,
      this.timeManager,
      this.domRenderer,
      false, // Don't show ETA
      true   // Show day/night cycle
    );
    */
    
    // Generate projected alerts and update display
    this.timeSkipService.generateProjectedAlerts(this.state.selectedSkipHours);
    this.updateInterface();
    
    // Return a cleanup function
    return () => {
      if (this.timeDisplay) {
        this.timeDisplay.destroy();
        this.timeDisplay = null;
      }
      
      // Stop the header view's interval
      if (headerView) {
        headerView.destroy();
      }
      
      if (this.state.skipProgressInterval) {
        clearInterval(this.state.skipProgressInterval);
        this.state.skipProgressInterval = null;
      }
      
      // Restore the time acceleration to normal
      if (this.state.isSkipActive) {
        this.timeManager.setTimeAcceleration(1);
        this.timeManager.cancelTimeSkip();
      }
      
      // Restore the location header elements that we hid
      const locationElements = document.querySelectorAll('.location-header, .location-display, .terminal-header');
      locationElements.forEach(element => {
        if (element) {
          (element as HTMLElement).style.display = '';
        }
      });
      
      // Unload CSS
      this.cssLoader.unloadCSS('time-display');
      this.cssLoader.unloadCSS('time-skip-interface');
    };
  }
  
  /**
   * Called when the time skip completes.
   */
  private onTimeSkipComplete(): void {
    // Update interface to reflect completion
    this.updateInterface();
  }
  
  /**
   * Called during time skip progress.
   */
  private onTimeSkipProgress(progress: number): void {
    // Update the progress indicator if we have a TimeDisplay component
    if (this.timeDisplay) {
      this.timeDisplay.showTimeSkipProgress(progress);
    }
  }
  
  /**
   * Start the time skip process.
   */
  private startTimeSkip(): void {
    // Different behavior based on mode
    if (this.state.useTargetTime) {
      // Target time mode: Skip to a specific future time
      this.timeSkipService.skipToTargetTime(
        this.state.selectedSkipHours,
        this.state.selectedAccelerationFactor,
        () => {
          // Update elapsed time display
          const timeElapsed = this.contentArea?.querySelector('.time-elapsed');
          if (timeElapsed) {
            const formattedTime = this.timeSkipService.getFormattedElapsedTime();
            timeElapsed.textContent = `TIME ELAPSED: ${formattedTime}`;
          }
          
          // Update time speed indicator
          const timeSpeed = this.contentArea?.querySelector('.time-speed');
          if (timeSpeed) {
            timeSpeed.textContent = `(SIMULATING AT ${this.state.selectedAccelerationFactor}x SPEED TO TARGET)`;
          }
        }
      );
    } else {
      // Continuous acceleration mode: Just speed up time with no end point
      this.timeSkipService.setTimeAcceleration(
        this.state.selectedAccelerationFactor,
        () => {
          // Update elapsed time display
          const timeElapsed = this.contentArea?.querySelector('.time-elapsed');
          if (timeElapsed) {
            const formattedTime = this.timeSkipService.getFormattedElapsedTime();
            timeElapsed.textContent = `TIME ELAPSED: ${formattedTime}`;
          }
          
          // Update time speed indicator
          const timeSpeed = this.contentArea?.querySelector('.time-speed');
          if (timeSpeed) {
            timeSpeed.textContent = `(SIMULATING AT ${this.state.selectedAccelerationFactor}x SPEED)`;
          }
        }
      );
    }
    
    // Update interface for active state
    this.updateInterface();
  }
  
  /**
   * Pause the time skip process.
   */
  private pauseTimeSkip(): void {
    this.timeSkipService.pauseTimeSkip();
    this.updateInterface();
  }
  
  /**
   * Resume a paused time skip process.
   */
  private resumeTimeSkip(): void {
    this.timeSkipService.resumeTimeSkip(() => {
      // Update elapsed time display
      const timeElapsed = this.contentArea?.querySelector('.time-elapsed');
      if (timeElapsed) {
        const formattedTime = this.timeSkipService.getFormattedElapsedTime();
        timeElapsed.textContent = `TIME ELAPSED: ${formattedTime}`;
      }
      
      // Update time speed indicator
      const timeSpeed = this.contentArea?.querySelector('.time-speed');
      if (timeSpeed) {
        const speedText = this.timeSkipService.getSpeedStatusText();
        timeSpeed.textContent = speedText;
      }
    });
    
    this.updateInterface();
  }
  
  /**
   * Cancel the time skip process.
   */
  private cancelTimeSkip(): void {
    if (!this.state.isSkipActive && !this.timeManager.isSkippingTime()) {
      // If we're not in an active skip, exit the interface
      this.exitInterface();
      return;
    }
    
    this.timeSkipService.cancelTimeSkip();
    this.updateInterface();
  }
  
  /**
   * Shows detailed system information.
   */
  private showSystemDetails(): void {
    this.timeSkipService.showSystemDetails();
  }
  
  /**
   * Updates the interface when settings change.
   */
  private updateInterface(): void {
    console.log('Updating TimeSkipInterface');
    
    // Update status display
    const statusView = new StatusView(this.state);
    const existingStatus = this.contentArea?.querySelector('.time-skip-status');
    if (existingStatus && existingStatus.parentNode) {
      existingStatus.parentNode.replaceChild(statusView.render(), existingStatus);
    }
    
    // Update footer status and controls
    const footerView = new FooterView(
      this.state,
      this.timeSkipService,
      () => this.startTimeSkip(),
      () => this.pauseTimeSkip(),
      () => this.cancelTimeSkip(),
      () => this.showSystemDetails(),
      () => this.exitInterface()
    );
    const existingFooter = this.container.querySelector('.terminal-footer');
    if (existingFooter && existingFooter.parentNode) {
      existingFooter.parentNode.replaceChild(footerView.render(), existingFooter);
    }
    
    // Update time speed indicator
    const timeSpeed = this.contentArea?.querySelector('.time-speed');
    if (timeSpeed) {
      const speedText = this.timeSkipService.getSpeedStatusText();
      timeSpeed.textContent = speedText;
    }
    
    // Update system monitor values
    const systemMonitorView = new SystemMonitorView(this.state);
    systemMonitorView.updateSystemValues();
  }
  
  /**
   * Exits the time skip interface.
   */
  private exitInterface(): void {
    console.log('Exiting TimeSkipInterface');
    
    // Cancel any active time skip before exiting
    if (this.state.isSkipActive || this.state.skipProgressInterval !== null) {
      this.timeSkipService.cancelTimeSkip();
    }
    
    // Use the interface manager if available
    if (this.interfaceManager) {
      console.log('TimeSkipInterface: Using interface manager to return to first person view');
      this.interfaceManager.returnToFirstPerson();
      return;
    }
    
    // Fallback behavior if the interface manager wasn't set properly
    console.warn('TimeSkipInterface: Could not find interface manager, manual exit required');
    this.container.innerHTML = '';
  }

  /**
   * Sets the interface manager reference
   * This must be called by the system that creates this interface
   * @param manager The interface manager instance
   */
  setInterfaceManager(manager: InterfaceManager): void {
    this.interfaceManager = manager;
    console.log('TimeSkipInterface: InterfaceManager has been set');
  }
}