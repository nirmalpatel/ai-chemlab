import { chemicals, chemicalCategories, hexColorToString, stringColorToHex, getColorFromPh } from './chemicals.js';

export class ControlPanel {
    constructor(options = {}) {
        console.log('ControlPanel constructor called with options:', options);
        this.options = Object.assign({
            containerId: 'control-panel',
            beakers: []
        }, options);
        
        this.currentBeakerId = null;
        this.beakers = this.options.beakers || [];
        
        // Delay initialization to ensure DOM is ready
        setTimeout(() => {
            this.createPanel();
            this.bindEvents();
            
            // Force visibility check again after creation
            if (this.panel) {
                console.log('Forcing control panel visibility after initialization');
                this.panel.style.display = 'block';
                this.panel.style.visibility = 'visible';
                this.panel.style.opacity = '1';
            }
        }, 100);
    }
    
    createPanel() {
        console.log('Creating/finding control panel...');
        // Look for existing panel
        this.panel = document.getElementById(this.options.containerId);
        
        if (!this.panel) {
            console.error('Control panel element not found and could not be created');
            return;
        }
        
        console.log('Found control panel element:', this.panel);
        
        // Create panel content
        try {
            this.renderPanelContent();
            
            // Apply direct styles for visibility
            this.panel.style.display = 'block';
            this.panel.style.visibility = 'visible';
            this.panel.style.opacity = '1';
            this.panel.style.zIndex = '10000';
            
            // Add the CSS class if missing
            if (!this.panel.classList.contains('control-panel')) {
                this.panel.classList.add('control-panel');
            }
            if (!this.panel.classList.contains('side-panel')) {
                this.panel.classList.add('side-panel');
            }
        } catch (error) {
            console.error('Error rendering control panel content:', error);
        }
    }
    
    renderPanelContent() {
        console.log('Rendering control panel content...');
        
        if (!this.panel) {
            console.error('Cannot render panel content - panel element is null');
            return;
        }
        
        if (!this.beakers || this.beakers.length === 0) {
            console.warn('No beakers available for the control panel');
            this.panel.innerHTML = '<h2>Chemistry Lab Control Panel</h2><p>No beakers available to control</p>';
            return;
        }

        // Use the imported chemicalCategories from chemicals.js
        
        console.log('Generating HTML for beakers:', this.beakers.map(b => b.options.id));

        let html = `
            <h2>Chemistry Lab Control Panel</h2>
            <div class="beaker-selector property-group">
                <label for="beaker-select">Select Beaker:</label>
                <select id="beaker-select">
                    ${this.beakers.map(beaker => 
                        `<option value="${beaker.options.id}">${beaker.options.id}</option>`
                    ).join('')}
                </select>
            </div>
            
            <!-- Rest of panel content... -->
        `;
        
        // Add the rest of the panel HTML
        html += this.generatePropertyGroups(chemicalCategories);
        
        console.log('Setting panel HTML, length:', html.length);
        
        // Set the HTML content
        this.panel.innerHTML = html;
        
        console.log('Panel content set successfully. DOM updated. HTML length:', this.panel.innerHTML.length);
    }
    
    generatePropertyGroups(chemicalCategories) {
        // First check if chemicals is properly imported and has content
        if (!chemicals || Object.keys(chemicals).length === 0) {
            console.error('Chemicals data is missing or empty. Check chemicals.js import.');
            return `
                <div class="property-group">
                    <h3>Error: Chemicals data not available</h3>
                    <p>Unable to load chemicals data. Please check the console for more details.</p>
                </div>
            `;
        }
        
        return `
            <div class="property-group">
                <h3>Liquid Properties</h3>
                <div class="property-row">
                    <div class="property-name">Chemical Type:</div>
                    <div class="property-value">
                        <select id="chemical-type">
                            ${Object.keys(chemicalCategories).map(category => 
                                `<optgroup label="${category}">
                                    ${chemicalCategories[category].map(key => {
                                        // Safely check if chemical exists before accessing its properties
                                        const chemical = chemicals[key];
                                        if (!chemical) {
                                            console.warn(`Chemical '${key}' not found in chemicals data`);
                                            return `<option value="${key}">${key} (unknown)</option>`;
                                        }
                                        return `<option value="${key}">${chemical.name || key} (${chemical.formula || 'unknown'})</option>`;
                                    }).join('')}
                                </optgroup>`
                            ).join('')}
                        </select>
                    </div>
                </div>
                <div class="property-row">
                    <div class="property-name">Liquid Level:</div>
                    <div class="property-value">
                        <input type="range" id="liquid-level" min="0" max="1" step="0.01" value="0.5">
                        <span id="liquid-level-value">50%</span>
                    </div>
                </div>
                <div class="property-row">
                    <div class="property-name">Liquid Color:</div>
                    <div class="property-value color-picker-container">
                        <input type="color" id="liquid-color" value="#3498db">
                        <span id="color-value" class="color-value">#3498db</span>
                    </div>
                </div>
            </div>
            
            <div class="property-group">
                <h3>Scientific Properties</h3>
                <div class="property-row">
                    <div class="property-name">pH Level:</div>
                    <div class="property-value">
                        <input type="range" id="ph-level" min="0" max="14" step="0.1" value="7">
                        <span id="ph-level-value">7.0</span>
                    </div>
                </div>
                <div class="property-row">
                    <div class="property-name">Temperature (°C):</div>
                    <div class="property-value">
                        <input type="range" id="temperature" min="0" max="100" step="1" value="25">
                        <span id="temperature-value">25°C</span>
                    </div>
                </div>
                <div class="property-row">
                    <div class="property-name">Concentration (mol/L):</div>
                    <div class="property-value">
                        <input type="range" id="concentration" min="0" max="5" step="0.1" value="1">
                        <span id="concentration-value">1.0</span>
                    </div>
                </div>
            </div>
            
            <div class="property-group">
                <h3>Description</h3>
                <div id="description-container">
                    <p id="chemical-description">Select a beaker to see its description.</p>
                </div>
            </div>
        `;
    }
    
    bindEvents() {
        // Beaker selection change
        const beakerSelect = document.getElementById('beaker-select');
        if (beakerSelect) {
            beakerSelect.addEventListener('change', (e) => {
                this.currentBeakerId = e.target.value;
                this.updateControlsFromBeaker();
            });
            
            // Initialize with the first beaker if available
            if (beakerSelect.options.length > 0) {
                this.currentBeakerId = beakerSelect.options[0].value;
                this.updateControlsFromBeaker();
            }
        }
        
        // Liquid level change
        const liquidLevel = document.getElementById('liquid-level');
        if (liquidLevel) {
            liquidLevel.addEventListener('input', (e) => {
                const level = parseFloat(e.target.value);
                document.getElementById('liquid-level-value').textContent = `${Math.round(level * 100)}%`;
                this.updateBeakerProperty('liquidLevel', level);
            });
        }
        
        // Liquid color change
        const liquidColor = document.getElementById('liquid-color');
        if (liquidColor) {
            liquidColor.addEventListener('input', (e) => {
                const color = e.target.value;
                document.getElementById('color-value').textContent = color;
                this.updateBeakerProperty('liquidColor', stringColorToHex(color));
            });
        }
        
        // Chemical type change
        const chemicalType = document.getElementById('chemical-type');
        if (chemicalType) {
            chemicalType.addEventListener('change', (e) => {
                const type = e.target.value;
                const chemical = chemicals[type];
                
                if (!chemical) {
                    console.error(`Chemical '${type}' not found in chemicals data`);
                    return;
                }
                
                this.updateBeakerProperty('chemicalType', type);
                this.updateBeakerProperty('description', chemical.description || 'No description available.');
                
                // Update related properties based on the chemical
                document.getElementById('ph-level').value = chemical.pHLevel || 7;
                document.getElementById('ph-level-value').textContent = (chemical.pHLevel || 7).toFixed(1);
                this.updateBeakerProperty('pHLevel', chemical.pHLevel || 7);
                
                document.getElementById('temperature').value = chemical.defaultTemperature || 25;
                document.getElementById('temperature-value').textContent = `${chemical.defaultTemperature || 25}°C`;
                this.updateBeakerProperty('temperature', chemical.defaultTemperature || 25);
                
                document.getElementById('liquid-color').value = hexColorToString(chemical.defaultColor || 0x3498db);
                document.getElementById('color-value').textContent = hexColorToString(chemical.defaultColor || 0x3498db);
                this.updateBeakerProperty('liquidColor', chemical.defaultColor || 0x3498db);
                
                document.getElementById('chemical-description').textContent = chemical.description || 'No description available.';
            });
        }
        
        // pH level change
        const phLevel = document.getElementById('ph-level');
        if (phLevel) {
            phLevel.addEventListener('input', (e) => {
                const ph = parseFloat(e.target.value);
                document.getElementById('ph-level-value').textContent = ph.toFixed(1);
                this.updateBeakerProperty('pHLevel', ph);
                
                // Optionally update color based on pH
                // const phColor = getColorFromPh(ph);
                // document.getElementById('liquid-color').value = hexColorToString(phColor);
                // document.getElementById('color-value').textContent = hexColorToString(phColor);
                // this.updateBeakerProperty('liquidColor', phColor);
            });
        }
        
        // Temperature change
        const temperature = document.getElementById('temperature');
        if (temperature) {
            temperature.addEventListener('input', (e) => {
                const temp = parseFloat(e.target.value);
                document.getElementById('temperature-value').textContent = `${temp}°C`;
                this.updateBeakerProperty('temperature', temp);
            });
        }
        
        // Concentration change
        const concentration = document.getElementById('concentration');
        if (concentration) {
            concentration.addEventListener('input', (e) => {
                const conc = parseFloat(e.target.value);
                document.getElementById('concentration-value').textContent = conc.toFixed(1);
                this.updateBeakerProperty('concentration', conc);
            });
        }
    }
    
    updateControlsFromBeaker() {
        const beaker = this.getSelectedBeaker();
        if (!beaker) return;
        
        const props = beaker.getProperties();
        
        // Update controls to match beaker properties
        document.getElementById('liquid-level').value = props.liquidLevel;
        document.getElementById('liquid-level-value').textContent = `${Math.round(props.liquidLevel * 100)}%`;
        
        document.getElementById('liquid-color').value = hexColorToString(props.liquidColor);
        document.getElementById('color-value').textContent = hexColorToString(props.liquidColor);
        
        document.getElementById('chemical-type').value = props.chemicalType;
        
        document.getElementById('ph-level').value = props.pHLevel;
        document.getElementById('ph-level-value').textContent = props.pHLevel.toFixed(1);
        
        document.getElementById('temperature').value = props.temperature;
        document.getElementById('temperature-value').textContent = `${props.temperature}°C`;
        
        document.getElementById('concentration').value = props.concentration;
        document.getElementById('concentration-value').textContent = props.concentration.toFixed(1);
        
        document.getElementById('chemical-description').textContent = props.description;
    }
    
    updateBeakerProperty(property, value) {
        const beaker = this.getSelectedBeaker();
        if (!beaker) return;
        
        switch(property) {
            case 'liquidLevel':
                beaker.setLiquidLevel(value);
                break;
            case 'liquidColor':
                beaker.setLiquidColor(value);
                break;
            case 'chemicalType':
                beaker.setChemicalType(value);
                break;
            case 'pHLevel':
                beaker.setPHLevel(value);
                break;
            case 'temperature':
                beaker.setTemperature(value);
                break;
            case 'concentration':
                beaker.setConcentration(value);
                break;
            case 'description':
                beaker.setDescription(value);
                document.getElementById('chemical-description').textContent = value;
                break;
        }
    }
    
    getSelectedBeaker() {
        if (!this.currentBeakerId) return null;
        return this.beakers.find(beaker => beaker.options.id === this.currentBeakerId);
    }
    
    addBeaker(beaker) {
        this.beakers.push(beaker);
        this.renderPanelContent();
        this.bindEvents();
    }
    
    removeBeaker(beakerId) {
        this.beakers = this.beakers.filter(beaker => beaker.options.id !== beakerId);
        this.renderPanelContent();
        this.bindEvents();
    }
}
