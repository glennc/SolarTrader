import { TimeManager } from '../../managers/time-manager';
import { DOMCSSLoader } from '../dom-css-loader';
import { SystemInterface } from '../base-system-interfaces';
import { InterfaceManager } from '../../managers/interface-manager';

// Import components from our new modular architecture
import {
  SleepPodState,
  SleepService,
  HeaderView,
  PodStatusView,
  SleepDurationView,
  PodVisualizationView
} from './sleep-pod';

/**
 * Sleep Pod interface that allows the player to rest and skip time
 * in a comfortable sleep pod environment.
 */
export class SleepPodInterface implements SystemInterface {
  private timeManager: TimeManager;
  private container: HTMLElement;
  private cssLoader: DOMCSSLoader;
  private onSleepCompleteCallback: (hours: number) => void;
  private interfaceManager: InterfaceManager | null = null;
  
  // Modular components
  private state: SleepPodState;
  private sleepService: SleepService;
  
  /**
   * Creates a new SleepPodInterface.
   * @param container The HTML element to render the interface into
   * @param timeManager Reference to the game's TimeManager
   * @param cssLoader Reference to the DOMCSSLoader for loading CSS styles
   * @param playerRestLevel Current rest level of the player (0-100)
   * @param onSleepComplete Callback when sleep is completed
   */
  constructor(
    container: HTMLElement,
    timeManager: TimeManager,
    cssLoader: DOMCSSLoader,
    playerRestLevel: number,
    onSleepComplete: (hours: number) => void
  ) {
    this.timeManager = timeManager;
    this.container = container;
    this.cssLoader = cssLoader;
    this.onSleepCompleteCallback = onSleepComplete;
    
    // Initialize state
    this.state = new SleepPodState(playerRestLevel);
    
    // Initialize sleep service
    this.sleepService = new SleepService(
      this.timeManager, 
      this.state,
      this.onSleepCompleteCallback
    );
    
    // Load the CSS for this interface - make sure these CSS files exist and paths are correct
    // Using absolute paths without leading slash to ensure correct loading
    this.cssLoader.loadCSS('css/components/time-display.css', 'time-display');
    this.cssLoader.loadCSS('css/components/sleep-pod-interface.css', 'sleep-pod-interface');
    
    console.log("SleepPodInterface initialized with CSS loading");
  }
  
  /**
   * Renders the sleep pod interface.
   * @returns A cleanup function to remove the interface
   */
  renderInterface(): () => void {
    console.log('Rendering SleepPodInterface');
    
    // Find the interface container
    const interfaceContainer = document.getElementById('interface-container');
    if (!interfaceContainer) {
      console.error('SleepPodInterface: Interface container not found');
      return () => {};
    }
    
    // Clear the interface container
    interfaceContainer.innerHTML = '';
    
    // Create terminal container
    const terminalContainer = document.createElement('div');
    terminalContainer.className = 'terminal';
    
    // Create terminal inner container
    const terminalInner = document.createElement('div');
    terminalInner.className = 'terminal-inner';
    
    // Create terminal header using HeaderView
    const headerView = new HeaderView(this.timeManager);
    terminalInner.appendChild(headerView.render());
    
    // Create content area
    const contentArea = document.createElement('div');
    contentArea.className = 'terminal-content';
    
    // Create sleep pod container
    const sleepPodContainer = document.createElement('div');
    sleepPodContainer.className = 'sleep-pod-container';
    
    // Create sleep pod controls
    const controls = document.createElement('div');
    controls.className = 'sleep-pod-controls';
    
    // Add pod status section using PodStatusView
    const podStatusView = new PodStatusView(this.state);
    controls.appendChild(podStatusView.render());
    
    // Add sleep duration section using SleepDurationView
    const sleepDurationView = new SleepDurationView(
      this.state, 
      this.sleepService,
      () => this.updateInterface()
    );
    controls.appendChild(sleepDurationView.render());
    
    sleepPodContainer.appendChild(controls);
    
    // Create pod visualization using PodVisualizationView
    const podVisualizationView = new PodVisualizationView(
      this.state,
      this.sleepService,
      () => this.startSleep(),
      () => this.exitInterface()
    );
    sleepPodContainer.appendChild(podVisualizationView.render());
    
    // Add everything to the content area
    contentArea.appendChild(sleepPodContainer);
    terminalInner.appendChild(contentArea);
    
    // Add footer
    terminalInner.appendChild(this.createFooter());
    
    // Add everything to the terminal container
    terminalContainer.appendChild(terminalInner);
    
    // Add to the main container
    this.container.innerHTML = '';
    this.container.appendChild(terminalContainer);
    
    // Return a cleanup function
    return () => {
      // Cancel any ongoing sleep
      this.cancelSleep();
      
      // Unload CSS
      this.cssLoader.unloadCSS('time-display');
      this.cssLoader.unloadCSS('sleep-pod-interface');
    };
  }
  
  /**
   * Creates the terminal footer element.
   */
  private createFooter(): HTMLElement {
    const footer = document.createElement('div');
    footer.className = 'terminal-footer';
    
    const cancelButton = document.createElement('div');
    cancelButton.className = 'cancel-button';
    cancelButton.textContent = 'RETURN TO COMPARTMENT';
    cancelButton.addEventListener('click', () => {
      // First cancel any active sleep
      this.cancelSleep();
      
      // Then exit the interface properly
      this.exitInterface();
    });
    
    footer.appendChild(cancelButton);
    
    return footer;
  }
  
  /**
   * Starts the sleep process.
   */
  private startSleep(): void {
    if (this.state.sleepConfig.isSkipActive) return;
    
    // Update UI to show sleep in progress
    this.updateUIForSleepStart();
    
    // Start the sleep process
    this.sleepService.startSleep();
  }
  
  /**
   * Updates the UI for sleep start.
   */
  private updateUIForSleepStart(): void {
    // Get a reference to the pod visualization view and update it
    const podVisualizationView = new PodVisualizationView(
      this.state,
      this.sleepService,
      () => {},
      () => {}
    );
    podVisualizationView.updateUIForSleepStart();
  }
  
  /**
   * Updates the sleep progress UI.
   */
  updateSleepProgress(progress: number): void {
    // Get a reference to the pod visualization view and update it
    const podVisualizationView = new PodVisualizationView(
      this.state,
      this.sleepService,
      () => {},
      () => {}
    );
    podVisualizationView.updateProgressDisplay(progress);
  }
  
  /**
   * Cancels an in-progress sleep cycle.
   */
  private cancelSleep(): void {
    if (!this.state.sleepConfig.isSkipActive) return;
    
    // Cancel the sleep cycle
    this.sleepService.cancelSleep();
    
    // Update UI
    this.updateUIForSleepComplete();
  }
  
  /**
   * Updates the UI to show sleep has completed.
   */
  private updateUIForSleepComplete(): void {
    // Get a reference to the pod visualization view and update it
    const podVisualizationView = new PodVisualizationView(
      this.state,
      this.sleepService,
      () => {},
      () => {}
    );
    podVisualizationView.updateUIForSleepComplete();
  }
  
  /**
   * Exits the sleep pod interface.
   */
  private exitInterface(): void {
    // Log the exit for debugging
    console.log('Exiting SleepPodInterface');
    
    // Cancel any active sleep before exiting
    this.cancelSleep();
    
    // Use the interface manager if available
    if (this.interfaceManager) {
      this.interfaceManager.returnToFirstPerson();
      return;
    }
    
    // Fallback behavior if the interface manager wasn't set properly
    console.warn('SleepPodInterface: Could not find interface manager, manual exit required');
    this.container.innerHTML = '';
  }
  
  /**
   * Updates the interface when settings change.
   */
  private updateInterface(): void {
    // In a more complex implementation, this might redraw specific elements
    // For now we'll just log this
    console.log('Updating SleepPodInterface with new settings');
  }

  /**
   * Sets the interface manager reference
   * This must be called by the system that creates this interface
   * @param manager The interface manager instance
   */
  setInterfaceManager(manager: InterfaceManager): void {
    this.interfaceManager = manager;
    console.log('SleepPodInterface: InterfaceManager has been set');
  }
}