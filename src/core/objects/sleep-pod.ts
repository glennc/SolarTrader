import { BaseInteractableObject } from '../interactable-object';
import { SleepPodInterface } from '../../interfaces/components/sleep-pod-interface';
import { TimeManager } from '../../managers/time-manager';
import { DOMCSSLoader } from '../../interfaces/dom-css-loader';
import { InterfaceManager } from '../../managers/interface-manager';
import { SystemInterface } from '../../interfaces/system-interfaces';

/**
 * A specialized sleep pod that allows the player to rest and skip time.
 * Implements SystemInterface so it's recognized as a system with a dedicated interface.
 */
export class SleepPod extends BaseInteractableObject implements SystemInterface {
  private playerRestLevel: number = 80; // Default player rest level
  private timeManager: TimeManager;
  private cssLoader: DOMCSSLoader;
  private sleepPodInterface: SleepPodInterface | null = null;
  private isCurrentlySleeping: boolean = false;
  private interfaceManager: InterfaceManager;
  
  /**
   * Creates a new SleepPod.
   * @param name Name of the object
   * @param description Description of the object
   * @param timeManager Reference to the game's TimeManager
   * @param cssLoader Reference to the DOMCSSLoader
   * @param interfaceManager Reference to the InterfaceManager
   */
  constructor(
    name: string,
    description: string,
    timeManager: TimeManager,
    cssLoader: DOMCSSLoader,
    interfaceManager: InterfaceManager
  ) {
    super(name, description, description, false, [], ['examine', 'look at', 'use', 'activate', 'operate', 'enter', 'sleep', 'rest']);
    this.timeManager = timeManager;
    this.cssLoader = cssLoader;
    this.interfaceManager = interfaceManager;
  }
  
  /**
   * Renders the sleep pod interface.
   * This implementation of the SystemInterface method helps the game
   * recognize this object as something that should use the "use" command when clicked.
   * @returns A cleanup function to remove the interface
   */
  renderInterface(): () => void {
    // Create sleep pod interface if it doesn't exist
    if (!this.sleepPodInterface) {
      // Get the proper container
      const container = document.querySelector('.terminal-container');
      if (!container) {
        console.error("Sleep Pod: Terminal container not found");
        return () => {};
      }
      
      this.sleepPodInterface = new SleepPodInterface(
        container as HTMLElement,
        this.timeManager,
        this.cssLoader,
        this.playerRestLevel,
        this.onSleepComplete.bind(this)
      );
      
      // Set the interface manager
      this.sleepPodInterface.setInterfaceManager(this.interfaceManager);
    }
    
    // Delegate to the actual interface's renderInterface method
    return this.sleepPodInterface.renderInterface();
  }
  
  /**
   * Called when the player interacts with the sleep pod.
   * @returns A string describing the interaction
   */
  onInteract(): string {
    // Display the interface using the InterfaceManager
    if (this.interfaceManager) {
      this.interfaceManager.showSystemInterface(this);
      return `The sleep pod activates with a soft hum. The control panel illuminates, displaying your current rest level: ${Math.round(this.playerRestLevel)}%.`;
    } else {
      console.error("Interface manager is not initialized!");
      return "Error: Interface manager is not initialized";
    }
  }
  
  /**
   * Called when the sleep cycle is complete.
   * @param hours The number of hours slept
   */
  onSleepComplete(hours: number): void {
    if (this.isCurrentlySleeping) {
      return; // Already sleeping, don't process again
    }
    
    console.log(`Starting sleep cycle: ${hours} hours`);
    this.isCurrentlySleeping = true;
    
    // Calculate milliseconds to skip based on hours
    const millisToSkip = hours * 60 * 60 * 1000;
    
    // Use TimeManager to skip time
    this.timeManager.skipTime(
      millisToSkip,
      () => {
        // This callback runs after time skip completes
        console.log(`Sleep complete: ${hours} hours skipped`);
        this.isCurrentlySleeping = false;
        
        // Calculate recovery based on sleep duration
        let recovery = 0;
        
        if (hours <= 8) {
          recovery = hours * 15; // 15% per hour for up to 8 hours
        } else {
          recovery = 8 * 15 + (hours - 8) * 5; // 5% per hour after 8 hours
        }
        
        // Cap maximum recovery at 100%
        this.playerRestLevel = Math.min(100, this.playerRestLevel + recovery);
        
        // Close the interface after a delay
        setTimeout(() => {
          this.closeInterface();
        }, 3000); // 3 second delay so the player can see the completion state
      },
      (progress) => {
        // Update progress in the interface if needed
        console.log(`Sleep progress: ${Math.round(progress * 100)}%`);
        
        // Call the updateSleepProgress method on the sleepPodInterface
        if (this.sleepPodInterface) {
          this.sleepPodInterface.updateSleepProgress(progress);
        }
      },
      100 // Time acceleration during sleep (100x speed)
    );
  }
  
  /**
   * Closes the sleep pod interface.
   */
  closeInterface(): void {
    if (this.interfaceManager && this.sleepPodInterface) {
      this.interfaceManager.returnToFirstPerson();
    }
    
    this.sleepPodInterface = null;
  }
  
  /**
   * Sets the player's current rest level.
   * @param restLevel Rest level value between 0-100
   */
  setPlayerRestLevel(restLevel: number): void {
    this.playerRestLevel = Math.max(0, Math.min(100, restLevel));
  }
  
  /**
   * Gets the player's current rest level.
  getPlayerRestLevel(): number {
    return this.playerRestLevel;
  }

  /**
   * Override the standard interact method from BaseInteractableObject
   * to properly handle various interaction verbs
   * @param verb The verb used for interaction (use, examine, etc.)
   * @returns A string describing the result of the interaction
   */
  interact(verb: string): string {
    verb = verb.toLowerCase();
    
    // Handle standard examination
    if (verb === 'examine' || verb === 'look at') {
      return this.description;
    }
    
    // Handle usage verbs that should trigger the sleep pod interface
    if (verb === 'use' || verb === 'activate' || verb === 'operate' || verb === 'enter' || verb === 'sleep' || verb === 'rest') {
      // Trigger the onInteract method to show the interface
      return this.onInteract();
    }
    
    // Default response for unsupported verbs
    return `You can't ${verb} the ${this.name}.`;
  }
}