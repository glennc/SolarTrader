import { Ship } from './core/ship';
import { Compartment } from './core/compartment';
import { 
    setManagers,
    createCompartmentObjects
} from './data/compartment-definitions';
import { TimeManager } from './managers/time-manager';
import { InterfaceManager } from './managers/interface-manager';

/**
 * Creates and initializes the player's ship with all compartments and objects.
 * This centralized initialization makes it easy to modify the ship's layout.
 */
export function createShip(
    timeManager: TimeManager, 
    interfaceManager: InterfaceManager
): Ship {
    // Set required managers for interactive objects - use the CSS loader from interface manager
    setManagers(timeManager, interfaceManager.getCSSLoader(), interfaceManager);
    
    // Create compartment objects with proper dependencies
    const { bridgeObjects, engineRoomObjects, cargoHoldObjects, 
            livingQuartersObjects, maintenanceBayObjects } = createCompartmentObjects();
    
    // Create the ship
    const ship = new Ship('Solar Clipper Mk. I', 'A reliable light cargo vessel designed for efficient transport across the solar system.');
    
    // Create all compartments
    const bridge = new Compartment(
        'Bridge', 
        'The nerve center of the ship. Displays and controls cover the walls, showing ship status, navigation data, and external sensors. The viewscreen at the front displays the starfield ahead, currently showing your trajectory toward Alpha Centauri.'
    );
    
    const engineRoom = new Compartment(
        'Engine Room', 
        'A cramped space dominated by the ship\'s power plant. The constant hum of machinery fills the air, and the subtle vibration through the deck plates tells you the main drive is operating normally. Status lights flicker across various panels, mostly showing green.'
    );
    
    const cargoHold = new Compartment(
        'Cargo Hold', 
        'A secure storage area with reinforced walls. Cargo containers are secured to the deck with magnetic clamps. The space is climate-controlled to preserve the integrity of your current shipment. The overhead lights cast everything in a neutral white glow.'
    );
    
    const livingQuarters = new Compartment(
        'Living Quarters', 
        'A modest but comfortable living space with essential amenities. The walls are adorned with personal effects and a few photos from Earth. Despite the compact dimensions, the space is efficiently organized to provide all necessary comforts for long transits.'
    );
    
    const maintenanceBay = new Compartment(
        'Maintenance Bay', 
        'A well-organized workshop space. Tools and spare parts are arranged in clearly labeled storage units along the walls. A central workbench provides space for repairs, and the overhead lighting is especially bright to facilitate detailed work.'
    );
    
    // Add compartments to the ship
    ship.addCompartment(bridge);
    ship.addCompartment(engineRoom);
    ship.addCompartment(cargoHold);
    ship.addCompartment(livingQuarters);
    ship.addCompartment(maintenanceBay);
    
    // Connect compartments with exits
    bridge.addExit('aft', livingQuarters, 'fore');
    bridge.addExit('down', maintenanceBay, 'up');
    
    engineRoom.addExit('fore', maintenanceBay, 'aft');
    engineRoom.addExit('port', cargoHold, 'starboard');
    
    cargoHold.addExit('fore', livingQuarters, 'aft');
    
    livingQuarters.addExit('down', maintenanceBay);
    
    // Add objects to compartments
    for (const object of bridgeObjects) {
        bridge.addInteractableObject(object);
    }
    
    for (const object of engineRoomObjects) {
        engineRoom.addInteractableObject(object);
    }
    
    for (const object of cargoHoldObjects) {
        cargoHold.addInteractableObject(object);
    }
    
    for (const object of livingQuartersObjects) {
        livingQuarters.addInteractableObject(object);
    }
    
    for (const object of maintenanceBayObjects) {
        maintenanceBay.addInteractableObject(object);
    }
    
    return ship;
}