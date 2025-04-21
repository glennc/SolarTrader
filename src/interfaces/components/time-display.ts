import { TimeManager } from '../../managers/time-manager';
import { DOMRenderer } from '../dom-renderer';

/**
 * A component that displays game time information including:
 * - Elapsed time since game start
 * - ETA to destination
 * - Time acceleration indicator
 * - Optional day/night cycle indicator
 */
export class TimeDisplay {
  private container: HTMLElement;
  private timeManager: TimeManager;
  private updateInterval: number | null = null;
  private etaCalculator: (() => string | null) | null = null;
  
  // DOM Elements
  private timeElapsedElement: HTMLElement | null = null;
  private etaElement: HTMLElement | null = null;
  private accelerationElement: HTMLElement | null = null;
  private dayCycleElement: HTMLElement | null = null;
  
  /**
   * Creates a new TimeDisplay component.
   * @param container The HTML element to render the time display into
   * @param timeManager Reference to the game's TimeManager
   * @param _domRenderer Reference to the DOMRenderer for generic DOM operations
   * @param showEta Whether to show ETA section (requires etaCalculator to be set)
   * @param showDayCycle Whether to show the day/night cycle indicator
   */
  constructor(
    container: HTMLElement,
    timeManager: TimeManager,
    _domRenderer: DOMRenderer, // Prefix with underscore to indicate it's unused
    showEta: boolean = true,
    showDayCycle: boolean = true
  ) {
    this.container = container;
    this.timeManager = timeManager;
    
    // Create the DOM structure
    this.createTimeDisplay(showEta, showDayCycle);
    
    // Start the update interval
    this.startUpdates();
  }
  
  /**
   * Creates the DOM elements for the time display.
   */
  private createTimeDisplay(showEta: boolean, showDayCycle: boolean): void {
    // Create main container
    const timeDisplay = document.createElement('div');
    timeDisplay.className = 'time-display';
    
    // Time elapsed section
    const elapsedHeader = document.createElement('div');
    elapsedHeader.className = 'time-display-header';
    elapsedHeader.textContent = 'MISSION TIME';
    timeDisplay.appendChild(elapsedHeader);
    
    const elapsedRow = document.createElement('div');
    elapsedRow.className = 'time-display-row';
    
    this.timeElapsedElement = document.createElement('div');
    this.timeElapsedElement.className = 'terminal-time';
    this.timeElapsedElement.textContent = 'T+00:00:00:00';
    elapsedRow.appendChild(this.timeElapsedElement);
    
    this.accelerationElement = document.createElement('div');
    this.accelerationElement.className = 'time-acceleration-indicator';
    this.accelerationElement.textContent = '1x';
    elapsedRow.appendChild(this.accelerationElement);
    
    timeDisplay.appendChild(elapsedRow);
    
    // ETA section (optional)
    if (showEta) {
      const etaHeader = document.createElement('div');
      etaHeader.className = 'time-display-header';
      etaHeader.textContent = 'ETA TO DESTINATION';
      timeDisplay.appendChild(etaHeader);
      
      const etaRow = document.createElement('div');
      etaRow.className = 'time-display-row';
      
      this.etaElement = document.createElement('div');
      this.etaElement.className = 'terminal-time';
      this.etaElement.textContent = '...CALCULATING...';
      etaRow.appendChild(this.etaElement);
      
      if (showDayCycle) {
        this.dayCycleElement = document.createElement('div');
        this.dayCycleElement.className = 'day-night-indicator';
        etaRow.appendChild(this.dayCycleElement);
      }
      
      timeDisplay.appendChild(etaRow);
    } else if (showDayCycle) {
      // If showing day/night cycle without ETA, add it to the elapsed time row
      this.dayCycleElement = document.createElement('div');
      this.dayCycleElement.className = 'day-night-indicator';
      elapsedRow.appendChild(this.dayCycleElement);
    }
    
    // Add the complete time display to the container
    this.container.appendChild(timeDisplay);
  }
  
  /**
   * Sets a function that calculates the current ETA to destination.
   * This function should return a formatted string or null if unavailable.
   * @param calculator Function that returns the formatted ETA string
   */
  setEtaCalculator(calculator: () => string | null): void {
    this.etaCalculator = calculator;
  }
  
  /**
   * Updates the time display with current values.
   */
  update(): void {
    // Update elapsed time
    const elapsedTime = this.timeManager.getElapsedTime();
    if (this.timeElapsedElement) {
      this.timeElapsedElement.textContent = elapsedTime.formatted;
    }
    
    // Update acceleration indicator
    if (this.accelerationElement) {
      const acceleration = this.timeManager.getTimeAcceleration();
      this.accelerationElement.textContent = `${acceleration}x`;
      
      // Add visual indicator if accelerated
      if (acceleration > 1) {
        this.accelerationElement.classList.add('accelerated');
      } else {
        this.accelerationElement.classList.remove('accelerated');
      }
    }
    
    // Update ETA if available
    if (this.etaElement && this.etaCalculator) {
      const eta = this.etaCalculator();
      if (eta) {
        this.etaElement.textContent = eta;
        this.etaElement.classList.remove('warning');
      } else {
        this.etaElement.textContent = 'UNAVAILABLE';
        this.etaElement.classList.add('warning');
      }
    }
    
    // Update day/night cycle indicator
    if (this.dayCycleElement) {
      const cyclePhase = this.timeManager.getDayCyclePhase();
      const rotationDegrees = cyclePhase * 360;
      this.dayCycleElement.style.setProperty('--cycle-rotation', `${rotationDegrees}deg`);
      
      // Add day/night class for potential styling
      if (this.timeManager.isDaytime()) {
        this.dayCycleElement.classList.add('daytime');
        this.dayCycleElement.classList.remove('nighttime');
      } else {
        this.dayCycleElement.classList.add('nighttime'); 
        this.dayCycleElement.classList.remove('daytime');
      }
    }
  }
  
  /**
   * Start regular updates of the time display.
   * @param intervalMs How often to update the display in milliseconds
   */
  startUpdates(intervalMs: number = 1000): void {
    if (this.updateInterval !== null) {
      this.stopUpdates();
    }
    
    this.update(); // Initial update
    
    // Set interval for future updates
    this.updateInterval = window.setInterval(() => {
      this.update();
    }, intervalMs);
  }
  
  /**
   * Stop regular updates of the time display.
   */
  stopUpdates(): void {
    if (this.updateInterval !== null) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  }
  
  /**
   * Prepare the component to be removed, clearing intervals.
   */
  destroy(): void {
    this.stopUpdates();
  }
  
  /**
   * Shows a time skip progress bar in the time display.
   * @param progress A value between 0 and 1 representing completion
   */
  showTimeSkipProgress(progress: number): void {
    // Remove any existing progress bar
    this.hideTimeSkipProgress();
    
    // Ensure progress is between 0 and 1
    progress = Math.max(0, Math.min(1, progress));
    
    // Create progress bar container
    const progressContainer = document.createElement('div');
    progressContainer.className = 'time-skip-progress';
    
    // Create progress bar
    const progressBar = document.createElement('div');
    progressBar.className = 'time-skip-progress-bar';
    progressBar.style.width = `${progress * 100}%`;
    
    // Add to DOM
    progressContainer.appendChild(progressBar);
    this.container.querySelector('.time-display')?.appendChild(progressContainer);
    
    // Add skipping class to time display for styling
    this.container.querySelector('.time-display')?.classList.add('time-skipping');
    
    // Add visual indicator to elapsed time
    if (this.timeElapsedElement) {
      this.timeElapsedElement.classList.add('skipping');
    }
  }
  
  /**
   * Removes the time skip progress bar.
   */
  hideTimeSkipProgress(): void {
    const existingBar = this.container.querySelector('.time-skip-progress');
    if (existingBar) {
      existingBar.remove();
    }
    
    // Remove skipping class from time display
    this.container.querySelector('.time-display')?.classList.remove('time-skipping');
    
    // Remove visual indicator from elapsed time
    if (this.timeElapsedElement) {
      this.timeElapsedElement.classList.remove('skipping');
    }
  }
}