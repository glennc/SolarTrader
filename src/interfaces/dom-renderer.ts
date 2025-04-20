/**
 * Handles direct manipulation of the HTML DOM to display game output.
 */
export class DOMRenderer {
    private outputElement: HTMLElement | null;
    private locationElement: HTMLElement | null;
    private inputElement: HTMLInputElement | null; // Assuming an input field exists

    constructor(outputElementId: string = 'output', locationElementId: string = 'location', inputElementId: string = 'input') {
        this.outputElement = document.getElementById(outputElementId);
        this.locationElement = document.getElementById(locationElementId);
        this.inputElement = document.getElementById(inputElementId) as HTMLInputElement;

        if (!this.outputElement) {
            console.error(`DOMRenderer: Element with ID "${outputElementId}" not found.`);
        }
        if (!this.locationElement) {
            console.error(`DOMRenderer: Element with ID "${locationElementId}" not found.`);
        }
         if (!this.inputElement) {
            console.warn(`DOMRenderer: Input element with ID "${inputElementId}" not found.`);
        }
        console.log("DOMRenderer initialized.");
    }

    /**
     * Updates the main output area of the UI.
     * @param text The text content to display. Can include HTML.
     */
    updateOutput(text: string): void {
        if (this.outputElement) {
            // Append new text, maybe clear old text depending on game design
            // For now, let's append and add a line break
            this.outputElement.innerHTML += text + '<br>';
            // Scroll to bottom
            this.outputElement.scrollTop = this.outputElement.scrollHeight;
        } else {
            console.error("DOMRenderer: Cannot update output, element not found.");
        }
    }

     /**
     * Clears the main output area.
     */
    clearOutput(): void {
        if (this.outputElement) {
            this.outputElement.innerHTML = '';
        }
    }

    /**
     * Updates the area displaying the player's current location/compartment name.
     * @param text The text content to display.
     */
    updateLocation(text: string): void {
        if (this.locationElement) {
            this.locationElement.textContent = text;
        } else {
            console.error("DOMRenderer: Cannot update location, element not found.");
        }
    }

    /**
     * Clears the input field.
     */
    clearInput(): void {
        if (this.inputElement) {
            this.inputElement.value = '';
        }
    }

    /**
     * Focuses the input field.
     */
    focusInput(): void {
         if (this.inputElement) {
            this.inputElement.focus();
        }
    }
}