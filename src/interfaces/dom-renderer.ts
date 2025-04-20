/**
 * Handles direct manipulation of the HTML DOM to display game output.
 */
export class DOMRenderer {
    private container: HTMLElement;
    private outputElement: HTMLElement;
    private locationElement: HTMLElement;
    private inputElement: HTMLInputElement;
    private commandHandler: ((input: string) => void) | null = null;

    constructor(container: HTMLElement) {
        this.container = container;
        
        // Create the interface elements
        this.createInterface();
        
        console.log("DOMRenderer initialized.");
    }
    
    /**
     * Creates the DOM structure for the game interface
     */
    private createInterface(): void {
        // Clear the container
        this.container.innerHTML = '';
        
        // Create the interface structure
        const interfaceContainer = document.createElement('div');
        interfaceContainer.className = 'game-interface';
        
        // Location display
        this.locationElement = document.createElement('div');
        this.locationElement.className = 'location-display';
        interfaceContainer.appendChild(this.locationElement);
        
        // Output area
        this.outputElement = document.createElement('div');
        this.outputElement.className = 'terminal-output';
        interfaceContainer.appendChild(this.outputElement);
        
        // Input area
        const inputContainer = document.createElement('div');
        inputContainer.className = 'terminal-input-container';
        
        const prompt = document.createElement('span');
        prompt.className = 'terminal-prompt';
        prompt.textContent = '> ';
        inputContainer.appendChild(prompt);
        
        this.inputElement = document.createElement('input');
        this.inputElement.className = 'terminal-input';
        this.inputElement.type = 'text';
        this.inputElement.spellcheck = false;
        
        // Set up input event handling
        this.inputElement.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                const command = this.inputElement.value;
                if (command.trim() !== '') {
                    this.updateOutput(`<span class="command-echo">> ${command}</span>`);
                    this.clearInput();
                    
                    // Process the command
                    if (this.commandHandler) {
                        this.commandHandler(command);
                    }
                }
            }
        });
        
        inputContainer.appendChild(this.inputElement);
        interfaceContainer.appendChild(inputContainer);
        
        // Add the interface to the container
        this.container.appendChild(interfaceContainer);
    }
    
    /**
     * Set a handler function for commands entered by the user
     */
    setCommandHandler(handler: (input: string) => void): void {
        this.commandHandler = handler;
    }

    /**
     * Updates the main output area of the UI.
     * @param text The text content to display. Can include HTML.
     */
    updateOutput(text: string): void {
        // Create a new output entry
        const entry = document.createElement('div');
        entry.className = 'output-entry';
        entry.innerHTML = text;
        
        this.outputElement.appendChild(entry);
        
        // Scroll to bottom
        this.outputElement.scrollTop = this.outputElement.scrollHeight;
    }

     /**
     * Clears the main output area.
     */
    clearOutput(): void {
        this.outputElement.innerHTML = '';
    }

    /**
     * Updates the area displaying the player's current location/compartment name.
     * @param text The text content to display.
     */
    updateLocation(text: string): void {
        this.locationElement.textContent = text;
    }

    /**
     * Clears the input field.
     */
    clearInput(): void {
        this.inputElement.value = '';
    }

    /**
     * Focuses the input field.
     */
    focusInput(): void {
        this.inputElement.focus();
    }
}