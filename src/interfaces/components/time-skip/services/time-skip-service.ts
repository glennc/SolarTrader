import { TimeManager } from '../../../../managers/time-manager';
import { TimeSkipState } from '../models/time-skip-state';

/**
 * Service to handle time skip functionality
 */
export class TimeSkipService {
  private timeManager: TimeManager;
  private state: TimeSkipState;
  private onCompleteCallback: () => void;
  private onProgressCallback: (progress: number) => void;
  private seconds = 0;
  private minutes = 0;
  private hours = 0;
  
  /**
   * Creates a new TimeSkipService.
   * @param timeManager Reference to the game's TimeManager
   * @param state Reference to the TimeSkipState
   * @param onComplete Callback when time skip completes
   * @param onProgress Callback for progress updates
   */
  constructor(
    timeManager: TimeManager,
    state: TimeSkipState,
    onComplete: () => void,
    onProgress: (progress: number) => void
  ) {
    this.timeManager = timeManager;
    this.state = state;
    this.onCompleteCallback = onComplete;
    this.onProgressCallback = onProgress;
  }
  
  /**
   * Starts the time skip process.
   * @param onInterval Callback for interval updates
   */
  startTimeSkip(onInterval: () => void): void {
    if (this.state.isSkipActive) return;
    
    this.state.setSkipActive(true);
    
    // Reset elapsed time
    this.seconds = 0;
    this.minutes = 0;
    this.hours = 0;
    
    // Calculate milliseconds to skip
    const skipMs = this.state.selectedSkipHours * 60 * 60 * 1000;
    
    // Start the time skip in the time manager
    this.timeManager.skipTime(
      skipMs,
      () => this.onTimeSkipComplete(),
      (progress) => this.onProgressCallback(progress),
      20 // Accelerate time by 20x during skip
    );
    
    // Start a timer to update the elapsed time display
    this.state.skipProgressInterval = window.setInterval(() => {
      this.seconds++;
      if (this.seconds >= 60) {
        this.seconds = 0;
        this.minutes++;
        if (this.minutes >= 60) {
          this.minutes = 0;
          this.hours++;
        }
      }
      
      // Update system values to simulate gradual changes
      this.updateSystemValues();
      
      // Call the interval callback to update UI
      onInterval();
      
      // Check alert triggers
      this.checkAlertTriggers();
      
    }, 50); // Update very fast to simulate accelerated time
  }
  
  /**
   * Pauses the time skip process.
   */
  pauseTimeSkip(): void {
    if (!this.state.isSkipActive) return;
    
    // Set paused state
    this.state.setSkipActive(false);
    
    // Pause the time acceleration in the time manager
    this.timeManager.setTimeRunning(false);
    
    // Stop the elapsed time update
    if (this.state.skipProgressInterval) {
      clearInterval(this.state.skipProgressInterval);
      this.state.skipProgressInterval = null;
    }
  }
  
  /**
   * Cancels the time skip process.
   */
  cancelTimeSkip(): void {
    // Set inactive state
    this.state.setSkipActive(false);
    
    // Cancel the time skip in the time manager
    this.timeManager.cancelTimeSkip();
    
    // Stop the elapsed time update
    if (this.state.skipProgressInterval) {
      clearInterval(this.state.skipProgressInterval);
      this.state.skipProgressInterval = null;
    }
    
    // Reset system values
    this.state.resetSystemValues();
  }
  
  /**
   * Called when the time skip completes.
   */
  private onTimeSkipComplete(): void {
    // Set inactive state
    this.state.setSkipActive(false);
    
    // Stop the elapsed time update
    if (this.state.skipProgressInterval) {
      clearInterval(this.state.skipProgressInterval);
      this.state.skipProgressInterval = null;
    }
    
    // Call the complete callback
    this.onCompleteCallback();
  }
  
  /**
   * Gets the formatted elapsed time.
   */
  getFormattedElapsedTime(): string {
    return `${this.hours.toString().padStart(2, '0')}:${this.minutes.toString().padStart(2, '0')}:${this.seconds.toString().padStart(2, '0')}`;
  }
  
  /**
   * Gets the time speed status text.
   */
  getSpeedStatusText(): string {
    if (!this.state.isSkipActive) {
      if (this.state.skipProgressInterval === null) {
        return '(SELECT TIME TO START)';
      } else {
        return '(PAUSED)';
      }
    } else {
      return '(SIMULATING AT 20x NORMAL SPEED)';
    }
  }
  
  /**
   * Updates system values during time skip to simulate gradual changes.
   */
  updateSystemValues(): void {
    // Simulate small random fluctuations in system values
    Object.keys(this.state.shipSystemStates).forEach(key => {
      // Small random change (-0.2 to +0.1)
      const change = Math.random() * 0.3 - 0.2;
      
      // Apply the change
      this.state.shipSystemStates[key] = Math.max(0, Math.min(100, this.state.shipSystemStates[key] + change));
    });
  }
  
  /**
   * Generates projected alerts based on current state and selected skip time.
   */
  generateProjectedAlerts(skipHours: number): void {
    // Clear existing alerts
    this.state.projectedAlerts = [];
    
    // Add a coolant pressure alert that triggers during longer skips
    if (skipHours >= 3) {
      const alertTime = Math.min(skipHours - 1, 3) * 60 + Math.floor(Math.random() * 30) + 15;
      this.state.projectedAlerts.push({
        system: 'COOLANT PRESSURE',
        status: 'WARNING',
        triggerMinute: alertTime,
        triggered: false
      });
    }
    
    // Add random power fluctuation alert for long skips
    if (skipHours >= 6) {
      const alertTime = 5 * 60 + Math.floor(Math.random() * 60);
      this.state.projectedAlerts.push({
        system: 'POWER FLUCTUATION',
        status: 'WARNING',
        triggerMinute: alertTime,
        triggered: false
      });
    }
    
    // Sort alerts by trigger time
    this.state.projectedAlerts.sort((a, b) => a.triggerMinute - b.triggerMinute);
  }
  
  /**
   * Checks if any alerts should be triggered based on elapsed time.
   */
  private checkAlertTriggers(): void {
    const totalMinutes = this.hours * 60 + this.minutes;
    
    this.state.projectedAlerts.forEach(alert => {
      if (!alert.triggered && totalMinutes >= alert.triggerMinute) {
        alert.triggered = true;
        // Alert has been triggered - could dispatch an event here
      }
    });
  }
  
  /**
   * Shows detailed system information.
   */
  showSystemDetails(): void {
    // For now, just show an alert with some system details
    alert('System Details:\n\nEngine Efficiency: 79%\nCoolant Flow Rate: 2.3 L/min\nPower Distribution: Balanced\nLife Support: Nominal\n\nNo critical issues detected.');
  }
}