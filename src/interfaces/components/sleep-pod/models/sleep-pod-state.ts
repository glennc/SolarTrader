/**
 * Model representing the state of the sleep pod
 */
export class SleepPodState {
  // Pod status values
  podStatus = {
    atmosphere: 98,
    temperature: 294,
    fieldIntegrity: 100
  };
  
  // Vital signs
  vitalSigns = {
    heartRate: 72,
    brainActivity: 'ALERT' as BrainActivityState,
    restQuality: 'PROJECTED: EXCELLENT' as RestQualityState
  };
  
  // Sleep configuration
  sleepConfig = {
    selectedHours: 6, // Default sleep duration
    isSkipActive: false
  };
  
  // Player state
  playerRestLevel: number;
  
  constructor(playerRestLevel: number) {
    this.playerRestLevel = playerRestLevel;
  }
  
  /**
   * Calculates the recovery percentage based on sleep duration
   */
  calculateRecovery(hours: number): string {
    let restGain = 0;
    if (hours <= 4) {
      restGain = hours * 15; // 15% per hour for short rests
    } else if (hours <= 8) {
      restGain = 60 + (hours - 4) * 10; // 10% per hour after 4 hours
    } else {
      restGain = 100 + (hours - 8) * 5; // 5% per hour after 8 hours
    }
    
    // Calculate new rest level but don't actually apply it yet
    const newRestLevel = Math.min(100, this.playerRestLevel + restGain);
    const effectiveGain = Math.max(10, newRestLevel - this.playerRestLevel); // Minimum 10% gain
    
    return `+${Math.round(effectiveGain)}% (TO ${Math.round(Math.min(100, this.playerRestLevel + effectiveGain))}%)`;
  }
  
  /**
   * Updates the vital signs during sleep
   */
  updateVitalsForSleep(): void {
    this.vitalSigns.heartRate = 65;
    this.vitalSigns.brainActivity = 'DROWSY';
    this.vitalSigns.restQuality = 'IN PROGRESS';
  }
  
  /**
   * Updates vital signs during sleep progress
   */
  updateVitalsForSleepProgress(progress: number): void {
    // Heart rate decreases as sleep deepens then slightly increases before waking
    if (progress < 0.3) {
      // Falling asleep phase
      this.vitalSigns.heartRate = Math.round(72 - (progress / 0.3) * 20);
    } else if (progress > 0.8) {
      // Waking up phase
      this.vitalSigns.heartRate = Math.round(52 + ((progress - 0.8) / 0.2) * 20);
    } else {
      // Deep sleep phase
      this.vitalSigns.heartRate = 52;
    }
    
    // Update brain activity based on sleep phase
    if (progress < 0.2) {
      this.vitalSigns.brainActivity = 'DROWSY';
    } else if (progress < 0.3) {
      this.vitalSigns.brainActivity = 'LIGHT SLEEP';
    } else if (progress < 0.8) {
      this.vitalSigns.brainActivity = 'DEEP SLEEP';
    } else if (progress < 0.9) {
      this.vitalSigns.brainActivity = 'REM SLEEP';
    } else {
      this.vitalSigns.brainActivity = 'WAKING';
    }
    
    // Update rest quality
    if (progress > 0.5) {
      this.vitalSigns.restQuality = 'EXCELLENT';
    } else {
      this.vitalSigns.restQuality = 'IN PROGRESS';
    }
  }
  
  /**
   * Updates the vital signs when sleep is complete
   */
  updateVitalsForSleepComplete(): void {
    this.vitalSigns.heartRate = 72;
    this.vitalSigns.brainActivity = 'ALERT';
    this.vitalSigns.restQuality = 'COMPLETED: EXCELLENT';
  }
  
  /**
   * Applies rest restoration based on sleep duration
   * Returns the new rest level
   */
  applyRestRestoration(hours: number): number {
    // Calculate rest restoration based on sleep duration
    // More sleep gives diminishing returns after 8 hours
    let restGain = 0;
    if (hours <= 4) {
      restGain = hours * 15; // 15% per hour for short rests
    } else if (hours <= 8) {
      restGain = 60 + (hours - 4) * 10; // 10% per hour after 4 hours
    } else {
      restGain = 100 + (hours - 8) * 5; // 5% per hour after 8 hours
    }
    
    // Cap at 100% and ensure we get at least 10% for any sleep
    const newRestLevel = Math.min(100, this.playerRestLevel + restGain);
    this.playerRestLevel = Math.max(Math.min(100, newRestLevel), this.playerRestLevel + 10);
    
    return this.playerRestLevel;
  }
  
  /**
   * Applies partial rest restoration based on progress
   * Returns the new rest level
   */
  applyPartialRestRestoration(hours: number, progress: number): number {
    if (progress > 0) {
      const partialRestGain = Math.round(progress * hours * 10);
      this.playerRestLevel = Math.min(100, this.playerRestLevel + partialRestGain);
    }
    return this.playerRestLevel;
  }
}

export type BrainActivityState = 'ALERT' | 'DROWSY' | 'LIGHT SLEEP' | 'DEEP SLEEP' | 'REM SLEEP' | 'WAKING';
export type RestQualityState = 'PROJECTED: EXCELLENT' | 'IN PROGRESS' | 'EXCELLENT' | 'COMPLETED: EXCELLENT';