import { UserInterface } from './base-interface';
import { DOMRenderer } from './dom-renderer';
import { WorldManager } from '../managers/world-manager';
import { Compartment } from '../core/compartment';

/**
 * Implements the UserInterface to provide a classic text-adventure style
 * first-person view of the current compartment.
 */
export class FirstPersonView implements UserInterface {
    private renderer: DOMRenderer | null = null;
    private worldManager: WorldManager | null = null;

    constructor() {
        console.log("FirstPersonView created.");
    }

    setRenderer(renderer: DOMRenderer): void {
        this.renderer = renderer;
    }

    setWorldManager(worldManager: WorldManager): void {
        this.worldManager = worldManager;
    }

    /**
     * Renders the current compartment's details to the DOM.
     */
    render(): void {
        if (!this.renderer || !this.worldManager) {
            console.error("FirstPersonView: Renderer or WorldManager not set.");
            return;
        }

        const currentCompartment = this.worldManager.getCurrentCompartment();

        if (currentCompartment) {
            // Update location display
            this.renderer.updateLocation(currentCompartment.name);
            // Clear previous output and show current description/exits
            // Note: Clearing might not always be desired, depends on game flow.
            // Let's clear for now for a clean look on each render.
            this.renderer.clearOutput();
            this.renderer.updateOutput(currentCompartment.getLookDescription());
        } else {
            this.renderer.updateLocation("Unknown Location");
            this.renderer.clearOutput();
            this.renderer.updateOutput("You are nowhere.");
        }
         // Ensure input is focused after rendering
        this.renderer.focusInput();
    }

    /**
     * Handles input - currently, input is processed by CommandParser first,
     * so this might not be directly used unless the view needs specific input handling.
     * @param input The user input string.
     */
    handleInput(input: string): void {
        // Placeholder - CommandParser handles general commands.
        // This could be used for view-specific interactions later.
        console.log(`FirstPersonView received input (but CommandParser handles it): ${input}`);
    }
}