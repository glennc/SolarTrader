import { WorldManager } from './world-manager';
import { InterfaceManager } from './interface-manager';
import { SystemInterface } from '../interfaces/system-interfaces';

/**
 * Parses user input strings into game commands and executes them.
 */
export class CommandParser {
    private worldManager: WorldManager;
    private interfaceManager: InterfaceManager;
    
    // Common interaction verbs that the player might use
    private interactionVerbs: string[] = [
        'examine', 'look at', 'inspect', 'check',  // Observation
        'use', 'activate', 'operate', 'start',     // Activation
        'open', 'close', 'lock', 'unlock',         // State changes
        'push', 'pull', 'turn', 'press',           // Physical interactions
        'take', 'get', 'grab', 'pick up',          // Item acquisition
        'drop', 'put down', 'place',               // Item placement
        'read', 'access',                          // Information retrieval
        'repair', 'fix', 'maintain'                // Maintenance
    ];

    constructor(worldManager: WorldManager, interfaceManager: InterfaceManager) {
        this.worldManager = worldManager;
        this.interfaceManager = interfaceManager;
        console.log("CommandParser initialized.");
    }

    /**
     * Parses the raw input string from the user.
     * @param rawInput The raw string entered by the user.
     */
    parse(rawInput: string): void {
        const input = rawInput.trim().toLowerCase();
        if (!input) {
            return; // Ignore empty input
        }

        console.log(`CommandParser: Parsing input "${input}"`);
        
        // Check if we're in a system interface mode
        if (this.interfaceManager['activeSystemInterface']) {
            this.handleSystemInterfaceCommand(input);
            return;
        }

        // Split input into words
        const parts = input.split(/\s+/); // Split by whitespace
        let command = parts[0];
        let argument = parts.length > 1 ? parts.slice(1).join(" ") : null;

        // Handle movement commands
        const moveResult = this.handleMovementCommand(command, argument);
        if (moveResult) {
            return; // Movement command was handled
        }
        
        // Handle general look command (no specific target)
        if ((command === "look" || command === "l") && !argument) {
            console.log("CommandParser: Executing LOOK command.");
            this.interfaceManager.render(); // Re-render the current view
            return;
        }
        
        // Handle interactions with objects
        const interactionResult = this.handleInteractionCommand(input);
        if (interactionResult) {
            return; // Interaction was handled
        }
        
        // Handle help command
        if (command === "help") {
            this.displayHelp();
            return;
        }
        
        // If we get here, the command wasn't recognized
        console.log(`CommandParser: Unknown command "${input}".`);
        this.outputMessage(`Unknown command: "${input}". Type "help" for a list of commands.`);
    }
    
    /**
     * Handle system interface commands
     */
    private handleSystemInterfaceCommand(input: string): void {
        // Check for exit commands first
        if (input.toLowerCase() === 'exit' || 
            input.toLowerCase() === 'back' || 
            input.toLowerCase() === 'quit' || 
            input.toLowerCase() === 'return') {
            
            console.log("CommandParser: Executing EXIT command from system interface.");
            this.interfaceManager.returnToFirstPerson();
            return;
        }
        
        // Handle other system interface commands
        // For now, we just pass these through to the interface manager
        this.interfaceManager.handleInput(input);
    }
    
    /**
     * Handle movement commands
     * @returns true if the command was a movement command, false otherwise
     */
    private handleMovementCommand(command: string, argument: string | null): boolean {
        // Simple movement command parsing (can be expanded significantly)
        // Common movement commands: go <direction>, n, s, e, w, u, d
        const moveKeywords = ["go", "move", "walk", "run"];
        const directionAliases: { [key: string]: string } = {
            "n": "north", "north": "north",
            "s": "south", "south": "south",
            "e": "east", "east": "east",
            "w": "west", "west": "west",
            "u": "up", "up": "up", 
            "d": "down", "down": "down",
            "fore": "fore", "forward": "fore", "f": "fore",
            "aft": "aft", "a": "aft", "backward": "aft", "back": "aft",
            "port": "port", "p": "port", "left": "port",
            "starboard": "starboard", "sb": "starboard", "right": "starboard"
        };

        let direction: string | null = null;

        if (directionAliases[command]) {
            // Single-word direction command (e.g., "north", "n")
            direction = directionAliases[command];
        } else if (moveKeywords.includes(command) && argument && directionAliases[argument]) {
            // Multi-word command (e.g., "go north")
            direction = directionAliases[argument];
        }

        if (direction) {
            console.log(`CommandParser: Executing MOVE command (Direction: ${direction}).`);
            const moveSuccessful = this.worldManager.movePlayer(direction);
            if (moveSuccessful) {
                // Re-render the view after successful movement
                this.interfaceManager.render();
            } else {
                // Provide feedback for failed movement
                this.outputMessage(`You can't go ${direction} from here.`);
            }
            return true;
        }
        
        return false;
    }
    
    /**
     * Handle interactions with objects
     * @returns true if the command was an interaction, false otherwise
     */
    private handleInteractionCommand(input: string): boolean {
        const currentCompartment = this.worldManager.getCurrentCompartment();
        if (!currentCompartment) {
            return false;
        }
        
        // Attempt to extract a verb and object from the input
        const { verb, object } = this.extractVerbAndObject(input);
        
        if (!verb || !object) {
            return false; // Not an interaction command
        }
        
        // Find the object to interact with
        const interactableObject = currentCompartment.findInteractableObject(object);
        
        if (!interactableObject) {
            this.outputMessage(`You don't see a ${object} here.`);
            return true; // It was an interaction attempt, even though it failed
        }
        
        // Check if this is a system interface object
        if (this.isSystemInterface(interactableObject) && 
            ['use', 'access', 'interact', 'operate', 'repair', 'check'].includes(verb)) {
            
            // Set the interface manager on the system interface if needed
            const sysInterface = interactableObject as unknown as SystemInterface;
            if ('setInterfaceManager' in sysInterface) {
                (sysInterface as any).setInterfaceManager(this.interfaceManager);
            }
            
            // Let the interact method handle the transition to system interface
            const result = interactableObject.interact(verb);
            this.outputMessage(result);
            return true;
        }
        
        // Standard interaction
        const result = interactableObject.interact(verb);
        this.outputMessage(result);
        
        return true;
    }
    
    /**
     * Check if an object implements the SystemInterface
     */
    private isSystemInterface(obj: any): boolean {
        return obj && 'renderInterface' in obj;
    }
    
    /**
     * Extract a verb and object from an input string
     * Example: "examine console" -> { verb: "examine", object: "console" }
     */
    private extractVerbAndObject(input: string): { verb: string | null, object: string | null } {
        // Special case for "look at" which is two words
        if (input.startsWith("look at ")) {
            const object = input.substring("look at ".length).trim();
            return { verb: "look at", object: this.cleanObjectName(object) };
        }
        
        // Try to match against our known interaction verbs
        for (const verb of this.interactionVerbs) {
            if (input.startsWith(verb + " ")) {
                const object = input.substring(verb.length).trim();
                return { verb, object: this.cleanObjectName(object) };
            }
        }
        
        // No matching verb found
        return { verb: null, object: null };
    }
    
    /**
     * Removes articles and normalizes object names
     * Converts "the nav console", "a chair", etc. to "nav console", "chair"
     */
    private cleanObjectName(objectName: string): string {
        // Remove leading articles (the, a, an)
        return objectName.replace(/^(the|a|an)\s+/i, '');
    }
    
    /**
     * Display help information
     */
    private displayHelp(): void {
        const helpText = `
SOLAR CLIPPER: FIRST LIGHT - Command Help

Movement:
  go [direction]   - Move in a direction (north, south, east, west, up, down, fore, aft, port, starboard)
  n, s, e, w, etc. - Shorthand for directions

Looking:
  look             - Look around the current compartment
  examine [object] - Look at a specific object
  look at [object] - Same as examine

Interactions:
  use [object]     - Use or operate an object
  access [object]  - Access a system interface
  repair [object]  - Attempt to repair an object
  take [object]    - Try to pick up an object
  open [object]    - Try to open an object
  
System Interfaces:
  exit, back       - Return to first-person view from a system interface
  
Other:
  help             - Show this help text
`;
        this.outputMessage(helpText);
    }
    
    /**
     * Output a message to the player
     */
    private outputMessage(message: string): void {
        if (this.interfaceManager.renderer) {
            this.interfaceManager.renderer.updateOutput(message);
        } else {
            console.log(`OUTPUT: ${message}`);
        }
    }
}