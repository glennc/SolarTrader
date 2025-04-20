/**
 * Utility functions for dynamically managing CSS stylesheets
 */

/**
 * Map to track loaded CSS by ID to prevent duplicate loading
 */
const loadedStylesheets = new Map<string, HTMLLinkElement>();

/**
 * Dynamically loads a CSS file only when needed
 * @param cssPath The path to the CSS file
 * @param id Unique identifier for this stylesheet
 * @returns The created link element
 */
export function loadStylesheet(cssPath: string, id: string): HTMLLinkElement {
    // If already loaded, return the existing element
    if (loadedStylesheets.has(id)) {
        return loadedStylesheets.get(id)!;
    }

    // Create a new link element
    const linkElement = document.createElement('link');
    linkElement.rel = 'stylesheet';
    linkElement.href = cssPath;
    linkElement.id = `css-${id}`;
    
    // Add to document head
    document.head.appendChild(linkElement);
    
    // Store reference
    loadedStylesheets.set(id, linkElement);
    
    return linkElement;
}

/**
 * Unloads a CSS file when no longer needed
 * @param id The identifier of the stylesheet to unload
 */
export function unloadStylesheet(id: string): void {
    if (loadedStylesheets.has(id)) {
        const linkElement = loadedStylesheets.get(id)!;
        linkElement.remove();
        loadedStylesheets.delete(id);
    }
}

/**
 * Preloads a stylesheet without actually applying it
 * Useful for reducing delay when a stylesheet will be needed soon
 * @param cssPath The path to the CSS file
 */
export function preloadStylesheet(cssPath: string): void {
    const linkElement = document.createElement('link');
    linkElement.rel = 'preload';
    linkElement.href = cssPath;
    linkElement.as = 'style';
    document.head.appendChild(linkElement);
}