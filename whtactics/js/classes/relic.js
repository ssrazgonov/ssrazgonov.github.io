// Relic Class for Warhammer 40K Grid Tactics
class Relic {
    constructor(type, rarity = 'common') {
        this.type = type;
        this.rarity = rarity;
        this.name = RELIC_TYPES[type]?.name || 'Unknown Relic';
        this.description = RELIC_TYPES[type]?.description || 'A mysterious artifact';
        this.icon = RELIC_TYPES[type]?.icon || '❓';
        this.stats = RELIC_TYPES[type]?.stats || {};
        this.effect = RELIC_TYPES[type]?.effect || null;
        this.isEquipped = false;
        this.durability = 100;
        this.maxDurability = 100;
    }

    // Apply relic effects to character
    applyEffects(character) {
        if (!this.isEquipped) return;

        // Apply stat bonuses
        if (this.stats.attack) character.attack += this.stats.attack;
        if (this.stats.defense) character.defense += this.stats.defense;
        if (this.stats.health) character.maxHealth += this.stats.health;
        if (this.stats.speed) character.speed += this.stats.speed;

        // Apply special effects
        switch (this.effect) {
            case 'doublesAttack':
                character.attack *= 2;
                break;
            case 'warpResistance':
                character.warpResistance = true;
                break;
            case 'energyDrain':
                character.energyDrain = true;
                break;
            case 'brutalStrike':
                character.brutalStrike = true;
                break;
            case 'poisonDamage':
                character.poisonDamage = this.stats.poison || 3;
                break;
        }
    }

    // Remove relic effects from character
    removeEffects(character) {
        if (!this.isEquipped) return;

        // Remove stat bonuses
        if (this.stats.attack) character.attack -= this.stats.attack;
        if (this.stats.defense) character.defense -= this.stats.defense;
        if (this.stats.health) character.maxHealth -= this.stats.health;
        if (this.stats.speed) character.speed -= this.stats.speed;

        // Remove special effects
        switch (this.effect) {
            case 'doublesAttack':
                character.attack /= 2;
                break;
            case 'warpResistance':
                character.warpResistance = false;
                break;
            case 'energyDrain':
                character.energyDrain = false;
                break;
            case 'brutalStrike':
                character.brutalStrike = false;
                break;
            case 'poisonDamage':
                character.poisonDamage = 0;
                break;
        }
    }

    // Use relic (consumes durability)
    use() {
        this.durability -= 10;
        if (this.durability <= 0) {
            this.durability = 0;
            this.isEquipped = false;
            return false; // Relic broken
        }
        return true;
    }

    // Repair relic
    repair(amount = 25) {
        this.durability = Math.min(this.maxDurability, this.durability + amount);
    }

    // Get rarity color
    getRarityColor() {
        switch (this.rarity) {
            case 'common': return '#ffffff';
            case 'uncommon': return '#1eff00';
            case 'rare': return '#0070dd';
            case 'epic': return '#a335ee';
            case 'legendary': return '#ff8000';
            default: return '#ffffff';
        }
    }

    // Get display info
    getDisplayInfo() {
        return {
            name: this.name,
            description: this.description,
            icon: this.icon,
            rarity: this.rarity,
            rarityColor: this.getRarityColor(),
            durability: `${this.durability}/${this.maxDurability}`,
            stats: this.stats,
            effect: this.effect
        };
    }
}
