/**
 * Chemical definitions for the chemistry simulation
 * Each chemical has properties for visualization and reactions
 */
export const chemicals = {
    // Basic chemicals
    water: {
        name: "Water",
        formula: "H₂O",
        defaultColor: 0xADD8E6, // Light blue
        pHLevel: 7.0,
        defaultTemperature: 25,
        density: 1.0,
        description: "Pure water (H₂O), a colorless liquid essential for life."
    },
    
    // Acids
    hydrochloricAcid: {
        name: "Hydrochloric Acid",
        formula: "HCl",
        defaultColor: 0xE6F7FF, // Very pale blue
        pHLevel: 1.0,
        defaultTemperature: 25,
        density: 1.2,
        description: "Strong acid (HCl) that completely dissociates in water."
    },
    
    sulphuricAcid: {
        name: "Sulphuric Acid",
        formula: "H₂SO₄",
        defaultColor: 0xFFF0E0, // Very pale yellow
        pHLevel: 0.5,
        defaultTemperature: 25,
        density: 1.84,
        description: "Highly corrosive strong acid (H₂SO₄) used in many industrial applications."
    },
    
    // Added missing acids referenced in chemicalCategories
    sulfuricAcid: {
        name: "Sulfuric Acid",
        formula: "H₂SO₄",
        defaultColor: 0xFFF0E0, // Very pale yellow
        pHLevel: 0.5,
        defaultTemperature: 25,
        density: 1.84,
        description: "Highly corrosive strong acid (H₂SO₄) used in many industrial applications."
    },
    
    nitricAcid: {
        name: "Nitric Acid",
        formula: "HNO₃",
        defaultColor: 0xFFFFF0, // Very pale yellow
        pHLevel: 1.2,
        defaultTemperature: 25,
        density: 1.51,
        description: "Strong, corrosive mineral acid (HNO₃) that is a powerful oxidizing agent."
    },
    
    phosphoricAcid: {
        name: "Phosphoric Acid",
        formula: "H₃PO₄",
        defaultColor: 0xF9F9F9, // Very light gray
        pHLevel: 2.0,
        defaultTemperature: 25,
        density: 1.88,
        description: "Medium-strong acid (H₃PO₄) commonly used in fertilizers and food products."
    },
    
    aceticAcid: {
        name: "Acetic Acid",
        formula: "CH₃COOH",
        defaultColor: 0xFCFCFC, // Nearly white
        pHLevel: 2.9,
        defaultTemperature: 25,
        density: 1.05,
        description: "Weak acid (CH₃COOH) that gives vinegar its characteristic sour taste and pungent smell."
    },
    
    // Bases
    sodiumHydroxide: {
        name: "Sodium Hydroxide",
        formula: "NaOH",
        defaultColor: 0xF0F0FF, // Very pale purple
        pHLevel: 14.0,
        defaultTemperature: 25,
        density: 1.1,
        description: "Strong base (NaOH) also known as lye or caustic soda."
    },
    
    // Added missing bases referenced in chemicalCategories
    potassiumHydroxide: {
        name: "Potassium Hydroxide",
        formula: "KOH",
        defaultColor: 0xF0F0F5, // Very pale purple
        pHLevel: 13.5,
        defaultTemperature: 25,
        density: 2.12,
        description: "Strong base (KOH) also known as caustic potash, used in various industrial applications."
    },
    
    calciumHydroxide: {
        name: "Calcium Hydroxide",
        formula: "Ca(OH)₂",
        defaultColor: 0xFAFAFA, // Almost white
        pHLevel: 12.8,
        defaultTemperature: 25,
        density: 2.21,
        description: "Moderately strong base (Ca(OH)₂) also known as slaked lime, used in mortar and plaster."
    },
    
    ammoniumHydroxide: {
        name: "Ammonium Hydroxide",
        formula: "NH₄OH",
        defaultColor: 0xF8F8FF, // Ghost white
        pHLevel: 11.0,
        defaultTemperature: 25,
        density: 0.91,
        description: "Weak base (NH₄OH) formed from ammonia in water, used as a cleaning agent."
    },
    
    // Metal salts
    sodiumChloride: {
        name: "Sodium Chloride",
        formula: "NaCl",
        defaultColor: 0xFFFFFA, // Off-white
        pHLevel: 7.0,
        defaultTemperature: 25,
        density: 2.16,
        description: "Common table salt (NaCl) formed from sodium and chloride ions."
    },
    
    // Added missing salts referenced in chemicalCategories
    potassiumChloride: {
        name: "Potassium Chloride",
        formula: "KCl",
        defaultColor: 0xFFFFF5, // Off-white
        pHLevel: 7.0,
        defaultTemperature: 25,
        density: 1.98,
        description: "White crystalline salt (KCl) used as a fertilizer and in medicine."
    },
    
    calciumChloride: {
        name: "Calcium Chloride",
        formula: "CaCl₂",
        defaultColor: 0xFAFAFA, // Almost white
        pHLevel: 7.0,
        defaultTemperature: 25,
        density: 2.15,
        description: "White crystalline salt (CaCl₂) used for de-icing and food preservation."
    },
    
    magnesiumSulfate: {
        name: "Magnesium Sulfate",
        formula: "MgSO₄",
        defaultColor: 0xFCFCFC, // Almost white
        pHLevel: 7.0,
        defaultTemperature: 25,
        density: 2.66,
        description: "White crystalline salt (MgSO₄) commonly known as Epsom salt, used in bath salts and as a fertilizer."
    },
    
    copperSulphate: {
        name: "Copper Sulphate",
        formula: "CuSO₄",
        defaultColor: 0x1E90FF, // Bright blue
        pHLevel: 4.0,
        defaultTemperature: 25,
        density: 3.6,
        description: "Blue crystalline salt (CuSO₄) used in agriculture and as a fungicide."
    },
    
    silverNitrate: {
        name: "Silver Nitrate",
        formula: "AgNO₃",
        defaultColor: 0xF5F5F5, // Very light grey/white
        pHLevel: 5.5,
        defaultTemperature: 25,
        density: 4.35,
        description: "Inorganic compound (AgNO₃) used in chemistry and photography."
    },
    
    // Added missing solvents referenced in chemicalCategories
    ethanol: {
        name: "Ethanol",
        formula: "C₂H₅OH",
        defaultColor: 0xFFFFFD, // Nearly transparent
        pHLevel: 7.0,
        defaultTemperature: 25,
        density: 0.789,
        description: "Colorless, flammable liquid (C₂H₅OH) used as a solvent and in alcoholic beverages."
    },
    
    methanol: {
        name: "Methanol",
        formula: "CH₃OH",
        defaultColor: 0xFFFFFD, // Nearly transparent
        pHLevel: 7.0,
        defaultTemperature: 25,
        density: 0.792,
        description: "Simplest alcohol (CH₃OH), a light, volatile, colorless, flammable liquid used as fuel and solvent."
    },
    
    acetone: {
        name: "Acetone",
        formula: "C₃H₆O",
        defaultColor: 0xFFFFFD, // Nearly transparent
        pHLevel: 7.0,
        defaultTemperature: 25,
        density: 0.784,
        description: "Colorless, flammable liquid (C₃H₆O) commonly used as a solvent and in nail polish remover."
    },
    
    // Added missing "Others" chemicals referenced in chemicalCategories
    glucose: {
        name: "Glucose",
        formula: "C₆H₁₂O₆",
        defaultColor: 0xFFFFF8, // Off-white
        pHLevel: 7.0,
        defaultTemperature: 25,
        density: 1.54,
        description: "Simple sugar (C₆H₁₂O₆) that is an important energy source in living organisms."
    },
    
    sucrose: {
        name: "Sucrose",
        formula: "C₁₂H₂₂O₁₁",
        defaultColor: 0xFFFFF8, // Off-white
        pHLevel: 7.0,
        defaultTemperature: 25,
        density: 1.59,
        description: "Common table sugar (C₁₂H₂₂O₁₁), a disaccharide composed of glucose and fructose."
    },
    
    fructose: {
        name: "Fructose",
        formula: "C₆H₁₂O₆",
        defaultColor: 0xFFFFF8, // Off-white
        pHLevel: 7.0,
        defaultTemperature: 25,
        density: 1.69,
        description: "Fruit sugar (C₆H₁₂O₆), a simple ketonic monosaccharide found in many plants."
    },
    
    urea: {
        name: "Urea",
        formula: "CO(NH₂)₂",
        defaultColor: 0xFFFFFA, // Off-white
        pHLevel: 7.0,
        defaultTemperature: 25,
        density: 1.32,
        description: "Organic compound (CO(NH₂)₂) found in urine and used as a fertilizer and in many commercial products."
    },
    
    // Additional chemicals
    phenolphthalein: {
        name: "Phenolphthalein",
        formula: "C₂₀H₁₄O₄",
        defaultColor: 0xFFFFFF, // Colorless
        pHLevel: 7.0,
        defaultTemperature: 25,
        density: 1.3,
        description: "pH indicator that turns pink in basic solutions and remains colorless in acidic solutions."
    },
    
    // Empty placeholder for empty beakers
    empty: {
        name: "Empty",
        formula: "",
        defaultColor: 0xFFFFFF, // White/clear
        pHLevel: 7.0,
        defaultTemperature: 25,
        density: 0,
        description: "Empty container"
    }
};

// Reaction definitions between chemicals
export const reactions = {
    // Acid-Base Neutralization: HCl + NaOH → NaCl + H2O
    "hydrochloricAcid+sodiumHydroxide": {
        products: ["sodiumChloride", "water"],
        resultColor: 0xFFFFFA, // Off-white for salt water
        energyChange: 55.8, // Exothermic (kJ/mol)
        description: "Neutralization reaction: HCl + NaOH → NaCl + H₂O"
    },
    
    // Precipitation: AgNO3 + NaCl → AgCl↓ + NaNO3
    "silverNitrate+sodiumChloride": {
        products: ["silverChloride", "sodiumNitrate"],
        resultColor: 0xE0E0E0, // White precipitate
        energyChange: -10.2,
        description: "Precipitation reaction forms silver chloride: AgNO₃ + NaCl → AgCl↓ + NaNO₃"
    }
};

// Additional chemical properties that can be added as needed
export const chemicalProperties = {
    molarMass: {
        water: 18.02,
        hydrochloricAcid: 36.46,
        sodiumHydroxide: 40.00,
        sodiumChloride: 58.44,
        silverNitrate: 169.87
    },
    solubility: {
        water: "N/A",
        hydrochloricAcid: "Very soluble",
        sodiumHydroxide: "Very soluble",
        sodiumChloride: "36g/100mL",
        silverNitrate: "219g/100mL"
    }
};

// Chemical categories for better organization in UI
export const chemicalCategories = {
    'Acids': ['hydrochloricAcid', 'sulfuricAcid', 'nitricAcid', 'phosphoricAcid', 'aceticAcid'],
    'Bases': ['sodiumHydroxide', 'potassiumHydroxide', 'calciumHydroxide', 'ammoniumHydroxide'],
    'Salts': ['sodiumChloride', 'potassiumChloride', 'calciumChloride', 'magnesiumSulfate'],
    'Solvents': ['water', 'ethanol', 'methanol', 'acetone'],
    'Others': ['glucose', 'sucrose', 'fructose', 'urea']
};

// Utility functions for color handling
export function hexColorToString(hexColor) {
    if (typeof hexColor === 'number') {
        return '#' + hexColor.toString(16).padStart(6, '0');
    }
    return hexColor;
}

export function stringColorToHex(colorString) {
    if (typeof colorString === 'string' && colorString.startsWith('#')) {
        return parseInt(colorString.substring(1), 16);
    }
    return colorString;
}

// Function to get color based on pH value
export function getColorFromPh(ph) {
    if (ph < 3) {
        return 0xff5252; // Red for strong acids
    } else if (ph < 6) {
        return 0xffaa00; // Orange for weak acids
    } else if (ph < 8) {
        return 0x00c853; // Green for neutral
    } else if (ph < 11) {
        return 0x2196f3; // Blue for weak bases
    } else {
        return 0x6a1b9a; // Purple for strong bases
    }
}
