import { DOMRenderer } from './dom-renderer';
import { WorldManager } from '../managers/world-manager';

/**
 * Base interface for different game views or user interfaces
 * (e.g., FirstPersonView, MapView, InventoryScreen).
 */
export interface UserInterface {
    /**
     * Renders the current view based on the game state.
     */
    render(): void;

    /**
     * Handles user input specific to this interface.
     * @param input The user input string.
     */
    handleInput(input: string): void;

    /**
     * Sets the renderer instance for this interface to use.
     * @param renderer The DOMRenderer instance.
     */
    setRenderer(renderer: DOMRenderer): void;

    /**
     * Sets the world manager instance for accessing game state.
     * @param worldManager The WorldManager instance.
     */
    setWorldManager(worldManager: WorldManager): void;
}