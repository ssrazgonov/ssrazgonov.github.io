// Game Manager class
class GameManager {
    constructor(canvas, gameConfig = null) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.running = false;
        this.lastFrameTime = 0;
        this.mapSize = 20; // Grid size (20x20)
        
        // Game configuration from menu
        this.gameConfig = gameConfig || {
            startingEquipment: 'medkit',
            emperorsSeal: 'abundance'
        };
        
        // Apply seal modifiers
        this.sealModifiers = this.initializeSealModifiers();
        
        // Create map generator
        this.mapGenerator = new MapGenerator(this.mapSize, this.mapSize);
        this.tiles = [];
        this.path = [];
        
        // Game state
        this.character = null;
        this.enemies = [];
        this.cards = [];
        this.selectedCard = null;
        this.day = 1;
        this.loopCount = 0;
        this.inCombat = false;
        
        // Deck and cards
        this.cardDeck = document.getElementById('cardDeck');
        this.maxCards = 5;
        this.cardPool = Object.values(CARD_TYPES);
        
        // Time controls
        this.timeScale = 1.0;
        this.previousTimeScale = null;
        this.dayDuration = 60; // seconds per day
        this.dayTimer = 0;
        
        // UI reference
        this.uiManager = null;
        
        // Event listeners
        this.setupEventListeners();
    }
    
    // Initialize the game
    init() {
        // Resize canvas to fit grid
        this.resizeCanvas();
        
        // Initialize grid
        this.tiles = this.mapGenerator.initializeGrid();
        
        // Generate path
        this.path = this.mapGenerator.generateLoopPath();
        
        // Create character
        const startPos = this.mapGenerator.getStartingPosition();
        this.character = new Character(
            startPos.canvasX,
            startPos.canvasY,
            'SPACE_MARINE'
        );
        
        // Apply seal effects to character
        this.applySealEffectsToCharacter();
        
        // Set character's movement path
        this.character.setPath(this.path);
        
        // Give character starter equipment based on choice
        this.giveStarterEquipment();
        
        // Dispatch game initialized event for UI components
        document.dispatchEvent(new CustomEvent('game-initialized'));
        
        // Deal initial cards
        this.dealCards();
        
        // Start game loop
        this.running = true;
        window.requestAnimationFrame(this.gameLoop.bind(this));
        
        // Update UI
        this.updateUI();
    }
    
    // Initialize seal modifiers based on chosen seal
    initializeSealModifiers() {
        const sealData = {
            abundance: {
                resourceMultiplier: 1.5,
                enemyHealthMultiplier: 1.25
            },
            war: {
                damageMultiplier: 1.3,
                enemySpawnMultiplier: 1.5
            },
            resilience: {
                healthMultiplier: 1.4,
                resourceMultiplier: 0.7
            }
        };
        
        return sealData[this.gameConfig.emperorsSeal] || sealData.abundance;
    }
    
    // Apply seal effects to character
    applySealEffectsToCharacter() {
        const seal = this.gameConfig.emperorsSeal;
        
        switch(seal) {
            case 'war':
                // Increase damage
                this.character.attack = Math.floor(this.character.attack * this.sealModifiers.damageMultiplier);
                break;
            case 'resilience':
                // Increase health
                const healthBonus = Math.floor(this.character.maxHp * (this.sealModifiers.healthMultiplier - 1));
                this.character.maxHp += healthBonus;
                this.character.hp += healthBonus;
                break;
            // abundance doesn't directly affect character stats
        }
        
        console.log(`Applied ${seal} seal effects to character`);
    }
    
    // Main game loop
    gameLoop(timestamp) {
        if (!this.running) return;
        
        // Calculate delta time
        const deltaTime = (timestamp - this.lastFrameTime) / 1000;
        this.lastFrameTime = timestamp;
        
        // Update game state
        this.update(deltaTime * this.timeScale);
        
        // Render game
        this.render();
        
        // Continue loop
        window.requestAnimationFrame(this.gameLoop.bind(this));
    }
    
    // Update game state
    update(deltaTime) {
        // Update day/night cycle
        this.updateDayNight(deltaTime);
        
        // Update character
        this.character.update(deltaTime, this);
        
        // Update enemies
        this.updateEnemies(deltaTime);
        
        // Update tiles
        this.updateTiles(deltaTime);
    }
    
    // Update day/night cycle
    updateDayNight(deltaTime) {
        this.dayTimer += deltaTime;
        
        if (this.dayTimer >= this.dayDuration) {
            this.dayTimer = 0;
            this.nextDay();
        }
    }
    
    // Advance to next day
    nextDay() {
        this.day++;
        
        // Reset tile effects
        this.mapGenerator.resetDailyEffects();
        
        // Update UI
        document.getElementById('day').querySelector('span').textContent = this.day;
        
        // Deal new card if below max
        if (this.cards.length < this.maxCards) {
            this.dealCard();
        }
        
        console.log(`Day ${this.day} has begun!`);
    }
    
    // Complete a loop around the path
    completeLoop() {
        this.loopCount++;
        
        // Update UI
        document.getElementById('loop').querySelector('span').textContent = this.loopCount;
        
        console.log(`Completed loop ${this.loopCount}!`);
        
        // Dispatch loop completed event
        document.dispatchEvent(new CustomEvent('loop-completed', {
            detail: { loopCount: this.loopCount }
        }));
        
        // Heal character slightly
        const healAmount = Math.ceil(this.character.maxHp * 0.1);
        this.character.heal(healAmount);
        
        // Spawn enemies based on loop count and placed cards
        this.spawnEnemiesForLoop();
    }
    
    // Update all enemies
    updateEnemies(deltaTime) {
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const enemy = this.enemies[i];
            
            // Remove dead enemies
            if (enemy.hp <= 0) {
                // Dispatch enemy defeated event for UI counter
                document.dispatchEvent(new CustomEvent('enemy-defeated', {
                    detail: { enemy }
                }));
                
                this.enemies.splice(i, 1);
                continue;
            }
            
            // Update active enemies
            enemy.update(deltaTime, this.character, this);
        }
    }
    
    // Update all tiles
    updateTiles(deltaTime) {
        for (let y = 0; y < this.mapSize; y++) {
            for (let x = 0; x < this.mapSize; x++) {
                this.tiles[y][x].update(deltaTime, this);
            }
        }
    }
    
    // Render game state
    render() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw map
        this.mapGenerator.draw(this.ctx);
        
        // Draw enemies
        this.enemies.forEach(enemy => enemy.draw(this.ctx));
        
        // Draw character
        this.character.draw(this.ctx);
    }
    
    // Resize canvas to fit grid
    resizeCanvas() {
        // Set the canvas dimensions based on tile size and map size
        this.canvas.width = this.mapSize * TILE_SIZE;
        this.canvas.height = this.mapSize * TILE_SIZE;
        
        // Keep the canvas at a reasonable size for the display
        const maxDimension = Math.min(window.innerWidth * 0.8, window.innerHeight * 0.7);
        const scaleFactor = Math.min(1, maxDimension / Math.max(this.canvas.width, this.canvas.height));
        
        // Apply the scaling with transform to maintain pixel clarity
        if (scaleFactor < 1) {
            this.canvas.style.transformOrigin = 'center';
            this.canvas.style.transform = `scale(${scaleFactor})`;
            
            // Adjust container to accommodate the scaled size
            const scaledWidth = this.canvas.width * scaleFactor;
            const scaledHeight = this.canvas.height * scaleFactor;
            this.canvas.parentElement.style.width = scaledWidth + 'px';
            this.canvas.parentElement.style.height = scaledHeight + 'px';
        }
        
        console.log(`Canvas resized to ${this.canvas.width}x${this.canvas.height}, scale: ${scaleFactor}`);
    }
    
    // Setup event listeners
    setupEventListeners() {
        // Listen for card selection
        document.addEventListener('card-selected', (event) => {
            this.selectedCard = event.detail.card;
            this.highlightPlaceableTiles(true);
        });
        
        // Listen for canvas clicks (for placing cards)
        this.canvas.addEventListener('click', (event) => {
            if (this.selectedCard) {
                this.handleCanvasClick(event);
            }
        });
        
        // Listen for window resize
        window.addEventListener('resize', () => {
            this.resizeCanvas();
        });
    }
    
    // Handle canvas click
    handleCanvasClick(event) {
        if (!this.selectedCard) return;
        
        // Get click position relative to canvas
        const rect = this.canvas.getBoundingClientRect();
        const scale = this.canvas.width / rect.width;
        
        const clickX = (event.clientX - rect.left) * scale;
        const clickY = (event.clientY - rect.top) * scale;
        
        // Convert to grid coordinates
        const gridPos = canvasToGrid(clickX, clickY);
        
        // Try to place card
        if (this.placeCard(gridPos.x, gridPos.y, this.selectedCard)) {
            // Remove card from hand
            this.removeCard(this.selectedCard);
            this.selectedCard = null;
            
            // Remove tile highlights
            this.highlightPlaceableTiles(false);
        }
    }
    
    // Place a card on the map
    placeCard(gridX, gridY, card) {
        const tile = this.mapGenerator.getTile(gridX, gridY);
        
        if (tile && tile.isPlaceable && !tile.isOccupied) {
            return tile.placeCard(card.type);
        }
        
        return false;
    }
    
    // Deal cards to fill hand
    dealCards() {
        while (this.cards.length < this.maxCards) {
            this.dealCard();
        }
    }
    
    // Deal a single card
    dealCard() {
        if (this.cards.length >= this.maxCards) return;
        
        // Card pool with weighted probabilities
        const weightedPool = [];
        
        // Add cards with appropriate weights
        // Battlefield cards appear more frequently early in the game
        Object.entries(CARD_TYPES).forEach(([key, cardType]) => {
            const baseWeight = key === 'BATTLEFIELD' ? 3 : 1;
            const weight = this.loopCount < 3 && key === 'BATTLEFIELD' ? baseWeight * 2 : baseWeight;
            
            for (let i = 0; i < weight; i++) {
                weightedPool.push(cardType);
            }
        });
        
        // Get random card from weighted pool
        const randomIndex = Math.floor(Math.random() * weightedPool.length);
        const cardType = weightedPool[randomIndex];
        
        // Create new card
        const card = new Card(cardType);
        this.cards.push(card);
        
        // Add to UI
        this.cardDeck.appendChild(card.element);
    }
    
    // Remove card from hand
    removeCard(card) {
        const index = this.cards.indexOf(card);
        if (index !== -1) {
            this.cards.splice(index, 1);
            card.removeFromDeck();
        }
    }
    
    // Highlight placeable tiles
    highlightPlaceableTiles(highlight) {
        const placeableTiles = this.mapGenerator.getPlaceableTiles();
        
        placeableTiles.forEach(tile => {
            tile.setHighlight(highlight, 'rgba(100, 255, 100, 0.3)');
        });
    }
    
    // Check for tile interaction when character moves onto it
    checkTileInteraction(character) {
        const gridPos = canvasToGrid(character.x, character.y);
        const tile = this.mapGenerator.getTile(gridPos.x, gridPos.y);
        
        if (!tile) return;
        
        // Special tile effects when character steps on them
        if (tile.type === TERRAIN_TYPES.RUINS && Math.random() < 0.3) { // 30% chance in ruins
            const foundItem = character.findLoot();
            if (foundItem && character.addItem(foundItem)) {
                this.uiManager.showNotification(`Found ${foundItem.name}!`, 3000);
            }
        }
        
        // Chance for Tyranid Hive to drop biomass items
        if (tile.type === TERRAIN_TYPES.SETTLEMENT && 
            tile.cardType && 
            tile.cardType.effects.spawnFaction === FACTIONS.TYRANIDS && 
            Math.random() < 0.2) { // 20% chance
            
            const consumableItem = new Consumable({
                name: 'Biomass Extract',
                description: 'Partially processed biomass that restores health',
                type: 'consumable',
                rarity: 'common',
                stackable: true,
                effect: {
                    hp: 20
                }
            });
            
            if (character.addItem(consumableItem)) {
                this.uiManager.showNotification('Found Biomass Extract!', 3000);
            }
        }
    }
    
    // Start combat between character and enemy
    startCombat(character, enemy) {
        this.inCombat = true;
        
        // Assign unique ID to enemy for reference
        enemy.id = 'enemy-' + Date.now();
        
        console.log(`Combat started between ${character.name} and ${enemy.name}!`);
        
        // Set time scale lower during combat for better gameplay
        this.previousTimeScale = this.timeScale;
        this.timeScale = 0.5;
        
        // Update UI
        if (this.uiManager) {
            this.uiManager.showCombatUI(character, enemy);
        }
        
        // Listen for enemy move events
        document.addEventListener('enemy-move-ready', this.handleEnemyMoveReady.bind(this));
        
        // Pause character movement
        character.isMoving = false;
        
        // Dispatch combat event
        document.dispatchEvent(new CustomEvent('combat-start', { 
            detail: { character, enemy }
        }));
    }
    
    // End combat
    endCombat() {
        if (!this.inCombat) return;
        
        this.inCombat = false;
        
        // Restore time scale
        if (this.previousTimeScale) {
            this.timeScale = this.previousTimeScale;
        }
        
        // Hide combat UI
        if (this.uiManager) {
            this.uiManager.hideCombatUI();
        }
        
        // Resume character movement
        this.character.isMoving = true;
        
        // Remove event listeners
        document.removeEventListener('enemy-move-ready', this.handleEnemyMoveReady.bind(this));
        
        console.log('Combat ended!');
        
        // Dispatch combat end event
        document.dispatchEvent(new CustomEvent('combat-end'));
    }
    
    // Handle enemy move ready event
    handleEnemyMoveReady(event) {
        if (!this.uiManager || !this.inCombat) return;
        
        // Update UI to show enemy's move
        this.uiManager.updateCombatUI(this.character, this.character.currentEnemy);
    }
    
    // Try to spawn an enemy at a specific location
    trySpawnEnemy(gridX, gridY, faction = null) {
        // Don't spawn if already too many enemies
        if (this.enemies.length >= 10) return false;
        
        // Only spawn on or near path
        const tile = this.mapGenerator.getTile(gridX, gridY);
        if (!tile || (!tile.isPath && !tile.isPlaceable)) return false;
        
        // Get eligible enemy types based on faction
        let eligibleEnemies = Object.entries(ENEMY_TYPES);
        
        if (faction) {
            eligibleEnemies = eligibleEnemies.filter(([_, data]) => data.faction === faction);
        }
        
        if (eligibleEnemies.length === 0) return false;
        
        // Weight-based selection
        const totalWeight = eligibleEnemies.reduce((sum, [_, data]) => sum + data.spawnWeight, 0);
        let randomWeight = Math.random() * totalWeight;
        
        let selectedType = null;
        for (const [type, data] of eligibleEnemies) {
            randomWeight -= data.spawnWeight;
            if (randomWeight <= 0) {
                selectedType = type;
                break;
            }
        }
        
        if (!selectedType) return false;
        
        // Create enemy
        const canvasPos = gridToCanvas(gridX, gridY);
        const enemy = new Enemy(canvasPos.x, canvasPos.y, selectedType, this);
        
        // Add to game
        this.enemies.push(enemy);
        
        // Dispatch enemy spawned event
        document.dispatchEvent(new CustomEvent('enemy-spawned', {
            detail: { enemy }
        }));
        
        return true;
    }
    
    // Spawn enemies based on loop count and placed cards
    spawnEnemiesForLoop() {
        // Base number of enemies per loop
        let baseEnemies = Math.min(3, 1 + Math.floor(this.loopCount / 2));
        
        // Apply war seal modifier
        if (this.gameConfig.emperorsSeal === 'war' && this.sealModifiers.enemySpawnMultiplier) {
            baseEnemies = Math.floor(baseEnemies * this.sealModifiers.enemySpawnMultiplier);
        }
        
        // Extra enemies from battlefield cards
        let extraEnemies = 0;
        for (let y = 0; y < this.mapSize; y++) {
            for (let x = 0; x < this.mapSize; x++) {
                const tile = this.tiles[y][x];
                if (
                    tile.isOccupied &&
                    tile.cardType &&
                    tile.cardType.type === TERRAIN_TYPES.BATTLEFIELD &&
                    tile.cardType.effects &&
                    tile.cardType.effects.spawnRateModifier
                ) {
                    extraEnemies += Math.floor(baseEnemies * (tile.cardType.effects.spawnRateModifier - 1));
                }
            }
        }
        
        // Spawn enemies along path
        const totalEnemies = baseEnemies + extraEnemies;
        let spawnAttempts = totalEnemies * 3; // Allow multiple attempts to find valid spawn positions
        let spawned = 0;
        
        while (spawned < totalEnemies && spawnAttempts > 0) {
            // Get random path position
            const pathIndex = Math.floor(Math.random() * this.path.length);
            const spawnPos = this.path[pathIndex];
            
            // Try to spawn enemy
            if (this.trySpawnEnemy(spawnPos.x, spawnPos.y)) {
                spawned++;
            }
            
            spawnAttempts--;
        }
        
        console.log(`Spawned ${spawned} enemies for loop ${this.loopCount} (base: ${baseEnemies})`);
    }
    
    // Update UI elements
    updateUI() {
        // Character stats
        document.getElementById('charHP').textContent = this.character.hp;
        document.getElementById('charMaxHP').textContent = this.character.maxHp;
        document.getElementById('charAttack').textContent = this.character.attack;
        document.getElementById('charDefense').textContent = this.character.defense;
        document.getElementById('charSpeed').textContent = this.character.speed.toFixed(1);
        
        // Resources
        Object.entries(this.character.resources).forEach(([type, amount]) => {
            const element = document.getElementById(type);
            if (element) {
                element.querySelector('span').textContent = amount;
            }
        });
        
        // Day and loop counters
        document.getElementById('day').querySelector('span').textContent = this.day;
        document.getElementById('loop').querySelector('span').textContent = this.loopCount;
    }
    
    // Give character starter equipment
    giveStarterEquipment() {
        // Create starter weapon
        const starterWeapon = new Equipment(ITEM_TEMPLATES.BOLT_PISTOL);
        const weaponSlot = starterWeapon.getEquipSlot();
        
        // Directly equip weapon
        this.character.equipment[weaponSlot] = starterWeapon;
        starterWeapon.equipped = true;
        
        // Apply weapon stats
        if (starterWeapon instanceof Equipment) {
            starterWeapon.applyStats(this.character);
        }
        
        // Create starter armor
        const starterArmor = new Equipment(ITEM_TEMPLATES.FLAK_ARMOR);
        const armorSlot = starterArmor.getEquipSlot();
        
        // Directly equip armor
        this.character.equipment[armorSlot] = starterArmor;
        starterArmor.equipped = true;
        
        // Apply armor stats
        if (starterArmor instanceof Equipment) {
            starterArmor.applyStats(this.character);
        }
        
        // Give starting equipment based on choice
        if (this.gameConfig.startingEquipment === 'medkit') {
            // Create healing items
            const healingItem = new Consumable(ITEM_TEMPLATES.MEDI_KIT);
            healingItem.quantity = 2; // Start with 2 med kits
            this.character.addItem(healingItem);
        } else if (this.gameConfig.startingEquipment === 'revive') {
            // Create revive pack
            const revivePack = new Consumable({
                name: 'Revive Pack',
                description: 'Emergency revival system - restores 20% health upon death',
                type: 'consumable',
                rarity: 'uncommon',
                stackable: false,
                effect: {
                    revive: true,
                    revivePercent: 0.2
                }
            });
            this.character.addItem(revivePack);
            
            // Set revive flag on character for future use
            this.character.hasRevivePack = true;
        }
        
        console.log(`Equipped starter equipment: ${this.gameConfig.startingEquipment}`);
        
        // Give some starter resources for testing crafting
        this.character.addResource(RESOURCE_TYPES.BIOMASS, 20, this);
        this.character.addResource(RESOURCE_TYPES.SCRAP, 15, this);
        this.character.addResource(RESOURCE_TYPES.WARPSTONE, 5, this);
        
        // Trigger UI update
        document.dispatchEvent(new CustomEvent('equipment-changed', {
            detail: { character: this.character }
        }));
    }
}