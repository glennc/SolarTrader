import { BaseInteractableObject } from '../interactable-object';
import { InterfaceManager } from '../../managers/interface-manager';

/**
 * Base class for all specialized interactable objects in the game
 * Extends the basic interactable object with additional functionality
 */
export abstract class SpecializedInteractableObject extends BaseInteractableObject {
    protected interfaceManager: InterfaceManager | null = null;
    
    constructor(
        name: string, 
        shortDescription: string, 
        description: string, 
        isPortable: boolean = false,
        aliases: string[] = [],
        supportedInteractions: string[] = ['examine', 'look at']
    ) {
        super(name, shortDescription, description, isPortable, aliases, supportedInteractions);
    }
    
    /**
     * Sets the interface manager reference
     */
    setInterfaceManager(manager: InterfaceManager): void {
        this.interfaceManager = manager;
    }
    
    /**
     * Override the default interact method to add specialized behavior
     */
    override interact(verb: string): string {
        // First attempt to handle with specialized behavior
        const result = this.handleSpecializedInteraction(verb);
        if (result) {
            return result;
        }
        
        // If not handled by specialized behavior, fall back to basic behavior
        return super.interact(verb);
    }
    
    /**
     * Handle specialized interactions unique to this object type
     * @param verb The action to perform
     * @returns A string response or null if not handled
     */
    protected abstract handleSpecializedInteraction(verb: string): string | null;
}