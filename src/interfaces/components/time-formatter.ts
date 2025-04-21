import { TimeManager, ElapsedTime } from '../../managers/time-manager';

/**
 * Provides standardized time formatting utilities across the application.
 * This ensures that all time displays have a consistent look and feel.
 */
export class TimeFormatter {
  /**
   * Format mission time in the standard format (T+DD:HH:MM:SS)
   * @param time Elapsed time object from TimeManager
   */
  static formatMissionTime(time: ElapsedTime): string {
    return time.formatted; // Already formatted by TimeManager
  }
  
  /**
   * Format a duration in hours, minutes, seconds
   * @param hours Total hours
   * @param includeSeconds Whether to include seconds in the format
   */
  static formatDuration(hours: number, includeSeconds = true): string {
    const totalHours = Math.floor(hours);
    const totalMinutes = Math.floor((hours - totalHours) * 60);
    const totalSeconds = Math.floor(((hours - totalHours) * 60 - totalMinutes) * 60);
    
    const h = totalHours.toString().padStart(2, '0');
    const m = totalMinutes.toString().padStart(2, '0');
    
    if (includeSeconds) {
      const s = totalSeconds.toString().padStart(2, '0');
      return `${h}:${m}:${s}`;
    } else {
      return `${h}:${m}`;
    }
  }
  
  /**
   * Format a time string from a date object (HH:MM:SS)
   * @param date Date object to format
   * @param includeSeconds Whether to include seconds
   */
  static formatTimeFromDate(date: Date, includeSeconds = true): string {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    
    if (includeSeconds) {
      const seconds = date.getSeconds().toString().padStart(2, '0');
      return `${hours}:${minutes}:${seconds}`;
    } else {
      return `${hours}:${minutes}`;
    }
  }
  
  /**
   * Format a date with time (DD.MM.YYYY HH:MM)
   * @param date Date object to format
   */
  static formatDateTime(date: Date): string {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    
    return `${day}.${month}.${year} ${hours}:${minutes}`;
  }
  
  /**
   * Format the elapsed time during a skip (HH:MM:SS)
   * @param hours Hours elapsed
   * @param minutes Minutes elapsed
   * @param seconds Seconds elapsed
   */
  static formatElapsedTime(hours: number, minutes: number, seconds: number): string {
    const h = hours.toString().padStart(2, '0');
    const m = minutes.toString().padStart(2, '0');
    const s = seconds.toString().padStart(2, '0');
    
    return `${h}:${m}:${s}`;
  }
  
  /**
   * Format a time alert reference (e.g., "WARNING @ 3h 15m")
   * @param hours Hours until alert
   * @param minutes Minutes until alert
   * @param status Alert status text
   */
  static formatAlertTime(hours: number, minutes: number, status: string): string {
    return `${status} @ ${hours}h ${minutes}m`;
  }
  
  /**
   * Calculate a wake time from current time plus sleep hours
   * @param timeManager Reference to the TimeManager
   * @param sleepHours Number of hours to sleep
   */
  static calculateWakeTime(timeManager: TimeManager, sleepHours: number): string {
    // Get current time
    const currentTime = timeManager.getCurrentTime();
    
    // Add the sleep duration
    const wakeTime = new Date(currentTime.getTime() + (sleepHours * 60 * 60 * 1000));
    
    // Format the time
    return this.formatDateTime(wakeTime);
  }
}