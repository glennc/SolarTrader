import { Ship } from '../core/ship';
import { Player } from '../core/player';
import { Compartment } from '../core/compartment';

/**
 * Manages the game world state, including the current location (ship)
 * and the player's position within it.
 */
export class WorldManager {
    private currentShip: Ship | null;
    private player: Player;

    constructor() {
        this.currentShip = null;
        this.player = new Player(); // Create the player instance
    }

    /**
     * Sets the active ship for the game world.
     * @param ship The Ship instance.
     */
    loadShip(ship: Ship): void {
        this.currentShip = ship;
        console.log(`WorldManager: Loaded ship "${ship.name}".`);
    }

    /**
     * Places the player in a specific starting compartment.
     * @param startCompartmentName The name of the compartment to start in.
     */
    setPlayerStartLocation(startCompartmentName: string): void {
        if (!this.currentShip) {
            console.error("WorldManager: Cannot set player location, no ship loaded.");
            return;
        }
        const compartment = this.currentShip.getCompartment(startCompartmentName);
        if (compartment) {
            this.player.moveTo(compartment, this.currentShip);
            console.log(`WorldManager: Player placed in "${startCompartmentName}".`);
        } else {
            console.error(`WorldManager: Start compartment "${startCompartmentName}" not found on ship "${this.currentShip.name}".`);
        }
    }

    /**
     * Attempts to move the player in a given direction from their current compartment.
     * @param direction The direction to move (e.g., "north", "east").
     * @returns True if the move was successful, false otherwise.
     */
    movePlayer(direction: string): boolean {
        const currentCompartment = this.player.currentCompartment;
        if (!currentCompartment) {
            console.error("WorldManager: Player has no current compartment to move from.");
            return false;
        }

        const targetCompartment = currentCompartment.exits.get(direction.toLowerCase());
        if (targetCompartment) {
            this.player.moveTo(targetCompartment);
            return true;
        } else {
            console.log(`WorldManager: Cannot move ${direction} from ${currentCompartment.name}. No exit found.`);
            return false;
        }
    }

    /**
     * Gets the player object.
     */
    getPlayer(): Player {
        return this.player;
    }

    /**
     * Gets the current compartment the player is in.
     */
    getCurrentCompartment(): Compartment | null {
        return this.player.currentCompartment;
    }

    /**
     * Gets the currently loaded ship.
     */
    getCurrentShip(): Ship | null {
        return this.currentShip;
    }
}