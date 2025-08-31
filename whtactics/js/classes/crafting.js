// Crafting System for Warhammer 40K Grid Tactics
class Crafting {
    constructor(base) {
        this.base = base;
        this.recipes = CRAFTING_RECIPES;
        this.craftedItems = [];
        this.craftingLevel = 1;
        this.maxCraftingLevel = 5;
    }

    // Check if we can craft an item
    canCraft(recipeName) {
        const recipe = this.recipes[recipeName];
        if (!recipe) return false;

        // Check if we have the required materials
        for (const [material, amount] of Object.entries(recipe.materials)) {
            if (this.base.resources[material] < amount) return false;
        }

        return true;
    }

    // Craft an item
    craftItem(recipeName) {
        const recipe = this.recipes[recipeName];
        if (!recipe || !this.canCraft(recipeName)) return false;

        // Spend materials
        for (const [material, amount] of Object.entries(recipe.materials)) {
            this.base.resources[material] -= amount;
        }

        // Create the crafted item
        const craftedItem = {
            name: recipe.name,
            rarity: recipe.rarity,
            stats: recipe.stats || {},
            effect: recipe.effect,
            description: recipe.description,
            icon: this.getCraftingIcon(recipeName),
            durability: 100,
            maxDurability: 100,
            isEquipped: false,
            craftDate: new Date().toISOString()
        };

        this.craftedItems.push(craftedItem);
        return craftedItem;
    }

    // Get crafting icon
    getCraftingIcon(recipeName) {
        const icons = {
            'POWER_SWORD': '⚔️',
            'PLASMA_RIFLE': '🔫',
            'TERMINATOR_ARMOR': '🛡️',
            'HEALING_POTION': '🧪',
            'WARP_BOMB': '💣'
        };
        return icons[recipeName] || '🔧';
    }

    // Get available recipes
    getAvailableRecipes() {
        return Object.keys(this.recipes).map(recipeName => {
            const recipe = this.recipes[recipeName];
            return {
                name: recipeName,
                ...recipe,
                canCraft: this.canCraft(recipeName),
                icon: this.getCraftingIcon(recipeName)
            };
        });
    }

    // Upgrade crafting level
    upgradeCrafting() {
        if (this.craftingLevel >= this.maxCraftingLevel) return false;

        const cost = {
            [RESOURCE_TYPES.SCRAP]: this.craftingLevel * 50,
            [RESOURCE_TYPES.WARPSTONE]: this.craftingLevel * 25
        };

        if (!this.base.canAfford(cost)) return false;

        this.base.spendResources(cost);
        this.craftingLevel++;
        return true;
    }

    // Apply crafting bonuses to items
    applyCraftingBonuses(item) {
        if (!item.stats) return;

        const bonus = (this.craftingLevel - 1) * 0.1; // 10% bonus per level

        for (const [stat, value] of Object.entries(item.stats)) {
            if (typeof value === 'number') {
                item.stats[stat] = Math.floor(value * (1 + bonus));
            }
        }
    }

    // Get crafting info
    getCraftingInfo() {
        return {
            level: this.craftingLevel,
            maxLevel: this.maxCraftingLevel,
            craftedItems: this.craftedItems,
            availableRecipes: this.getAvailableRecipes()
        };
    }

    // Repair crafted item
    repairItem(itemIndex) {
        const item = this.craftedItems[itemIndex];
        if (!item) return false;

        const repairCost = {
            [RESOURCE_TYPES.SCRAP]: Math.floor((100 - item.durability) / 10)
        };

        if (!this.base.canAfford(repairCost)) return false;

        this.base.spendResources(repairCost);
        item.durability = item.maxDurability;
        return true;
    }

    // Disassemble item for materials
    disassembleItem(itemIndex) {
        const item = this.craftedItems[itemIndex];
        if (!item) return false;

        // Return some materials based on rarity and durability
        const returnRate = item.durability / 100;
        const rarityMultiplier = this.getRarityMultiplier(item.rarity);

        // Find the original recipe to get materials
        const recipe = Object.values(this.recipes).find(r => r.name === item.name);
        if (recipe) {
            for (const [material, amount] of Object.entries(recipe.materials)) {
                const returnedAmount = Math.floor(amount * returnRate * rarityMultiplier);
                this.base.addResources(material, returnedAmount);
            }
        }

        // Remove the item
        this.craftedItems.splice(itemIndex, 1);
        return true;
    }

    // Get rarity multiplier for disassembly
    getRarityMultiplier(rarity) {
        switch (rarity) {
            case 'common': return 0.5;
            case 'uncommon': return 0.6;
            case 'rare': return 0.7;
            case 'epic': return 0.8;
            case 'legendary': return 0.9;
            default: return 0.5;
        }
    }
}
