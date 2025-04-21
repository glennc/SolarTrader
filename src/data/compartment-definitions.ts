import { BaseInteractableObject } from '../core/interactable-object';
import { CoolantSystemInterface } from '../interfaces/systems/coolant-system-interface';
import { SystemDiagnosticsInterface } from '../interfaces/systems/system-diagnostics-interface';
import { SleepPod } from '../core/objects/sleep-pod';
import { TimeManager } from '../managers/time-manager';
import { DOMCSSLoader } from '../interfaces/dom-css-loader';
import { InterfaceManager } from '../managers/interface-manager';

// We'll set these when ship-init.ts calls createCompartmentObjects
let timeManager: TimeManager | null = null;
let cssLoader: DOMCSSLoader | null = null;
let interfaceManager: InterfaceManager | null = null;

/**
 * Set the managers needed for interactive objects.
 * Must be called before accessing the object arrays.
 */
export function setManagers(
  tm: TimeManager,
  css: DOMCSSLoader,
  im: InterfaceManager
): void {
  timeManager = tm;
  cssLoader = css;
  interfaceManager = im;
  console.log("Compartment definitions: Managers have been set");
}

/**
 * Create compartment objects with the required dependencies.
 * This ensures all interactive objects have the managers they need.
 */
export function createCompartmentObjects() {
  if (!timeManager || !cssLoader || !interfaceManager) {
    console.error("Compartment definitions: Managers not set before creating objects");
    return { bridgeObjects: [], engineRoomObjects: [], cargoHoldObjects: [], 
             livingQuartersObjects: [], maintenanceBayObjects: [] };
  }
  
  // Bridge objects
  const bridgeObjects = [
    new BaseInteractableObject(
        'Nav Console',
        'Ship navigation and steering controls.',
        'A complex array of displays and controls for navigating the ship. Current course data is displayed on the main screen showing a transit to Alpha Centauri. System status indicators show all navigation systems operating at nominal levels.',
        false,
        ['navigation console', 'navigation', 'nav', 'console'],
        ['examine', 'look at', 'use', 'access', 'check']
    ),
    
    new BaseInteractableObject(
        'Comms Terminal',
        'Long-range communication system.',
        'A dedicated terminal for ship communications. Status indicators show the system is operational but in standby mode. The message queue is empty, and the last transmission log shows a routine check-in with Solar System Traffic Control three days ago.',
        false,
        ['communications terminal', 'communications', 'comms', 'terminal', 'radio'],
        ['examine', 'look at', 'use', 'activate', 'access']
    ),
    
    new BaseInteractableObject(
        'Captain\'s Chair',
        'The command seat with integrated control panels.',
        'A well-worn but comfortable chair positioned for optimal view of all bridge systems. Small control panels are built into each armrest, offering quick access to essential ship functions. The synthetic leather is cracked in places from years of use.',
        false,
        ['chair', 'command chair', 'seat'],
        ['examine', 'look at', 'sit', 'use']
    ),
    
    // Replace the basic diagnostics panel with our interactive system diagnostics interface
    new SystemDiagnosticsInterface()
  ];

  // Engine Room objects
  const engineRoomObjects = [
    new BaseInteractableObject(
        'Power Control Panel',
        'Controls power distribution throughout the ship.',
        'A complex panel with numerous gauges, switches and a central power distribution diagram. The main reactor is running at 87% capacity with power routed primarily to propulsion and life support systems. Reserve capacity appears adequate for emergency needs.',
        false,
        ['power panel', 'power controls', 'panel', 'controls'],
        ['examine', 'look at', 'use', 'adjust', 'check']
    ),
    
    new BaseInteractableObject(
        'Diagnostic Terminal',
        'Detailed engine and reactor diagnostics.',
        'A specialized terminal for monitoring and troubleshooting the ship\'s propulsion systems. Current readouts show the main drive operating within normal parameters, though the coolant system pressure is at 76%, just below the recommended maintenance threshold of 80%.',
        false,
        ['diagnostic computer', 'diagnostics', 'terminal', 'engine diagnostics'],
        ['examine', 'look at', 'use', 'access', 'check']
    ),
    
    new BaseInteractableObject(
        'Tool Locker',
        'Contains engineering tools and equipment.',
        'A wall-mounted locker containing specialized tools for engine maintenance and repair. The inventory list on the door shows a complete set of reactor service tools, diagnostic equipment, and replacement parts for routine maintenance tasks.',
        false,
        ['locker', 'tools', 'equipment', 'toolbox'],
        ['examine', 'look at', 'open', 'close', 'access']
    ),
    
    // Replace the basic coolant valves with our new interactive coolant system
    new CoolantSystemInterface()
  ];

  // Cargo Hold objects
  const cargoHoldObjects = [
    new BaseInteractableObject(
        'Cargo Manifest Terminal',
        'Tracks and manages cargo inventory.',
        'A wall-mounted terminal displaying the ship\'s current cargo manifest. According to the screen, you\'re transporting medical supplies to Alpha Centauri colony. The cargo is secured and environmental controls are maintaining optimal preservation conditions.',
        false,
        ['manifest terminal', 'manifest', 'terminal', 'cargo computer'],
        ['examine', 'look at', 'use', 'access', 'check']
    ),
    
    new BaseInteractableObject(
        'Loading Controls',
        'Operates the cargo bay doors and loading equipment.',
        'Control panel for cargo operations including bay door operation, loading crane, and magnetic clamps. All systems are currently in locked/secured mode, appropriate for transit. Emergency override codes are displayed on a small placard below the main controls.',
        false,
        ['cargo controls', 'controls', 'loading panel', 'panel'],
        ['examine', 'look at', 'use', 'access']
    ),
    
    new BaseInteractableObject(
        'Storage Containers',
        'Secured shipping containers.',
        'Several reinforced containers secured to the deck with magnetic clamps. The containers are sealed and labeled with medical caution symbols. Manifest codes on each container match the inventory list in the ship\'s cargo system.',
        false,
        ['containers', 'crates', 'boxes', 'cargo', 'shipment'],
        ['examine', 'look at', 'check', 'inspect']
    )
  ];

  // Living Quarters objects with SleepPod using proper managers
  const livingQuartersObjects = [
    new SleepPod(
      'Sleeping Pod',
      'A space-efficient sleeping pod built into the wall. Despite its small size, the mattress is surprisingly comfortable and the integrated environmental controls allow you to customize temperature and lighting. A small shelf contains some personal items and reading material.',
      timeManager,
      cssLoader,
      interfaceManager
    ),
    
    new BaseInteractableObject(
        'Food Prep Station',
        'Compact food preparation and storage area.',
        'A small but efficient kitchen area with basic food preparation equipment, a compact refrigeration unit, and storage for supplies. The automated inventory system shows adequate supplies for the planned journey duration. A selection of both prepared meals and cooking ingredients is available.',
        false,
        ['kitchen', 'food area', 'galley', 'prep station'],
        ['examine', 'look at', 'use', 'cook', 'prepare food']
    ),
    
    new BaseInteractableObject(
        'Personal Locker',
        'Storage for personal belongings.',
        'A secure locker containing your personal effects and spare clothing. Everything is neatly organized according to your preference. A small mirror is mounted on the inside of the door. At the bottom of the locker is a worn family photo and your certification as a licensed cargo hauler.',
        false,
        ['locker', 'closet', 'storage', 'wardrobe'],
        ['examine', 'look at', 'open', 'close', 'use']
    ),
    
    new BaseInteractableObject(
        'Datapad',
        'Personal information device.',
        'Your trusty datapad, a durable tablet-like device that contains your personal logs, contract details, and various reference materials. The screen displays the current ship time, your vital statistics, and a reminder about the coolant system maintenance that\'s due.',
        true, // This is portable
        ['pad', 'tablet', 'computer', 'device'],
        ['examine', 'look at', 'use', 'read', 'access', 'check']
    )
  ];

  // Maintenance Bay objects
  const maintenanceBayObjects = [
    new BaseInteractableObject(
        'Repair Station',
        'Workbench with specialized repair equipment.',
        'A comprehensive repair station with integrated diagnostic tools and materials for most shipboard maintenance tasks. The station includes precision fabrication equipment for simple replacement parts and a library of technical manuals. Everything is meticulously organized and in good condition.',
        false,
        ['workbench', 'repair bench', 'station', 'workshop'],
        ['examine', 'look at', 'use', 'access']
    ),
    
    new BaseInteractableObject(
        'Parts Storage',
        'Organized storage of spare parts and components.',
        'Floor-to-ceiling shelving units containing carefully categorized spare parts for all major ship systems. The inventory management system indicates good stock levels for routine maintenance items, though some specialized reactor components are flagged as low stock and due for replenishment at the next major port.',
        false,
        ['parts', 'spares', 'storage', 'shelves', 'inventory'],
        ['examine', 'look at', 'search', 'check']
    ),
    
    new BaseInteractableObject(
        'Maintenance Terminal',
        'Access point for technical specifications and maintenance logs.',
        'A rugged terminal dedicated to maintenance operations. The screen displays the ship\'s current maintenance schedule, with the coolant system flagged for immediate attention. Technical diagrams for all major systems can be accessed here, along with step-by-step repair procedures.',
        false,
        ['terminal', 'computer', 'maintenance computer', 'technical station'],
        ['examine', 'look at', 'use', 'access', 'check']
    ),
    
    new BaseInteractableObject(
        'Toolkit',
        'Comprehensive set of tools for ship repairs.',
        'A portable toolkit containing a complete set of specialized tools for spaceship maintenance. Each tool has its place in the foam-lined case, and all appear to be in excellent condition. The toolkit is designed to handle 95% of common repair scenarios on vessels of this class.',
        true, // This is portable
        ['tools', 'tool kit', 'equipment', 'repair kit'],
        ['examine', 'look at', 'take', 'use', 'open']
    )
  ];

  return { bridgeObjects, engineRoomObjects, cargoHoldObjects, livingQuartersObjects, maintenanceBayObjects };
}

console.log("Placeholder: src/data/compartment-definitions.ts loaded.");

// Ensure the file is treated as a module.
export {};