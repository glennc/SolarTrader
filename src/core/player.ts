import { Entity } from './entity';
import { Location } from './location';
import { Compartment } from './compartment';

/**
 * Represents the player character in the game.
 */
export class Player implements Entity {
    name: string;
    currentLocation: Location | null; // The broader location (e.g., the Ship)
    currentCompartment: Compartment | null; // The specific compartment within the location

    constructor(name: string = "Player") {
        this.name = name;
        this.currentLocation = null;
        this.currentCompartment = null;
    }

    /**
     * Moves the player to a new compartment.
     * Updates both currentCompartment and potentially currentLocation if moving between locations (though not applicable yet).
     * @param compartment The target compartment.
     * @param location The location containing the compartment (optional, defaults to current).
     */
    moveTo(compartment: Compartment, location?: Location): void {
        this.currentCompartment = compartment;
        if (location) {
            this.currentLocation = location;
        } else if (!this.currentLocation && compartment) {
            // Attempt to infer location if not provided and player wasn't anywhere
            // This is a placeholder assumption, might need refinement
            console.warn("Player moved to compartment without explicit location update.");
        }
        console.log(`${this.name} moved to ${compartment.name}.`);
    }
}