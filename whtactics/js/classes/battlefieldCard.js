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
        
        // Get all buildings and filter by terrain restrictions
        const allBuildings = Object.entries(BATTLEFIELD_CARDS)
            .map(([buildingKey, building]) => ({
                key: buildingKey,
                ...building
            }));
        
        const terrainFiltered = allBuildings.filter(building => {
            // Check if building is allowed on this terrain
            if (building.allowedTerrain && !building.allowedTerrain.includes(terrainType)) {
                return false;
            }
            return true;
        });
        
        const affordableBuildings = terrainFiltered.filter(building => this.canAffordBuilding(building));
        
        const result = affordableBuildings.map(building => ({
            ...building,
            canBuild: this.canAffordBuilding(building),
            costText: this.getCostText(building.cost),
            terrainRestriction: building.allowedTerrain ? 
                `Only on: ${building.allowedTerrain.map(t => TERRAIN_BUILDING_TYPES[t]?.name || t).join(', ')}` : 
                'Any terrain'
        }));
        
        return result;
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
        
        // Check terrain restrictions
        const terrainType = this.getTerrainType(x, y);
        if (building.allowedTerrain && !building.allowedTerrain.includes(terrainType)) {
            console.error(`Cannot build ${building.name} on ${terrainType} terrain`);
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
            isActive: true,
            usesRemaining: building.effects?.uses || null,
            cooldownRemaining: 0
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
        // For the new simplified building system, we don't apply immediate effects
        // All effects are applied when the structure is used
        console.log(`Built ${building.name} at position (${x}, ${y})`);
    }
    
    // Get structure at position
    getStructureAt(x, y) {
        const positionKey = `${x},${y}`;
        return this.builtStructures.get(positionKey);
    }
    
    // Use structure (for Shield Generator and other utility buildings)
    useStructure(x, y) {
        const positionKey = `${x},${y}`;
        const structure = this.builtStructures.get(positionKey);
        
        if (!structure || !structure.isActive) {
            return { success: false, message: 'No active structure at this position' };
        }
        
        // Check if structure has uses
        if (structure.usesRemaining !== null && structure.usesRemaining <= 0) {
            return { success: false, message: 'Structure has no uses remaining' };
        }
        
        // Check cooldown
        if (structure.cooldownRemaining > 0) {
            return { success: false, message: `Structure on cooldown for ${structure.cooldownRemaining} turns` };
        }
        
        // Handle Shield Generator
        if (structure.name === 'Shield Generator') {
            const character = window.gridGameManager.character;
            if (character) {
                character.shield = character.maxShield;
                structure.usesRemaining = 0;
                structure.cooldownRemaining = structure.effects.cooldown;
                
                // Update character display
                if (window.gridGameManager.updateCharacterDisplay) {
                    window.gridGameManager.updateCharacterDisplay();
                }
                
                return { success: true, message: 'Shield restored to maximum!' };
            }
        }
        
        // Handle Medical Hospital
        if (structure.name === 'Medical Hospital') {
            const character = window.gridGameManager.character;
            if (character) {
                character.health = character.maxHealth;
                structure.usesRemaining = 0;
                structure.cooldownRemaining = structure.effects.cooldown;
                
                // Update character display
                if (window.gridGameManager.updateCharacterDisplay) {
                    window.gridGameManager.updateCharacterDisplay();
                }
                
                return { success: true, message: 'Health restored to maximum!' };
            }
        }
        
        // Handle Outpost
        if (structure.name === 'Outpost') {
            if (window.gridGameManager) {
                // Restore 10 turn points
                window.gridGameManager.remainingTurns = Math.min(
                    window.gridGameManager.maxTurns,
                    window.gridGameManager.remainingTurns + 10
                );
                
                structure.usesRemaining = 0;
                structure.cooldownRemaining = structure.effects.cooldown;
                
                // Update turn display
                if (window.gridGameManager.updateTurnDisplay) {
                    window.gridGameManager.updateTurnDisplay();
                }
                
                return { success: true, message: 'Turn points restored! (+10 turns)' };
            }
        }
        
        // Handle Plasma Reactor
        if (structure.name === 'Plasma Reactor') {
            const character = window.gridGameManager.character;
            if (character) {
                // Provide combat bonuses for 3 turns
                character.plasmaBoost = true;
                character.plasmaBoostTurns = 3;
                
                // Temporary stat boosts
                character.tempAttack = character.attack;
                character.tempDefense = character.defense;
                character.attack = Math.floor(character.attack * 1.5); // +50% attack
                character.defense = Math.floor(character.defense * 1.3); // +30% defense
                
                structure.usesRemaining = 0;
                structure.cooldownRemaining = structure.effects.cooldown;
                
                // Update character display
                if (window.gridGameManager.updateCharacterDisplay) {
                    window.gridGameManager.updateCharacterDisplay();
                }
                
                return { success: true, message: 'Plasma energy activated! Combat bonuses for 3 turns!' };
            }
        }
        
        return { success: false, message: 'Unknown structure type' };
    }
    
    // Process turn effects for all structures
    processTurnEffects() {
        // Reduce cooldowns for all structures
        for (const [positionKey, structure] of this.builtStructures) {
            if (structure.cooldownRemaining > 0) {
                structure.cooldownRemaining--;
            }
        }
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
        // For the new simplified building system, we don't need to remove effects
        // since effects are only applied when structures are used
        console.log(`Removed ${building.name} from position`);
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
