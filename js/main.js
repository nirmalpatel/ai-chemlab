import { Beaker } from './beaker.js';
import { ControlPanel } from './control-panel.js';
import { chemicals } from './chemicals.js';
import { ReactionSystem } from './reaction-system.js';
import { ReactionLog } from './reaction-log.js';
import { Toolbox } from './toolbox.js';
import { debugElement, forceElementVisibility } from './debug-utils.js';

// Ensure CSS is loaded
function ensureStylesLoaded() {
    // Check if our stylesheets are already loaded
    const requiredStyles = ['style.css', 'control-panel.css', 'components.css', 'styles.css'];
    const loadedStylesheets = Array.from(document.styleSheets).map(sheet => 
        sheet.href ? sheet.href.split('/').pop() : '');
    
    console.log('Currently loaded stylesheets:', loadedStylesheets);
    
    // Load any missing styles
    requiredStyles.forEach(stylesheet => {
        if (!loadedStylesheets.some(sheet => sheet.includes(stylesheet))) {
            console.log(`Loading missing stylesheet: ${stylesheet}`);
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = `css/${stylesheet}`;
            document.head.appendChild(link);
        }
    });
    
    // Add inline styles for critical panel visibility
    const style = document.createElement('style');
    style.textContent = `
        .control-panel, .reaction-log, .toolbox {
            display: block !important;
            visibility: visible !important;
            opacity: 1 !important;
        }
    `;
    document.head.appendChild(style);
}

// Wait for DOM content to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM fully loaded');
    
    // Ensure our styles are loaded
    ensureStylesLoaded();
    
    // Debug initial state of control panel
    debugElement('control-panel', 'Initial state of control panel');
    
    // Make sure PIXI is loaded
    if (typeof PIXI === 'undefined') {
        console.error('PIXI is not defined. Make sure the PixiJS library is loaded properly.');
        return;
    }

    // Initialize PixiJS Application
    const app = new PIXI.Application({
        width: window.innerWidth,
        height: window.innerHeight,
        backgroundColor: 0xf0f0f0,
        antialias: true,
        resizeTo: window
    });

    // Add the canvas to the HTML document - Fixed approach
    const sceneContainer = document.getElementById('scene-container');
    if (sceneContainer) {
        // Depending on PIXI version, canvas might be accessed differently
        if (app.view instanceof HTMLCanvasElement) {
            sceneContainer.appendChild(app.view);
        } else if (app.view && app.view.canvas instanceof HTMLCanvasElement) {
            sceneContainer.appendChild(app.view.canvas);
        } else {
            console.error('Unable to access PIXI canvas element. Check PIXI version compatibility.');
            return;
        }
    } else {
        console.error('Scene container not found in the document');
        return;
    }

    // Create beakers with different chemicals to demonstrate reactions
    const beaker1 = new Beaker({
        id: 'Beaker A',
        x: window.innerWidth / 4,
        y: window.innerHeight / 2,
        width: 150,
        height: 200,
        liquidColor: chemicals.sodiumHydroxide.defaultColor,
        liquidLevel: 0.7, // 70% filled
        chemicalType: 'sodiumHydroxide',
        pHLevel: chemicals.sodiumHydroxide.pHLevel,
        temperature: chemicals.sodiumHydroxide.defaultTemperature,
        density: chemicals.sodiumHydroxide.density,
        description: chemicals.sodiumHydroxide.description
    });

    const beaker2 = new Beaker({
        id: 'Beaker B',
        x: 2 * window.innerWidth / 4,
        y: window.innerHeight / 2,
        width: 150,
        height: 200,
        liquidColor: chemicals.hydrochloricAcid.defaultColor,
        liquidLevel: 0.5, // 50% filled
        chemicalType: 'hydrochloricAcid',
        pHLevel: chemicals.hydrochloricAcid.pHLevel,
        temperature: chemicals.hydrochloricAcid.defaultTemperature,
        density: chemicals.hydrochloricAcid.density,
        description: chemicals.hydrochloricAcid.description
    });

    // Create another beaker with silver nitrate for precipitation reactions
    const beaker3 = new Beaker({
        id: 'Beaker C',
        x: 3 * window.innerWidth / 4,
        y: window.innerHeight / 2,
        width: 150,
        height: 200,
        liquidColor: chemicals.silverNitrate.defaultColor,
        liquidLevel: 0.6, // 60% filled
        chemicalType: 'silverNitrate',
        pHLevel: chemicals.silverNitrate.pHLevel,
        temperature: chemicals.silverNitrate.defaultTemperature,
        density: chemicals.silverNitrate.density,
        description: chemicals.silverNitrate.description
    });

    // Create an empty beaker for mixing
    const beaker4 = new Beaker({
        id: 'Mixing Beaker',
        x: window.innerWidth / 2,
        y: window.innerHeight / 2 + 200,
        width: 180,
        height: 220,
        liquidColor: 0xFFFFFF,
        liquidLevel: 0, // Empty
        chemicalType: 'empty',
        pHLevel: 7.0,
        temperature: 25,
        density: 1.0,
        description: "Empty beaker ready for mixing chemicals"
    });

    // Add beakers to the stage
    app.stage.addChild(beaker1.container);
    app.stage.addChild(beaker2.container);
    app.stage.addChild(beaker3.container);
    app.stage.addChild(beaker4.container);
    
    // Initialize reaction system with all beakers
    const reactionSystem = new ReactionSystem({
        app: app,
        beakers: [beaker1, beaker2, beaker3, beaker4]
    });

    // Initialize reaction log - ensure the container exists
    const reactionLogElement = document.getElementById('reaction-log');
    if (!reactionLogElement) {
        console.log('Creating reaction log element');
        const logDiv = document.createElement('div');
        logDiv.id = 'reaction-log';
        logDiv.className = 'reaction-log side-panel';
        document.body.appendChild(logDiv);
    }
    
    // Initialize reaction log
    const reactionLog = new ReactionLog({
        containerId: 'reaction-log'
    });
    
    // Update initial log message
    reactionLog.addEntry('Welcome to AI ChemLab! Mix chemicals to see reactions. Try mixing acids with bases or salt solutions!');

    // Initialize toolbox - ensure the container exists
    const toolboxElement = document.getElementById('toolbox');
    if (!toolboxElement) {
        console.log('Creating toolbox element');
        const toolDiv = document.createElement('div');
        toolDiv.id = 'toolbox';
        toolDiv.className = 'toolbox side-panel';
        document.body.appendChild(toolDiv);
    }

    // Initialize toolbox
    const toolbox = new Toolbox({
        containerId: 'toolbox',
        app: app,
        items: ['thermometer', 'stirrer', 'dropper', 'burner']
    });

    // Initialize control panel with more robust checks
    console.log('Initializing control panel');
    const controlPanelElement = document.getElementById('control-panel');
    
    if (!controlPanelElement) {
        console.error('Control panel element not found, creating it');
        const panel = document.createElement('div');
        panel.id = 'control-panel';
        panel.className = 'control-panel side-panel';
        panel.innerHTML = '<h2>Chemistry Lab Control Panel</h2><p>Loading control panel...</p>';
        document.body.appendChild(panel);
    } else {
        console.log('Found existing control panel element:', controlPanelElement);
        // Ensure the element has some initial content
        if (!controlPanelElement.innerHTML || controlPanelElement.innerHTML.trim() === '') {
            controlPanelElement.innerHTML = '<h2>Chemistry Lab Control Panel</h2><p>Loading control panel...</p>';
        }
    }

    // Force visibility of all panels before creating controllers
    forceElementVisibility('control-panel');
    forceElementVisibility('reaction-log');
    forceElementVisibility('toolbox');

    // Setup UI in a short timeout to ensure DOM is ready
    setTimeout(() => {
        console.log('Setting up UI components with delay');
        
        // Initialize control panel with all beakers
        const controlPanel = new ControlPanel({
            containerId: 'control-panel',
            beakers: [beaker1, beaker2, beaker3, beaker4],
            reactionSystem: reactionSystem,
            reactionLog: reactionLog
        });
        
        // Debug the state after initialization
        debugElement('control-panel', 'Control panel after initialization');
        
        // Rest of the setup...
    }, 500);

    // Force visibility of control panel
    const cpanel = document.getElementById('control-panel');
    if (cpanel) {
        cpanel.style.display = 'block';
        cpanel.style.visibility = 'visible';
        cpanel.style.opacity = '1';
        console.log('Control panel element ready:', cpanel);
    }

    // Debug check for control panel content
    console.log('Control panel HTML content:', document.getElementById('control-panel').innerHTML);

    // Make sure all panels are visible
    document.getElementById('control-panel').style.display = 'block';
    document.getElementById('reaction-log').style.display = 'block';
    document.getElementById('toolbox').style.display = 'block';

    // Setup interactive pouring between all beakers
    const allBeakers = [beaker1, beaker2, beaker3, beaker4];
    allBeakers.forEach(sourceBeaker => {
        const targetBeakers = allBeakers.filter(b => b !== sourceBeaker);
        sourceBeaker.setupPouringInteraction(app.stage, targetBeakers, reactionSystem, reactionLog);
    });

    // Handle window resize
    window.addEventListener('resize', () => {
        beaker1.container.x = window.innerWidth / 4;
        beaker1.container.y = window.innerHeight / 2;
        
        beaker2.container.x = 2 * window.innerWidth / 4;
        beaker2.container.y = window.innerHeight / 2;
        
        beaker3.container.x = 3 * window.innerWidth / 4;
        beaker3.container.y = window.innerHeight / 2;

        beaker4.container.x = window.innerWidth / 2;
        beaker4.container.y = window.innerHeight / 2 + 200;
    });
    
    // Add animation ticker
    app.ticker.add((delta) => {
        // Update beaker animations
        beaker1.update(delta);
        beaker2.update(delta);
        beaker3.update(delta);
        beaker4.update(delta);
        
        // Update reaction system
        reactionSystem.update(delta);
    });
    
    console.log('Setup complete');
});
