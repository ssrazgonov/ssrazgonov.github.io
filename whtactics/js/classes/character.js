// Character class (player avatar)
class Character extends Entity {
    constructor(x, y, characterClass) {
        super(x, y, TILE_SIZE, TILE_SIZE);
        
        // Base stats from character class
        const baseStats = CHARACTER_CLASSES[characterClass];
        this.name = baseStats.name;
        this.maxHp = baseStats.baseHP;
        this.hp = this.maxHp;
        this.attack = baseStats.baseAttack;
        this.defense = baseStats.baseDefense;
        this.speed = baseStats.baseSpeed;
        this.faction = baseStats.faction;
        this.abilities = [...baseStats.abilities];
        
        // Combat mode ('auto' or 'interactive')
        this.combatMode = 'interactive'; // Default to interactive combat
        
        // Movement properties
        this.targetX = x;
        this.targetY = y;
        this.isMoving = false;
        this.pathIndex = 0;
        this.currentPath = [];
        this.movementSpeed = MOVEMENT_SPEED * this.speed;
        
        // Combat properties
        this.inCombat = false;
        this.currentEnemy = null;
        this.attackCooldown = 0;
        this.attackSpeed = 1.0; // Attacks per second
        
        // Equipment and inventory
        this.equipment = {
            weapon: null,
            armor: null,
            accessory: null
        };
        this.inventory = [];
        this.inventorySize = 12; // Maximum items in inventory
        
        // Experience and level
        this.level = 1;
        this.experience = 0;
        this.experienceToNextLevel = 100;
        
        // Resources
        this.resources = {
            [RESOURCE_TYPES.BIOMASS]: 0,
            [RESOURCE_TYPES.SCRAP]: 0,
            [RESOURCE_TYPES.WARPSTONE]: 0
        };
        
        // Upgrade levels for crafting system
        this.upgradelevels = {
            health: 0,
            attack: 0,
            defense: 0,
            speed: 0,
            inventorySize: 0
        };
    }
    
    // Update character state
    update(deltaTime, gameManager) {
        if (this.inCombat) {
            this.updateCombat(deltaTime, gameManager);
            return;
        }
        
        if (this.isMoving) {
            this.updateMovement(deltaTime, gameManager);
        }
    }
    
    // Update character movement along path
    updateMovement(deltaTime, gameManager) {
        if (!this.isMoving || this.currentPath.length === 0) return;
        
        const target = this.currentPath[this.pathIndex];
        const targetCanvasPos = gridToCanvas(target.x, target.y);
        
        // Add small offset to target position to center character on tile
        targetCanvasPos.x += TILE_SIZE / 2 - this.width / 2;
        targetCanvasPos.y += TILE_SIZE / 2 - this.height / 2;
        
        const distanceToTarget = calculateDistance(
            this.x, 
            this.y, 
            targetCanvasPos.x, 
            targetCanvasPos.y
        );
        
        if (distanceToTarget < 2) {
            // We've reached the current path point
            this.x = targetCanvasPos.x;
            this.y = targetCanvasPos.y;
            
            // Check for tiles at this position
            gameManager.checkTileInteraction(this);
            
            // Move to next path point
            this.pathIndex = (this.pathIndex + 1) % this.currentPath.length;
            
            // Check if we completed a loop
            if (this.pathIndex === 0) {
                gameManager.completeLoop();
            }
        } else {
            // Move towards target
            const dirX = targetCanvasPos.x - this.x;
            const dirY = targetCanvasPos.y - this.y;
            const length = Math.sqrt(dirX * dirX + dirY * dirY);
            
            const normalizedDirX = dirX / length;
            const normalizedDirY = dirY / length;
            
            const moveDistance = this.movementSpeed * deltaTime;
            
            this.x += normalizedDirX * moveDistance;
            this.y += normalizedDirY * moveDistance;
        }
    }
    
    // Update combat
    updateCombat(deltaTime, gameManager) {
        if (!this.inCombat || !this.currentEnemy) return;
        
        // If enemy is defeated, exit combat
        if (this.currentEnemy.hp <= 0) {
            this.endCombat(gameManager);
            return;
        }
        
        // For automatic combat only
        if (this.combatMode === 'auto') {
            // Update attack cooldown
            this.attackCooldown -= deltaTime;
            
            // Attack when cooldown is ready
            if (this.attackCooldown <= 0) {
                this.attackEnemy(this.currentEnemy);
                this.attackCooldown = 1 / this.attackSpeed;
            }
        }
        // For interactive combat, player actions are handled by UI events
    }
    
    // Perform a combat move against the enemy
    performCombatMove(move) {
        if (!this.inCombat || !this.currentEnemy) return;
        
        // Only process if enemy has chosen its move
        if (this.currentEnemy.nextMove) {
            return this.currentEnemy.processInteractiveCombat(move, this);
        } else {
            console.log("Wait for enemy to prepare!");
        }
    }
    
    // Special attack for critical hits
    performSpecialAttack(enemy) {
        // Visual feedback for special attack
        enemy.isFlashing = true;
        enemy.flashTimer = 0.3; // Longer flash for critical
        
        // Could add special effects or animations here
    }
    
    // Toggle combat mode between auto and interactive
    toggleCombatMode() {
        this.combatMode = this.combatMode === 'auto' ? 'interactive' : 'auto';
        console.log(`Combat mode switched to: ${this.combatMode}`);
        
        // Update UI to reflect current mode
        document.dispatchEvent(new CustomEvent('combat-mode-changed', {
            detail: { mode: this.combatMode }
        }));
        
        return this.combatMode;
    }
    
    // Start combat with an enemy
    startCombat(enemy, gameManager) {
        this.inCombat = true;
        this.isMoving = false;
        this.currentEnemy = enemy;
        this.attackCooldown = 0;
        
        // Let game manager know we're in combat
        gameManager.startCombat(this, enemy);
    }
    
    // End combat
    endCombat(gameManager) {
        // Check if we're actually in combat
        if (!this.inCombat || !this.currentEnemy) {
            this.inCombat = false;
            this.currentEnemy = null;
            this.isMoving = true;
            return;
        }
        
        // Collect loot from defeated enemy
        if (this.currentEnemy && this.currentEnemy.hp <= 0) {
            this.collectLoot(this.currentEnemy, gameManager);
        } else if (this.currentEnemy) {
            // Reset enemy state if it wasn't defeated
            this.currentEnemy.inCombat = false;
            this.currentEnemy.nextMove = null;
        }
        
        this.inCombat = false;
        this.currentEnemy = null;
        this.isMoving = true;
        
        // Let game manager know combat ended
        gameManager.endCombat();
    }
    
    // Attack enemy
    attackEnemy(enemy) {
        const damage = Math.max(1, this.attack - enemy.defense);
        enemy.takeDamage(damage);
        
        console.log(`${this.name} attacks ${enemy.name} for ${damage} damage!`);
    }
    
    // Take damage
    takeDamage(damage) {
        this.hp -= damage;
        if (this.hp < 0) this.hp = 0;
        
        // Update UI
        document.getElementById('charHP').textContent = this.hp;
        
        // Dispatch event to update UI
        document.dispatchEvent(new CustomEvent('character-updated'));
    }
    
    // Heal character
    heal(amount) {
        this.hp = Math.min(this.maxHp, this.hp + amount);
        
        // Update UI
        document.getElementById('charHP').textContent = this.hp;
        document.getElementById('charMaxHP').textContent = this.maxHp;
        
        // Dispatch event to update UI
        document.dispatchEvent(new CustomEvent('character-updated'));
    }
    
    // Collect loot from defeated enemy
    collectLoot(enemy, gameManager = null) {
        if (!enemy.loot) return;
        
        // Get resources from enemy
        Object.entries(enemy.loot).forEach(([resourceType, range]) => {
            const amount = getRandomValue(range);
            this.addResource(resourceType, amount, gameManager);
        });
        
        // Chance to find equipment
        if (Math.random() < 0.3) { // 30% chance to find an item
            const newItem = this.findLoot();
            if (newItem) {
                this.addItem(newItem);
                console.log(`Found ${newItem.name}!`);
            }
        }
    }
    
    // Add resource to character
    addResource(resourceType, amount, gameManager = null) {
        if (this.resources.hasOwnProperty(resourceType)) {
            let finalAmount = amount;
            
            // Apply seal modifiers if gameManager is available
            if (gameManager && gameManager.gameConfig && gameManager.sealModifiers) {
                const seal = gameManager.gameConfig.emperorsSeal;
                const modifiers = gameManager.sealModifiers;
                
                if (seal === 'shield' && modifiers.resourceMultiplier) {
                    finalAmount = Math.floor(amount * modifiers.resourceMultiplier);
                }
            }
            
            this.resources[resourceType] += finalAmount;
            
            // Update UI if element exists
            const resourceElement = document.getElementById(resourceType);
            if (resourceElement) {
                resourceElement.querySelector('span').textContent = this.resources[resourceType];
            }
            
            // Dispatch resource gained event with final amount
            document.dispatchEvent(new CustomEvent('resource-gained', {
                detail: {
                    resourceType: resourceType,
                    amount: finalAmount
                }
            }));
            
            console.log(`Gained ${finalAmount} ${resourceType}!`);
        }
    }
    
    // Add item to inventory
    addItem(item) {
        // Check if we can stack this item with an existing one
        if (item.stackable) {
            const existingItem = this.inventory.find(i => 
                i.name === item.name && 
                i.type === item.type && 
                i.rarity === item.rarity
            );
            
            if (existingItem) {
                existingItem.quantity += item.quantity;
                
                // Dispatch item found event
                document.dispatchEvent(new CustomEvent('item-found', {
                    detail: { item: item }
                }));
                
                return true;
            }
        }
        
        // Check if inventory has space
        if (this.inventory.length >= this.inventorySize) {
            console.log('Inventory is full!');
            return false;
        }
        
        // Add new item
        this.inventory.push(item);
        console.log(`Added ${item.name} to inventory`);
        
        // Dispatch item found event
        document.dispatchEvent(new CustomEvent('item-found', {
            detail: { item: item }
        }));
        
        // Update UI if exists
        document.dispatchEvent(new CustomEvent('inventory-changed', {
            detail: { character: this }
        }));
        
        return true;
    }
    
    // Remove item from inventory
    removeItem(itemId) {
        const index = this.inventory.findIndex(item => item.id === itemId);
        
        if (index !== -1) {
            const item = this.inventory[index];
            
            // If stackable and quantity > 1, just reduce quantity
            if (item.stackable && item.quantity > 1) {
                item.quantity--;
            } else {
                this.inventory.splice(index, 1);
            }
            
            // Update UI
            document.dispatchEvent(new CustomEvent('inventory-changed', {
                detail: { character: this }
            }));
            
            return true;
        }
        
        return false;
    }
    
    // Use an item from inventory
    useItem(itemId) {
        const item = this.inventory.find(item => item.id === itemId);
        
        if (!item || !item.usable) {
            return false;
        }
        
        // Use the item
        const result = item.use(this);
        
        // If item was consumed, remove it or decrease quantity
        if (result && item.quantity <= 0) {
            this.removeItem(itemId);
        }
        
        // Update UI
        document.dispatchEvent(new CustomEvent('inventory-changed', {
            detail: { character: this }
        }));
        
        // Dispatch character updated event
        document.dispatchEvent(new CustomEvent('character-updated'));
        
        return result;
    }
    
    // Equip an item
    equipItem(itemId) {
        const item = this.inventory.find(item => item.id === itemId);
        
        if (!item || !item.isEquippable()) {
            return false;
        }
        
        const slot = item.getEquipSlot();
        
        // Unequip current item in slot if any
        if (this.equipment[slot]) {
            this.unequipItem(slot);
        }
        
        // Remove item from inventory
        const index = this.inventory.findIndex(i => i.id === itemId);
        if (index !== -1) {
            this.inventory.splice(index, 1);
        }
        
        // Equip new item
        this.equipment[slot] = item;
        item.equipped = true;
        
        // Apply item stats
        if (item instanceof Equipment) {
            item.applyStats(this);
        }
        
        // Update UI
        document.dispatchEvent(new CustomEvent('equipment-changed', {
            detail: { character: this, slot: slot }
        }));
        
        document.dispatchEvent(new CustomEvent('inventory-changed', {
            detail: { character: this }
        }));
        
        console.log(`Equipped ${item.name}`);
        return true;
    }
    
    // Unequip an item
    unequipItem(slot) {
        if (!this.equipment[slot]) {
            return false;
        }
        
        const item = this.equipment[slot];
        
        // Remove stats from character
        if (item instanceof Equipment) {
            item.removeStats(this);
        }
        
        // Add item back to inventory
        this.inventory.push(item);
        
        // Update equipment status
        item.equipped = false;
        this.equipment[slot] = null;
        
        // Update UI
        document.dispatchEvent(new CustomEvent('equipment-changed', {
            detail: { character: this, slot: slot }
        }));
        
        document.dispatchEvent(new CustomEvent('inventory-changed', {
            detail: { character: this }
        }));
        
        console.log(`Unequipped ${item.name}`);
        return true;
    }
    
    // Find items in ruins or after combat
    findLoot(lootTable, rarity = null) {
        // Determine rarity based on probability if not specified
        if (!rarity) {
            const rarityRoll = Math.random();
            if (rarityRoll < 0.01) rarity = 'legendary';
            else if (rarityRoll < 0.05) rarity = 'epic';
            else if (rarityRoll < 0.15) rarity = 'rare';
            else if (rarityRoll < 0.40) rarity = 'uncommon';
            else rarity = 'common';
        }
        
        // Get items matching the rarity
        const eligibleItems = Object.entries(ITEM_TEMPLATES)
            .filter(([_, template]) => template.rarity === rarity)
            .map(([key, template]) => ({ key, template }));
        
        if (eligibleItems.length === 0) return null;
        
        // Select random item from eligible list
        const randomItem = eligibleItems[Math.floor(Math.random() * eligibleItems.length)];
        
        // Create appropriate item type
        let newItem;
        if (randomItem.template.type === 'consumable') {
            newItem = new Consumable(randomItem.template);
        } else if (randomItem.template.type === 'weapon' || 
                  randomItem.template.type === 'armor' || 
                  randomItem.template.type === 'accessory') {
            newItem = new Equipment(randomItem.template);
        } else {
            newItem = new Item(randomItem.template);
        }
        
        return newItem;
    }
    
    // Set movement path
    setPath(path) {
        this.currentPath = [...path];
        this.pathIndex = 0;
        this.isMoving = true;
    }
    
    // Draw the character
    draw(ctx) {
        super.draw(ctx);
        
        // Draw health bar
        const healthPercentage = this.hp / this.maxHp;
        const barWidth = this.width;
        const barHeight = 5;
        const barX = this.x;
        const barY = this.y - 10;
        
        // Background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(barX, barY, barWidth, barHeight);
        
        // Health
        ctx.fillStyle = healthPercentage > 0.5 ? 'green' : healthPercentage > 0.2 ? 'orange' : 'red';
        ctx.fillRect(barX, barY, barWidth * healthPercentage, barHeight);
        
        // Border
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 1;
        ctx.strokeRect(barX, barY, barWidth, barHeight);
        
        // If in combat, draw combat indicator
        if (this.inCombat) {
            ctx.fillStyle = 'red';
            ctx.beginPath();
            ctx.arc(this.x + this.width, this.y, 5, 0, 2 * Math.PI);
            ctx.fill();
        }
    }
}