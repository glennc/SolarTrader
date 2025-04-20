import { DOMRenderer } from '../dom-renderer';
import { UserInterface } from '../base-interface';
import { WorldManager } from '../../managers/world-manager';

/**
 * Interface for all terminal interfaces in the game
 * This extends the basic UserInterface with terminal-specific functionality
 */
export interface TerminalInterface extends UserInterface {
    /**
     * Unique identifier for this terminal type
     */
    readonly id: string;
    
    /**
     * Display name for this terminal
     */
    readonly name: string;
    
    /**
     * Render the terminal interface
     * This is called when the terminal is first accessed
     */
    renderTerminal(): void;
    
    /**
     * Handle terminal-specific commands
     * @param command The command to handle
     * @returns True if the command was handled, false otherwise
     */
    handleTerminalCommand(command: string): boolean;
    
    /**
     * Exit the terminal interface
     * This is called when the user exits the terminal
     */
    exitTerminal(): void;
}

/**
 * Base class for all terminal interfaces in the game
 * Provides common functionality for all terminal types
 */
export abstract class BaseTerminalInterface implements TerminalInterface {
    readonly id: string;
    readonly name: string;
    protected renderer: DOMRenderer | null = null;
    protected worldManager: WorldManager | null = null;
    
    constructor(id: string, name: string) {
        this.id = id;
        this.name = name;
    }
    
    /**
     * Sets the renderer for this interface
     */
    setRenderer(renderer: DOMRenderer): void {
        this.renderer = renderer;
    }
    
    /**
     * Sets the world manager for this interface
     */
    setWorldManager(worldManager: WorldManager): void {
        this.worldManager = worldManager;
    }
    
    /**
     * Renders the interface based on the current game state
     * This is part of the UserInterface contract
     */
    render(): void {
        this.renderTerminal();
    }
    
    /**
     * Handles user input
     * This is part of the UserInterface contract
     */
    handleInput(input: string): void {
        // If this is a command to exit the terminal, handle it
        if (input.toLowerCase() === 'exit' || input.toLowerCase() === 'back') {
            this.exitTerminal();
            return;
        }
        
        // Otherwise, try to handle it as a terminal command
        if (!this.handleTerminalCommand(input)) {
            // If not handled, show an error message
            this.showErrorMessage(`Unknown command: ${input}`);
        }
    }
    
    /**
     * Renders the terminal interface
     * Each terminal type must implement this
     */
    abstract renderTerminal(): void;
    
    /**
     * Handle terminal-specific commands
     * @param command The command to handle
     * @returns True if the command was handled, false otherwise
     */
    abstract handleTerminalCommand(command: string): boolean;
    
    /**
     * Exit the terminal interface
     * Each terminal type can override this to add custom cleanup
     */
    exitTerminal(): void {
        if (this.renderer) {
            // Clear the terminal container mode if it exists
            const terminalContainer = document.querySelector('.terminal-container');
            if (terminalContainer) {
                terminalContainer.classList.remove('terminal-mode');
            }
            
            // Clear the output
            this.renderer.clearOutput();
            
            // Display a message confirming exit
            this.renderer.updateOutput('<div>You exit the terminal.</div>');
        }
    }
    
    /**
     * Expands the terminal container for full terminal mode
     */
    protected expandTerminalContainer(): void {
        const terminalContainer = document.querySelector('.terminal-container');
        if (terminalContainer) {
            terminalContainer.classList.add('terminal-mode');
        }
    }
    
    /**
     * Shows an error message in the terminal
     */
    protected showErrorMessage(message: string): void {
        if (this.renderer) {
            this.renderer.updateOutput(`<div class="terminal-error">${message}</div>`);
        }
    }
    
    /**
     * Shows a success message in the terminal
     */
    protected showSuccessMessage(message: string): void {
        if (this.renderer) {
            this.renderer.updateOutput(`<div class="terminal-success">${message}</div>`);
        }
    }
    
    /**
     * Shows a notification in the terminal
     */
    protected showNotification(message: string, type: 'info' | 'warning' | 'success' = 'info'): void {
        if (this.renderer) {
            this.renderer.updateOutput(`<div class="terminal-notification ${type}">${message}</div>`);
        }
    }
    
    /**
     * Updates the terminal header
     */
    protected updateTerminalHeader(title: string): void {
        const headerText = document.querySelector('.terminal-header-text');
        if (headerText) {
            headerText.textContent = title;
        }
    }
    
    /**
     * Renders a menu of options
     */
    protected renderMenu(options: { id: string, label: string }[]): void {
        if (!this.renderer) return;
        
        const menuContainer = document.createElement('div');
        menuContainer.className = 'terminal-menu';
        
        options.forEach((option, index) => {
            const optionElement = document.createElement('div');
            optionElement.className = 'terminal-option';
            optionElement.innerHTML = `${index + 1}. ${option.label}`;
            optionElement.dataset.id = option.id;
            
            // Add click handler
            optionElement.addEventListener('click', () => {
                this.handleTerminalCommand(`${index + 1}`);
            });
            
            menuContainer.appendChild(optionElement);
        });
        
        this.renderer.updateOutput(menuContainer.outerHTML);
    }
}