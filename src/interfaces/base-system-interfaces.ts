import { BaseInteractableObject } from '../core/interactable-object';
import { InterfaceManager } from '../managers/interface-manager';
import { DOMCSSLoader } from './dom-css-loader';

/**
 * Interface for objects that can display a dedicated system interface
 * This extends the basic InteractableObject with the ability to show a specialized interface
 */
export interface SystemInterface {
    /**
     * Renders this system's interface to the DOM
     * @returns A function to call when exiting the interface
     */
    renderInterface(): () => void;
}

/**
 * Base class for system interfaces in the ship
 */
export abstract class BaseSystemInterface extends BaseInteractableObject implements SystemInterface {
    protected interfaceManager: InterfaceManager | null = null;
    protected loadedStylesheetId: string | null = null;
    protected cssLoader: DOMCSSLoader = new DOMCSSLoader();
    
    /**
     * Sets the interface manager reference
     */
    setInterfaceManager(manager: InterfaceManager): void {
        this.interfaceManager = manager;
    }
    
    /**
     * Loads CSS for this system interface
     * @param cssPath Path to the CSS file
     * @param id Unique identifier for the stylesheet
     */
    protected loadInterfaceCSS(cssPath: string, id: string): void {
        this.cssLoader.loadCSS(cssPath, id);
        this.loadedStylesheetId = id;
    }
    
    /**
     * Unloads CSS for this system interface
     */
    protected unloadInterfaceCSS(): void {
        if (this.loadedStylesheetId) {
            this.cssLoader.unloadCSS(this.loadedStylesheetId);
            this.loadedStylesheetId = null;
        }
    }
    
    /**
     * Renders this system's interface to the DOM
     * This must be implemented by specific system interfaces
     * @param renderer The DOM renderer to use
     * @returns A function to call when exiting the interface
     */
    abstract renderInterface(): () => void;
    
    /**
     * Override the default interact method to handle using the system
     */
    interact(verb: string): string {
        verb = verb.toLowerCase();
        
        if (verb === 'examine' || verb === 'look at') {
            return this.description;
        }
        
        if (verb === 'use' || verb === 'access' || verb === 'interact') {
            if (this.interfaceManager) {
                this.interfaceManager.showSystemInterface(this);
                return `You access the ${this.name}.`;
            } else {
                return `You try to use the ${this.name}, but nothing happens.`;
            }
        }
        
        if (!this.supportedInteractions.includes(verb)) {
            return `You can't ${verb} the ${this.name}.`;
        }
        
        return `You ${verb} the ${this.name}.`;
    }
}