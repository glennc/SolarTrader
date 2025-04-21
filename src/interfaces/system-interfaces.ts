/**
 * System interfaces module
 * 
 * This barrel file re-exports the base interfaces and concrete implementations
 * to maintain backward compatibility with existing code.
 */

// Export the base interfaces
export type { SystemInterface } from './base-system-interfaces';
export { BaseSystemInterface } from './base-system-interfaces';

// Export specific system interfaces
export { CoolantSystemInterface } from './systems/coolant-system-interface';
export { SystemDiagnosticsInterface } from './systems/system-diagnostics-interface';

// Add new system interface exports here as they are implemented
// export { NavigationSystemInterface } from './systems/navigation-system-interface';
// export { LifeSupportSystemInterface } from './systems/life-support-system-interface';
// etc.