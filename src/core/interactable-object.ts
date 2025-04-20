import { Entity } from './entity';

/**
 * Interface for objects that can be interacted with
 */
export interface InteractableObject extends Entity {
    /** The primary name of the object as seen in the compartment */
    name: string;
    
    /** Alternative names/aliases that can be used to reference this object */
    aliases: string[];
    
    /** Short description displayed in the compartment's object list */
    shortDescription: string;
    
    /** Longer description shown when examining the object */
    description: string;
    
    /**
     * Whether the object can be picked up and carried by the player
     * Some objects are fixtures (terminals, consoles) and cannot be moved
     */
    isPortable: boolean;
    
    /**
     * List of verbs that can be used with this object
     * Examples: "examine", "use", "activate", "open", etc.
     */
    supportedInteractions: string[];
    
    /**
     * Handle an interaction with this object
     * @param verb The action to perform ("use", "examine", etc.)
     * @returns A string describing the result of the interaction
     */
    interact(verb: string): string;
}

/**
 * Base implementation of an interactable object
 */
export class BaseInteractableObject implements InteractableObject {
    name: string;
    aliases: string[];
    shortDescription: string;
    description: string;
    isPortable: boolean;
    supportedInteractions: string[];
    
    constructor(
        name: string, 
        shortDescription: string, 
        description: string, 
        isPortable: boolean = false,
        aliases: string[] = [],
        supportedInteractions: string[] = ['examine', 'look at']
    ) {
        this.name = name;
        this.shortDescription = shortDescription;
        this.description = description;
        this.isPortable = isPortable;
        this.aliases = aliases;
        this.supportedInteractions = supportedInteractions;
    }
    
    /**
     * Default implementation of interact that handles basic commands
     * like examining the object
     */
    interact(verb: string): string {
        verb = verb.toLowerCase();
        
        if (verb === 'examine' || verb === 'look at') {
            return this.description;
        }
        
        if (!this.supportedInteractions.includes(verb)) {
            return `You can't ${verb} the ${this.name}.`;
        }
        
        return `You ${verb} the ${this.name}.`;
    }
}