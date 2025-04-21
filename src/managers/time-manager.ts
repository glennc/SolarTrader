/**
 * Manages game time, including real-time progression, acceleration, 
 * day/night cycles, and scheduled events.
 */
export class TimeManager {
  // Game clock properties
  private gameStartTime: Date; // When the game started in real-time
  private gameElapsedMs: number = 0; // Total elapsed game time in milliseconds
  private lastUpdateTime: number = 0; // Last time we updated the game clock
  private timeAcceleration: number = 1; // Default 1x time acceleration
  private isTimeRunning: boolean = true; // Whether game time is advancing
  private timeSkipTarget: number | null = null; // Target time for time skip 

  // Day/Night cycle properties
  private readonly HOURS_PER_DAY = 24;
  private readonly MINUTES_PER_HOUR = 60;
  private readonly SECONDS_PER_MINUTE = 60;
  private readonly MS_PER_SECOND = 1000;
  private readonly MS_PER_DAY = this.HOURS_PER_DAY * this.MINUTES_PER_HOUR * 
                              this.SECONDS_PER_MINUTE * this.MS_PER_SECOND;

  // Event and callback tracking
  private eventSchedule: ScheduledEvent[] = [];
  private timeChangeCallbacks: TimeChangeCallback[] = [];
  private dayChangeCallbacks: DayChangeCallback[] = [];

  // Time skip state tracking
  private isTimeSkipping: boolean = false;
  private onTimeSkipComplete: (() => void) | null = null;
  private onTimeSkipProgress: ((progress: number) => void) | null = null;

  /**
   * Creates a new TimeManager and initializes the game clock.
   * @param initialGameTime Optional starting game time offset in milliseconds
   */
  constructor(initialGameTime: number = 0) {
    this.gameStartTime = new Date();
    this.gameElapsedMs = initialGameTime;
    this.lastUpdateTime = Date.now();
  }

  /**
   * Updates the game clock based on real time elapsed.
   * Should be called each frame.
   */
  update(): void {
    const currentTime = Date.now();
    const realElapsedMs = currentTime - this.lastUpdateTime;
    this.lastUpdateTime = currentTime;

    if (!this.isTimeRunning) {
      return;
    }

    const previousGameDay = this.getCurrentDay();
    
    // Calculate game time elapsed based on acceleration
    const gameElapsedMs = realElapsedMs * this.timeAcceleration;
    this.gameElapsedMs += gameElapsedMs;

    // Handle day change events
    const currentGameDay = this.getCurrentDay();
    if (currentGameDay !== previousGameDay) {
      this.notifyDayChanged(currentGameDay, previousGameDay);
    }

    // Notify time change listeners
    this.notifyTimeChanged(gameElapsedMs);

    // Process any due events
    this.processScheduledEvents();

    // Handle time skip logic
    if (this.isTimeSkipping && this.timeSkipTarget !== null) {
      if (this.gameElapsedMs >= this.timeSkipTarget) {
        this.completeTimeSkip();
      } else if (this.onTimeSkipProgress) {
        // Calculate and report progress as a value between 0 and 1
        const startTime = this.timeSkipTarget - this.gameElapsedMs;
        const progress = 1 - ((this.timeSkipTarget - this.gameElapsedMs) / startTime);
        this.onTimeSkipProgress(progress);
      }
    }
  }

  /**
   * Sets the time acceleration factor.
   * @param factor The factor to accelerate time by (1 = normal, 2 = twice as fast, etc.)
   */
  setTimeAcceleration(factor: number): void {
    if (factor < 0.1) factor = 0.1; // Prevent time from going too slow
    if (factor > 10000) factor = 10000; // Cap maximum speed
    this.timeAcceleration = factor;
    console.log(`TimeManager: Time acceleration set to ${factor}x`);
  }

  /**
   * Pauses or resumes the game clock.
   * @param isRunning True to resume time, false to pause it
   */
  setTimeRunning(isRunning: boolean): void {
    if (this.isTimeRunning !== isRunning) {
      this.isTimeRunning = isRunning;
      this.lastUpdateTime = Date.now(); // Reset last update time to avoid time jumps
      console.log(`TimeManager: Time ${isRunning ? 'resumed' : 'paused'}`);
    }
  }

  /**
   * Initiates a time skip to a future point in time.
   * @param skipMs Milliseconds to skip ahead
   * @param onComplete Optional callback when time skip completes
   * @param onProgress Optional callback for skip progress (0 to 1)
   * @param accelerationFactor Acceleration factor during skip (default: 20x)
   */
  skipTime(
    skipMs: number, 
    onComplete?: () => void,
    onProgress?: (progress: number) => void,
    accelerationFactor: number = 20
  ): void {
    if (skipMs <= 0) {
      console.warn('TimeManager: Cannot skip negative or zero time');
      return;
    }

    // Save the normal time acceleration to restore later
    const previousAcceleration = this.timeAcceleration;
    
    // Setup time skip
    this.isTimeSkipping = true;
    this.timeSkipTarget = this.gameElapsedMs + skipMs;
    this.onTimeSkipComplete = onComplete || null;
    this.onTimeSkipProgress = onProgress || null;
    
    // Accelerate time for the skip
    this.setTimeAcceleration(accelerationFactor);
    
    console.log(`TimeManager: Skipping ${this.formatDuration(skipMs)} of game time at ${accelerationFactor}x speed`);
    
    // Save the previous acceleration to restore after skip
    // This is a simple approach - a more robust method would be to store the start
    // state and handle potential interruptions
    this.onTimeSkipComplete = () => {
      this.setTimeAcceleration(previousAcceleration);
      if (onComplete) onComplete();
    };
  }

  /**
   * Cancels an in-progress time skip.
   */
  cancelTimeSkip(): void {
    if (!this.isTimeSkipping) return;
    
    this.isTimeSkipping = false;
    this.timeSkipTarget = null;
    
    console.log('TimeManager: Time skip cancelled');
    
    // Reset time acceleration to 1x or another appropriate value
    this.setTimeAcceleration(1);
  }

  /**
   * Completes a time skip operation.
   */
  private completeTimeSkip(): void {
    if (!this.isTimeSkipping) return;
    
    this.isTimeSkipping = false;
    this.timeSkipTarget = null;
    
    console.log('TimeManager: Time skip completed');
    
    // Call the completion callback if one was provided
    if (this.onTimeSkipComplete) {
      this.onTimeSkipComplete();
      this.onTimeSkipComplete = null;
    }
    
    this.onTimeSkipProgress = null;
  }

  /**
   * Gets the current game time as a Date object.
   */
  getCurrentTime(): Date {
    const currentDate = new Date(this.gameStartTime);
    currentDate.setTime(currentDate.getTime() + this.gameElapsedMs);
    return currentDate;
  }

  /**
   * Gets the current day number (days since game start).
   */
  getCurrentDay(): number {
    return Math.floor(this.gameElapsedMs / this.MS_PER_DAY);
  }

  /**
   * Gets the current hour of the day (0-23).
   */
  getCurrentHour(): number {
    const totalHours = (this.gameElapsedMs / (this.MINUTES_PER_HOUR * this.SECONDS_PER_MINUTE * this.MS_PER_SECOND));
    return Math.floor(totalHours % this.HOURS_PER_DAY);
  }

  /**
   * Gets the current day-night cycle phase (0-1).
   * 0 = midnight, 0.25 = sunrise, 0.5 = noon, 0.75 = sunset
   */
  getDayCyclePhase(): number {
    const hourDecimal = this.getCurrentHourDecimal();
    return hourDecimal / this.HOURS_PER_DAY;
  }

  /**
   * Gets the current hour as a decimal (e.g., 14.5 for 2:30 PM).
   */
  getCurrentHourDecimal(): number {
    const totalHours = this.gameElapsedMs / (this.MINUTES_PER_HOUR * this.SECONDS_PER_MINUTE * this.MS_PER_SECOND);
    return totalHours % this.HOURS_PER_DAY;
  }

  /**
   * Gets the elapsed time since game start in various formats.
   */
  getElapsedTime(): ElapsedTime {
    const totalSeconds = Math.floor(this.gameElapsedMs / this.MS_PER_SECOND);
    const totalMinutes = Math.floor(totalSeconds / this.SECONDS_PER_MINUTE);
    const totalHours = Math.floor(totalMinutes / this.MINUTES_PER_HOUR);
    const totalDays = Math.floor(totalHours / this.HOURS_PER_DAY);
    
    const seconds = totalSeconds % this.SECONDS_PER_MINUTE;
    const minutes = totalMinutes % this.MINUTES_PER_HOUR;
    const hours = totalHours % this.HOURS_PER_DAY;
    
    return {
      days: totalDays,
      hours: hours,
      minutes: minutes,
      seconds: seconds,
      totalDays: totalDays,
      totalHours: totalHours,
      totalMinutes: totalMinutes,
      totalSeconds: totalSeconds,
      totalMs: this.gameElapsedMs,
      formatted: this.formatTime(totalDays, hours, minutes, seconds)
    };
  }

  /**
   * Returns a formatted time string (e.g., "02:14:37:12" for 2d, 14h, 37m, 12s).
   */
  formatTime(days: number, hours: number, minutes: number, seconds: number): string {
    const pad = (num: number) => num.toString().padStart(2, '0');
    return `T+${pad(days)}:${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  }

  /**
   * Formats a duration in milliseconds to a human-readable string.
   */
  formatDuration(ms: number): string {
    const seconds = Math.floor(ms / this.MS_PER_SECOND) % this.SECONDS_PER_MINUTE;
    const minutes = Math.floor(ms / (this.MS_PER_SECOND * this.SECONDS_PER_MINUTE)) % this.MINUTES_PER_HOUR;
    const hours = Math.floor(ms / (this.MS_PER_SECOND * this.SECONDS_PER_MINUTE * this.MINUTES_PER_HOUR)) % this.HOURS_PER_DAY;
    const days = Math.floor(ms / (this.MS_PER_SECOND * this.SECONDS_PER_MINUTE * this.MINUTES_PER_HOUR * this.HOURS_PER_DAY));
    
    const parts = [];
    if (days > 0) parts.push(`${days}d`);
    if (hours > 0 || days > 0) parts.push(`${hours}h`);
    if (minutes > 0 || hours > 0 || days > 0) parts.push(`${minutes}m`);
    parts.push(`${seconds}s`);
    
    return parts.join(' ');
  }

  /**
   * Schedules an event to occur after a specified delay.
   * @param delay Milliseconds after which the event should occur
   * @param callback Function to call when the event triggers
   * @param recurring Whether this event should repeat
   * @param interval If recurring, the interval in ms between recurrences
   * @returns The ID of the scheduled event
   */
  scheduleEvent(
    delay: number, 
    callback: () => void, 
    recurring: boolean = false,
    interval: number = 0
  ): number {
    const eventTime = this.gameElapsedMs + delay;
    const eventId = Date.now() + Math.random(); // Simple unique ID
    
    this.eventSchedule.push({
      id: eventId,
      triggerTime: eventTime,
      callback,
      recurring,
      interval: recurring ? (interval || delay) : 0
    });
    
    // Sort events by trigger time for efficient processing
    this.eventSchedule.sort((a, b) => a.triggerTime - b.triggerTime);
    
    return eventId;
  }

  /**
   * Cancels a previously scheduled event.
   * @param eventId The ID of the event to cancel
   * @returns True if the event was found and canceled
   */
  cancelEvent(eventId: number): boolean {
    const initialLength = this.eventSchedule.length;
    this.eventSchedule = this.eventSchedule.filter(event => event.id !== eventId);
    return initialLength !== this.eventSchedule.length;
  }

  /**
   * Processes any scheduled events that are due to trigger.
   */
  private processScheduledEvents(): void {
    if (this.eventSchedule.length === 0) return;
    
    const currentTime = this.gameElapsedMs;
    const triggeredEvents: ScheduledEvent[] = [];
    
    // Find events that have triggered
    while (
      this.eventSchedule.length > 0 && 
      this.eventSchedule[0].triggerTime <= currentTime
    ) {
      triggeredEvents.push(this.eventSchedule.shift()!);
    }
    
    // Process triggered events
    for (const event of triggeredEvents) {
      // Execute the callback
      try {
        event.callback();
      } catch (error) {
        console.error('TimeManager: Error in scheduled event callback:', error);
      }
      
      // If recurring, schedule the next occurrence
      if (event.recurring) {
        this.eventSchedule.push({
          ...event,
          triggerTime: currentTime + event.interval
        });
      }
    }
    
    // Re-sort if we added any recurring events
    if (triggeredEvents.some(e => e.recurring)) {
      this.eventSchedule.sort((a, b) => a.triggerTime - b.triggerTime);
    }
  }

  /**
   * Registers a callback for when game time changes.
   * @param callback Function to call when time changes
   */
  onTimeChange(callback: TimeChangeCallback): void {
    this.timeChangeCallbacks.push(callback);
  }

  /**
   * Registers a callback for when the game day changes.
   * @param callback Function to call when the day changes
   */
  onDayChange(callback: DayChangeCallback): void {
    this.dayChangeCallbacks.push(callback);
  }

  /**
   * Removes a time change callback.
   * @param callback The callback to remove
   */
  removeTimeChangeCallback(callback: TimeChangeCallback): void {
    this.timeChangeCallbacks = this.timeChangeCallbacks.filter(cb => cb !== callback);
  }

  /**
   * Removes a day change callback.
   * @param callback The callback to remove
   */
  removeDayChangeCallback(callback: DayChangeCallback): void {
    this.dayChangeCallbacks = this.dayChangeCallbacks.filter(cb => cb !== callback);
  }

  /**
   * Notifies all registered callbacks about a time change.
   * @param elapsedMs Milliseconds elapsed since last update
   */
  private notifyTimeChanged(elapsedMs: number): void {
    for (const callback of this.timeChangeCallbacks) {
      try {
        callback(elapsedMs, this.gameElapsedMs);
      } catch (error) {
        console.error('TimeManager: Error in time change callback:', error);
      }
    }
  }

  /**
   * Notifies all registered callbacks about a day change.
   * @param currentDay The new day number
   * @param previousDay The previous day number
   */
  private notifyDayChanged(currentDay: number, previousDay: number): void {
    for (const callback of this.dayChangeCallbacks) {
      try {
        callback(currentDay, previousDay);
      } catch (error) {
        console.error('TimeManager: Error in day change callback:', error);
      }
    }
  }

  /**
   * Checks if it's currently daytime (6:00 - 18:00).
   */
  isDaytime(): boolean {
    const hour = this.getCurrentHour();
    return hour >= 6 && hour < 18;
  }

  /**
   * Gets the current time acceleration factor.
   */
  getTimeAcceleration(): number {
    return this.timeAcceleration;
  }

  /**
   * Checks if a time skip is currently in progress.
   */
  isSkippingTime(): boolean {
    return this.isTimeSkipping;
  }

  /**
   * Gets the current progress of an active time skip as a value between 0 and 1.
   * Returns 0 if no time skip is in progress.
   */
  getTimeSkipProgress(): number {
    if (!this.isTimeSkipping || this.timeSkipTarget === null) {
      return 0;
    }
    
    // Calculate starting point (when skip was initiated)
    const startPoint = this.timeSkipTarget - (this.timeSkipTarget - this.gameElapsedMs) / (this.timeAcceleration / 20);
    
    // Calculate progress
    const totalSkipAmount = this.timeSkipTarget - startPoint;
    const progress = (this.gameElapsedMs - startPoint) / totalSkipAmount;
    
    return Math.min(1, Math.max(0, progress)); // Clamp between 0 and 1
  }
}

// Interfaces for time-related data structures

/**
 * Information about elapsed game time.
 */
export interface ElapsedTime {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalDays: number;
  totalHours: number;
  totalMinutes: number;
  totalSeconds: number;
  totalMs: number;
  formatted: string;
}

/**
 * A scheduled event in the game world.
 */
interface ScheduledEvent {
  id: number;
  triggerTime: number;
  callback: () => void;
  recurring: boolean;
  interval: number;
}

/**
 * Callback type for time change events.
 */
type TimeChangeCallback = (elapsedMs: number, totalGameTimeMs: number) => void;

/**
 * Callback type for day change events.
 */
type DayChangeCallback = (currentDay: number, previousDay: number) => void;