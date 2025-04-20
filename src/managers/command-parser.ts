import { WorldManager } from './world-manager';
import { InterfaceManager } from './interface-manager';

/**
 * Parses user input strings into game commands and executes them.
 */
export class CommandParser {
    private worldManager: WorldManager;
    private interfaceManager: InterfaceManager;

    constructor(worldManager: WorldManager, interfaceManager: InterfaceManager) {
        this.worldManager = worldManager;
        this.interfaceManager = interfaceManager;
        console.log("CommandParser initialized.");
    }

    /**
     * Parses the raw input string from the user.
     * For now, it only handles basic movement commands.
     * @param rawInput The raw string entered by the user.
     */
    parse(rawInput: string): void {
        const input = rawInput.trim().toLowerCase();
        if (!input) {
            return; // Ignore empty input
        }

        console.log(`CommandParser: Parsing input "${input}"`);

        // Simple movement command parsing (can be expanded significantly)
        // Common movement commands: go <direction>, n, s, e, w, u, d
        const moveKeywords = ["go", "move", "walk", "run"];
        const directionAliases: { [key: string]: string } = {
            "n": "north", "north": "north",
            "s": "south", "south": "south",
            "e": "east", "east": "east",
            "w": "west", "west": "west",
            "u": "up", "up": "up", // Assuming 'up'/'down' might be valid exits
            "d": "down", "down": "down"
        };

        const parts = input.split(/\s+/); // Split by whitespace
        let command = parts[0];
        let argument = parts.length > 1 ? parts.slice(1).join(" ") : null;

        let direction: string | null = null;

        if (directionAliases[command]) {
            // Single-word direction command (e.g., "north", "n")
            direction = directionAliases[command];
        } else if (moveKeywords.includes(command) && argument && directionAliases[argument]) {
            // Multi-word command (e.g., "go north")
            direction = directionAliases[argument];
        } else if (command === "look" || command === "l") {
             // Handle 'look' command - just re-render
             console.log("CommandParser: Executing LOOK command.");
             this.interfaceManager.render(); // Re-render the current view
             return; // Exit after handling look
        }


        if (direction) {
            console.log(`CommandParser: Executing MOVE command (Direction: ${direction}).`);
            const moveSuccessful = this.worldManager.movePlayer(direction);
            if (moveSuccessful) {
                // Re-render the view after successful movement
                this.interfaceManager.render();
            } else {
                // Optionally provide feedback via the interface/renderer
                // For now, WorldManager logs the failure. We could add:
                // this.interfaceManager.renderer.updateOutput("You can't go that way.");
            }
        } else {
            console.log(`CommandParser: Unknown command "${input}".`);
            // Provide feedback for unknown commands
            // this.interfaceManager.renderer.updateOutput(`Unknown command: "${input}"`);
            // For now, just log it.
        }
    }
}