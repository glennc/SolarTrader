import { SpecializedInteractableObject } from './specialized-object';

/**
 * Maintenance Toolkit - Used for repairs throughout the ship
 */
export class MaintenanceToolkit extends SpecializedInteractableObject {
    private tools: ToolItem[] = [];
    private currentlyUsing: boolean = false;
    
    constructor() {
        super(
            'Toolkit',
            'Comprehensive set of tools for ship repairs.',
            'A portable toolkit containing a complete set of specialized tools for spaceship maintenance. Each tool has its place in the foam-lined case, and all appear to be in excellent condition. The toolkit is designed to handle 95% of common repair scenarios on vessels of this class.',
            true, // This is portable
            ['tools', 'tool kit', 'equipment', 'repair kit'],
            ['examine', 'look at', 'use', 'open', 'check', 'inventory']
        );
        
        // Initialize with standard tools
        this.addTool({
            name: 'Magnetic Spanner',
            description: 'Used for precision torque application in zero-g environments.',
            condition: 'Excellent',
            canRepair: ['coolant system', 'power distribution panel']
        });
        
        this.addTool({
            name: 'Circuit Diagnostic Probe',
            description: 'Detects faults in system circuitry and provides repair guidance.',
            condition: 'Good',
            canRepair: ['nav console', 'terminal', 'diagnostic panel']
        });
        
        this.addTool({
            name: 'Hydraulic Pressure Tester',
            description: 'Measures and calibrates pressure in various ship fluid systems.',
            condition: 'Excellent',
            canRepair: ['coolant system', 'life support']
        });
        
        this.addTool({
            name: 'Nano-filament Sealer',
            description: 'Repairs micro-fractures in conduits and seals.',
            condition: 'Fair',
            canRepair: ['coolant system', 'life support', 'hull breach']
        });
        
        this.addTool({
            name: 'Power Cell Calibrator',
            description: 'Balances and optimizes power cell output.',
            condition: 'Excellent',
            canRepair: ['power distribution panel', 'backup generator']
        });
    }
    
    /**
     * Handle specialized interactions with the toolkit
     */
    protected handleSpecializedInteraction(verb: string): string | null {
        verb = verb.toLowerCase();
        
        if (verb === 'open' || verb === 'inventory') {
            return this.getToolInventory();
        }
        
        if (verb === 'use') {
            this.currentlyUsing = true;
            return `You open the toolkit, ready to use it for repairs. What would you like to fix?`;
        }
        
        return null; // Not handled by specialized behavior
    }
    
    /**
     * Get list of tools in the toolkit
     */
    getTools(): ToolItem[] {
        return [...this.tools];
    }
    
    /**
     * Add a tool to the toolkit
     */
    addTool(tool: ToolItem): void {
        this.tools.push(tool);
    }
    
    /**
     * Remove a tool from the toolkit
     */
    removeTool(toolName: string): ToolItem | null {
        const index = this.tools.findIndex(t => t.name === toolName);
        if (index >= 0) {
            const tool = this.tools[index];
            this.tools.splice(index, 1);
            return tool;
        }
        return null;
    }
    
    /**
     * Check if the toolkit has the appropriate tools to repair a system
     */
    canRepair(systemName: string): boolean {
        return this.tools.some(tool => 
            tool.canRepair.some(system => 
                system.toLowerCase() === systemName.toLowerCase()
            )
        );
    }
    
    /**
     * Get the best tool for repairing a specific system
     */
    getBestToolFor(systemName: string): ToolItem | null {
        const matchingTools = this.tools.filter(tool => 
            tool.canRepair.some(system => 
                system.toLowerCase() === systemName.toLowerCase()
            )
        );
        
        if (matchingTools.length === 0) {
            return null;
        }
        
        // Sort by condition and return the best one
        const conditionValue = {
            'Excellent': 3,
            'Good': 2,
            'Fair': 1,
            'Poor': 0
        };
        
        matchingTools.sort((a, b) => 
            (conditionValue[b.condition as keyof typeof conditionValue] || 0) - 
            (conditionValue[a.condition as keyof typeof conditionValue] || 0)
        );
        
        return matchingTools[0];
    }
    
    /**
     * Get a description of the toolkit contents
     */
    private getToolInventory(): string {
        let description = `You open the toolkit and examine its contents:`;
        
        this.tools.forEach(tool => {
            description += `\n\n- ${tool.name} (${tool.condition}): ${tool.description}`;
        });
        
        return description;
    }
    
    /**
     * Check if the toolkit is currently being used
     */
    isInUse(): boolean {
        return this.currentlyUsing;
    }
    
    /**
     * Stop using the toolkit
     */
    stopUsing(): void {
        this.currentlyUsing = false;
    }
}

/**
 * Interface for a tool item in the toolkit
 */
export interface ToolItem {
    name: string;
    description: string;
    condition: 'Excellent' | 'Good' | 'Fair' | 'Poor';
    canRepair: string[]; // List of systems this tool can repair
}