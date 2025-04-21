import { SpecializedInteractableObject } from './specialized-object';
import { SystemInterface } from '../../interfaces/system-interfaces';
import { TimeSkipInterface } from '../../interfaces/components/time-skip-interface';
import { InterfaceManager } from '../../managers/interface-manager';

/**
 * Captain's Chair - Provides access to time skip functionality when sitting in it
 * Implements SystemInterface to be properly recognized as a system
 */
export class CaptainsChair extends SpecializedInteractableObject implements SystemInterface {
    private timeSkipInterface: TimeSkipInterface | null = null;
    
    constructor() {
        super(
            'Captain\'s Chair',
            'The command seat with integrated control panels.',
            'A well-worn but comfortable chair positioned for optimal view of all bridge systems. Small control panels are built into each armrest, offering quick access to essential ship functions including time management. The synthetic leather is cracked in places from years of use.',
            false, // Not portable
            ['chair', 'command chair', 'seat', 'captains chair', 'captain\'s chair'],
            ['examine', 'look at', 'use', 'sit', 'sit on', 'access']
        );
    }
    
    /**
     * Set the interface manager to use when activating the chair
     * Override the parent method to ensure proper setup
     */
    override setInterfaceManager(interfaceManager: InterfaceManager): void {
        // Call parent implementation
        super.setInterfaceManager(interfaceManager);
        
        // If we already have a time skip interface, update its reference too
        if (this.timeSkipInterface) {
            this.timeSkipInterface.setInterfaceManager(interfaceManager);
        }
    }
    
    /**
     * Handle specialized interactions with the captain's chair
     */
    protected handleSpecializedInteraction(verb: string): string | null {
        verb = verb.toLowerCase();
        
        if (verb === 'use' || verb === 'sit' || verb === 'sit on' || verb === 'access') {
            if (this.interfaceManager) {
                // Use the interfaceManager to show the system interface (this)
                this.interfaceManager.showSystemInterface(this);
                return "You sit in the captain's chair and activate the time management controls.";
            } else {
                return "You sit in the captain's chair. The armrest controls would allow you to manage ship systems if properly initialized.";
            }
        }
        
        return null; // Not handled by specialized behavior
    }
    
    /**
     * Implements the SystemInterface renderInterface method
     * This allows the object to be recognized as a system interface
     */
    renderInterface(): () => void {
        // Find the correct container to render into
        const interfaceContainer = document.getElementById('interface-container');
        if (!interfaceContainer) {
            console.error("Captain's Chair: Interface container not found");
            return () => {};
        }
        
        // Create the time skip interface if it doesn't exist yet
        if (!this.timeSkipInterface && this.interfaceManager) {
            const timeManager = this.interfaceManager.getTimeManager();
            const cssLoader = this.interfaceManager.getCSSLoader();
            
            if (timeManager && cssLoader) {
                // Create TimeSkipInterface with the proper container
                this.timeSkipInterface = new TimeSkipInterface(
                    interfaceContainer, // Use the interface container, not app or body
                    timeManager,
                    this.interfaceManager.renderer,
                    cssLoader
                );
                
                // Set the interface manager on the time skip interface
                this.timeSkipInterface.setInterfaceManager(this.interfaceManager);
                
                console.log("Captain's Chair: Created time skip interface with interface manager:", 
                            this.interfaceManager ? "available" : "not available");
            }
        }
        
        // If we have a time skip interface, render it
        if (this.timeSkipInterface) {
            // Make sure interface manager is properly set before rendering
            if (this.interfaceManager && this.timeSkipInterface) {
                this.timeSkipInterface.setInterfaceManager(this.interfaceManager);
            }
            
            return this.timeSkipInterface.renderInterface();
        }
        
        // Fallback return empty cleanup function
        return () => {};
    }
}