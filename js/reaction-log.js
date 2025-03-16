export class ReactionLog {
    constructor(options = {}) {
        this.options = Object.assign({
            containerId: 'reaction-log',
            maxEntries: 10
        }, options);
        
        this.entries = [];
        this.createLog();
        
        // Ensure the log is visible
        if (this.logElement) {
            this.logElement.classList.add('side-panel');
            this.logElement.style.display = 'block';
        }
    }
    
    createLog() {
        // Look for existing log element
        this.logElement = document.getElementById(this.options.containerId);
        
        // Create log container if it doesn't exist
        if (!this.logElement) {
            console.log('Creating new reaction log element');
            this.logElement = document.createElement('div');
            this.logElement.id = this.options.containerId;
            this.logElement.className = 'reaction-log side-panel';
            
            // Add title and content container
            this.logElement.innerHTML = `
                <h3>Reaction Log</h3>
                <div class="log-entries"></div>
            `;
            
            document.body.appendChild(this.logElement);
        }
        
        // Get or create the entries container
        this.entriesContainer = this.logElement.querySelector('.log-entries');
        if (!this.entriesContainer) {
            this.entriesContainer = document.createElement('div');
            this.entriesContainer.className = 'log-entries';
            this.logElement.appendChild(this.entriesContainer);
        }
        
        // Add initial entry
        this.addEntry('Welcome to AI ChemLab! Mix chemicals to see reactions.');
    }
    
    addEntry(text, type = 'info') {
        const entry = {
            text,
            type,
            timestamp: new Date()
        };
        
        this.entries.unshift(entry); // Add to beginning
        
        // Limit number of entries
        if (this.entries.length > this.options.maxEntries) {
            this.entries.pop();
        }
        
        this.renderEntries();
    }
    
    renderEntries() {
        // Clear existing entries
        this.entriesContainer.innerHTML = '';
        
        // Add each entry to the DOM
        this.entries.forEach(entry => {
            const entryElement = document.createElement('div');
            entryElement.className = `log-entry ${entry.type}`;
            
            // Format timestamp
            const time = entry.timestamp.toLocaleTimeString();
            
            // Add appropriate icon based on type
            let icon = '';
            switch(entry.type) {
                case 'reaction':
                    icon = '🧪';
                    break;
                case 'warning':
                    icon = '⚠️';
                    break;
                case 'error':
                    icon = '❌';
                    break;
                default: 
                    icon = 'ℹ️';
            }
            
            entryElement.innerHTML = `
                <span class="icon">${icon}</span>
                <span class="time">${time}</span>
                <span class="text">${entry.text}</span>
            `;
            
            this.entriesContainer.appendChild(entryElement);
        });
    }
    
    clear() {
        this.entries = [];
        this.renderEntries();
    }
}