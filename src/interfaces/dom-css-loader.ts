/**
 * Utility class for dynamically loading and unloading CSS files in the DOM.
 */
export class DOMCSSLoader {
  private loadedStylesheets: Map<string, HTMLLinkElement> = new Map();

  /**
   * Loads a CSS file into the document head.
   * @param cssPath Path to the CSS file
   * @param id Identifier for the stylesheet
   * @returns True if successful, false if already loaded
   */
  loadCSS(cssPath: string, id: string): boolean {
    // Check if already loaded
    if (this.loadedStylesheets.has(id)) {
      console.log(`CSS already loaded: ${id}`);
      return false;
    }

    // Create link element
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.type = 'text/css';
    link.href = cssPath;
    link.id = `css-${id}`;

    // Add to document head
    document.head.appendChild(link);
    
    // Store reference
    this.loadedStylesheets.set(id, link);
    console.log(`CSS loaded: ${id}`);
    
    return true;
  }

  /**
   * Unloads a CSS file from the document head.
   * @param id Identifier for the stylesheet
   * @returns True if successful, false if not found
   */
  unloadCSS(id: string): boolean {
    const link = this.loadedStylesheets.get(id);
    
    if (!link) {
      console.log(`CSS not loaded: ${id}`);
      return false;
    }
    
    // Remove from document
    link.remove();
    
    // Remove from map
    this.loadedStylesheets.delete(id);
    console.log(`CSS unloaded: ${id}`);
    
    return true;
  }

  /**
   * Checks if a CSS file is loaded.
   * @param id Identifier for the stylesheet
   * @returns True if loaded, false if not
   */
  isLoaded(id: string): boolean {
    return this.loadedStylesheets.has(id);
  }

  /**
   * Unloads all loaded CSS files.
   */
  unloadAll(): void {
    this.loadedStylesheets.forEach((link, id) => {
      link.remove();
      console.log(`CSS unloaded: ${id}`);
    });
    
    this.loadedStylesheets.clear();
  }
}