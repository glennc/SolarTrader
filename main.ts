// Import core modules and styles
import './styles.css';

// Import game components
import { InterfaceManager } from './src/managers/interface-manager';
import { WorldManager } from './src/managers/world-manager';
import { CommandParser } from './src/managers/command-parser';
import { DOMRenderer } from './src/interfaces/dom-renderer';
import { FirstPersonView } from './src/interfaces/first-person-view';
import { createShip } from './src/ship-init';

// Game initialization
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, starting game initialization');
    initializeGame().catch(error => {
        console.error('Failed to initialize game:', error);
    });
});

async function initializeGame(): Promise<void> {
    console.log('Starting game initialization...');

    const appContainer = document.getElementById('app');
    if (!appContainer) {
        console.error('Failed to find #app container');
        throw new Error('Missing #app container');
    }
    console.log('Found #app container');

    // Add loading screen
    const loadingScreen = createLoadingScreen();
    appContainer.appendChild(loadingScreen);
    console.log('Loading screen added');

    try {
        // Clear any existing content
        while (appContainer.firstChild !== loadingScreen) {
            appContainer.firstChild?.remove();
        }
        
        // Create the game interface components
        const renderer = new DOMRenderer(appContainer);
        const worldManager = new WorldManager();
        const interfaceManager = new InterfaceManager(renderer);
        
        // Set up the first-person view
        const firstPersonView = new FirstPersonView();
        
        // Create and initialize the ship FIRST
        console.log('Creating and initializing ship...');
        const ship = createShip();
        worldManager.loadShip(ship);
        worldManager.setPlayerStartLocation('Bridge');
        console.log('Ship initialized and player placed at Bridge');
        
        // THEN set up the world manager references
        interfaceManager.setWorldManager(worldManager);
        firstPersonView.setWorldManager(worldManager);
        
        // THEN register the view with the interface manager
        interfaceManager.registerInterface('first-person', firstPersonView);
        interfaceManager.setActiveInterface('first-person');
        
        // Set up the command parser AFTER everything else is initialized
        const commandParser = new CommandParser(worldManager, interfaceManager);
        
        // Connect renderer to command parser
        renderer.setCommandHandler((input: string) => {
            commandParser.parse(input);
        });
        
        // Simulate asset loading
        console.log('Loading game assets...');
        await new Promise(resolve => setTimeout(resolve, 1000));
        console.log('Assets loaded');

        // Remove loading screen
        loadingScreen.classList.add('hidden');
        await new Promise(resolve => {
            loadingScreen.addEventListener('transitionend', () => {
                loadingScreen.remove();
                resolve(true);
            }, { once: true });
        });
        
        // Display welcome message
        renderer.updateOutput('<div>Welcome to Solar Clipper: First Light\nType "help" for available commands.</div>');
        
        // Allow a brief moment for the welcome message to be processed
        await new Promise(resolve => setTimeout(resolve, 50));
        
        // THEN auto-execute the look command
        console.log('Auto-executing look command for initial location description');
        commandParser.parse('look');
        
        // Focus input field
        renderer.focusInput();
        console.log('Game initialization complete');
    } catch (error) {
        console.error('Error during game initialization:', error);
        loadingScreen.querySelector('.loading-text')!.textContent = 'Error initializing game. Please refresh the page.';
        throw error;
    }
}

// UI Elements - Loading Screen
function createLoadingScreen(): HTMLDivElement {
    const loadingScreen = document.createElement('div');
    loadingScreen.className = 'loading-screen';
    
    const loadingText = document.createElement('div');
    loadingText.className = 'loading-text';
    loadingText.textContent = 'INITIALIZING SOLAR CLIPPER...';
    
    // Add a loading progress bar
    const progressContainer = document.createElement('div');
    progressContainer.className = 'loading-progress';
    
    const progressBar = document.createElement('div');
    progressBar.className = 'loading-bar';
    
    progressContainer.appendChild(progressBar);
    
    loadingScreen.appendChild(loadingText);
    loadingScreen.appendChild(progressContainer);
    
    return loadingScreen;
}
