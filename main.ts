// Types
interface Room {
    name: string;
    description: string;
    exits: { [key: string]: string }; // Direction -> Room name mapping
    objects: string[]; // Interactable objects in the room
}

interface GameState {
    currentRoom: string;
    rooms: { [key: string]: Room };
    commandHistory: string[];
    historyIndex: number;
}

// Game initialization
const initialState: GameState = {
    currentRoom: 'Bridge',
    rooms: {
        'Bridge': {
            name: 'Bridge',
            description: 'The nerve center of the ship. Displays and controls cover the walls, showing ship status, navigation data, and external sensors.',
            exits: {
                'aft': 'Living Quarters',
                'down': 'Maintenance Bay'
            },
            objects: ['Nav Console', 'Comms Terminal', 'Captain\'s Chair']
        },
        'Engine Room': {
            name: 'Engine Room',
            description: 'A cramped space dominated by the ship\'s power plant. The constant hum of machinery fills the air.',
            exits: {
                'fore': 'Maintenance Bay',
                'port': 'Cargo Hold'
            },
            objects: ['Power Control Panel', 'Diagnostic Terminal', 'Tool Locker']
        },
        'Cargo Hold': {
            name: 'Cargo Hold',
            description: 'A secure storage area with reinforced walls. Cargo containers are secured to the deck with magnetic clamps.',
            exits: {
                'starboard': 'Engine Room',
                'fore': 'Living Quarters'
            },
            objects: ['Cargo Manifest Terminal', 'Loading Controls', 'Storage Containers']
        },
        'Living Quarters': {
            name: 'Living Quarters',
            description: 'A modest but comfortable living space with essential amenities. The walls are adorned with personal effects.',
            exits: {
                'fore': 'Bridge',
                'aft': 'Cargo Hold',
                'down': 'Maintenance Bay'
            },
            objects: ['Sleeping Pod', 'Food Prep Station', 'Personal Locker']
        },
        'Maintenance Bay': {
            name: 'Maintenance Bay',
            description: 'A well-organized workshop space. Tools and spare parts are arranged in clearly labeled storage units.',
            exits: {
                'up': 'Bridge',
                'aft': 'Engine Room'
            },
            objects: ['Repair Station', 'Parts Storage', 'Maintenance Terminal']
        }
    },
    commandHistory: [],
    historyIndex: -1
};

let gameState: GameState = { ...initialState };

// UI Elements
const terminalContainer = document.createElement('div');
terminalContainer.className = 'terminal-container';

const outputDisplay = document.createElement('div');
outputDisplay.className = 'terminal-output';

const inputLine = document.createElement('div');
inputLine.className = 'terminal-input-line';

const promptSpan = document.createElement('span');
promptSpan.className = 'terminal-prompt';
promptSpan.textContent = '> ';

const input = document.createElement('input');
input.className = 'terminal-input';
input.type = 'text';
input.spellcheck = false;

// Command handling
function handleCommand(command: string): void {
    const normalizedCommand = command.toLowerCase().trim();
    
    // Add command to history
    gameState.commandHistory.unshift(command);
    gameState.historyIndex = -1;
    
    if (normalizedCommand === '') {
        return;
    }
    
    // Split command into words
    const words = normalizedCommand.split(' ');
    
    // Handle different commands
    switch (words[0]) {
        case 'go':
        case 'move':
            if (words.length < 2) {
                displayOutput('Go where? Try "go <direction>" or "go to <room>"\nExample: "go fore" or "go to Bridge"');
                return;
            }
            if (words[1] === 'to') {
                handleMovement(words.slice(2).join(' '));
            } else {
                handleMovement(words.slice(1).join(' '));
            }
            break;
            
        case 'look':
        case 'l':
            displayRoomDescription();
            break;
            
        case 'help':
        case '?':
            displayHelp();
            break;
            
        case 'clear':
        case 'cls':
            clearTerminal();
            break;
            
        default:
            displayOutput(`Unknown command: "${command}"\nType "help" or "?" for available commands.`);
    }
}

function clearTerminal(): void {
    outputDisplay.innerHTML = '';
    displayOutput('Terminal cleared. Type "help" for available commands.');
}

// Movement handling
function handleMovement(direction: string): void {
    const currentRoom = gameState.rooms[gameState.currentRoom];
    
    // Normalize the direction
    direction = direction.toLowerCase();
    
    // Handle both "go to [room]" and directional commands
    const targetRoom = Object.values(gameState.rooms).find(room =>
        room.name.toLowerCase() === direction
    );

    if (targetRoom) {
        // Check if the target room is a valid exit
        if (Object.values(currentRoom.exits).includes(targetRoom.name)) {
            gameState.currentRoom = targetRoom.name;
            displayRoomDescription();
        } else {
            displayOutput(`You can't go directly to ${targetRoom.name} from here.`);
        }
        return;
    }

    // Handle directional movement
    if (currentRoom.exits[direction]) {
        gameState.currentRoom = currentRoom.exits[direction];
        displayRoomDescription();
    } else {
        const validExits = Object.keys(currentRoom.exits).join('", "');
        displayOutput(`Cannot go ${direction} from here. Valid exits are: "${validExits}"`);
    }
}

// Display functions
function displayRoomDescription(): void {
    const room = gameState.rooms[gameState.currentRoom];
    let description = `\n[${room.name}]\n\n${room.description}\n\n`;
    
    // Format exits with destinations
    const exits = Object.entries(room.exits)
        .map(([direction, destination]) => `${direction} (to ${destination})`)
        .join('\n  - ');
    description += 'Exits:\n  - ' + exits + '\n';
    
    // Format objects
    if (room.objects.length > 0) {
        description += '\nYou can see:\n  - ' + room.objects.join('\n  - ') + '\n';
    }
    
    displayOutput(description);
}

function displayHelp(): void {
    const help = `
Available commands:
- go <direction>: Move in the specified direction (e.g., "go fore", "go aft")
- go to <room>: Move directly to a connected room (e.g., "go to Bridge")
- look: Examine your current location
- help: Show this help message

Navigation Tips:
- Common directions: fore (forward), aft (backward), port (left), starboard (right), up, down
- You can only move to rooms that are connected to your current location
- Use "look" to see available exits and objects in your current room
`;
    displayOutput(help);
}

function displayOutput(text: string): void {
    const output = document.createElement('div');
    
    // Split text into lines and process each line
    const lines = text.split('\n');
    let formattedText = '';
    
    lines.forEach(line => {
        // Style room names in brackets
        line = line.replace(/\[(.*?)\]/g, (match, roomName) =>
            `<span class="room-name">${match}</span>`);
        
        // Style directional words
        line = line.replace(/\b(fore|aft|port|starboard|up|down)\b/g,
            '<span class="direction">$1</span>');
            
        formattedText += line + '\n';
    });
    
    output.innerHTML = formattedText;
    outputDisplay.appendChild(output);
    outputDisplay.scrollTop = outputDisplay.scrollHeight;
}

// Event handlers
function handleInput(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
        const command = (event.target as HTMLInputElement).value;
        displayOutput(`> ${command}`);
        handleCommand(command);
        (event.target as HTMLInputElement).value = '';
    } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        navigateHistory(1);
    } else if (event.key === 'ArrowDown') {
        event.preventDefault();
        navigateHistory(-1);
    }
}

function navigateHistory(direction: number): void {
    if (gameState.commandHistory.length === 0) return;
    
    gameState.historyIndex = Math.min(
        Math.max(gameState.historyIndex + direction, 0),
        gameState.commandHistory.length - 1
    );
    
    input.value = gameState.commandHistory[gameState.historyIndex];
}

// Initialize UI
function createLoadingScreen(): HTMLDivElement {
    const loadingScreen = document.createElement('div');
    loadingScreen.className = 'loading-screen';
    
    const loadingText = document.createElement('div');
    loadingText.className = 'loading-text';
    loadingText.textContent = 'Initializing Solar Clipper...';
    
    loadingScreen.appendChild(loadingText);
    return loadingScreen;
}

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
        
        console.log('Setting up terminal components...');
        inputLine.appendChild(promptSpan);
        inputLine.appendChild(input);
        
        terminalContainer.appendChild(outputDisplay);
        terminalContainer.appendChild(inputLine);
        
        // Prepare terminal container but don't add it yet
        console.log('Terminal components prepared');
        
        // Simulate asset loading
        console.log('Loading game assets...');
        await new Promise(resolve => setTimeout(resolve, 1000));
        console.log('Assets loaded');

        // Remove loading screen first
        loadingScreen.classList.add('hidden');
        await new Promise(resolve => {
            loadingScreen.addEventListener('transitionend', () => {
                loadingScreen.remove();
                resolve(true);
            }, { once: true });
        });
        
        // Now add the terminal
        appContainer.appendChild(terminalContainer);
        console.log('Terminal components mounted');
        
        input.addEventListener('keydown', handleInput);
        console.log('Input handler attached');
        
        // Display initial room description
        console.log('Displaying welcome message and initial room');
        displayOutput('Welcome to Solar Clipper: First Light\nType "help" for available commands.\n');
        displayRoomDescription();
        
        // Focus input after initialization
        input.focus();
        console.log('Game initialization complete');
    } catch (error) {
        console.error('Error during game initialization:', error);
        loadingScreen.querySelector('.loading-text')!.textContent = 'Error initializing game. Please refresh the page.';
        throw error; // Re-throw to trigger the catch handler in the DOMContentLoaded listener
    }
}

// Start the game
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, starting game initialization');
    initializeGame().catch(error => {
        console.error('Failed to initialize game:', error);
    });
});
