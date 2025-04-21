import { UserInterface } from '../interfaces/base-interface';
import { DOMRenderer } from '../interfaces/dom-renderer';
import { SystemInterface } from '../interfaces/system-interfaces';
import { WorldManager } from './world-manager';
import { TimeManager } from './time-manager';
import { DOMCSSLoader } from '../interfaces/dom-css-loader';

/**
 * Manages the active user interface (view) and coordinates rendering.
 */
export class InterfaceManager {
    private activeInterface: UserInterface | null;
    private activeSystemInterface: SystemInterface | null;
    private interfaces: Map<string, UserInterface>;
    public renderer: DOMRenderer;
    private worldManager: WorldManager | null; // To provide context to the interface
    private timeManager: TimeManager | null; // To provide time management to interfaces
    private cleanupFunction: (() => void) | null = null;
    private cssLoader: DOMCSSLoader;

    constructor(renderer: DOMRenderer) {
        this.activeInterface = null;
        this.activeSystemInterface = null;
        this.interfaces = new Map<string, UserInterface>();
        this.renderer = renderer;
        this.worldManager = null;
        this.timeManager = null;
        this.cssLoader = new DOMCSSLoader();
        console.log("InterfaceManager initialized.");
    }

    /**
     * Sets the world manager reference
     */
    setWorldManager(worldManager: WorldManager): void {
        this.worldManager = worldManager;
    }

    /**
     * Sets the time manager reference
     */
    setTimeManager(timeManager: TimeManager): void {
        this.timeManager = timeManager;
    }

    /**
     * Gets the time manager instance
     */
    getTimeManager(): TimeManager | null {
        return this.timeManager;
    }

    /**
     * Gets the CSS loader instance
     */
    getCSSLoader(): DOMCSSLoader {
        return this.cssLoader;
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
        // If we're exiting a system interface, clean up
        if (this.activeSystemInterface) {
            this.exitSystemInterface();
        }
        
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
     * Displays a system interface, temporarily replacing the first person view
     */
    showSystemInterface(system: SystemInterface): void {
        if (!this.activeInterface) {
            console.error("InterfaceManager: Cannot show system interface, no active interface to return to.");
            return;
        }
        
        // Store the current system interface
        this.activeSystemInterface = system;
        
        // Create interface container if it doesn't exist
        let interfaceContainer = document.getElementById('interface-container');
        if (!interfaceContainer) {
            interfaceContainer = document.createElement('div');
            interfaceContainer.id = 'interface-container';
            
            // Find the terminal container to append the interface container
            const terminalContainer = document.querySelector('.terminal-container');
            if (terminalContainer) {
                terminalContainer.appendChild(interfaceContainer);
                console.log("InterfaceManager: Created interface container");
            } else {
                console.error("InterfaceManager: Cannot find terminal container");
                return;
            }
        } else {
            // Clear the interface container if it already exists
            interfaceContainer.innerHTML = '';
        }
        
        // Expand the terminal container for system interface mode
        const terminalContainer = document.querySelector('.terminal-container');
        if (terminalContainer) {
            terminalContainer.classList.add('system-mode');
        }
        
        // If system needs TimeManager, provide it before rendering
        if ('setTimeManager' in system && this.timeManager) {
            (system as any).setTimeManager(this.timeManager);
        }
        
        // If system needs CSSLoader, provide it before rendering
        if ('setCssLoader' in system) {
            (system as any).setCssLoader(this.cssLoader);
        }
        
        // If system needs InterfaceManager, provide it before rendering
        if ('setInterfaceManager' in system) {
            (system as any).setInterfaceManager(this);
        }
        
        // Hide the terminal output and input temporarily
        const terminalOutput = document.querySelector('.terminal-output');
        const terminalInputLine = document.querySelector('.terminal-input-line');
        
        if (terminalOutput) {
            (terminalOutput as HTMLElement).style.display = 'none';
        }
        
        if (terminalInputLine) {
            (terminalInputLine as HTMLElement).style.display = 'none';
        }
        
        // Render the system interface
        const cleanup = system.renderInterface();
        this.cleanupFunction = () => {
            if (cleanup) cleanup();
            
            // Restore terminal output and input
            if (terminalOutput) {
                (terminalOutput as HTMLElement).style.display = '';
            }
            
            if (terminalInputLine) {
                (terminalInputLine as HTMLElement).style.display = '';
            }
            
            // Remove interface container content
            if (interfaceContainer) {
                interfaceContainer.innerHTML = '';
            }
        };
        
        console.log(`InterfaceManager: Showing system interface.`);
    }
    
    /**
     * Returns to the first person view from a system interface
     */
    returnToFirstPerson(): void {
        if (!this.activeSystemInterface) {
            console.warn("InterfaceManager: No system interface active to return from.");
            return;
        }
        
        // Restore original terminal size
        const terminalContainer = document.querySelector('.terminal-container');
        if (terminalContainer) {
            terminalContainer.classList.remove('system-mode');
        }
        
        this.exitSystemInterface();
        
        // Re-render the first person view
        this.render();
        
        console.log("InterfaceManager: Returned to first person view.");
    }
    
    /**
     * Exits the current system interface with cleanup
     */
    private exitSystemInterface(): void {
        // Execute cleanup function if it exists
        if (this.cleanupFunction) {
            this.cleanupFunction();
            this.cleanupFunction = null;
        }
        
        this.activeSystemInterface = null;
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
        // If we're in a system interface, certain commands should exit it
        if (this.activeSystemInterface && (input.toLowerCase() === 'exit' || input.toLowerCase() === 'back')) {
            this.returnToFirstPerson();
            return;
        }
        
        if (this.activeInterface) {
            this.activeInterface.handleInput(input);
        } else {
            console.warn("InterfaceManager: Cannot handle input, no active interface set.");
        }
    }
}