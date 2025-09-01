// Tile class
class Tile extends Entity {
    constructor(gridX, gridY, type) {
        const { x, y } = gridToCanvas(gridX, gridY);
        super(x, y, TILE_SIZE, TILE_SIZE);
        
        this.gridX = gridX;
        this.gridY = gridY;
        this.type = type || this.generateRandomTerrain();
        this.isPath = false;
        this.isPlaceable = false;
        this.isOccupied = false;
        this.cardType = null;
        this.effectsApplied = false;
        this.daysPassed = 0;
        
        // Discovery system
        this.isDiscovered = false;
        this.hasEnemy = Math.random() < 0.3; // 30% chance for enemy
        this.enemyType = this.hasEnemy ? this.generateRandomEnemy() : null;
        
        // Visual properties
        this.highlight = false;
        this.highlightColor = 'rgba(255, 255, 0, 0.3)';
    }
    
    // Update tile state
    update(deltaTime, gameManager) {
        if (this.cardType && this.cardType.effects) {
            this.updateEffects(deltaTime, gameManager);
        }
    }
    
    // Update tile effects
    updateEffects(deltaTime, gameManager) {
        // Skip if no card or effects
        if (!this.cardType || !this.cardType.effects) return;
        
        // Check for resource generation
        if (this.cardType.effects.resources && !this.effectsApplied) {
            Object.entries(this.cardType.effects.resources).forEach(([resourceType, range]) => {
                const amount = getRandomValue(range);
                gameManager.character.addResource(resourceType, amount, gameManager);
            });
            
            this.effectsApplied = true;
        }
        
        // Check for enemy spawning
        if (this.cardType.effects.spawnFaction && Math.random() < 0.1 * deltaTime) {
            gameManager.trySpawnEnemy(this.gridX, this.gridY, this.cardType.effects.spawnFaction);
        }
        
        // Check for treasure drops
        if (this.cardType.effects.treasureChance && Math.random() < this.cardType.effects.treasureChance * 0.05 * deltaTime) {
            console.log(`Found treasure at ${this.gridX}, ${this.gridY}!`);
            // TODO: Implement treasure system
        }
    }
    
    // Reset the tile's daily effects
    resetDailyEffects() {
        this.effectsApplied = false;
        this.daysPassed++;
    }
    
    // Place a card on this tile
    placeCard(card) {
        if (!this.isPlaceable || this.isOccupied) {
            return false;
        }
        
        this.cardType = card;
        this.isOccupied = true;
        this.type = card.type;
        this.effectsApplied = false;
        
        console.log(`Placed ${card.name} at ${this.gridX}, ${this.gridY}`);
        return true;
    }
    
    // Set tile as a path tile
    setAsPath() {
        this.isPath = true;
        this.isPlaceable = false;
    }
    
    // Set tile as placeable
    setAsPlaceable() {
        if (!this.isPath) {
            this.isPlaceable = true;
        }
    }
    
    // Generate random terrain type
    generateRandomTerrain() {
        const terrainTypes = [
            TERRAIN_TYPES.PLAINS,
            TERRAIN_TYPES.HILLS,
            TERRAIN_TYPES.FOREST,
            TERRAIN_TYPES.RUINS,
            TERRAIN_TYPES.WASTELAND,
            TERRAIN_TYPES.MOUNTAIN,
            TERRAIN_TYPES.WARPSTONE_DEPOSIT
        ];
        
        const weights = [30, 20, 15, 10, 10, 10, 5]; // Weighted probabilities
        const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
        let random = Math.random() * totalWeight;
        
        for (let i = 0; i < terrainTypes.length; i++) {
            random -= weights[i];
            if (random <= 0) {
                return terrainTypes[i];
            }
        }
        
        return TERRAIN_TYPES.PLAINS; // Fallback
    }
    
    // Generate random enemy type
    generateRandomEnemy() {
        const enemyTypes = Object.keys(ENEMY_TYPES);
        return enemyTypes[Math.floor(Math.random() * enemyTypes.length)];
    }
    
    // Discover this tile
    discover() {
        this.isDiscovered = true;
        console.log(`Discovered ${this.type} at (${this.gridX}, ${this.gridY})${this.hasEnemy ? ' with enemy: ' + this.enemyType : ''}`);
    }
    
    // Get terrain info for display
    getTerrainInfo() {
        // Convert terrain type to proper constant key
        let terrainKey = this.type.toUpperCase();
        if (terrainKey === 'WARPSTONEDEPOSIT') {
            terrainKey = 'WARPSTONE_DEPOSIT';
        }
        
        const terrainData = TERRAIN_BUILDING_TYPES[terrainKey];
        
        return {
            name: terrainData?.name || this.type,
            description: terrainData?.description || 'Unknown terrain',
            icon: terrainData?.icon || '❓',
            type: this.type,
            availableBuildings: terrainData?.availableBuildings || [],
            hasEnemy: this.hasEnemy,
            enemyType: this.enemyType
        };
    }
    
    // Draw the tile
    draw(ctx) {
        // Draw base tile
        if (this.isDiscovered) {
            ctx.fillStyle = this.getBackgroundColor();
        } else {
            ctx.fillStyle = 'rgba(20, 20, 20, 0.8)'; // Dark undiscovered color
        }
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // Draw border with stronger visibility
        ctx.strokeStyle = this.isPlaceable ? 'rgba(120, 120, 120, 0.7)' : 'rgba(60, 60, 60, 0.5)';
        ctx.lineWidth = 1;
        ctx.strokeRect(this.x, this.y, this.width, this.height);
        
        // Draw path indicator
        if (this.isPath) {
            ctx.fillStyle = 'rgba(180, 180, 180, 0.5)';
            const inset = this.width * 0.1;
            ctx.fillRect(
                this.x + inset,
                this.y + inset,
                this.width - inset * 2,
                this.height - inset * 2
            );
            
            // Add path border
            ctx.strokeStyle = 'rgba(200, 200, 200, 0.7)';
            ctx.lineWidth = 2;
            ctx.strokeRect(
                this.x + inset,
                this.y + inset,
                this.width - inset * 2,
                this.height - inset * 2
            );
        }
        
        // Draw terrain icon if discovered
        if (this.isDiscovered && !this.isOccupied) {
            const terrainInfo = this.getTerrainInfo();
            ctx.font = '16px Arial';
            ctx.textAlign = 'center';
            ctx.fillStyle = 'white';
            ctx.fillText(terrainInfo.icon, this.x + this.width/2, this.y + this.height/2 + 6);
            
            // Draw enemy indicator if present
            if (this.hasEnemy && this.enemyType) {
                ctx.font = '12px Arial';
                ctx.fillStyle = '#ff6600';
                ctx.fillText('👹', this.x + this.width - 8, this.y + 12);
            }
        }
        
        // Draw highlight
        if (this.highlight) {
            ctx.fillStyle = this.highlightColor;
            ctx.fillRect(this.x, this.y, this.width, this.height);
        }
        
        // Draw card if occupied
        if (this.isOccupied && this.cardType) {
            // Draw card background
            ctx.fillStyle = this.getCardColor();
            const cardInset = this.width * 0.15;
            ctx.fillRect(
                this.x + cardInset,
                this.y + cardInset,
                this.width - cardInset * 2,
                this.height - cardInset * 2
            );
            
            // Draw card border
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
            ctx.lineWidth = 1;
            ctx.strokeRect(
                this.x + cardInset,
                this.y + cardInset,
                this.width - cardInset * 2,
                this.height - cardInset * 2
            );
            
            // Draw card name with improved visibility
            drawTextWithStroke(
                ctx,
                this.cardType.name,
                this.x + this.width / 2,
                this.y + this.height / 2,
                'white',
                'black',
                3,  // Thicker stroke
                11   // Slightly larger font
            );
        }
        
        // If sprite exists, draw it
        if (this.sprite) {
            ctx.drawImage(this.sprite, this.x, this.y, this.width, this.height);
        }
    }
    
    // Get background color based on tile type
    getBackgroundColor() {
        if (!this.isDiscovered) {
            return 'rgba(20, 20, 20, 0.8)';
        }
        
        switch (this.type) {
            case TERRAIN_TYPES.EMPTY:
                return this.isPlaceable ? 'rgba(100, 100, 100, 0.2)' : 'rgba(40, 40, 40, 0.3)';
            case TERRAIN_TYPES.PLAINS:
                return 'rgba(90, 140, 60, 0.6)';
            case TERRAIN_TYPES.HILLS:
                return 'rgba(120, 100, 80, 0.6)';
            case TERRAIN_TYPES.FOREST:
                return 'rgba(50, 120, 50, 0.6)';
            case TERRAIN_TYPES.BATTLEFIELD:
                return 'rgba(150, 30, 30, 0.7)';
            case TERRAIN_TYPES.FORGE:
                return 'rgba(180, 90, 30, 0.6)';
            case TERRAIN_TYPES.WARP_RIFT:
                return 'rgba(130, 30, 160, 0.6)';
            case TERRAIN_TYPES.RUINS:
                return 'rgba(150, 150, 150, 0.6)';
            case TERRAIN_TYPES.SETTLEMENT:
                return 'rgba(70, 120, 50, 0.6)';
            case TERRAIN_TYPES.OUTPOST:
                return 'rgba(80, 160, 60, 0.6)';
            case TERRAIN_TYPES.GROVE:
                return 'rgba(50, 160, 50, 0.6)';
            case TERRAIN_TYPES.MOUNTAIN:
                return 'rgba(120, 120, 120, 0.6)';
            case TERRAIN_TYPES.WASTELAND:
                return 'rgba(160, 140, 70, 0.6)';
            case TERRAIN_TYPES.WARPSTONE_DEPOSIT:
                return 'rgba(100, 50, 180, 0.6)';
            default:
                return 'rgba(40, 40, 40, 0.3)';
        }
    }
    
    // Get card color based on card type
    getCardColor() {
        if (!this.cardType) return 'rgba(100, 100, 100, 0.8)';
        
        switch (this.cardType.type) {
            case TERRAIN_TYPES.BATTLEFIELD:
                return 'rgba(150, 30, 30, 0.8)';
            case TERRAIN_TYPES.FORGE:
                return 'rgba(200, 100, 30, 0.8)';
            case TERRAIN_TYPES.WARP_RIFT:
                return 'rgba(150, 30, 180, 0.8)';
            case TERRAIN_TYPES.RUINS:
                return 'rgba(180, 180, 180, 0.8)';
            case TERRAIN_TYPES.SETTLEMENT:
                return 'rgba(90, 150, 70, 0.8)';
            case TERRAIN_TYPES.OUTPOST:
                return 'rgba(100, 180, 80, 0.8)';
            default:
                return 'rgba(100, 100, 100, 0.8)';
        }
    }
    
    // Set highlight state
    setHighlight(highlight, color) {
        this.highlight = highlight;
        if (color) {
            this.highlightColor = color;
        }
    }
}