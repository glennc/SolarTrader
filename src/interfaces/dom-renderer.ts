/**
 * Handles direct manipulation of the HTML DOM to display game output.
 */
import { TimeManager } from '../managers/time-manager';
import { TimeFormatter } from './components/time-formatter';

export class DOMRenderer {
    private container: HTMLElement;
    private outputElement!: HTMLElement;
    private timeElement!: HTMLElement;
    private watchElement!: HTMLElement;
    private alertLight!: HTMLElement;
    private inputElement!: HTMLInputElement;
    private terminalContainer!: HTMLElement;
    private commandHandler: ((input: string) => void) | null = null;
    private timeManager: TimeManager | null = null;
    private timeUpdateInterval: number | null = null;

    // Ship watch schedule (traditional naval watches adapted for space)
    private readonly WATCHES = [
        { name: "FIRST WATCH", start: 20, end: 0 },
        { name: "MIDDLE WATCH", start: 0, end: 4 },
        { name: "MORNING WATCH", start: 4, end: 8 },
        { name: "FORENOON WATCH", start: 8, end: 12 },
        { name: "AFTERNOON WATCH", start: 12, end: 16 },
        { name: "EVENING WATCH", start: 16, end: 20 }
    ];

    constructor(container: HTMLElement) {
        this.container = container;
        
        // Create the interface elements
        this.createInterface();
        
        console.log("DOMRenderer initialized.");
    }
    
    /**
     * Sets the time manager for this renderer
     * @param timeManager The time manager instance
     */
    setTimeManager(timeManager: TimeManager): void {
        this.timeManager = timeManager;
        this.startTimeUpdates();
    }
    
    /**
     * Creates the DOM structure for the game interface
     */
    private createInterface(): void {
        // Clear the container
        this.container.innerHTML = '';
        
        // Create terminal container with CRT effects
        this.terminalContainer = document.createElement('div');
        this.terminalContainer.className = 'terminal-container';
        
        // Create the terminal inner container
        const terminalInner = document.createElement('div');
        terminalInner.className = 'terminal-inner';
        
        // Create terminal header with ship name, time, and alert indicator
        const terminalHeader = document.createElement('div');
        terminalHeader.className = 'terminal-header';
        
        // Create status container for left side
        const statusContainer = document.createElement('div');
        statusContainer.className = 'status-container';
        
        // Location/ship name
        const headerText = document.createElement('div');
        headerText.className = 'terminal-header-text';
        headerText.textContent = 'SOLAR CLIPPER: FIRST LIGHT';
        statusContainer.appendChild(headerText);
        
        // Right side container for status indicators
        const statusIndicators = document.createElement('div');
        statusIndicators.className = 'status-indicators';
        
        // Create alert light
        this.alertLight = document.createElement('div');
        this.alertLight.className = 'alert-light';
        this.alertLight.innerHTML = `
            <div class="alert-indicator">
                <div class="alert-light-icon"></div>
                <span>ALERT STATUS: NORMAL</span>
            </div>
        `;
        statusIndicators.appendChild(this.alertLight);
        
        // Create the time indicators container
        const timeContainer = document.createElement('div');
        timeContainer.className = 'time-container';
        
        // Create standard time display
        this.timeElement = document.createElement('div');
        this.timeElement.className = 'terminal-time';
        this.timeElement.textContent = 'T+00:00:00:00';
        timeContainer.appendChild(this.timeElement);
        
        // Create watch display 
        this.watchElement = document.createElement('div');
        this.watchElement.className = 'terminal-watch';
        this.watchElement.textContent = 'FIRST WATCH · DAY 1';
        timeContainer.appendChild(this.watchElement);
        
        statusIndicators.appendChild(timeContainer);
        
        // Add elements to header
        terminalHeader.appendChild(statusContainer);
        terminalHeader.appendChild(statusIndicators);
        terminalInner.appendChild(terminalHeader);
        
        // Create terminal output area
        this.outputElement = document.createElement('div');
        this.outputElement.className = 'terminal-output';
        terminalInner.appendChild(this.outputElement);
        
        // Create input area
        const inputLine = document.createElement('div');
        inputLine.className = 'terminal-input-line';
        
        const prompt = document.createElement('span');
        prompt.className = 'terminal-prompt';
        prompt.textContent = 'CMD://';
        inputLine.appendChild(prompt);
        
        this.inputElement = document.createElement('input');
        this.inputElement.className = 'terminal-input';
        this.inputElement.type = 'text';
        this.inputElement.spellcheck = false;
        this.inputElement.placeholder = 'Enter command...';
        
        // Set up input event handling
        this.inputElement.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                const command = this.inputElement.value;
                if (command.trim() !== '') {
                    this.updateOutput(`<div><span class="command">> ${command}</span></div>`);
                    this.clearInput();
                    
                    // Process the command
                    if (this.commandHandler) {
                        this.commandHandler(command);
                    }
                }
            }
        });
        
        inputLine.appendChild(this.inputElement);
        terminalInner.appendChild(inputLine);
        
        // Add everything to the container
        this.terminalContainer.appendChild(terminalInner);
        this.container.appendChild(this.terminalContainer);
    }
    
    /**
     * Updates both standard mission time and watch time displays
     */
    private startTimeUpdates(): void {
        if (!this.timeManager) return;
        
        // Clear existing interval if any
        if (this.timeUpdateInterval) {
            clearInterval(this.timeUpdateInterval);
        }
        
        // Update time display every second
        this.timeUpdateInterval = window.setInterval(() => {
            if (this.timeManager) {
                // Update mission time
                const elapsedTime = this.timeManager.getElapsedTime();
                this.timeElement.textContent = TimeFormatter.formatMissionTime(elapsedTime);
                
                // Update watch display
                this.updateWatchDisplay();
            }
        }, 1000);
        
        // Initial updates
        const elapsedTime = this.timeManager.getElapsedTime();
        this.timeElement.textContent = TimeFormatter.formatMissionTime(elapsedTime);
        this.updateWatchDisplay();
    }
    
    /**
     * Determines the current watch based on game time and updates display
     */
    private updateWatchDisplay(): void {
        if (!this.timeManager) return;
        
        const currentHour = this.timeManager.getCurrentHour();
        const currentDay = this.timeManager.getCurrentDay() + 1; // Display day 1 instead of day 0
        
        // Find the current watch
        let currentWatch = this.WATCHES[0]; // Default
        
        for (const watch of this.WATCHES) {
            if (watch.start <= watch.end) {
                // Normal watch span (e.g., 4-8)
                if (currentHour >= watch.start && currentHour < watch.end) {
                    currentWatch = watch;
                    break;
                }
            } else {
                // Watch spans midnight (e.g., 20-0)
                if (currentHour >= watch.start || currentHour < watch.end) {
                    currentWatch = watch;
                    break;
                }
            }
        }
        
        this.watchElement.textContent = `${currentWatch.name} · DAY ${currentDay}`;
    }
    
    /**
     * Cleans up all the intervals
     */
    destroy(): void {
        if (this.timeUpdateInterval) {
            clearInterval(this.timeUpdateInterval);
            this.timeUpdateInterval = null;
        }
    }
    
    /**
     * Set alert status
     * @param isActive Whether the alert is active
     * @param level Alert level ("warning" or "danger")
     */
    setAlertStatus(isActive: boolean, level: 'normal' | 'warning' | 'danger' = 'normal'): void {
        const alertIcon = this.alertLight.querySelector('.alert-light-icon') as HTMLElement;
        const alertText = this.alertLight.querySelector('span') as HTMLElement;
        
        if (isActive) {
            this.alertLight.classList.add('alert-active');
            
            if (level === 'warning') {
                alertIcon.classList.add('alert-warning');
                alertText.textContent = 'ALERT STATUS: WARNING';
            } else if (level === 'danger') {
                alertIcon.classList.add('alert-danger');
                alertText.textContent = 'ALERT STATUS: DANGER';
            }
        } else {
            this.alertLight.classList.remove('alert-active');
            alertIcon.classList.remove('alert-warning', 'alert-danger');
            alertText.textContent = 'ALERT STATUS: NORMAL';
        }
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
        entry.innerHTML = text;
        
        this.outputElement.appendChild(entry);
        
        // Scroll to bottom
        this.outputElement.scrollTop = this.outputElement.scrollHeight;
    }

    /**
     * Adds a room display with name and description
     * @param name The room name
     * @param description The room description
     */
    displayRoom(name: string, description: string): void {
        const nameElem = document.createElement('div');
        nameElem.className = 'room-name';
        nameElem.textContent = name;
        
        const descElem = document.createElement('div');
        descElem.className = 'room-description';
        descElem.textContent = description;
        
        this.outputElement.appendChild(nameElem);
        this.outputElement.appendChild(descElem);
        
        // Scroll to bottom
        this.outputElement.scrollTop = this.outputElement.scrollHeight;
    }

    /**
     * Displays a notification message
     * @param message The message text
     * @param warning Whether this is a warning notification
     */
    displayNotification(message: string, warning: boolean = false): void {
        const notification = document.createElement('div');
        notification.className = warning ? 'notification warning-notification' : 'notification';
        notification.textContent = message;
        
        this.outputElement.appendChild(notification);
        
        // Scroll to bottom
        this.outputElement.scrollTop = this.outputElement.scrollHeight;
    }

    /**
     * Display interactive objects in the room
     * @param objects Array of object names
     * @param systemInterfaces Optional array of system interface names that should use "use" command
     */
    displayObjects(objects: string[], systemInterfaces: string[] = []): void {
        if (objects.length === 0) return;
        
        const header = document.createElement('div');
        header.className = 'section-header';
        header.textContent = 'You can interact with:';
        
        const container = document.createElement('div');
        
        objects.forEach(obj => {
            const objElem = document.createElement('span');
            objElem.className = 'object clickable';
            objElem.textContent = obj;
            
            // Determine which command to use - "use" for system interfaces, "examine" for others
            const isSystemInterface = systemInterfaces.includes(obj);
            const command = isSystemInterface ? 'use' : 'examine';
            
            // Add click handler to execute the appropriate command for this object
            objElem.addEventListener('click', () => {
                if (this.commandHandler) {
                    this.commandHandler(`${command} ${obj}`);
                    // Add visual feedback for the click
                    this.updateOutput(`<div><span class="command">> ${command} ${obj}</span></div>`);
                }
            });
            
            container.appendChild(objElem);
            // Add a space after each object
            container.appendChild(document.createTextNode(' '));
        });
        
        this.outputElement.appendChild(header);
        this.outputElement.appendChild(container);
        
        // Scroll to bottom
        this.outputElement.scrollTop = this.outputElement.scrollHeight;
    }

    /**
     * Display exits from the current room
     * @param exits Array of exit directions
     */
    displayExits(exits: string[]): void {
        if (exits.length === 0) return;
        
        const header = document.createElement('div');
        header.className = 'section-header';
        header.textContent = 'Exits:';
        
        const container = document.createElement('div');
        container.className = 'exits';
        
        exits.forEach(exit => {
            const exitElem = document.createElement('span');
            exitElem.className = 'direction clickable';
            exitElem.textContent = exit;
            
            // Add click handler to execute the 'go' command for this location
            exitElem.addEventListener('click', () => {
                if (this.commandHandler) {
                    this.commandHandler(`go ${exit}`);
                    // Add visual feedback for the click
                    this.updateOutput(`<div><span class="command">> go ${exit}</span></div>`);
                }
            });
            
            container.appendChild(exitElem);
            // Add a space after each exit
            container.appendChild(document.createTextNode(' '));
        });
        
        this.outputElement.appendChild(header);
        this.outputElement.appendChild(container);
        
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
        const headerText = this.terminalContainer.querySelector('.terminal-header-text');
        if (headerText) {
            headerText.textContent = `LOCATION: ${text.toUpperCase()}`;
        }
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