// Enemy class
class Enemy extends Entity {
    constructor(x, y, enemyType, gameManager = null) {
        super(x, y, TILE_SIZE, TILE_SIZE);
        
        const enemyData = ENEMY_TYPES[enemyType];
        this.name = enemyData.name;
        this.maxHp = enemyData.hp;
        this.attack = enemyData.attack;
        this.defense = enemyData.defense;
        this.speed = enemyData.speed;
        this.faction = enemyData.faction;
        this.enemyType = enemyType;
        
        // Shield seal has no enemy modifiers
        
        this.hp = this.maxHp;
        
        // Loot that can be dropped when defeated
        this.loot = deepClone(enemyData.loot);
        
        // Combat properties
        this.inCombat = false;
        this.attackCooldown = 0;
        this.attackSpeed = 0.8; // Attacks per second
        this.targetPlayer = null;
        
        // Interactive combat
        this.attackOptions = enemyData.attackOptions || ['Attack', 'Block', 'Dodge'];
        this.weakAgainst = enemyData.weakAgainst || 'Block';
        this.strongAgainst = enemyData.strongAgainst || 'Dodge';
        this.nextMove = null;
        
        // Visual properties
        this.flashTimer = 0;
        this.isFlashing = false;
        this.isInteractive = true;
    }
    
    // Update enemy state
    update(deltaTime, character, gameManager) {
        if (this.inCombat) {
            this.updateCombat(deltaTime, character);
        } else {
            // Check for collision with character
            if (this.collidesWith(character) && !character.inCombat) {
                this.startCombat(character, gameManager);
            }
        }
        
        // Update visual effects
        if (this.isFlashing) {
            this.flashTimer -= deltaTime;
            if (this.flashTimer <= 0) {
                this.isFlashing = false;
            }
        }
    }
    
    // Update combat
    updateCombat(deltaTime, character) {
        // Exit combat if player is no longer in combat with this enemy
        if (!character.inCombat || character.currentEnemy !== this) {
            this.inCombat = false;
            this.nextMove = null;
            return;
        }
        
        // Update attack cooldown
        this.attackCooldown -= deltaTime;
        
        // Don't auto-attack in interactive combat mode
        if (character.combatMode === 'interactive') {
            if (!this.nextMove && this.attackCooldown <= 0) {
                this.chooseNextMove();
                this.attackCooldown = 1.5; // Give player time to respond
            }
            return;
        }
        
        // Auto-attack when cooldown is ready (non-interactive mode)
        if (this.attackCooldown <= 0) {
            this.attackCharacter(character);
            this.attackCooldown = 1 / this.attackSpeed;
        }
    }
    
    // Choose the enemy's next move in interactive combat
    chooseNextMove() {
        const moves = this.attackOptions;
        this.nextMove = moves[Math.floor(Math.random() * moves.length)];
        
        // Signal that enemy has chosen a move
        document.dispatchEvent(new CustomEvent('enemy-move-ready', {
            detail: {
                enemyId: this.id,
                move: this.nextMove
            }
        }));
        
        console.log(`${this.name} prepares to ${this.nextMove}!`);
    }
    
    // Process the result of interactive combat
    processInteractiveCombat(playerMove, character) {
        if (!this.nextMove) return;
        
        const result = this.determineInteractiveCombatResult(playerMove);
        let damage = 0;
        
        // Store current move for reference before resetting
        const currentMove = this.nextMove;
        
        switch (result) {
            case 'player-advantage':
                // Player has advantage (critical hit)
                damage = Math.max(1, character.attack * 1.5 - this.defense);
                character.performSpecialAttack(this);
                this.takeDamage(damage);
                console.log(`${character.name}'s ${playerMove} counters ${this.name}'s ${currentMove}! Critical hit for ${damage} damage!`);
                break;
                
            case 'enemy-advantage':
                // Enemy has advantage
                damage = Math.max(1, this.attack * 1.5 - character.defense);
                character.takeDamage(damage);
                console.log(`${this.name}'s ${currentMove} overpowers ${character.name}'s ${playerMove}! Takes ${damage} damage!`);
                break;
                
            case 'neutral':
                // Regular exchange
                const playerDamage = Math.max(1, character.attack - this.defense);
                const enemyDamage = Math.max(1, this.attack - character.defense);
                
                this.takeDamage(playerDamage);
                character.takeDamage(enemyDamage);
                
                console.log(`${character.name} and ${this.name} exchange blows! ${playerDamage} vs ${enemyDamage} damage!`);
                break;
        }
        
        // Reset for next round
        this.nextMove = null;
        this.attackCooldown = 1 / this.attackSpeed;
        
        // Dispatch combat result event
        document.dispatchEvent(new CustomEvent('combat-result', {
            detail: {
                result: result,
                enemyMove: currentMove,
                playerMove: playerMove,
                enemyName: this.name,
                enemyType: this.enemyType
            }
        }));
        
        return result;
    }
    
    // Determine the result of interactive combat
    determineInteractiveCombatResult(playerMove) {
        // Player has advantage
        if (playerMove === this.weakAgainst) {
            return 'player-advantage';
        }
        
        // Enemy has advantage
        if (this.strongAgainst === playerMove) {
            return 'enemy-advantage';
        }
        
        // Neutral outcome
        return 'neutral';
    }
    
    // Start combat with the character
    startCombat(character, gameManager) {
        this.inCombat = true;
        character.startCombat(this, gameManager);
        this.attackCooldown = 0.5; // Slight delay before first attack
    }
    
    // Attack the character
    attackCharacter(character) {
        const damage = Math.max(1, this.attack - character.defense);
        character.takeDamage(damage);
        
        console.log(`${this.name} attacks ${character.name} for ${damage} damage!`);
    }
    
    // Take damage
    takeDamage(damage) {
        this.hp -= damage;
        if (this.hp < 0) this.hp = 0;
        
        // Visual feedback when taking damage
        this.isFlashing = true;
        this.flashTimer = 0.2; // Flash for 0.2 seconds
    }
    
    // Draw the enemy
    draw(ctx) {
        if (!this.visible) return;
        
        // If flashing, draw with alpha
        if (this.isFlashing) {
            ctx.globalAlpha = 0.5;
        }
        
        super.draw(ctx);
        
        // Reset alpha
        ctx.globalAlpha = 1.0;
        
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
        ctx.fillStyle = 'red';
        ctx.fillRect(barX, barY, barWidth * healthPercentage, barHeight);
        
        // Border
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 1;
        ctx.strokeRect(barX, barY, barWidth, barHeight);
        
        // Draw enemy name
        drawTextWithStroke(
            ctx, 
            this.name, 
            this.x + this.width / 2, 
            this.y - 15, 
            'white', 
            'black', 
            2, 
            12
        );
    }
}