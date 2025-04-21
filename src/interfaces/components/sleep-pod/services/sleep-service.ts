import { TimeManager } from '../../../../managers/time-manager';
import { SleepPodState } from '../models/sleep-pod-state';
import { TimeFormatter } from '../../time-formatter';

/**
 * Service that handles the sleep pod business logic
 */
export class SleepService {
  private timeManager: TimeManager;
  private state: SleepPodState;
  private onSleepCompleteCallback: (hours: number) => void;
  
  constructor(
    timeManager: TimeManager, 
    state: SleepPodState,
    onSleepComplete: (hours: number) => void
  ) {
    this.timeManager = timeManager;
    this.state = state;
    this.onSleepCompleteCallback = onSleepComplete;
  }
  
  /**
   * Calculates the wake time based on sleep duration.
   * @param hours Number of hours to sleep
   * @returns Formatted wake time string
   */
  calculateWakeTime(hours: number): string {
    // Use the standardized time formatter
    return TimeFormatter.calculateWakeTime(this.timeManager, hours);
  }
  
  /**
   * Starts the sleep process.
   */
  startSleep(): void {
    if (this.state.sleepConfig.isSkipActive) return;
    
    this.state.sleepConfig.isSkipActive = true;
    
    // Calculate sleep time in milliseconds
    const sleepTimeMs = this.state.sleepConfig.selectedHours * 60 * 60 * 1000;
    
    // Update vitals for sleep state
    this.state.updateVitalsForSleep();
    
    // Start the time skip
    this.timeManager.skipTime(
      sleepTimeMs,
      () => this.completeSleep(),
      (progress) => this.updateSleepProgress(progress)
    );
  }
  
  /**
   * Updates the sleep progress based on the progress value (0-1).
   * This method is called by the TimeManager during time skipping.
   * @param progress The progress of the sleep cycle (0-1)
   */
  updateSleepProgress(progress: number): void {
    // Update vitals based on sleep progress
    this.state.updateVitalsForSleepProgress(progress);
  }
  
  /**
   * Completes the sleep cycle and processes the results.
   */
  private completeSleep(): void {
    if (!this.state.sleepConfig.isSkipActive) return;
    
    // Reset sleep active state
    this.state.sleepConfig.isSkipActive = false;
    
    // Apply rest restoration based on sleep duration
    this.state.applyRestRestoration(this.state.sleepConfig.selectedHours);
    
    // Update vitals for awake state
    this.state.updateVitalsForSleepComplete();
    
    // Call the callback to inform the game of the sleep completion
    if (this.onSleepCompleteCallback) {
      this.onSleepCompleteCallback(this.state.sleepConfig.selectedHours);
    }
  }
  
  /**
   * Cancels an in-progress sleep cycle.
   */
  cancelSleep(): void {
    if (!this.state.sleepConfig.isSkipActive) return;
    
    // Cancel the time skip
    this.timeManager.cancelTimeSkip();
    
    // Reset sleep active state
    this.state.sleepConfig.isSkipActive = false;
    
    // Only give partial rest based on how much time has passed
    const progress = this.timeManager.getTimeSkipProgress();
    this.state.applyPartialRestRestoration(this.state.sleepConfig.selectedHours, progress);
    
    // Update vitals for awake state
    this.state.updateVitalsForSleepComplete();
  }
  
  /**
   * Selects a sleep duration.
   * @param hours Number of hours to sleep
   */
  selectDuration(hours: number): void {
    this.state.sleepConfig.selectedHours = hours;
  }
}