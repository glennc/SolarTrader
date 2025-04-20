import { UserInterface } from './base-interface';
import { DOMRenderer } from './dom-renderer';
import { WorldManager } from '../managers/world-manager';
import { Compartment } from '../core/compartment';
import { InteractableObject } from '../core/interactable-object';

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
            
            // Clear previous output and start fresh
            this.renderer.clearOutput();
            
            // Display the room name and description with enhanced styling
            this.renderer.displayRoom(
                currentCompartment.name, 
                currentCompartment.description
            );
            
            // Show any special notifications for this compartment
            this.displayCompartmentStatus(currentCompartment);
            
            // List objects in the compartment
            this.displayInteractableObjects(currentCompartment);
            
            // Show available exits
            this.displayExits(currentCompartment);
        } else {
            this.renderer.updateLocation("Unknown Location");
            this.renderer.clearOutput();
            this.renderer.updateOutput("<div class='error'>Error: Unable to determine your location.</div>");
        }
        
        // Ensure input is focused after rendering
        this.renderer.focusInput();
    }
    
    /**
     * Displays any special status messages for the compartment
     */
    private displayCompartmentStatus(compartment: Compartment): void {
        if (!this.renderer) return;
        
        // This is where you'd check for any special conditions in the compartment
        // For example, if an engine is damaged, or if there's an environmental hazard
        
        // For now, let's add a sample notification for certain compartments
        if (compartment.name === 'Engine Room') {
            this.renderer.displayNotification(
                'Engine coolant pressure has dropped to 76% - recommended maintenance required',
                true // warning = true
            );
        }
    }
    
    /**
     * Displays interactable objects in the compartment
     */
    private displayInteractableObjects(compartment: Compartment): void {
        if (!this.renderer) return;
        
        // Get objects directly from the interactableObjects property
        const objects = compartment.interactableObjects;
        
        if (objects.length > 0) {
            const objectNames = objects.map((obj: InteractableObject) => obj.name);
            
            // Identify which objects are system interfaces (have renderInterface method)
            // These will trigger "use" command instead of "examine" when clicked
            const systemInterfaceNames = objects
                .filter(obj => 'renderInterface' in obj)
                .map(obj => obj.name);
            
            this.renderer.displayObjects(objectNames, systemInterfaceNames);
        }
    }
    
    /**
     * Displays available exits from the compartment
     */
    private displayExits(compartment: Compartment): void {
        if (!this.renderer) return;
        
        // Get exits from the exits map property
        const exits = Array.from(compartment.exits.keys());
        
        if (exits.length > 0) {
            this.renderer.displayExits(exits);
        }
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