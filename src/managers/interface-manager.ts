import { UserInterface } from '../interfaces/base-interface';
import { DOMRenderer } from '../interfaces/dom-renderer';
import { WorldManager } from './world-manager';

/**
 * Manages the active user interface (view) and coordinates rendering.
 */
export class InterfaceManager {
    private activeInterface: UserInterface | null;
    private renderer: DOMRenderer;
    private worldManager: WorldManager; // To provide context to the interface

    constructor(renderer: DOMRenderer, worldManager: WorldManager) {
        this.activeInterface = null;
        this.renderer = renderer;
        this.worldManager = worldManager;
        console.log("InterfaceManager initialized.");
    }

    /**
     * Sets the currently active user interface.
     * @param ui The UserInterface instance to activate.
     */
    setActiveInterface(ui: UserInterface): void {
        this.activeInterface = ui;
        this.activeInterface.setRenderer(this.renderer); // Provide renderer access
        this.activeInterface.setWorldManager(this.worldManager); // Provide world context
        console.log(`InterfaceManager: Active interface set to ${ui.constructor.name}.`);
        this.render(); // Initial render of the new interface
    }

    /**
     * Triggers the active interface to render the current game state.
     */
    render(): void {
        if (this.activeInterface) {
            this.activeInterface.render();
        } else {
            console.warn("InterfaceManager: Cannot render, no active interface set.");
            // Optionally render a default message via renderer
            this.renderer.updateOutput("No active view.");
        }
    }

    /**
     * Passes user input to the active interface for handling.
     * (Currently not used directly, CommandParser handles input first)
     * @param input The user input string.
     */
    handleInput(input: string): void {
        if (this.activeInterface) {
            this.activeInterface.handleInput(input);
        } else {
            console.warn("InterfaceManager: Cannot handle input, no active interface set.");
        }
    }
}