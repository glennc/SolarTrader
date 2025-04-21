/**
 * Interface for a projected alert during time skip.
 */
export interface ProjectedAlert {
  system: string;
  status: 'NOMINAL' | 'WARNING' | 'DANGER';
  triggerMinute: number;
  triggered: boolean;
}

/**
 * Interface for system states
 */
export interface SystemStates {
  [key: string]: number;
}

/**
 * State management for the time skip interface
 */
export class TimeSkipState {
  // Configuration
  public skipOptions = [1, 4, 8, 12, 24]; // Hours options for time skip
  public selectedSkipHours = 4; // Default selected hours
  
  // Acceleration factors
  public accelerationOptions = [1, 5, 10, 20, 50, 100]; // Available acceleration factors
  public selectedAccelerationFactor = 20; // Default acceleration factor
  
  // Target time mode vs. continuous mode
  public useTargetTime = true; // Default to target time mode
  
  // Status flags
  public isSkipActive = false;
  
  // System states (percentages)
  public shipSystemStates: SystemStates;
  
  // Alerts that may occur during the time skip
  public projectedAlerts: ProjectedAlert[] = [];
  
  // Interval ID for progress updates
  public skipProgressInterval: number | null = null;
  
  /**
   * Creates a new time skip state.
   * @param initialSystemStates Initial system values as percentages
   */
  constructor(initialSystemStates: SystemStates) {
    this.shipSystemStates = {...initialSystemStates};
  }
  
  /**
   * Reset system values to their initial state
   * @param initialValues The values to reset to, or undefined to use defaults
   */
  resetSystemValues(initialValues?: SystemStates): void {
    if (initialValues) {
      this.shipSystemStates = {...initialValues};
    } else {
      // Default values if none provided
      this.shipSystemStates = {
        power: 87,
        engines: 76,
        lifeSupport: 93,
        fuel: 65
      };
    }
  }
  
  /**
   * Sets the selected skip hours
   * @param hours Hours to skip
   */
  setSelectedSkipHours(hours: number): void {
    this.selectedSkipHours = hours;
  }
  
  /**
   * Sets the selected acceleration factor
   * @param factor Acceleration factor to use
   */
  setAccelerationFactor(factor: number): void {
    if (this.accelerationOptions.includes(factor)) {
      this.selectedAccelerationFactor = factor;
    } else {
      console.warn(`Invalid acceleration factor: ${factor}`);
    }
  }
  
  /**
   * Sets whether to use target time mode or continuous acceleration
   * @param useTarget True for target time mode, false for continuous acceleration
   */
  setUseTargetTime(useTarget: boolean): void {
    this.useTargetTime = useTarget;
  }
  
  /**
   * Sets the skip active state
   * @param active Whether the skip is active
   */
  setSkipActive(active: boolean): void {
    this.isSkipActive = active;
  }
}