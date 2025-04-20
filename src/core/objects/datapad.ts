import { SpecializedInteractableObject } from './specialized-object';

/**
 * Player's datapad - a portable device that contains logs, contracts and other information
 */
export class Datapad extends SpecializedInteractableObject {
    private logs: DatapadLog[] = [];
    private contracts: DatapadContract[] = [];
    private personalNotes: string[] = [];
    
    constructor() {
        super(
            'Datapad',
            'Personal information device.',
            'Your trusty datapad, a durable tablet-like device that contains your personal logs, contract details, and various reference materials. The screen displays the current ship time, your vital statistics, and a reminder about the coolant system maintenance that\'s due.',
            true, // This is portable
            ['pad', 'tablet', 'computer', 'device'],
            ['examine', 'look at', 'use', 'read', 'access', 'check']
        );
        
        // Initialize with some default content
        this.addLog({
            title: 'Journey Start',
            date: 'Cycle 001, Shift 1',
            content: 'Embarking on another cargo run to Alpha Centauri. Manifest indicates medical supplies - routine delivery, nothing special. Ship systems nominal, though coolant system is showing signs of wear. Will need maintenance soon.',
            isRead: true
        });
        
        this.addLog({
            title: 'Maintenance Reminder',
            date: 'Cycle 003, Shift 2',
            content: 'Diagnostic scan shows coolant pressure at 76%. Should schedule maintenance before next port. Adding to task list.',
            isRead: false
        });
        
        this.addContract({
            id: 'AC-29876',
            client: 'Cargo Consortium',
            destination: 'Alpha Centauri Colony',
            cargo: 'Medical Supplies',
            priority: 'Standard',
            payment: 12500,
            bonusConditions: 'Early arrival +2000 credits',
            deadlineText: 'Expected arrival within 14 cycles'
        });
        
        this.addPersonalNote('Remember to check supply inventory before next port call.');
    }
    
    /**
     * Handle specialized interactions with the datapad
     */
    protected handleSpecializedInteraction(verb: string): string | null {
        verb = verb.toLowerCase();
        
        if (verb === 'use' || verb === 'access' || verb === 'read' || verb === 'check') {
            if (this.interfaceManager) {
                // In a full implementation, this would show the datapad interface
                // For now, we'll just return a description
                return this.getDatapadContentsDescription();
            } else {
                return `You activate the datapad. The screen glows to life, showing your logs, contracts, and notes.`;
            }
        }
        
        return null; // Not handled by specialized behavior
    }
    
    /**
     * Add a log entry to the datapad
     */
    addLog(log: DatapadLog): void {
        this.logs.push(log);
    }
    
    /**
     * Add a contract to the datapad
     */
    addContract(contract: DatapadContract): void {
        this.contracts.push(contract);
    }
    
    /**
     * Add a personal note to the datapad
     */
    addPersonalNote(note: string): void {
        this.personalNotes.push(note);
    }
    
    /**
     * Get all logs stored in the datapad
     */
    getLogs(): DatapadLog[] {
        return [...this.logs];
    }
    
    /**
     * Get all contracts stored in the datapad
     */
    getContracts(): DatapadContract[] {
        return [...this.contracts];
    }
    
    /**
     * Get all personal notes stored in the datapad
     */
    getPersonalNotes(): string[] {
        return [...this.personalNotes];
    }
    
    /**
     * Mark a log as read
     */
    markLogAsRead(index: number): boolean {
        if (index >= 0 && index < this.logs.length) {
            this.logs[index].isRead = true;
            return true;
        }
        return false;
    }
    
    /**
     * Get a description of the datapad contents
     */
    private getDatapadContentsDescription(): string {
        const unreadLogs = this.logs.filter(log => !log.isRead).length;
        
        let description = `You access your datapad. The screen displays:`;
        
        if (unreadLogs > 0) {
            description += `\n\n- ${unreadLogs} unread log entries`;
        } else {
            description += `\n\n- All log entries read`;
        }
        
        description += `\n- ${this.contracts.length} active contracts`;
        description += `\n- ${this.personalNotes.length} personal notes`;
        
        description += `\n\nCurrent contract: Delivery of medical supplies to Alpha Centauri Colony.`;
        
        if (unreadLogs > 0) {
            description += `\n\nA notification blinks, indicating unread log entries.`;
        }
        
        return description;
    }
}

/**
 * Interface for a log entry in the datapad
 */
export interface DatapadLog {
    title: string;
    date: string;
    content: string;
    isRead: boolean;
}

/**
 * Interface for a contract in the datapad
 */
export interface DatapadContract {
    id: string;
    client: string;
    destination: string;
    cargo: string;
    priority: string;
    payment: number;
    bonusConditions?: string;
    deadlineText: string;
}