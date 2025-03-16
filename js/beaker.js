export class Beaker {
    constructor(options = {}) {
        // Default options
        this.options = Object.assign({
            x: 0,
            y: 0,
            width: 100,
            height: 150,
            liquidColor: 0x3498db,
            liquidLevel: 0.5, // 0 to 1
            beakerColor: 0xffffff,
            outlineColor: 0x000000,
            outlineWidth: 2,
            draggable: true,
            
            // New scientific properties
            id: `beaker-${Math.floor(Math.random() * 10000)}`,
            chemicalType: "water",
            pHLevel: 7.0,
            temperature: 25, // Celsius
            density: 1.0, // g/mL
            concentration: 1.0, // mol/L
            description: "Water (H₂O)"
        }, options);

        // Create a container for the beaker
        this.container = new PIXI.Container();
        this.container.x = this.options.x;
        this.container.y = this.options.y;
        
        // Center the beaker
        this.container.pivot.x = this.options.width / 2;
        this.container.pivot.y = this.options.height / 2;

        // Create the beaker outline
        this.drawBeaker();
        
        // Create the liquid
        this.drawLiquid();
        
        // Create bubbles container
        this.bubblesContainer = new PIXI.Container();
        this.container.addChild(this.bubblesContainer);
        this.bubbles = [];

        // Add label for the beaker
        this.createLabel();
        
        // Add temperature indicator
        this.createTemperatureIndicator();

        // Make the beaker draggable if enabled
        if (this.options.draggable) {
            this.setupDraggable();
        }
        
        // Animation properties
        this.animationTimer = 0;
        this.isReacting = false;
        this.pouringState = null;
        this.pouringTarget = null;
        this.pouringAmount = 0;
        this.originalPosition = { x: this.container.x, y: this.container.y };
        
        // Add more animation properties
        this.bubbleIntensity = 1;
        this.hasPrecipitate = false;
        this.precipitateColor = 0xFFFFFF;
        this.precipitateAmount = 0;
        this.targetColor = null;
        this.colorChangeFrames = 0;
        this.colorChangeProgress = 0;
        this.originalColor = this.options.liquidColor;
    }

    drawBeaker() {
        // Create the beaker shape
        const beaker = new PIXI.Graphics();
        beaker.lineStyle(this.options.outlineWidth, this.options.outlineColor);
        beaker.beginFill(this.options.beakerColor, 0.3);
        
        // Define beaker shape with rounded bottom
        const w = this.options.width;
        const h = this.options.height;
        
        // Draw the beaker outline
        beaker.drawRect(0, 0, w, h - 20);
        beaker.drawRoundedRect(0, h - 20, w, 20, 10);
        beaker.drawRect(w * 0.1, -10, w * 0.8, 10);
        
        beaker.endFill();
        
        this.container.addChild(beaker);
        this.beakerGraphics = beaker;
    }
    
    drawLiquid() {
        // Create the liquid
        const liquid = new PIXI.Graphics();
        liquid.beginFill(this.options.liquidColor, 0.8);
        
        const w = this.options.width;
        const h = this.options.height;
        const liquidHeight = h * this.options.liquidLevel;
        
        // Draw the liquid based on the level
        if (liquidHeight > 20) {
            liquid.drawRect(2, h - liquidHeight, w - 4, liquidHeight - 20);
            liquid.drawRoundedRect(2, h - 20, w - 4, 18, 10);
        } else {
            liquid.drawRoundedRect(2, h - liquidHeight, w - 4, liquidHeight, 10);
        }
        
        liquid.endFill();
        
        this.container.addChild(liquid);
        this.liquidGraphics = liquid;
    }
    
    setLiquidLevel(level) {
        // Update liquid level (0-1)
        this.options.liquidLevel = Math.max(0, Math.min(1, level));
        
        // Remove old liquid and redraw
        this.container.removeChild(this.liquidGraphics);
        this.drawLiquid();
    }
    
    setLiquidColor(color) {
        // Update liquid color
        this.options.liquidColor = color;
        
        // Remove old liquid and redraw
        this.container.removeChild(this.liquidGraphics);
        this.drawLiquid();
    }

    setupDraggable() {
        this.container.interactive = true;
        this.container.buttonMode = true;
        
        // Variables to track dragging
        this.dragging = false;
        this.dragData = null;
        this.dragOffset = { x: 0, y: 0 };
        
        // Setup event listeners
        this.container
            .on('pointerdown', this.onDragStart.bind(this))
            .on('pointerup', this.onDragEnd.bind(this))
            .on('pointerupoutside', this.onDragEnd.bind(this))
            .on('pointermove', this.onDragMove.bind(this));
    }
    
    onDragStart(event) {
        this.dragging = true;
        this.dragData = event.data;
        const position = this.dragData.getLocalPosition(this.container.parent);
        this.dragOffset.x = this.container.x - position.x;
        this.dragOffset.y = this.container.y - position.y;
        
        // Optional: Bring to front
        if (this.container.parent) {
            this.container.parent.addChild(this.container);
        }
    }
    
    onDragMove(event) {
        if (this.dragging) {
            const newPosition = this.dragData.getLocalPosition(this.container.parent);
            this.container.x = newPosition.x + this.dragOffset.x;
            this.container.y = newPosition.y + this.dragOffset.y;
        }
    }
    
    onDragEnd() {
        this.dragging = false;
        this.dragData = null;
    }

    createLabel() {
        // Create text style
        const style = new PIXI.TextStyle({
            fontFamily: 'Arial',
            fontSize: 12,
            fill: 0x000000,
            align: 'center',
        });
        
        // Create text
        this.label = new PIXI.Text(this.options.id, style);
        this.label.anchor.set(0.5, 0);
        this.label.position.set(this.options.width / 2, this.options.height + 10);
        
        this.container.addChild(this.label);
    }
    
    updateLabel(text) {
        if (this.label) {
            this.label.text = text || this.options.id;
        }
    }
    
    setChemicalType(chemicalType) {
        this.options.chemicalType = chemicalType;
    }
    
    setPHLevel(pH) {
        this.options.pHLevel = Math.max(0, Math.min(14, pH));
    }
    
    setTemperature(temp) {
        this.options.temperature = temp;
        this.updateTemperatureIndicator();
        
        // Add bubbling effect for hot liquids
        if (temp > 70 && this.options.liquidLevel > 0) {
            this.startBubbling();
        } else {
            this.stopBubbling();
        }
    }
    
    setConcentration(concentration) {
        this.options.concentration = Math.max(0, concentration);
    }
    
    setDescription(description) {
        this.options.description = description;
    }
    
    getProperties() {
        return {
            id: this.options.id,
            liquidLevel: this.options.liquidLevel,
            liquidColor: this.options.liquidColor,
            chemicalType: this.options.chemicalType,
            pHLevel: this.options.pHLevel,
            temperature: this.options.temperature,
            density: this.options.density,
            concentration: this.options.concentration,
            description: this.options.description
        };
    }

    createTemperatureIndicator() {
        const thermometer = new PIXI.Graphics();
        
        // Create thermometer background
        thermometer.beginFill(0xFFFFFF);
        thermometer.lineStyle(1, 0x000000);
        thermometer.drawRoundedRect(this.options.width + 5, 0, 10, this.options.height * 0.8, 5);
        thermometer.endFill();
        
        // Create temperature level indicator
        this.tempIndicator = new PIXI.Graphics();
        this.updateTemperatureIndicator();
        
        this.container.addChild(thermometer);
        this.container.addChild(this.tempIndicator);
    }
    
    updateTemperatureIndicator() {
        if (!this.tempIndicator) return;
        
        this.tempIndicator.clear();
        
        // Temperature range: 0-100°C
        const temp = Math.max(0, Math.min(100, this.options.temperature));
        const height = (this.options.height * 0.8) * (temp / 100);
        
        // Color based on temperature (blue-cold to red-hot)
        const t = temp / 100;
        const r = Math.floor(255 * t);
        const b = Math.floor(255 * (1-t));
        const tempColor = (r << 16) | (0 << 8) | b;
        
        this.tempIndicator.beginFill(tempColor);
        this.tempIndicator.drawRoundedRect(
            this.options.width + 6, 
            this.options.height * 0.8 - height, 
            8, 
            height, 
            4
        );
        this.tempIndicator.endFill();
    }
    
    startBubbling(intensity = 1) {
        this.isReacting = true;
        this.bubbleIntensity = intensity;
    }
    
    stopBubbling() {
        this.bubbleIntensity = 0;
        if (!this.hasPrecipitate) {
            this.isReacting = false;
        }
        
        // Clear all bubbles
        this.bubbles = [];
        this.bubblesContainer.removeChildren();
    }
    
    startPrecipitation(color) {
        this.isReacting = true;
        this.hasPrecipitate = true;
        this.precipitateColor = color || 0xFFFFFF;
        
        // Create precipitate particles
        if (!this.precipitateGraphics) {
            this.precipitateGraphics = new PIXI.Graphics();
            this.container.addChild(this.precipitateGraphics);
        }
        
        this.precipitateAmount = 0;
        this.drawPrecipitate();
    }
    
    startSettling() {
        // Transition to settled precipitate
        this.precipitateAmount = 1;
        this.drawPrecipitate();
    }
    
    stopPrecipitation() {
        this.hasPrecipitate = false;
        if (!this.isReacting) {
            this.isReacting = false;
        }
        
        // Remove precipitate
        if (this.precipitateGraphics) {
            this.container.removeChild(this.precipitateGraphics);
            this.precipitateGraphics = null;
        }
    }
    
    drawPrecipitate() {
        if (!this.precipitateGraphics) return;
        
        this.precipitateGraphics.clear();
        
        if (this.precipitateAmount <= 0) return;
        
        const w = this.options.width;
        const h = this.options.height;
        const liquidHeight = h * this.options.liquidLevel;
        
        if (this.precipitateAmount >= 1) {
            // Settled precipitate at the bottom
            this.precipitateGraphics.beginFill(this.precipitateColor, 0.8);
            this.precipitateGraphics.drawRoundedRect(
                2, 
                h - Math.min(liquidHeight * 0.2, 20), 
                w - 4, 
                Math.min(liquidHeight * 0.2, 20), 
                8
            );
            this.precipitateGraphics.endFill();
        } else {
            // Particles suspended in liquid
            this.precipitateGraphics.beginFill(this.precipitateColor, 0.6);
            
            // Draw multiple small particles
            const particleCount = 50 * this.precipitateAmount;
            for (let i = 0; i < particleCount; i++) {
                const particleSize = 1 + Math.random() * 3;
                const px = 10 + Math.random() * (w - 20);
                const py = h - liquidHeight + 10 + Math.random() * (liquidHeight - 20);
                
                this.precipitateGraphics.drawCircle(px, py, particleSize);
            }
            
            this.precipitateGraphics.endFill();
        }
    }
    
    animateColorChange(targetColor, frames) {
        this.isReacting = true;
        this.originalColor = this.options.liquidColor;
        this.targetColor = targetColor;
        this.colorChangeFrames = frames;
        this.colorChangeProgress = 0;
    }
    
    updateColorAnimation() {
        if (this.targetColor === null) return;
        
        this.colorChangeProgress++;
        
        if (this.colorChangeProgress >= this.colorChangeFrames) {
            // Animation complete
            this.setLiquidColor(this.targetColor);
            this.targetColor = null;
        } else {
            // Interpolate color
            const progress = this.colorChangeProgress / this.colorChangeFrames;
            const currentColor = this.interpolateColor(this.originalColor, this.targetColor, progress);
            this.setLiquidColor(currentColor);
        }
    }
    
    interpolateColor(color1, color2, ratio) {
        // Convert hex colors to RGB
        const r1 = (color1 >> 16) & 0xFF;
        const g1 = (color1 >> 8) & 0xFF;
        const b1 = color1 & 0xFF;
        
        const r2 = (color2 >> 16) & 0xFF;
        const g2 = (color2 >> 8) & 0xFF;
        const b2 = color2 & 0xFF;
        
        // Mix colors based on ratio
        const r = Math.round(r1 * (1 - ratio) + r2 * ratio);
        const g = Math.round(g1 * (1 - ratio) + g2 * ratio);
        const b = Math.round(b1 * (1 - ratio) + b2 * ratio);
        
        // Convert back to hex
        return (r << 16) | (g << 8) | b;
    }
    
    createBubble() {
        if (this.options.liquidLevel <= 0 || this.bubbleIntensity <= 0) return;
        
        const bubble = new PIXI.Graphics();
        const size = 2 + Math.random() * 6 * this.bubbleIntensity;
        const x = 10 + Math.random() * (this.options.width - 20);
        const y = this.options.height - (this.options.liquidLevel * this.options.height * 0.2);
        
        bubble.beginFill(0xFFFFFF, 0.7);
        bubble.drawCircle(0, 0, size);
        bubble.endFill();
        
        bubble.x = x;
        bubble.y = y;
        bubble.vy = (-0.5 - Math.random() * 1.5) * this.bubbleIntensity;
        bubble.size = size;
        
        this.bubblesContainer.addChild(bubble);
        this.bubbles.push(bubble);
    }
    
    updateBubbles() {
        // Create new bubbles randomly when reacting
        if (this.isReacting && Math.random() < 0.2 * this.bubbleIntensity) {
            this.createBubble();
        }
        
        // Update bubble positions
        for (let i = this.bubbles.length - 1; i >= 0; i--) {
            const bubble = this.bubbles[i];
            bubble.y += bubble.vy;
            
            // Add some horizontal wobble
            bubble.x += Math.sin(this.animationTimer * 0.1 + i) * 0.3;
            
            // Remove bubbles that reach the top
            const liquidTop = this.options.height - (this.options.liquidLevel * this.options.height);
            if (bubble.y < liquidTop) {
                this.bubblesContainer.removeChild(bubble);
                this.bubbles.splice(i, 1);
            }
        }
    }
    
    setupPouringInteraction(stage, targetBeakers, reactionSystem, reactionLog) {
        this.container.on('pointerdown', (event) => {
            // Start dragging
            this.onDragStart(event);
            
            // Record original position for snapping back
            this.originalPosition = { x: this.container.x, y: this.container.y };
        });
        
        this.container.on('pointerup', (event) => {
            // Check if we're over another beaker
            if (this.dragging && this.options.liquidLevel > 0) {
                let didPour = false;
                
                for (const target of targetBeakers) {
                    const targetBounds = target.container.getBounds();
                    const localPoint = event.data.getLocalPosition(stage);
                    
                    if (localPoint.x > targetBounds.x && 
                        localPoint.x < targetBounds.x + targetBounds.width &&
                        localPoint.y > targetBounds.y && 
                        localPoint.y < targetBounds.y + targetBounds.height) {
                        
                        // Pour into the target beaker
                        didPour = true;
                        this.pourInto(target, reactionSystem, reactionLog);
                        break;
                    }
                }
                
                // If we didn't pour, snap back to original position
                if (!didPour) {
                    this.container.x = this.originalPosition.x;
                    this.container.y = this.originalPosition.y;
                }
            }
            
            // End dragging
            this.onDragEnd();
        });
        
        // Keep the pointermove handler from the original draggable setup
    }
    
    pourInto(targetBeaker, reactionSystem, reactionLog) {
        if (this.options.liquidLevel <= 0) return;
        
        // Calculate amount to pour (let's say 20% of our liquid)
        const amountToPour = this.options.liquidLevel * 0.2;
        
        // Don't pour if target is already full
        if (targetBeaker.options.liquidLevel >= 1) {
            if (reactionLog) {
                reactionLog.addEntry(`Cannot pour into ${targetBeaker.options.id} - it's already full.`);
            }
            return;
        }
        
        // Create a pouring animation
        this.pouringState = {
            target: targetBeaker,
            progress: 0,
            duration: 60, // frames
            amount: amountToPour
        };
        
        // Record chemistry information for reaction
        const sourceInfo = {
            chemicalType: this.options.chemicalType,
            pHLevel: this.options.pHLevel,
            temperature: this.options.temperature,
            concentration: this.options.concentration,
            amount: amountToPour
        };
        
        const targetInfo = {
            chemicalType: targetBeaker.options.chemicalType,
            pHLevel: targetBeaker.options.pHLevel,
            temperature: targetBeaker.options.temperature,
            concentration: targetBeaker.options.concentration,
            amount: targetBeaker.options.liquidLevel
        };
        
        // Log the pouring action
        if (reactionLog) {
            reactionLog.addEntry(`Pouring ${this.options.chemicalType} from ${this.options.id} into ${targetBeaker.options.id}`);
        }
        
        // Process the chemical reaction immediately
        if (reactionSystem) {
            reactionSystem.processReaction(this, targetBeaker, amountToPour, reactionLog);
        }
    }
    
    update(delta) {
        // Update animation timer
        this.animationTimer += delta;
        
        // Create new bubbles randomly when reacting
        if (this.isReacting && Math.random() < 0.2 * this.bubbleIntensity) {
            this.createBubble();
        }
        
        // Update bubbles
        this.updateBubbles();
        
        // Update color animation if active
        if (this.targetColor !== null) {
            this.updateColorAnimation();
        }
        
        // Handle pouring animation
        if (this.pouringState) {
            this.pouringState.progress++;
            
            if (this.pouringState.progress >= this.pouringState.duration) {
                // Animation complete, reset
                this.pouringState = null;
                // Return to original position
                this.container.x = this.originalPosition.x;
                this.container.y = this.originalPosition.y;
            }
        }
        
        // Update precipitate animation
        if (this.hasPrecipitate && this.precipitateAmount < 1) {
            this.precipitateAmount += 0.005 * delta;
            if (this.precipitateAmount > 1) this.precipitateAmount = 1;
            this.drawPrecipitate();
        }
    }
}
