// Enhanced Combat System for Warhammer 40K Grid Tactics
class Combat {
    constructor(player, enemy) {
        this.player = player;
        this.enemy = enemy;
        this.isPlayerTurn = true;
        this.turnNumber = 1;
        this.combatLog = [];
        this.autobattleMode = false; // New autobattle flag
        this.autobattleExecuting = false; // Prevent multiple autobattle executions
        
        // Player combat state
        this.playerState = {
            health: player.health,
            maxHealth: player.maxHealth,
            attack: player.attack,
            defense: player.defense,
            effects: [],
            cooldowns: {},
            isStunned: false
        };
        
        // Enemy combat state
        this.enemyState = {
            health: this.calculateEnemyHealth(),
            maxHealth: this.calculateEnemyHealth(),
            attack: this.calculateEnemyAttack(),
            defense: this.calculateEnemyDefense(),
            effects: [],
            isStunned: false
        };
        
        // Available actions
        this.playerActions = this.getPlayerActions();
        this.enemyActions = this.getEnemyActions();
    }
    
    // Calculate enemy stats based on threat level
    calculateEnemyHealth() {
        // If enemy already has hp set (from previous combat), use that value
        if (this.enemy.hp !== undefined && this.enemy.maxHp !== undefined) {
            return this.enemy.maxHp;
        }
        // Otherwise calculate based on threat level
        const health = this.enemy.threat * 25 + 50;
        // Store the calculated values on the enemy object for future reference
        this.enemy.maxHp = health;
        this.enemy.hp = health;
        return health;
    }
    
    calculateEnemyAttack() {
        return this.enemy.threat * 3 + 8;
    }
    
    calculateEnemyDefense() {
        return this.enemy.threat * 2 + 3;
    }
    
    // Get available player actions
    getPlayerActions() {
        const actions = [];
        
        // Basic actions always available
        actions.push(COMBAT_ACTIONS.ATTACK);
        actions.push(COMBAT_ACTIONS.DEFEND);
        actions.push(COMBAT_ACTIONS.DODGE);
        
        // Check cooldowns for special actions
        if (!this.playerState.cooldowns['Heavy Attack']) {
            actions.push(COMBAT_ACTIONS.HEAVY_ATTACK);
        }
        if (!this.playerState.cooldowns['Rapid Fire']) {
            actions.push(COMBAT_ACTIONS.RAPID_FIRE);
        }
        if (!this.playerState.cooldowns['Special Ability']) {
            actions.push(COMBAT_ACTIONS.SPECIAL_ABILITY);
        }
        
        console.log('Available actions:', actions.map(a => a.name));
        console.log('Current cooldowns:', this.playerState.cooldowns);
        
        return actions;
    }
    
    // Get enemy actions based on type
    getEnemyActions() {
        const enemyType = this.getEnemyType();
        return ENEMY_ACTIONS[enemyType] || ENEMY_ACTIONS.TYRANID_WARRIOR;
    }
    
    // Determine enemy type from name
    getEnemyType() {
        const name = this.enemy.name.toLowerCase();
        if (name.includes('tyranid')) return 'TYRANID_WARRIOR';
        if (name.includes('ork')) return 'ORK_BOY';
        if (name.includes('necron')) return 'NECRON_WARRIOR';
        if (name.includes('chaos')) return 'CHAOS_MARINE';
        return 'TYRANID_WARRIOR'; // Default
    }
    
    // Player performs an action
    performPlayerAction(actionType) {
        if (!this.isPlayerTurn || this.playerState.isStunned) {
            this.addToLog("You cannot act right now!");
            return false;
        }
        
        const action = this.playerActions.find(a => a.name === actionType);
        if (!action) {
            this.addToLog("Invalid action!");
            return false;
        }
        
        // Check cooldown
        if (this.playerState.cooldowns[actionType]) {
            this.addToLog(`${actionType} is on cooldown!`);
            return false;
        }
        
        // Perform the action
        let result = false;
        switch (action.type) {
            case 'physical':
            case 'ranged':
            case 'special':
                result = this.performAttack(action);
                break;
            case 'defensive':
                result = this.performDefense(action);
                break;
        }
        
        if (result) {
            // Set cooldown if action has one
            if (action.cooldown) {
                this.playerState.cooldowns[actionType] = action.cooldown;
            }
            
            // End player turn
            this.endPlayerTurn();
        }
        
        return result;
    }
    
    // Perform attack action
    performAttack(action) {
        const accuracy = this.calculateAccuracy(action.accuracy);
        const hit = Math.random() * 100 < accuracy;
        
        if (!hit) {
            this.addToLog(`Your ${action.name} missed!`);
            return true;
        }
        
        let damage = this.calculateDamage(action.damage);
        
        // Apply damage multiplier for multiple hits
        if (action.hits) {
            damage = damage * action.hits;
            this.addToLog(`Your ${action.name} hits ${action.hits} times!`);
        }
        
        // Apply damage to enemy
        console.log('Combat: Enemy health before damage:', this.enemyState.health);
        this.enemyState.health -= damage;
        console.log('Combat: Enemy health after damage:', this.enemyState.health);
        this.addToLog(`Your ${action.name} deals ${Math.round(damage)} damage!`);
        
        // Check if enemy is defeated
        if (this.enemyState.health <= 0) {
            this.enemyState.health = 0;
            this.addToLog(`${this.enemy.name} has been defeated!`);
            return true;
        }
        
        return true;
    }
    
    // Perform defensive action
    performDefense(action) {
        if (action.name === 'Defend') {
            this.playerState.effects.push({
                type: 'defend',
                duration: 1,
                blockChance: action.blockChance,
                blockAmount: action.blockAmount
            });
            this.addToLog("You take a defensive stance!");
        } else if (action.name === 'Dodge') {
            this.playerState.effects.push({
                type: 'dodge',
                duration: 1,
                dodgeChance: action.dodgeChance
            });
            this.addToLog("You prepare to dodge!");
        }
        
        return true;
    }
    
    // Enemy performs an action
    performEnemyAction() {
        if (this.enemyState.isStunned) {
            this.addToLog(`${this.enemy.name} is stunned and cannot act!`);
            this.enemyState.isStunned = false;
            return;
        }
        
        // Choose enemy action (AI decision)
        const action = this.chooseEnemyAction();
        const accuracy = this.calculateAccuracy(action.accuracy);
        const hit = Math.random() * 100 < accuracy;
        
        if (!hit) {
            this.addToLog(`${this.enemy.name}'s ${action.name} missed!`);
            return;
        }
        
        let damage = this.calculateEnemyDamage(action.damage);
        
        // Check player defensive effects
        damage = this.applyDefensiveEffects(damage);
        
        // Apply damage to player
        console.log('Combat: Player health before damage:', this.playerState.health);
        this.playerState.health -= damage;
        console.log('Combat: Player health after damage:', this.playerState.health);
        this.addToLog(`${this.enemy.name}'s ${action.name} deals ${Math.round(damage)} damage!`);
        
        // Apply special effects
        if (action.effect) {
            this.applyEffect(action.effect, this.playerState);
        }
        
        // Check if player is defeated
        if (this.playerState.health <= 0) {
            this.playerState.health = 0;
            this.addToLog("You have been defeated!");
        }
    }
    
    // AI chooses enemy action
    chooseEnemyAction() {
        const actions = Object.values(this.enemyActions);
        const healthPercent = this.enemyState.health / this.enemyState.maxHealth;
        
        // AI decision logic
        if (healthPercent < 0.3) {
            // Low health - prefer healing or defensive actions
            const healingActions = actions.filter(a => a.effect === 'heal');
            if (healingActions.length > 0) {
                return healingActions[0];
            }
        }
        
        // Random choice with some preference for stronger attacks
        const weights = actions.map((action, index) => ({
            action,
            weight: action.damage > 15 ? 2 : 1
        }));
        
        const totalWeight = weights.reduce((sum, w) => sum + w.weight, 0);
        let random = Math.random() * totalWeight;
        
        for (const weight of weights) {
            random -= weight.weight;
            if (random <= 0) {
                return weight.action;
            }
        }
        
        return actions[0];
    }
    
    // Calculate accuracy with modifiers
    calculateAccuracy(baseAccuracy) {
        let accuracy = baseAccuracy;
        
        // Apply effects
        this.playerState.effects.forEach(effect => {
            if (effect.type === 'berserk') {
                accuracy *= 0.8; // Reduced accuracy when berserk
            }
        });
        
        return Math.max(10, Math.min(95, accuracy));
    }
    
    // Calculate damage with modifiers
    calculateDamage(baseDamage) {
        let damage = baseDamage;
        
        // Apply attack stat
        damage += this.playerState.attack * 0.5;
        
        // Apply effects
        this.playerState.effects.forEach(effect => {
            if (effect.type === 'berserk') {
                damage *= effect.value;
            }
        });
        
        return Math.max(1, damage);
    }
    
    // Calculate enemy damage
    calculateEnemyDamage(baseDamage) {
        let damage = baseDamage;
        damage += this.enemyState.attack * 0.3;
        return Math.max(1, damage);
    }
    
    // Apply defensive effects to incoming damage
    applyDefensiveEffects(damage) {
        let finalDamage = damage;
        
        this.playerState.effects.forEach(effect => {
            if (effect.type === 'defend' && Math.random() * 100 < effect.blockChance) {
                finalDamage = Math.max(1, finalDamage - effect.blockAmount);
                this.addToLog("You successfully blocked some damage!");
            } else if (effect.type === 'dodge' && Math.random() * 100 < effect.dodgeChance) {
                finalDamage = 0;
                this.addToLog("You successfully dodged the attack!");
            }
        });
        
        return finalDamage;
    }
    
    // Apply status effects
    applyEffect(effectType, target) {
        const effect = COMBAT_EFFECTS[effectType.toUpperCase()];
        if (!effect) return;
        
        target.effects.push({
            type: effectType,
            duration: effect.duration,
            ...effect
        });
        
        this.addToLog(`${target === this.playerState ? 'You' : this.enemy.name} are affected by ${effect.name}!`);
    }
    
    // Process effects at turn end
    processEffects() {
        // Process player effects
        this.playerState.effects = this.playerState.effects.filter(effect => {
            effect.duration--;
            
            if (effect.duration <= 0) {
                this.addToLog(`Effect ${effect.name || effect.type} has worn off!`);
                return false;
            }
            
            // Apply damage over time effects
            if (effect.damagePerTurn) {
                this.playerState.health -= effect.damagePerTurn;
                this.addToLog(`You take ${effect.damagePerTurn} damage from ${effect.name}!`);
            }
            
            return true;
        });
        
        // Process enemy effects
        this.enemyState.effects = this.enemyState.effects.filter(effect => {
            effect.duration--;
            
            if (effect.duration <= 0) {
                this.addToLog(`${this.enemy.name}'s ${effect.name || effect.type} has worn off!`);
                return false;
            }
            
            // Apply damage over time effects
            if (effect.damagePerTurn) {
                this.enemyState.health -= effect.damagePerTurn;
                this.addToLog(`${this.enemy.name} takes ${effect.damagePerTurn} damage from ${effect.name}!`);
            }
            
            return true;
        });
    }
    
    // End player turn and start enemy turn
    endPlayerTurn() {
        this.isPlayerTurn = false;
        this.processEffects();
        this.updateCooldowns();
        
        // Check if combat should end
        if (this.playerState.health <= 0 || this.enemyState.health <= 0) {
            return;
        }
        
        // Enemy turn
        setTimeout(() => {
            this.performEnemyAction();
            this.endEnemyTurn();
        }, 1000);
    }
    
    // End enemy turn and start player turn
    endEnemyTurn() {
        this.isPlayerTurn = true;
        this.turnNumber++;
        this.processEffects();
        
        // Check if combat should end
        if (this.playerState.health <= 0 || this.enemyState.health <= 0) {
            return;
        }
        
        // Update available actions
        this.playerActions = this.getPlayerActions();
    }
    
    // Update cooldowns
    updateCooldowns() {
        Object.keys(this.playerState.cooldowns).forEach(action => {
            this.playerState.cooldowns[action]--;
            if (this.playerState.cooldowns[action] <= 0) {
                delete this.playerState.cooldowns[action];
            }
        });
    }
    
    // Add message to combat log
    addToLog(message) {
        this.combatLog.push({
            turn: this.turnNumber,
            message: message,
            timestamp: Date.now()
        });
        
        // Keep only last 10 messages
        if (this.combatLog.length > 10) {
            this.combatLog.shift();
        }
    }
    
    // Get combat status
    getCombatStatus() {
        return {
            playerHealth: this.playerState.health,
            playerMaxHealth: this.playerState.maxHealth,
            enemyHealth: this.enemyState.health,
            enemyMaxHealth: this.enemyState.maxHealth,
            turnNumber: this.turnNumber,
            isPlayerTurn: this.isPlayerTurn,
            playerEffects: this.playerState.effects,
            enemyEffects: this.enemyState.effects,
            playerActions: this.playerActions,
            combatLog: this.combatLog
        };
    }
    
    // Check if combat is over
    isCombatOver() {
        return this.playerState.health <= 0 || this.enemyState.health <= 0;
    }
    
    // Get combat result
    getCombatResult() {
        if (this.playerState.health <= 0) {
            return { winner: 'enemy', message: 'You have been defeated!' };
        } else if (this.enemyState.health <= 0) {
            return { winner: 'player', message: `${this.enemy.name} has been defeated!` };
        }
        return null;
    }

    // Toggle autobattle mode
    toggleAutobattle() {
        this.autobattleMode = !this.autobattleMode;
        this.addToLog(`Autobattle ${this.autobattleMode ? 'enabled' : 'disabled'}!`);
        return this.autobattleMode;
    }
    
    // Get autobattle status
    isAutobattleEnabled() {
        return this.autobattleMode;
    }
    
    // AI chooses best player action
    choosePlayerAction() {
        // Get available actions (this already filters out cooldown actions)
        const actions = this.getPlayerActions();
        const healthPercent = this.playerState.health / this.playerState.maxHealth;
        const enemyHealthPercent = this.enemyState.health / this.enemyState.maxHealth;
        
        // Priority system for action selection
        const actionScores = actions.map(action => {
            let score = 0;
            
            // Base score based on action type
            switch (action.type) {
                case 'physical':
                case 'ranged':
                case 'special':
                    score += action.damage * 2; // Prioritize damage
                    score += action.accuracy * 0.5; // Consider accuracy
                    if (action.hits) score += action.hits * 5; // Bonus for multi-hit
                    break;
                case 'defensive':
                    // Defensive actions based on health situation
                    if (healthPercent < 0.4) {
                        score += 100; // High priority when low health
                    } else if (healthPercent < 0.7) {
                        score += 50; // Medium priority when moderate health
                    } else {
                        score += 10; // Low priority when healthy
                    }
                    break;
            }
            
            // Bonus for finishing moves when enemy is low
            if (enemyHealthPercent < 0.3 && action.damage > 15) {
                score += 50;
            }
            
            // Penalty for low accuracy attacks when enemy is dangerous
            if (enemyHealthPercent > 0.7 && action.accuracy < 70) {
                score -= 20;
            }
            
            // Bonus for special abilities when available (but not on cooldown)
            if (action.name === 'Special Ability' && !this.playerState.cooldowns[action.name]) {
                score += 30;
            }
            
            // Bonus for heavy attacks when enemy is vulnerable
            if (action.name === 'Heavy Attack' && enemyHealthPercent < 0.5) {
                score += 25;
            }
            
            // Ensure basic attacks always have a minimum score
            if (action.name === 'Attack') {
                score = Math.max(score, 10);
            }
            
            return { action, score };
        });
        
        // Sort by score and return the best action
        actionScores.sort((a, b) => b.score - a.score);
        return actionScores[0].action;
    }
    
    // Perform autobattle turn
    performAutobattleTurn() {
        if (!this.autobattleMode || !this.isPlayerTurn || this.playerState.isStunned || this.autobattleExecuting) {
            return false;
        }
        
        // Additional safety check - if no actions are available, fall back to basic attack
        const availableActions = this.getPlayerActions();
        if (availableActions.length === 0) {
            this.addToLog("No actions available, skipping turn!");
            this.autobattleExecuting = false;
            return false;
        }
        
        this.autobattleExecuting = true;
        
        const bestAction = this.choosePlayerAction();
        
        // Double-check that the action is not on cooldown
        if (this.playerState.cooldowns[bestAction.name]) {
            this.addToLog(`AI tried to use ${bestAction.name} but it's on cooldown!`);
            // Reset flag and return false to prevent infinite loop
            this.autobattleExecuting = false;
            return false;
        }
        
        this.addToLog(`AI chooses: ${bestAction.name}`);
        
        // Perform the chosen action
        console.log('Autobattle: Performing action:', bestAction.name);
        const result = this.performPlayerAction(bestAction.name);
        console.log('Autobattle: Action result:', result);
        
        // Reset flag after action is complete
        setTimeout(() => {
            this.autobattleExecuting = false;
            console.log('Autobattle: Execution flag reset');
        }, 100);
        
        return result;
    }
}
