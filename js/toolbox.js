export class Toolbox {
    constructor(options = {}) {
        this.options = Object.assign({
            containerId: 'toolbox',
            app: null,
            items: []
        }, options);
        
        this.items = this.options.items;
        this.activeItem = null;
        this.createToolbox();
        
        // Ensure the toolbox is visible and properly positioned
        if (this.toolboxElement) {
            this.toolboxElement.classList.add('side-panel', 'toolbox');
            this.toolboxElement.style.display = 'block';
        }
    }
    
    createToolbox() {
        // Look for existing toolbox element
        this.toolboxElement = document.getElementById(this.options.containerId);
        
        // Create toolbox container if it doesn't exist
        if (!this.toolboxElement) {
            this.toolboxElement = document.createElement('div');
            this.toolboxElement.id = this.options.containerId;
            this.toolboxElement.className = 'toolbox side-panel';
            
            // Add title and content container
            this.toolboxElement.innerHTML = `
                <h3>Lab Tools</h3>
                <div class="tool-items"></div>
            `;
            
            document.body.appendChild(this.toolboxElement);
        }
        
        // Get or create the items container
        this.itemsContainer = this.toolboxElement.querySelector('.tool-items');
        if (!this.itemsContainer) {
            this.itemsContainer = document.createElement('div');
            this.itemsContainer.className = 'tool-items';
            this.toolboxElement.appendChild(this.itemsContainer);
        }
        
        this.renderItems();
    }
    
    renderItems() {
        // Clear existing items
        this.itemsContainer.innerHTML = '';
        
        // Add each tool to the toolbox
        this.items.forEach(item => {
            const itemElement = document.createElement('div');
            itemElement.className = `tool-item ${item}`;
            
            // Create the image element separately to handle errors better
            const imgElement = document.createElement('img');
            imgElement.alt = item;
            
            // Set a default placeholder initially
            imgElement.src = 'images/tools/placeholder.svg';
            
            // Try to load the actual image
            const actualImage = new Image();
            actualImage.onload = () => {
                imgElement.src = `images/tools/${item}.svg`;
            };
            actualImage.src = `images/tools/${item}.svg`;
            
            const nameSpan = document.createElement('span');
            nameSpan.textContent = this.formatItemName(item);
            
            // Append elements to the item
            itemElement.appendChild(imgElement);
            itemElement.appendChild(nameSpan);
            
            // Add click handler
            itemElement.addEventListener('click', () => this.selectItem(item));
            
            this.itemsContainer.appendChild(itemElement);
        });
    }
    
    formatItemName(name) {
        return name.charAt(0).toUpperCase() + name.slice(1);
    }
    
    selectItem(item) {
        this.activeItem = item;
        
        // Remove active class from all items
        const toolItems = this.toolboxElement.querySelectorAll('.tool-item');
        toolItems.forEach(el => el.classList.remove('active'));
        
        // Add active class to selected item
        const selectedItem = this.toolboxElement.querySelector(`.tool-item.${item}`);
        if (selectedItem) {
            selectedItem.classList.add('active');
        }
    }
    
    getActiveItem() {
        return this.activeItem;
    }
}
