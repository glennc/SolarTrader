/**
 * Utility service for formatting data in the diagnostics interface
 */
export class DiagnosticFormatter {
    /**
     * Formats a date as a timestamp string (HH:MM:SS)
     */
    static formatTimestamp(date: Date): string {
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        const seconds = date.getSeconds().toString().padStart(2, '0');
        
        return `${hours}:${minutes}:${seconds}`;
    }
    
    /**
     * Formats a date as a relative time string
     */
    static formatTimeAgo(date: Date): string {
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        
        const minutes = Math.floor(diff / (1000 * 60));
        const hours = Math.floor(diff / (1000 * 60 * 60));
        
        if (minutes < 60) {
            return `${minutes} minutes ago`;
        } else {
            return `${hours} hours ago`;
        }
    }
    
    /**
     * Formats time for the scan display (MM:SS)
     */
    static formatScanTime(seconds: number): string {
        const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
        const secs = Math.floor(seconds % 60).toString().padStart(2, '0');
        return `${mins}:${secs}`;
    }
}