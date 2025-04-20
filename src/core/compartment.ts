import { Entity } from './entity';

/**
 * Represents a single area within a Location (like a room on a ship).
 */
export class Compartment {
    name: string;
    description: string;
    exits: Map<string, Compartment>; // Direction -> Connected Compartment
    entities: Entity[]; // Entities currently in this compartment

    constructor(name: string, description: string) {
        this.name = name;
        this.description = description;
        this.exits = new Map<string, Compartment>();
        this.entities = [];
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
        let exitList = Array.from(this.exits.keys()).join(', ');
        if (!exitList) {
            exitList = 'none';
        }
        return `${this.description}\nExits: ${exitList}`;
    }

    // Basic methods for entity management (can be expanded later)
    addEntity(entity: Entity): void {
        this.entities.push(entity);
    }

    removeEntity(entity: Entity): void {
        this.entities = this.entities.filter(e => e !== entity);
    }
}