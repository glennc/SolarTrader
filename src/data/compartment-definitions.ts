/**
 * Placeholder for defining individual compartments.
 * This could evolve into a more structured format (e.g., JSON, classes).
 * For now, it's just a conceptual placeholder.
 */

// Example structure (not used directly yet):
/*
export interface CompartmentDefinition {
    name: string;
    description: string;
    exits: { [direction: string]: string }; // Direction -> Target Compartment Name
}

export const compartmentDefinitions: { [key: string]: CompartmentDefinition } = {
    "Bridge": {
        name: "Bridge",
        description: "The command center of the ship. Consoles hum quietly.",
        exits: { "south": "Corridor" }
    },
    "Corridor": {
        name: "Corridor",
        description: "A narrow metal corridor.",
        exits: { "north": "Bridge", "east": "Engineering", "west": "CargoHold" }
    },
    "Engineering": {
        name: "Engineering",
        description: "The engine room, filled with the thrum of machinery.",
        exits: { "west": "Corridor" }
    },
    "CargoHold": {
        name: "Cargo Hold",
        description: "A large, mostly empty space for cargo.",
        exits: { "east": "Corridor" }
    }
};
*/

console.log("Placeholder: src/data/compartment-definitions.ts loaded.");

// Ensure the file is treated as a module.
export {};