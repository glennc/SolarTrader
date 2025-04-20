import { UserInterface } from '../interfaces/base-interface';
import { DOMRenderer } from '../interfaces/dom-renderer';
import { WorldManager } from './world-manager';

/**
 * Manages the active user interface (view) and coordinates rendering.
 */
export class InterfaceManager {
    private activeInterface: UserInterface | null;
    private interfaces: Map<string, UserInterface>;
    public renderer: DOMRenderer;
    private worldManager: WorldManager | null; // To provide context to the interface

    constructor(renderer: DOMRenderer) {
        this.activeInterface = null;
        this.interfaces = new Map<string, UserInterface>();
        this.renderer = renderer;
        this.worldManager = null;
        console.log("InterfaceManager initialized.");
    }

    /**
     * Sets the world manager reference
     */
    setWorldManager(worldManager: WorldManager): void {
        this.worldManager = worldManager;
    }

    /**
     * Registers a user interface with the manager
     * @param name The name identifier for the interface
     * @param ui The UserInterface instance to register
     */
    registerInterface(name: string, ui: UserInterface): void {
        this.interfaces.set(name, ui);
        console.log(`InterfaceManager: Registered interface "${name}".`);
    }

    /**
     * Sets the currently active user interface by name.
     * @param name The name of the interface to activate
     */
    setActiveInterface(name: string): void {
        const ui = this.interfaces.get(name);
        if (!ui) {
            console.error(`InterfaceManager: No interface registered with name "${name}".`);
            return;
        }
        
        this.activeInterface = ui;
        
        // Provide necessary resources to the interface
        this.activeInterface.setRenderer(this.renderer);
        
        if (this.worldManager) {
            this.activeInterface.setWorldManager(this.worldManager);
        }
        
        console.log(`InterfaceManager: Active interface set to "${name}".`);
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