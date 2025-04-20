import { Ship } from './core/ship';
import { Compartment } from './core/compartment';
import { WorldManager } from './managers/world-manager';
import { InterfaceManager } from './managers/interface-manager';
import { CommandParser } from './managers/command-parser';
import { DOMRenderer } from './interfaces/dom-renderer';
import { FirstPersonView } from './interfaces/first-person-view';

// --- Initialization ---
console.log("Solar Clipper initializing...");

// 1. Create Core Components
const solarClipper = new Ship("Solar Clipper Mk. I", "A standard light freighter.");
const bridge = new Compartment("Bridge", "The command center of the ship. Consoles hum quietly.");
const corridor = new Compartment("Corridor", "A narrow metal corridor connecting various sections.");
const engineering = new Compartment("Engineering", "The engine room, filled with the constant thrum of machinery.");

// 2. Connect Compartments (using bi-directional exits)
bridge.addExit("south", corridor, "north");
corridor.addExit("east", engineering, "west");
// Add more connections as needed (e.g., Cargo Hold if defined)

// 3. Add Compartments to the Ship
solarClipper.addCompartment(bridge);
solarClipper.addCompartment(corridor);
solarClipper.addCompartment(engineering);

// 4. Initialize Managers
//    - DOMRenderer needs the IDs of the HTML elements
const renderer = new DOMRenderer('game-output', 'location-display', 'command-input');
const worldManager = new WorldManager();
const interfaceManager = new InterfaceManager(renderer, worldManager);
const commandParser = new CommandParser(worldManager, interfaceManager);

// 5. Load the Ship and Place the Player
worldManager.loadShip(solarClipper);
worldManager.setPlayerStartLocation("Bridge"); // Start the player on the Bridge

// 6. Set the Initial User Interface
const firstPersonView = new FirstPersonView();
interfaceManager.setActiveInterface(firstPersonView); // This triggers the initial render

// --- Input Handling ---
const inputElement = document.getElementById('command-input') as HTMLInputElement;
const inputForm = document.getElementById('input-form'); // Assuming form wraps input and button

if (inputElement && inputForm) {
    inputForm.addEventListener('submit', (event) => {
        event.preventDefault(); // Prevent default form submission (page reload)
        const command = inputElement.value;
        if (command.trim()) {
            // Display command entered by player
            renderer.updateOutput(`> ${command}`);
            // Parse and execute the command
            commandParser.parse(command);
            // Clear the input field
            renderer.clearInput();
        }
         // Keep focus on input
        renderer.focusInput();
    });

    // Initial focus
    renderer.focusInput();

} else {
    console.error("Initialization failed: Could not find input form or command input element.");
    renderer.updateOutput("Error: Game input components not found in HTML.");
}

console.log("Solar Clipper initialization complete. Ready for input.");