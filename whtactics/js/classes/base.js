// Base Building System for Warhammer 40K Grid Tactics
class Base {
    constructor() {
        this.structures = [];
        this.resources = {
            [RESOURCE_TYPES.BIOMASS]: 0,
            [RESOURCE_TYPES.SCRAP]: 0,
            [RESOURCE_TYPES.WARPSTONE]: 0
        };
        this.level = 1;
        this.maxLevel = 5;
        this.defense = 10;
        this.maxDefense = 50;
        this.population = 0;
        this.maxPopulation = 10;
    }

    // Add a structure to the base
    addStructure(structureType) {
        const structure = BASE_STRUCTURES[structureType];
        if (!structure) return false;

        // Check if we can afford it
        if (!this.canAfford(structure.cost)) return false;

        // Pay the cost
        this.spendResources(structure.cost);

        // Add structure
        const newStructure = {
            type: structureType,
            name: structure.name,
            level: structure.level,
            maxLevel: structure.maxLevel,
            effect: structure.effect,
            description: structure.description,
            icon: structure.icon,
            isActive: true
        };

        this.structures.push(newStructure);
        this.applyStructureEffects(newStructure);
        return true;
    }

    // Upgrade a structure
    upgradeStructure(structureIndex) {
        const structure = this.structures[structureIndex];
        if (!structure || structure.level >= structure.maxLevel) return false;

        const baseStructure = BASE_STRUCTURES[structure.type];
        const upgradeCost = this.calculateUpgradeCost(baseStructure, structure.level);

        if (!this.canAfford(upgradeCost)) return false;

        // Pay the cost
        this.spendResources(upgradeCost);

        // Upgrade structure
        structure.level++;
        this.applyStructureEffects(structure);
        return true;
    }

    // Calculate upgrade cost
    calculateUpgradeCost(baseStructure, currentLevel) {
        const cost = {};
        for (const [resource, amount] of Object.entries(baseStructure.cost)) {
            cost[resource] = Math.floor(amount * (1 + currentLevel * 0.5));
        }
        return cost;
    }

    // Apply structure effects
    applyStructureEffects(structure) {
        if (!structure.isActive) return;

        switch (structure.effect) {
            case 'weaponCrafting':
                // Enable weapon crafting
                break;
            case 'healing':
                // Enable healing
                break;
            case 'energyBoost':
                // Generate warp energy
                this.generateWarpEnergy(structure.level);
                break;
            case 'defense':
                this.defense += structure.level * 5;
                break;
            case 'technology':
                // Enable research
                break;
        }
    }

    // Generate warp energy
    generateWarpEnergy(level) {
        this.resources[RESOURCE_TYPES.WARPSTONE] += level * 2;
    }

    // Check if we can afford something
    canAfford(cost) {
        for (const [resource, amount] of Object.entries(cost)) {
            if (this.resources[resource] < amount) return false;
        }
        return true;
    }

    // Spend resources
    spendResources(cost) {
        for (const [resource, amount] of Object.entries(cost)) {
            this.resources[resource] -= amount;
        }
    }

    // Add resources
    addResources(resourceType, amount) {
        this.resources[resourceType] += amount;
    }

    // Get available structures
    getAvailableStructures() {
        return Object.keys(BASE_STRUCTURES).map(type => ({
            type,
            ...BASE_STRUCTURES[type],
            canAfford: this.canAfford(BASE_STRUCTURES[type].cost)
        }));
    }

    // Get base info
    getBaseInfo() {
        return {
            level: this.level,
            maxLevel: this.maxLevel,
            defense: this.defense,
            maxDefense: this.maxDefense,
            population: this.population,
            maxPopulation: this.maxPopulation,
            structures: this.structures,
            resources: this.resources
        };
    }

    // Upgrade base level
    upgradeBase() {
        if (this.level >= this.maxLevel) return false;

        const cost = {
            [RESOURCE_TYPES.SCRAP]: this.level * 100,
            [RESOURCE_TYPES.WARPSTONE]: this.level * 50
        };

        if (!this.canAfford(cost)) return false;

        this.spendResources(cost);
        this.level++;
        this.maxPopulation += 2;
        this.maxDefense += 10;
        return true;
    }

    // Repair base
    repairBase(amount = 10) {
        this.defense = Math.min(this.maxDefense, this.defense + amount);
    }

    // Take damage
    takeDamage(amount) {
        this.defense -= amount;
        if (this.defense < 0) {
            this.defense = 0;
            return true; // Base destroyed
        }
        return false;
    }
}
