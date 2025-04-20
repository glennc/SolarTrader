import { Entity } from './entity';
import { InteractableObject } from './interactable-object';

/**
 * Represents a single area within a Location (like a room on a ship).
 */
export class Compartment {
    name: string;
    description: string;
    exits: Map<string, Compartment>; // Direction -> Connected Compartment
    entities: Entity[]; // Entities currently in this compartment
    interactableObjects: InteractableObject[]; // Objects that can be interacted with

    constructor(name: string, description: string) {
        this.name = name;
        this.description = description;
        this.exits = new Map<string, Compartment>();
        this.entities = [];
        this.interactableObjects = [];
    }

    /**
     * Connects this compartment to another in a specific direction.
     * Also creates the reverse connection if the opposite direction is provided.
     * @param direction The direction of the exit (e.g., "north", "east").
     * @param targetCompartment The compartment to connect to.
     * @param oppositeDirection Optional: The direction from the target back to this one.
     */
    addExit(direction: string, targetCompartment: Compartment, oppositeDirection?: string): void {
        this.exits.set(direction.toLowerCase(), targetCompartment);
        if (oppositeDirection) {
            targetCompartment.exits.set(oppositeDirection.toLowerCase(), this);
        }
    }

    /**
     * Gets the description of the compartment, including exits.
     */
    getLookDescription(): string {
        let description = this.description;
        
        // Add list of interactable objects
        if (this.interactableObjects.length > 0) {
            description += "\n\nYou can see:";
            this.interactableObjects.forEach(obj => {
                description += `\n- ${obj.name}: ${obj.shortDescription}`;
            });
        }
        
        // Add exits
        let exitList = Array.from(this.exits.keys()).join(', ');
        if (!exitList) {
            exitList = 'none';
        }
        description += `\n\nExits: ${exitList}`;
        
        return description;
    }

    // Basic methods for entity management (can be expanded later)
    addEntity(entity: Entity): void {
        this.entities.push(entity);
    }

    removeEntity(entity: Entity): void {
        this.entities = this.entities.filter(e => e !== entity);
    }
    
    /**
     * Adds an interactable object to the compartment
     */
    addInteractableObject(object: InteractableObject): void {
        this.interactableObjects.push(object);
    }
    
    /**
     * Removes an interactable object from the compartment
     */
    removeInteractableObject(object: InteractableObject): void {
        this.interactableObjects = this.interactableObjects.filter(obj => obj !== object);
    }
    
    /**
     * Finds an interactable object by name or alias
     * @param objectName The name or alias of the object to find
     * @returns The matching object or undefined if not found
     */
    findInteractableObject(objectName: string): InteractableObject | undefined {
        const normalizedName = objectName.toLowerCase();
        
        return this.interactableObjects.find(obj => 
            obj.name.toLowerCase() === normalizedName || 
            obj.aliases.some(alias => alias.toLowerCase() === normalizedName)
        );
    }
}