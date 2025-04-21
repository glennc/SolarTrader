/**
 * Specialized objects module
 * 
 * This barrel file re-exports all specialized interactable objects
 * to make them easily accessible from a single import.
 */

// Export base specialized object class
export { SpecializedInteractableObject } from './specialized-object';

// Export specific specialized objects
export { Datapad, type DatapadLog, type DatapadContract } from './datapad';
export { MaintenanceToolkit, type ToolItem } from './maintenance-toolkit';
export { TimeSkipTerminal, type SystemProjection, type ProjectedAlert, type SystemChangeResult } from './time-skip-terminal';
export { CaptainsChair } from './captains-chair';

// Add new specialized object exports here as they are implemented
// export { FoodPreparationStation } from './food-preparation-station';
// export { MedicalStation } from './medical-station';
// etc.