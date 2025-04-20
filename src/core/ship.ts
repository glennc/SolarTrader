import { Location } from './location';
import { Compartment } from './compartment';

/**
 * Represents the player's ship, which is a specific type of Location
 * composed of interconnected Compartments.
 */
export class Ship implements Location {
    name: string;
    description: string;
    compartments: Map<string, Compartment>; // Map compartment name to Compartment instance

    constructor(name: string, description: string) {
        this.name = name;
        this.description = description;
        this.compartments = new Map<string, Compartment>();
    }

    /**
     * Adds a compartment to the ship.
     * @param compartment The compartment instance to add.
     */
    addCompartment(compartment: Compartment): void {
        if (this.compartments.has(compartment.name)) {
            console.warn(`Ship already contains a compartment named "${compartment.name}". Overwriting.`);
        }
        this.compartments.set(compartment.name, compartment);
    }

    /**
     * Retrieves a compartment by its name.
     * @param name The name of the compartment.
     * @returns The Compartment instance or undefined if not found.
     */
    getCompartment(name: string): Compartment | undefined {
        return this.compartments.get(name);
    }
}