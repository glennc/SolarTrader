import { TimeManager } from '../../../../managers/time-manager';
import { TimeSkipState } from '../models/time-skip-state';
import { TimeFormatter } from '../../time-formatter';

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
  private realTimeElapsed = 0;
  private targetTime: number | null = null;
  
  // Available acceleration factors
  readonly ACCELERATION_FACTORS = [1, 5, 10, 20, 50, 100];
  
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
   * Sets time acceleration factor without a target end time
   * @param factor The time acceleration factor (e.g., 5x, 20x, 50x)
   * @param onInterval Callback for interval updates
   */
  setTimeAcceleration(factor: number, onInterval: () => void): void {
    if (this.state.isSkipActive) {
      // If already running, just change the factor
      this.timeManager.setTimeAcceleration(factor);
      this.state.selectedAccelerationFactor = factor;
      return;
    }
    
    // Set the acceleration factor
    this.timeManager.setTimeAcceleration(factor);
    this.state.selectedAccelerationFactor = factor;
    
    // Mark as active but with no target time
    this.state.setSkipActive(true);
    this.targetTime = null;
    
    // Reset elapsed time counters
    this.resetElapsedCounters();
    
    // Ensure time is running
    this.timeManager.setTimeRunning(true);
    
    // Start interval to update UI and monitor systems
    this.startUpdateInterval(onInterval);
    
    console.log(`TimeSkipService: Accelerating time by ${factor}x`);
  }
  
  /**
   * Skips to a specific target time
   * @param hours Number of hours to skip forward
   * @param accelerationFactor Acceleration factor to use (default to state's selected factor)
   * @param onInterval Callback for interval updates
   */
  skipToTargetTime(hours: number, accelerationFactor?: number, onInterval?: () => void): void {
    if (this.state.isSkipActive) {
      this.cancelTimeSkip();
    }
    
    // Use provided acceleration factor or currently selected one
    const factor = accelerationFactor || this.state.selectedAccelerationFactor;
    
    // Calculate milliseconds to skip
    const skipMs = hours * 60 * 60 * 1000;
    
    // Store target time
    this.targetTime = this.timeManager.getElapsedTime().totalMs + skipMs;
    
    // Generate alerts for the skip duration
    this.generateProjectedAlerts(hours);
    
    // Reset elapsed counters
    this.resetElapsedCounters();
    
    // Mark skip as active
    this.state.setSkipActive(true);
    
    // Update the state
    this.state.setSelectedSkipHours(hours);
    this.state.selectedAccelerationFactor = factor;
    
    // Start the time skip in the time manager
    this.timeManager.skipTime(
      skipMs,
      () => this.onTimeSkipComplete(),
      (progress) => this.onProgressCallback(progress),
      factor
    );
    
    // Start interval to update UI and monitor systems
    if (onInterval) {
      this.startUpdateInterval(onInterval);
    }
    
    console.log(`TimeSkipService: Skipping ${hours} hours at ${factor}x speed`);
  }
  
  /**
   * Start the interval for updating UI and system values
   */
  private startUpdateInterval(onInterval: () => void): void {
    // Stop any existing interval
    if (this.state.skipProgressInterval) {
      clearInterval(this.state.skipProgressInterval);
    }
    
    // Reset real time elapsed
    this.realTimeElapsed = 0;
    const startRealTime = Date.now();
    
    // Start a timer to update the display and system values
    this.state.skipProgressInterval = window.setInterval(() => {
      // Update real time elapsed for UI purposes
      this.realTimeElapsed = Date.now() - startRealTime;
      
      // Update in-game time elapsed counters
      this.updateElapsedCounters();
      
      // Update system values to simulate gradual changes
      this.updateSystemValues();
      
      // Call the interval callback to update UI
      onInterval();
      
      // Check alert triggers
      this.checkAlertTriggers();
      
    }, 50); // Update very fast to simulate accelerated time
  }
  
  /**
   * Resets the elapsed time counters
   */
  private resetElapsedCounters(): void {
    this.seconds = 0;
    this.minutes = 0;
    this.hours = 0;
  }
  
  /**
   * Updates the elapsed time counters based on real time and acceleration
   */
  private updateElapsedCounters(): void {
    // Base on real time to avoid precision issues
    const realSeconds = this.realTimeElapsed / 1000;
    const gameSeconds = realSeconds * this.state.selectedAccelerationFactor;
    
    this.seconds = Math.floor(gameSeconds % 60);
    this.minutes = Math.floor(gameSeconds / 60) % 60;
    this.hours = Math.floor(gameSeconds / 3600);
  }
  
  /**
   * Pauses the time skip process.
   */
  pauseTimeSkip(): void {
    if (!this.state.isSkipActive) return;
    
    // Pause the time in the time manager
    this.timeManager.setTimeRunning(false);
    
    // Note: we're not setting isSkipActive to false here,
    // just pausing the time flow for resume capability
    
    // Stop the elapsed time update
    if (this.state.skipProgressInterval) {
      clearInterval(this.state.skipProgressInterval);
      this.state.skipProgressInterval = null;
    }
    
    console.log('TimeSkipService: Time acceleration paused');
  }
  
  /**
   * Resumes a paused time skip process
   * @param onInterval Callback for interval updates
   */
  resumeTimeSkip(onInterval: () => void): void {
    if (!this.state.isSkipActive) return;
    
    // Resume time in the manager
    this.timeManager.setTimeRunning(true);
    
    // Restart the update interval
    this.startUpdateInterval(onInterval);
    
    console.log('TimeSkipService: Time acceleration resumed');
  }
  
  /**
   * Cancels the time skip process.
   */
  cancelTimeSkip(): void {
    // Set inactive state
    this.state.setSkipActive(false);
    
    // Reset target time
    this.targetTime = null;
    
    // Cancel the time skip in the time manager
    this.timeManager.cancelTimeSkip();
    
    // Reset time acceleration to normal
    this.timeManager.setTimeAcceleration(1);
    
    // Stop the elapsed time update
    if (this.state.skipProgressInterval) {
      clearInterval(this.state.skipProgressInterval);
      this.state.skipProgressInterval = null;
    }
    
    // Reset system values
    this.state.resetSystemValues();
    
    console.log('TimeSkipService: Time acceleration canceled');
  }
  
  /**
   * Called when the time skip completes.
   */
  private onTimeSkipComplete(): void {
    // Set inactive state
    this.state.setSkipActive(false);
    
    // Reset target time
    this.targetTime = null;
    
    // Stop the elapsed time update
    if (this.state.skipProgressInterval) {
      clearInterval(this.state.skipProgressInterval);
      this.state.skipProgressInterval = null;
    }
    
    // Call the complete callback
    this.onCompleteCallback();
    
    console.log('TimeSkipService: Target time reached, time acceleration complete');
  }
  
  /**
   * Gets the formatted elapsed time.
   */
  getFormattedElapsedTime(): string {
    // Use the standardized time formatter
    return TimeFormatter.formatElapsedTime(this.hours, this.minutes, this.seconds);
  }
  
  /**
   * Gets the time speed status text.
   */
  getSpeedStatusText(): string {
    if (!this.state.isSkipActive) {
      return '(TIME ACCELERATION INACTIVE)';
    } else if (!this.timeManager.isTimeRunning()) {
      return '(PAUSED)';
    } else if (this.targetTime) {
      return `(SIMULATING AT ${this.state.selectedAccelerationFactor}x SPEED TO TARGET)`;
    } else {
      return `(SIMULATING AT ${this.state.selectedAccelerationFactor}x SPEED)`;
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
  
  /**
   * Calculates time until the next watch and sets that as the target time
   * @param onInterval Callback for interval updates (optional)
   */
  skipToNextWatch(onInterval?: () => void): void {
    if (this.state.isSkipActive) return; // Don't start another skip if one is active
    
    // Define standard watch boundaries (hours)
    const watchBoundaries = [0, 4, 8, 12, 16, 20, 24];
    
    // Get current hour 
    const currentHour = this.timeManager.getCurrentHour();
    const currentMinute = Math.floor((this.timeManager.getCurrentHourDecimal() - currentHour) * 60);
    
    // Find the next watch boundary
    let nextWatchHour = 24; // Default to end of day
    for (const boundary of watchBoundaries) {
      if (boundary > currentHour || (boundary === 0 && currentHour >= 20)) {
        nextWatchHour = boundary;
        break;
      }
    }
    
    // Handle midnight rollover (if we're in the last watch)
    if (nextWatchHour === 24) nextWatchHour = 0;
    
    // Calculate hours to skip
    let hoursToSkip = nextWatchHour - currentHour;
    if (hoursToSkip <= 0) hoursToSkip += 24; // Handle rollover
    
    // Subtract the current minutes to get exact time remaining
    hoursToSkip -= currentMinute / 60;
    
    // Round to nearest 0.1 hour for cleaner skip
    hoursToSkip = Math.ceil(hoursToSkip * 10) / 10;
    
    // Use the standard target time skipping (standard 30x for watches)
    this.skipToTargetTime(hoursToSkip, 30, onInterval);
    
    console.log(`TimeSkipService: Skipping to next watch (${hoursToSkip} hours at 30x speed)`);
  }
  
  /**
   * Returns true if currently using target-based time skip 
   * (vs open-ended acceleration)
   */
  isUsingTargetTime(): boolean {
    return this.targetTime !== null;
  }
  
  /**
   * Gets the current target time if one is set
   */
  getTargetTime(): number | null {
    return this.targetTime;
  }
  
  /**
   * Returns a useful description of what the skip is doing
   */
  getSkipDescription(): string {
    if (!this.state.isSkipActive) {
      return "Time acceleration inactive";
    }
    
    if (this.targetTime) {
      // Calculate remaining time
      const currentTime = this.timeManager.getElapsedTime().totalMs;
      const remainingMs = this.targetTime - currentTime;
      
      if (remainingMs <= 0) {
        return "Target time reached";
      }
      
      // Calculate hours, minutes, seconds
      const seconds = Math.floor(remainingMs / 1000) % 60;
      const minutes = Math.floor(remainingMs / (1000 * 60)) % 60;
      const hours = Math.floor(remainingMs / (1000 * 60 * 60));
      
      return `Target: ${hours}h ${minutes}m ${seconds}s remaining`;
    } else {
      return `Continuous ${this.state.selectedAccelerationFactor}x acceleration`;
    }
  }
}