// Base Item class
class Item {
    constructor(data) {
        this.id = 'item_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
        this.name = data.name || 'Unknown Item';
        this.description = data.description || '';
        this.type = data.type || 'misc'; // weapon, armor, accessory, consumable, misc
        this.rarity = data.rarity || 'common'; // common, uncommon, rare, epic, legendary
        this.value = data.value || 0;
        this.icon = data.icon || null;
        this.usable = data.usable || false;
        this.stackable = data.stackable || false;
        this.quantity = data.quantity || 1;
    }
    
    // Get display name with rarity color
    getDisplayName() {
        const rarityColors = {
            common: '#AAAAAA',
            uncommon: '#00AA00',
            rare: '#0066CC',
            epic: '#8800CC',
            legendary: '#CC8800'
        };
        
        return `<span style="color:${rarityColors[this.rarity]}">${this.name}</span>`;
    }
    
    // Create HTML element for this item in the inventory
    createInventoryElement() {
        const element = document.createElement('div');
        element.className = `inventory-item rarity-${this.rarity}`;
        element.setAttribute('data-item-id', this.id);
        
        // Create tooltip with item details
        element.title = `${this.name} (${this.rarity})\n${this.description}`;
        
        // Add rarity border
        element.style.borderColor = this.getRarityColor();
        
        // Add content
        if (this.icon) {
            const img = document.createElement('img');
            img.src = this.icon;
            img.alt = this.name;
            element.appendChild(img);
        } else {
            // Placeholder display
            const itemDisplay = document.createElement('div');
            itemDisplay.className = 'item-display';
            itemDisplay.textContent = this.name.substring(0, 2).toUpperCase();
            itemDisplay.style.backgroundColor = this.getTypeColor();
            element.appendChild(itemDisplay);
        }
        
        // Add quantity badge for stackable items
        if (this.stackable && this.quantity > 1) {
            const quantityBadge = document.createElement('span');
            quantityBadge.className = 'item-quantity';
            quantityBadge.textContent = this.quantity;
            element.appendChild(quantityBadge);
        }
        
        return element;
    }
    
    // Get color based on item type
    getTypeColor() {
        const typeColors = {
            weapon: '#8B0000',
            armor: '#4B4B4B',
            accessory: '#DAA520',
            consumable: '#006400',
            misc: '#4B0082'
        };
        
        return typeColors[this.type] || '#333333';
    }
    
    // Get color based on rarity
    getRarityColor() {
        const rarityColors = {
            common: '#AAAAAA',
            uncommon: '#00AA00',
            rare: '#0066CC',
            epic: '#8800CC',
            legendary: '#CC8800'
        };
        
        return rarityColors[this.rarity] || '#AAAAAA';
    }
    
    // Use the item (to be overridden by subclasses)
    use(character) {
        if (!this.usable) return false;
        return true;
    }
    
    // Check if item can be equipped
    isEquippable() {
        return this.type === 'weapon' || this.type === 'armor' || this.type === 'accessory';
    }
    
    // Get the equipment slot this item fits in
    getEquipSlot() {
        return this.type; // weapon, armor, or accessory
    }
}

// Equipment item (weapons, armor, accessories)
class Equipment extends Item {
    constructor(data) {
        super(data);
        this.stats = data.stats || {};
        this.equipped = false;
    }
    
    // Apply equipment stats to character
    applyStats(character) {
        if (this.stats.maxHp) character.maxHp += this.stats.maxHp;
        if (this.stats.attack) character.attack += this.stats.attack;
        if (this.stats.defense) character.defense += this.stats.defense;
        if (this.stats.speed) character.speed += this.stats.speed;
        
        // Dispatch event to update UI
        document.dispatchEvent(new CustomEvent('character-updated'));
    }
    
    // Remove equipment stats from character
    removeStats(character) {
        if (this.stats.maxHp) character.maxHp -= this.stats.maxHp;
        if (this.stats.attack) character.attack -= this.stats.attack;
        if (this.stats.defense) character.defense -= this.stats.defense;
        if (this.stats.speed) character.speed -= this.stats.speed;
        
        // Dispatch event to update UI
        document.dispatchEvent(new CustomEvent('character-updated'));
    }
    
    // Get description with stats
    getDescription() {
        let desc = this.description + '\n\n';
        
        if (this.stats.maxHp) desc += `Max HP: +${this.stats.maxHp}\n`;
        if (this.stats.attack) desc += `Attack: +${this.stats.attack}\n`;
        if (this.stats.defense) desc += `Defense: +${this.stats.defense}\n`;
        if (this.stats.speed) desc += `Speed: +${this.stats.speed.toFixed(1)}\n`;
        
        return desc;
    }
}

// Consumable item (potions, scrolls, etc)
class Consumable extends Item {
    constructor(data) {
        super(data);
        this.usable = true;
        this.effect = data.effect || {};
        this.duration = data.duration || 0; // For temporary effects
    }
    
    // Use the consumable
    use(character) {
        if (!super.use(character)) return false;
        
        // Apply immediate effects
        if (this.effect.hp) {
            character.heal(this.effect.hp);
        }
        
        // Apply temporary effects (buffs)
        if (this.effect.tempAttack) {
            // Implement buff system here
        }
        
        // Reduce quantity
        this.quantity--;
        
        // Dispatch event to update UI
        document.dispatchEvent(new CustomEvent('character-updated'));
        
        return true;
    }
}