import { chemicals, hexColorToString } from './chemicals.js';

export class ReactionSystem {
    constructor(options = {}) {
        this.options = Object.assign({
            app: null,
            beakers: []
        }, options);
        
        this.app = this.options.app;
        this.beakers = this.options.beakers;
        
        // Reaction definitions - mapping pairs of chemicals to reactions
        this.reactions = {
            // Acid + Base reactions
            'hydrochloricAcid+sodiumHydroxide': {
                name: 'Neutralization',
                result: 'water',
                byproducts: ['salt'],
                exothermic: true,
                description: 'HCl + NaOH → NaCl + H₂O',
                temperatureChange: 15, // +15°C
                effect: 'neutralization'
            },
            'sulfuricAcid+sodiumHydroxide': {
                name: 'Neutralization',
                result: 'water',
                byproducts: ['sodiumSulfate'],
                exothermic: true,
                description: 'H₂SO₄ + 2NaOH → Na₂SO₄ + 2H₂O',
                temperatureChange: 20, // +20°C
                effect: 'neutralization'
            },
            'aceticAcid+sodiumHydroxide': {
                name: 'Neutralization',
                result: 'water',
                byproducts: ['sodiumAcetate'],
                exothermic: true,
                description: 'CH₃COOH + NaOH → CH₃COONa + H₂O',
                temperatureChange: 10, // +10°C
                effect: 'neutralization'
            },
            'nitricAcid+sodiumHydroxide': {
                name: 'Neutralization',
                result: 'sodiumNitrate',
                byproducts: ['water'],
                exothermic: true,
                description: 'HNO₃ + NaOH → NaNO₃ + H₂O',
                temperatureChange: 18,
                effect: 'neutralization'
            },
            'phosphoricAcid+sodiumHydroxide': {
                name: 'Neutralization',
                result: 'sodiumPhosphate',
                byproducts: ['water'],
                exothermic: true,
                description: 'H₃PO₄ + 3NaOH → Na₃PO₄ + 3H₂O',
                temperatureChange: 22,
                effect: 'neutralization'
            },
            
            // Metal and acid reactions
            'hydrochloricAcid+iron': {
                name: 'Single Displacement',
                result: 'ironChloride',
                byproducts: ['hydrogen'],
                exothermic: true,
                description: '2HCl + Fe → FeCl₂ + H₂',
                temperatureChange: 25,
                effect: 'bubbling'
            },
            
            // Decomposition reactions
            'hydrogenPeroxide': {
                name: 'Decomposition',
                result: 'water',
                byproducts: ['oxygen'],
                exothermic: true,
                description: '2H₂O₂ → 2H₂O + O₂',
                temperatureChange: 10,
                effect: 'rapidBubbling',
                catalyst: 'manganeseOxide'
            },
            
            // Precipitation reactions
            'sodiumChloride+silverNitrate': {
                name: 'Precipitation',
                result: 'silverChloride',
                byproducts: ['sodiumNitrate'],
                exothermic: false,
                description: 'NaCl + AgNO₃ → AgCl↓ + NaNO₃',
                temperatureChange: 0,
                effect: 'precipitation',
                precipitateColor: 0xFFFFFF // white precipitate
            },
            'bariumChloride+sodiumSulfate': {
                name: 'Precipitation',
                result: 'bariumSulfate',
                byproducts: ['sodiumChloride'],
                exothermic: false,
                description: 'BaCl₂ + Na₂SO₄ → BaSO₄↓ + 2NaCl',
                temperatureChange: 0,
                effect: 'precipitation',
                precipitateColor: 0xFFFFFF // white precipitate
            },
            
            // Redox reactions
            'copperSulfate+iron': {
                name: 'Redox Reaction',
                result: 'ironSulfate',
                byproducts: ['copper'],
                exothermic: true,
                description: 'CuSO₄ + Fe → FeSO₄ + Cu',
                temperatureChange: 15,
                effect: 'precipitation',
                precipitateColor: 0xB87333 // copper color
            },
            'potassiumPermanganate+hydrogenPeroxide': {
                name: 'Redox Reaction',
                result: 'water',
                byproducts: ['oxygen', 'manganeseOxide'],
                exothermic: true,
                description: '2KMnO₄ + 5H₂O₂ + 3H₂SO₄ → K₂SO₄ + 2MnSO₄ + 8H₂O + 5O₂',
                temperatureChange: 25,
                effect: 'colorChange',
                colorChange: 0x6a0dad // purple to colorless
            }
        };
        
        // Effects animations
        this.activeEffects = [];
        this.activeReactions = [];
        this.particleSystems = [];
    }
    
    getReactionKey(chemical1, chemical2) {
        // Create a deterministic key for the reaction
        const sorted = [chemical1, chemical2].sort();
        return `${sorted[0]}+${sorted[1]}`;
    }
    
    processReaction(sourceBeaker, targetBeaker, amount, reactionLog) {
        const sourceChemical = sourceBeaker.options.chemicalType;
        const targetChemical = targetBeaker.options.chemicalType;
        
        // Try direct reaction key first
        let reactionKey = `${sourceChemical}+${targetChemical}`;
        let reaction = this.reactions[reactionKey];
        
        // If not found, try the reverse order
        if (!reaction) {
            reactionKey = `${targetChemical}+${sourceChemical}`;
            reaction = this.reactions[reactionKey];
        }
        
        // If still not found, try single chemical reactions (decomposition, etc.)
        if (!reaction) {
            reactionKey = sourceChemical;
            reaction = this.reactions[reactionKey];
        }
        
        if (targetBeaker.options.liquidLevel <= 0) {
            // If target is empty, just transfer the liquid
            this.transferLiquid(sourceBeaker, targetBeaker, amount, reactionLog);
            return;
        }
        
        if (reaction) {
            // We have a reaction!
            this.executeReaction(sourceBeaker, targetBeaker, amount, reaction, reactionLog);
        } else {
            // No reaction, just mix the liquids
            this.mixLiquids(sourceBeaker, targetBeaker, amount, reactionLog);
        }
    }
    
    executeReaction(sourceBeaker, targetBeaker, amount, reaction, reactionLog) {
        if (reactionLog) {
            reactionLog.addEntry(`Reaction: ${reaction.name} - ${reaction.description}`, 'reaction');
        }
        
        // Calculate the resulting liquid - weighted mix based on volumes
        const sourceLiquidVolume = amount;
        const targetLiquidVolume = targetBeaker.options.liquidLevel;
        const totalVolume = Math.min(1, sourceLiquidVolume + targetLiquidVolume);
        
        // Update target beaker with reaction result
        if (chemicals[reaction.result]) {
            targetBeaker.options.chemicalType = reaction.result;
            targetBeaker.setLiquidColor(chemicals[reaction.result].defaultColor);
            targetBeaker.setPHLevel(chemicals[reaction.result].pHLevel);
        } else {
            // Fallback if chemical definition not found
            targetBeaker.options.chemicalType = 'mixture';
            const mixedColor = this.mixColors(sourceBeaker.options.liquidColor, targetBeaker.options.liquidColor, 
                                             sourceLiquidVolume / totalVolume);
            targetBeaker.setLiquidColor(mixedColor);
        }
        
        targetBeaker.setLiquidLevel(totalVolume);
        
        // Handle temperature changes
        if (reaction.exothermic) {
            const weightedTemp = (sourceBeaker.options.temperature * (sourceLiquidVolume / totalVolume)) +
                               (targetBeaker.options.temperature * (targetLiquidVolume / totalVolume));
            let newTemp = weightedTemp + reaction.temperatureChange;
            targetBeaker.setTemperature(newTemp);
        }
        
        // Update description
        targetBeaker.setDescription(chemicals[reaction.result]?.description || reaction.description);
        
        // Reduce the source beaker's liquid
        sourceBeaker.setLiquidLevel(sourceBeaker.options.liquidLevel - amount);
        
        // Create appropriate visual effect
        this.createReactionEffect(targetBeaker, reaction);
        
        // Add to active reactions
        this.activeReactions.push({
            beaker: targetBeaker,
            reaction: reaction,
            startTime: Date.now(),
            duration: 5000, // 5 seconds
            stage: 'start'
        });
    }
    
    transferLiquid(sourceBeaker, targetBeaker, amount, reactionLog) {
        // Simple transfer with no reaction (target was empty)
        targetBeaker.options.chemicalType = sourceBeaker.options.chemicalType;
        targetBeaker.setLiquidLevel(amount);
        targetBeaker.setLiquidColor(sourceBeaker.options.liquidColor);
        targetBeaker.setPHLevel(sourceBeaker.options.pHLevel);
        targetBeaker.setTemperature(sourceBeaker.options.temperature);
        targetBeaker.setDescription(sourceBeaker.options.description);
        
        // Reduce the source beaker's liquid
        sourceBeaker.setLiquidLevel(sourceBeaker.options.liquidLevel - amount);
        
        if (reactionLog) {
            reactionLog.addEntry(`Transferred ${sourceBeaker.options.chemicalType} to ${targetBeaker.options.id}`);
        }
    }
    
    mixLiquids(sourceBeaker, targetBeaker, amount, reactionLog) {
        // Calculate the resulting liquid - weighted mix based on volumes
        const sourceLiquidVolume = amount;
        const targetLiquidVolume = targetBeaker.options.liquidLevel;
        const totalVolume = Math.min(1, sourceLiquidVolume + targetLiquidVolume);
        
        // Mix colors
        const sourceColor = sourceBeaker.options.liquidColor;
        const targetColor = targetBeaker.options.liquidColor;
        const mixedColor = this.mixColors(sourceColor, targetColor, sourceLiquidVolume / totalVolume);
        
        // Mix pH levels (logarithmic)
        const sourceH = Math.pow(10, -sourceBeaker.options.pHLevel);
        const targetH = Math.pow(10, -targetBeaker.options.pHLevel);
        const sourceFraction = sourceLiquidVolume / totalVolume;
        const targetFraction = targetLiquidVolume / totalVolume;
        const mixedH = sourceH * sourceFraction + targetH * targetFraction;
        const mixedPH = -Math.log10(mixedH);
        
        // Mix temperatures
        const mixedTemp = (sourceBeaker.options.temperature * sourceFraction) +
                         (targetBeaker.options.temperature * targetFraction);
        
        // Update target beaker
        targetBeaker.setLiquidLevel(totalVolume);
        targetBeaker.setLiquidColor(mixedColor);
        targetBeaker.setPHLevel(mixedPH);
        targetBeaker.setTemperature(mixedTemp);
        
        // Update description
        const mixDesc = `Mixture of ${sourceBeaker.options.chemicalType} and ${targetBeaker.options.chemicalType}`;
        targetBeaker.setDescription(mixDesc);
        
        // Set chemical type to mixture
        targetBeaker.options.chemicalType = 'mixture';
        
        // Reduce the source beaker's liquid
        sourceBeaker.setLiquidLevel(sourceBeaker.options.liquidLevel - amount);
        
        if (reactionLog) {
            reactionLog.addEntry(`Mixed ${sourceBeaker.options.chemicalType} with ${targetBeaker.options.chemicalType}`);
        }
    }
    
    mixColors(color1, color2, ratio) {
        // Convert hex colors to RGB
        const r1 = (color1 >> 16) & 0xFF;
        const g1 = (color1 >> 8) & 0xFF;
        const b1 = color1 & 0xFF;
        
        const r2 = (color2 >> 16) & 0xFF;
        const g2 = (color2 >> 8) & 0xFF;
        const b2 = color2 & 0xFF;
        
        // Mix colors based on ratio
        const r = Math.round(r1 * ratio + r2 * (1 - ratio));
        const g = Math.round(g1 * ratio + g2 * (1 - ratio));
        const b = Math.round(b1 * ratio + b2 * (1 - ratio));
        
        // Convert back to hex
        return (r << 16) | (g << 8) | b;
    }
    
    createReactionEffect(beaker, reaction) {
        beaker.isReacting = true;
        
        switch (reaction.effect) {
            case 'neutralization':
                beaker.startBubbling();
                break;
                
            case 'precipitation':
                beaker.startPrecipitation(reaction.precipitateColor || 0xFFFFFF);
                break;
                
            case 'colorChange':
                beaker.animateColorChange(reaction.colorChange, 60); // 60 frames
                break;
                
            case 'bubbling':
            case 'rapidBubbling':
                beaker.startBubbling(reaction.effect === 'rapidBubbling' ? 2 : 1);
                break;
                
            default:
                beaker.startBubbling();
        }
    }
    
    update(delta) {
        // Update all active reactions
        for (let i = this.activeReactions.length - 1; i >= 0; i--) {
            const reaction = this.activeReactions[i];
            const elapsed = Date.now() - reaction.startTime;
            
            // Process reaction stages
            if (elapsed > reaction.duration) {
                // Reaction complete
                reaction.beaker.stopBubbling();
                reaction.beaker.stopPrecipitation();
                reaction.beaker.isReacting = false;
                this.activeReactions.splice(i, 1);
            } else if (elapsed > reaction.duration * 0.7 && reaction.stage === 'start') {
                // Transition to ending stage
                reaction.stage = 'ending';
                if (reaction.reaction.effect === 'precipitation') {
                    reaction.beaker.startSettling();
                }
            }
        }
        
        // Update particle systems
        this.particleSystems.forEach(ps => ps.update(delta));
        
        // Update active effects
        for (let i = this.activeEffects.length - 1; i >= 0; i--) {
            const effect = this.activeEffects[i];
            effect.elapsed += delta;
            
            // Remove expired effects
            if (effect.elapsed >= effect.duration) {
                // Stop the effect
                effect.beaker.stopBubbling();
                effect.beaker.isReacting = false;
                
                this.activeEffects.splice(i, 1);
            }
        }
    }
}
