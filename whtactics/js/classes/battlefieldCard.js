// Battlefield Card System for Warhammer 40K Grid Tactics
class BattlefieldCard {
    constructor() {
        this.availableBuildings = [];
        this.currentTerrain = null;
        this.builtStructures = new Map(); // Map of position -> structure
        this.maxStructuresPerCell = 1;
    }
    
    // Get terrain type for a specific position
    getTerrainType(x, y) {
        // Simple terrain generation based on position
        const distanceFromCenter = Math.sqrt((x - 4) ** 2 + (y - 4) ** 2);
        
        if (distanceFromCenter < 2) {
            return 'PLAINS';
        } else if (distanceFromCenter < 3) {
            return 'HILLS';
        } else if (distanceFromCenter < 4) {
            return 'FOREST';
        } else if (distanceFromCenter < 5) {
            return 'RUINS';
        } else {
            return 'WARPSTONE_DEPOSIT';
        }
    }
    
    // Get available buildings for current position
    getAvailableBuildings(x, y) {
        const terrainType = this.getTerrainType(x, y);
        const terrainInfo = TERRAIN_BUILDING_TYPES[terrainType];
        
        if (!terrainInfo) {
            return [];
        }
        
        // Filter buildings based on terrain and player resources
        return terrainInfo.availableBuildings
            .map(buildingKey => BATTLEFIELD_CARDS[buildingKey])
            .filter(building => building && this.canAffordBuilding(building))
            .map(building => ({
                ...building,
                canBuild: this.canAffordBuilding(building),
                costText: this.getCostText(building.cost)
            }));
    }
    
    // Check if player can afford a building
    canAffordBuilding(building) {
        if (!window.gridGameManager || !window.gridGameManager.resources) {
            return false;
        }
        
        const resources = window.gridGameManager.resources;
        
        for (const [resourceType, cost] of Object.entries(building.cost)) {
            if (!resources[resourceType] || resources[resourceType] < cost) {
                return false;
            }
        }
        
        return true;
    }
    
    // Get cost text for display
    getCostText(cost) {
        return Object.entries(cost)
            .map(([resourceType, amount]) => {
                const resourceName = resourceType.toLowerCase();
                const resourceIcon = this.getResourceIcon(resourceType);
                return `${resourceIcon} ${amount}`;
            })
            .join(' ');
    }
    
    // Get resource icon
    getResourceIcon(resourceType) {
        const icons = {
            [RESOURCE_TYPES.BIOMASS]: '🌱',
            [RESOURCE_TYPES.SCRAP]: '🔧',
            [RESOURCE_TYPES.WARPSTONE]: '💎'
        };
        return icons[resourceType] || '❓';
    }
    
    // Build a structure at current position
    buildStructure(buildingKey, x, y) {
        const building = BATTLEFIELD_CARDS[buildingKey];
        if (!building) {
            console.error('Invalid building key:', buildingKey);
            return false;
        }
        
        if (!this.canAffordBuilding(building)) {
            console.error('Cannot afford building:', building.name);
            return false;
        }
        
        // Check if cell already has a structure
        const positionKey = `${x},${y}`;
        if (this.builtStructures.has(positionKey)) {
            console.error('Cell already has a structure');
            return false;
        }
        
        // Deduct resources
        const resources = window.gridGameManager.resources;
        for (const [resourceType, cost] of Object.entries(building.cost)) {
            resources[resourceType] -= cost;
        }
        
        // Add structure to the map
        this.builtStructures.set(positionKey, {
            ...building,
            position: { x, y },
            buildTurn: window.gridGameManager ? window.gridGameManager.maxTurns - window.gridGameManager.remainingTurns : 0,
            isActive: true
        });
        
        // Apply building effects
        this.applyBuildingEffects(building, x, y);
        
        // Update resource display
        if (window.gridGameManager && window.gridGameManager.updateResourceDisplay) {
            window.gridGameManager.updateResourceDisplay();
        }
        
        console.log(`Built ${building.name} at position (${x}, ${y})`);
        return true;
    }
    
    // Apply building effects
    applyBuildingEffects(building, x, y) {
        if (!window.gridGameManager || !window.gridGameManager.character) {
            return;
        }
        
        const character = window.gridGameManager.character;
        
        // Apply immediate effects
        if (building.effects.health) {
            character.maxHealth += building.effects.health;
            character.health = Math.min(character.health + building.effects.health, character.maxHealth);
        }
        
        if (building.effects.attack) {
            character.attack += building.effects.attack;
        }
        
        if (building.effects.defense) {
            character.defense += building.effects.defense;
        }
        
        if (building.effects.shield) {
            character.shield = (character.shield || 0) + building.effects.shield;
        }
        
        // Update character display
        if (window.gridGameManager.updateCharacterDisplay) {
            window.gridGameManager.updateCharacterDisplay();
        }
    }
    
    // Get structure at position
    getStructureAt(x, y) {
        const positionKey = `${x},${y}`;
        return this.builtStructures.get(positionKey);
    }
    
    // Remove structure at position
    removeStructure(x, y) {
        const positionKey = `${x},${y}`;
        const structure = this.builtStructures.get(positionKey);
        
        if (structure) {
            // Remove effects
            this.removeBuildingEffects(structure);
            
            // Remove from map
            this.builtStructures.delete(positionKey);
            
            console.log(`Removed ${structure.name} from position (${x}, ${y})`);
            return true;
        }
        
        return false;
    }
    
    // Remove building effects
    removeBuildingEffects(building) {
        if (!window.gridGameManager || !window.gridGameManager.character) {
            return;
        }
        
        const character = window.gridGameManager.character;
        
        // Remove effects
        if (building.effects.health) {
            character.maxHealth -= building.effects.health;
            character.health = Math.min(character.health, character.maxHealth);
        }
        
        if (building.effects.attack) {
            character.attack -= building.effects.attack;
        }
        
        if (building.effects.defense) {
            character.defense -= building.effects.defense;
        }
        
        if (building.effects.shield) {
            character.shield = Math.max(0, (character.shield || 0) - building.effects.shield);
        }
        
        // Update character display
        if (window.gridGameManager.updateCharacterDisplay) {
            window.gridGameManager.updateCharacterDisplay();
        }
    }
    
    // Get all built structures
    getAllStructures() {
        return Array.from(this.builtStructures.values());
    }
    
    // Get structures by type
    getStructuresByType(type) {
        return this.getAllStructures().filter(structure => structure.type === type);
    }
    
    // Process building effects each turn
    processTurnEffects() {
        this.getAllStructures().forEach(structure => {
            if (structure.effects.healthRegen && window.gridGameManager && window.gridGameManager.character) {
                const character = window.gridGameManager.character;
                character.health = Math.min(character.maxHealth, character.health + structure.effects.healthRegen);
            }
            
            if (structure.effects.scrapProduction && window.gridGameManager && window.gridGameManager.resources) {
                window.gridGameManager.resources[RESOURCE_TYPES.SCRAP] += structure.effects.scrapProduction;
            }
            
            if (structure.effects.biomassProduction && window.gridGameManager && window.gridGameManager.resources) {
                window.gridGameManager.resources[RESOURCE_TYPES.BIOMASS] += structure.effects.biomassProduction;
            }
            
            if (structure.effects.warpstoneProduction && window.gridGameManager && window.gridGameManager.resources) {
                window.gridGameManager.resources[RESOURCE_TYPES.WARPSTONE] += structure.effects.warpstoneProduction;
            }
        });
        
        // Update displays
        if (window.gridGameManager) {
            if (window.gridGameManager.updateResourceDisplay) {
                window.gridGameManager.updateResourceDisplay();
            }
            if (window.gridGameManager.updateCharacterDisplay) {
                window.gridGameManager.updateCharacterDisplay();
            }
        }
    }
}
