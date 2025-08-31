// Grid-based Game Manager for Turn-based Movement
class GridGameManager {
    constructor() {
        this.gridSize = GRID_SIZE;
        this.cellSize = CELL_SIZE;
        this.canvas = null;
        this.ctx = null;
        this.isInitialized = false;
        
        // Player position
        this.playerPosition = {
            x: START_POSITION.x,
            y: START_POSITION.y
        };
        
        // Game state
        this.highlightedCells = [];
        this.isPlayerTurn = true;
        
        // Turn counter system
        this.maxTurns = 30;
        this.remainingTurns = this.maxTurns;
        this.isGameOver = false;
        
        // Hidden enemies system
        this.enemies = [];
        this.enemyCount = 0;
        this.maxEnemies = 8; // Number of hidden enemies on the map
        this.inCombat = false;
        this.currentEnemy = null;
        
        // New systems integration
        this.base = new Base();
        this.crafting = new Crafting(this.base);
        this.heroUpgrade = new HeroUpgrade(this.base);
        this.battlefieldCard = new BattlefieldCard();
        this.relics = [];
        this.character = null;
        
        // Relic discovery system
        this.relicSpawnChance = 0.15; // 15% chance per enemy kill
        this.maxRelics = 5;
        
        // Resource collection
        this.resources = {
            [RESOURCE_TYPES.BIOMASS]: 0,
            [RESOURCE_TYPES.SCRAP]: 0,
            [RESOURCE_TYPES.WARPSTONE]: 0
        };
        
        // Combat points system
        this.combatPoints = 0;
        this.totalCombatPoints = 0;
        
        // Achievement system
        this.achievements = {
            firstBlood: false,
            veteran: false,
            elite: false,
            legendary: false,
            survivor: false
        };
        
        // Combat statistics
        this.combatStats = {
            enemiesDefeated: 0,
            battlesWon: 0,
            battlesLost: 0,
            totalDamageDealt: 0,
            totalDamageTaken: 0
        };
        
        // Colors
        this.colors = {
            grid: '#444',
            background: '#1a1a1a',
            player: '#bb0000',
            startCell: '#ffcc00',
            possibleMove: '#88ff88',
            possibleMoveHover: '#aaffaa',
            cellBorder: '#666',
            enemy: '#ff6600',
            enemyBorder: '#ff0000',
            relic: '#ffcc00',
            relicBorder: '#ffaa00'
        };
    }
    
    // Initialize the grid game
    init() {
        this.canvas = document.getElementById('gameCanvas');
        if (!this.canvas) {
            console.error('Game canvas not found');
            return;
        }
        
        this.ctx = this.canvas.getContext('2d');
        
        // Set canvas size
        this.canvas.width = GAME_WIDTH;
        this.canvas.height = GAME_HEIGHT;
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Initialize character and systems
        this.initializeCharacter();
        this.updateResourceDisplay();
        
        // Draw initial state
        this.drawGrid();
        this.highlightPossibleMoves();
        this.updateTurnCounter();
        
        // Generate hidden enemies
        this.generateHiddenEnemies();
        
        // Add UI buttons
        this.addUIButtons();
        
        // Initialize battlefield UI
        this.updateBattlefieldUI();
        
        this.isInitialized = true;
        console.log('Grid Game Manager initialized with enhanced systems');
    }
    
    // Setup event listeners for mouse and touch
    setupEventListeners() {
        // Mouse events
        this.canvas.addEventListener('click', (e) => this.handleClick(e));
        this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        
        // Touch events for mobile
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            const rect = this.canvas.getBoundingClientRect();
            const x = touch.clientX - rect.left;
            const y = touch.clientY - rect.top;
            this.handleClick({offsetX: x, offsetY: y});
        }, {passive: false});
    }
    
    // Convert canvas coordinates to grid coordinates
    canvasToGrid(canvasX, canvasY) {
        return {
            x: Math.floor(canvasX / this.cellSize),
            y: Math.floor(canvasY / this.cellSize)
        };
    }
    
    // Convert grid coordinates to canvas coordinates
    gridToCanvas(gridX, gridY) {
        return {
            x: gridX * this.cellSize,
            y: gridY * this.cellSize
        };
    }
    
    // Check if a position is valid on the grid
    isValidPosition(x, y) {
        return x >= 0 && x < this.gridSize && y >= 0 && y < this.gridSize;
    }
    
    // Check if a move is valid (within 1 cell distance)
    isValidMove(fromX, fromY, toX, toY) {
        const dx = Math.abs(toX - fromX);
        const dy = Math.abs(toY - fromY);
        return dx <= 1 && dy <= 1 && (dx > 0 || dy > 0);
    }
    
    // Get all possible moves from current position
    getPossibleMoves() {
        const moves = [];
        const {x, y} = this.playerPosition;
        
        MOVEMENT_DIRECTIONS.forEach(dir => {
            const newX = x + dir.x;
            const newY = y + dir.y;
            
            if (this.isValidPosition(newX, newY)) {
                moves.push({x: newX, y: newY});
            }
        });
        
        return moves;
    }
    
    // Highlight possible moves
    highlightPossibleMoves() {
        this.highlightedCells = this.getPossibleMoves();
        this.drawGrid();
    }
    
    // Handle mouse click
    handleClick(event) {
        if (!this.isPlayerTurn || this.isGameOver || this.inCombat) return;
        
        const gridPos = this.canvasToGrid(event.offsetX, event.offsetY);
        
        // Check if clicked position is a valid move
        const isValidMove = this.highlightedCells.some(cell => 
            cell.x === gridPos.x && cell.y === gridPos.y
        );
        
        if (isValidMove) {
            this.movePlayer(gridPos.x, gridPos.y);
        }
    }
    
    // Handle mouse movement for hover effects
    handleMouseMove(event) {
        const gridPos = this.canvasToGrid(event.offsetX, event.offsetY);
        
        // Check if hovering over a valid move
        const isHovering = this.highlightedCells.some(cell => 
            cell.x === gridPos.x && cell.y === gridPos.y
        );
        
        // Change cursor
        this.canvas.style.cursor = isHovering ? 'pointer' : 'default';
        
        // Redraw with hover effect
        this.drawGrid(gridPos);
    }
    
    // Move player to new position
    movePlayer(x, y) {
        console.log(`Moving player from (${this.playerPosition.x}, ${this.playerPosition.y}) to (${x}, ${y})`);
        
        this.playerPosition.x = x;
        this.playerPosition.y = y;
        
        // Decrease remaining turns
        this.remainingTurns--;
        this.updateTurnCounter();
        
        // Check for game over
        if (this.remainingTurns <= 0) {
            this.gameOver();
            return;
        }
        
        // Update highlights for new position
        this.highlightPossibleMoves();
        
        // Update battlefield UI for new position
        this.updateBattlefieldUI();
        
        // End turn (for future turn-based mechanics)
        this.endPlayerTurn();
    }
    
    // End player turn
    endPlayerTurn() {
        console.log(`Player turn ended. Remaining turns: ${this.remainingTurns}`);
        
        // Check if player stepped on an enemy
        this.checkEnemyEncounter();
        
        // Process battlefield card effects
        this.battlefieldCard.processTurnEffects();
        
        // Update persistent battlefield UI
        this.updateBattlefieldUI();
        
        // For now, immediately start new turn
        // In future, this is where enemy/event processing would happen
        this.isPlayerTurn = true;
    }
    
    // Generate hidden enemies on the map
    generateHiddenEnemies() {
        this.enemies = [];
        this.enemyCount = 0;
        
        const enemyTypes = [
            { name: 'Tyranid Warrior', faction: 'Tyranids', threat: 3 },
            { name: 'Ork Boy', faction: 'Orks', threat: 2 },
            { name: 'Necron Warrior', faction: 'Necrons', threat: 4 },
            { name: 'Chaos Cultist', faction: 'Chaos', threat: 1 },
            { name: 'Genestealer', faction: 'Tyranids', threat: 3 },
            { name: 'Ork Nob', faction: 'Orks', threat: 4 },
            { name: 'Chaos Marine', faction: 'Chaos', threat: 5 },
            { name: 'Necron Immortal', faction: 'Necrons', threat: 5 }
        ];
        
        // Generate random enemy positions (avoiding center start position)
        for (let i = 0; i < this.maxEnemies; i++) {
            let x, y;
            let attempts = 0;
            
            // Find valid position (not on start cell and not occupied by another enemy)
            do {
                x = Math.floor(Math.random() * this.gridSize);
                y = Math.floor(Math.random() * this.gridSize);
                attempts++;
            } while (
                (x === START_POSITION.x && y === START_POSITION.y) || // Not on start position
                this.isEnemyAt(x, y) || // Not on existing enemy
                attempts > 100 // Safety break
            );
            
            if (attempts <= 100) {
                const enemyType = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];
                
                const enemy = {
                    id: `enemy_${i}`,
                    x: x,
                    y: y,
                    name: enemyType.name,
                    faction: enemyType.faction,
                    threat: enemyType.threat,
                    discovered: false,
                    defeated: false
                };
                
                this.enemies.push(enemy);
                this.enemyCount++;
            }
        }
        
        console.log(`Generated ${this.enemies.length} hidden enemies:`);
        this.enemies.forEach(enemy => {
            console.log(`- ${enemy.name} (${enemy.faction}) at (${enemy.x}, ${enemy.y}) - Threat: ${enemy.threat}`);
        });
    }
    
    // Check if there's an enemy at specific coordinates
    isEnemyAt(x, y) {
        return this.enemies.some(enemy => 
            enemy.x === x && enemy.y === y && !enemy.defeated
        );
    }
    
    // Get enemy at specific coordinates
    getEnemyAt(x, y) {
        return this.enemies.find(enemy => 
            enemy.x === x && enemy.y === y && !enemy.defeated
        );
    }
    
    // Check for enemy encounter when player moves
    checkEnemyEncounter() {
        const enemy = this.getEnemyAt(this.playerPosition.x, this.playerPosition.y);
        
        if (enemy) {
            // First encounter with this enemy
            if (!enemy.discovered) {
                enemy.discovered = true;
                console.log(`ENEMY DISCOVERED! ${enemy.name} (${enemy.faction}) - Threat Level: ${enemy.threat}`);
            } else {
                console.log(`ENEMY ENCOUNTERED AGAIN! ${enemy.name} (${enemy.faction}) - Threat Level: ${enemy.threat}`);
            }
            
            this.currentEnemy = enemy;
            
            // Redraw grid to show discovered enemy
            this.drawGrid();
            
            // Start combat encounter
            this.startCombat(enemy);
        }
    }
    
    // Handle enemy encounter (placeholder for future combat system)
    handleEnemyEncounter(enemy) {
        // Mark enemy as defeated for now (automatic victory)
        enemy.defeated = true;
        
        console.log(`Enemy ${enemy.name} defeated! Player continues...`);
        
        // Future: This would open combat interface
        // For now, just show a notification in console
        
        // Reduce remaining enemies count
        const remainingEnemies = this.enemies.filter(e => !e.defeated).length;
        console.log(`Enemies remaining on map: ${remainingEnemies}`);
    }
    
    // Start combat encounter
    startCombat(enemy) {
        this.inCombat = true;
        this.isPlayerTurn = false;
        enemy.inCombat = true;
        
        console.log(`Combat started with ${enemy.name}!`);
        
        // Initialize combat system
        this.currentCombat = new Combat(this.character, enemy);
        
        // Show enhanced combat interface
        this.showEnhancedCombatInterface(enemy);
    }
    
    // Show enhanced combat interface
    showEnhancedCombatInterface(enemy) {
        // Create combat overlay
        const overlay = document.createElement('div');
        overlay.id = 'combat-overlay';
        overlay.style.position = 'fixed';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.width = '100%';
        overlay.style.height = '100%';
        overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.9)';
        overlay.style.display = 'flex';
        overlay.style.justifyContent = 'center';
        overlay.style.alignItems = 'center';
        overlay.style.zIndex = '9998';
        overlay.style.animation = 'fadeIn 0.5s ease-out';
        
        // Enhanced combat interface
        overlay.innerHTML = `
            <div class="enhanced-combat-panel" style="
                background: linear-gradient(135deg, rgba(15, 5, 5, 0.98), rgba(30, 10, 10, 0.99));
                border: 3px solid #bb0000;
                border-radius: 12px;
                box-shadow: 0 0 50px rgba(187, 0, 0, 0.8);
                max-width: 800px;
                width: 95%;
                max-height: 90vh;
                overflow-y: auto;
                padding: 20px;
            ">
                <!-- Combat Header -->
                <div class="combat-header" style="text-align: center; margin-bottom: 20px;">
                    <div style="font-size: 2.5rem; margin-bottom: 10px;">⚔️💀⚔️</div>
                    <h2 style="
                        color: #bb0000;
                        font-size: 1.8rem;
                        margin-bottom: 10px;
                        text-shadow: 0 0 15px rgba(187, 0, 0, 0.8);
                        font-family: 'Trebuchet MS', serif;
                    ">TACTICAL COMBAT</h2>
                    <h3 style="
                        color: #ffcc00;
                        font-size: 1.3rem;
                        margin-bottom: 5px;
                        text-shadow: 0 0 10px rgba(255, 204, 0, 0.6);
                    ">${enemy.name}</h3>
                    <p style="color: #ff6600; font-size: 0.9rem;">Faction: ${enemy.faction} | Threat: ${enemy.threat}</p>
                </div>
                
                <!-- Health Bars -->
                <div class="health-bars" style="display: flex; gap: 20px; margin-bottom: 20px;">
                    <div class="player-health" style="flex: 1; background: rgba(0,0,0,0.5); padding: 10px; border-radius: 8px; border: 2px solid #0070dd;">
                        <div style="color: #0070dd; font-weight: bold; margin-bottom: 5px;">YOUR HEALTH</div>
                        <div class="health-bar" style="background: #333; height: 20px; border-radius: 10px; overflow: hidden;">
                            <div class="health-fill" style="background: linear-gradient(90deg, #0070dd, #00aaff); height: 100%; width: 100%; transition: width 0.3s;"></div>
                        </div>
                        <div class="health-text" style="color: #fff; font-size: 0.9rem; margin-top: 5px;">100/100</div>
                    </div>
                    <div class="enemy-health" style="flex: 1; background: rgba(0,0,0,0.5); padding: 10px; border-radius: 8px; border: 2px solid #bb0000;">
                        <div style="color: #bb0000; font-weight: bold; margin-bottom: 5px;">${enemy.name.toUpperCase()}</div>
                        <div class="health-bar" style="background: #333; height: 20px; border-radius: 10px; overflow: hidden;">
                            <div class="health-fill" style="background: linear-gradient(90deg, #bb0000, #ff6600); height: 100%; width: 100%; transition: width 0.3s;"></div>
                        </div>
                        <div class="health-text" style="color: #fff; font-size: 0.9rem; margin-top: 5px;">100/100</div>
                    </div>
                </div>
                
                <!-- Combat Actions -->
                <div class="combat-actions" style="margin-bottom: 20px;">
                    <h4 style="color: #ffcc00; margin-bottom: 10px; text-align: center;">CHOOSE YOUR ACTION</h4>
                    <div class="action-buttons" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 10px;">
                        <!-- Action buttons will be populated by JavaScript -->
                    </div>
                </div>
                
                <!-- Combat Log -->
                <div class="combat-log" style="
                    background: rgba(0,0,0,0.7);
                    border: 1px solid #444;
                    border-radius: 8px;
                    padding: 15px;
                    height: 150px;
                    overflow-y: auto;
                    margin-bottom: 15px;
                ">
                    <div style="color: #ffcc00; font-weight: bold; margin-bottom: 10px;">COMBAT LOG</div>
                    <div class="log-content" style="color: #e0e0e0; font-size: 0.9rem; line-height: 1.4;">
                        <div>Combat initiated with ${enemy.name}...</div>
                    </div>
                </div>
                
                <!-- Turn Info -->
                <div class="turn-info" style="
                    background: rgba(0,0,0,0.5);
                    border: 1px solid #666;
                    border-radius: 8px;
                    padding: 10px;
                    text-align: center;
                    margin-bottom: 15px;
                ">
                    <div style="color: #ffcc00; font-weight: bold;">TURN <span class="turn-number">1</span></div>
                    <div class="turn-status" style="color: #00ff00; font-size: 0.9rem;">Your turn</div>
                </div>
                
                <!-- Combat Control Buttons -->
                <div style="text-align: center; display: flex; gap: 10px; justify-content: center; margin-bottom: 15px;">
                    <button onclick="window.gridGameManager.toggleAutobattle()" id="autobattle-button" class="autobattle-button" style="
                        background: linear-gradient(45deg, #006600, #00aa00);
                        color: white;
                        border: 2px solid #004400;
                        border-radius: 5px;
                        padding: 10px 20px;
                        cursor: pointer;
                        font-weight: bold;
                        transition: all 0.3s ease;
                    ">AUTO BATTLE</button>
                    <button onclick="window.gridGameManager.retreatFromCombat()" class="retreat-button" style="
                        background: linear-gradient(45deg, #666, #999);
                        color: white;
                        border: 2px solid #444;
                        border-radius: 5px;
                        padding: 10px 20px;
                        cursor: pointer;
                        font-weight: bold;
                        transition: all 0.3s ease;
                    ">RETREAT</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(overlay);
        
        // Initialize combat UI
        this.updateCombatUI();
        
        // Start combat update loop - reduced frequency to prevent jitter
        this.combatUpdateInterval = setInterval(() => {
            this.updateCombatUI();
        }, 500);
    }
    
    // Update combat UI
    updateCombatUI() {
        if (!this.currentCombat) return;
        
        // Check if combat is over first
        if (this.currentCombat.isCombatOver()) {
            this.endCombat();
            return;
        }
        
        const status = this.currentCombat.getCombatStatus();
        
        // Update health bars
        const playerHealthFill = document.querySelector('.player-health .health-fill');
        const playerHealthText = document.querySelector('.player-health .health-text');
        const enemyHealthFill = document.querySelector('.enemy-health .health-fill');
        const enemyHealthText = document.querySelector('.enemy-health .health-text');
        
        if (playerHealthFill && playerHealthText) {
            const playerHealthPercent = (status.playerHealth / status.playerMaxHealth) * 100;
            const currentPlayerPercent = parseFloat(playerHealthFill.style.width) || 100;
            
            // Only update if health actually changed significantly
            if (Math.abs(currentPlayerPercent - playerHealthPercent) > 1) {
                playerHealthFill.style.width = `${playerHealthPercent}%`;
                playerHealthText.textContent = `${Math.round(status.playerHealth)}/${status.playerMaxHealth}`;
            }
        }
        
        if (enemyHealthFill && enemyHealthText) {
            const enemyHealthPercent = (status.enemyHealth / status.enemyMaxHealth) * 100;
            const currentEnemyPercent = parseFloat(enemyHealthFill.style.width) || 100;
            
            // Only update if health actually changed significantly
            if (Math.abs(currentEnemyPercent - enemyHealthPercent) > 1) {
                enemyHealthFill.style.width = `${enemyHealthPercent}%`;
                enemyHealthText.textContent = `${Math.round(status.enemyHealth)}/${status.enemyMaxHealth}`;
            }
        }
        
        // Update turn info
        const turnNumber = document.querySelector('.turn-number');
        const turnStatus = document.querySelector('.turn-status');
        
        if (turnNumber) turnNumber.textContent = status.turnNumber;
        if (turnStatus) {
            turnStatus.textContent = status.isPlayerTurn ? 'Your turn' : `${this.currentEnemy.name}'s turn`;
            turnStatus.style.color = status.isPlayerTurn ? '#00ff00' : '#ff6600';
        }
        
        // Update action buttons
        this.updateActionButtons(status);
        
        // Update combat log
        this.updateCombatLog(status);
    }
    
    // Update action buttons
    updateActionButtons(status) {
        const actionButtons = document.querySelector('.action-buttons');
        if (!actionButtons) return;
        
        // Only update if it's a player turn and we need to show buttons
        if (!status.isPlayerTurn) {
            if (actionButtons.children.length === 0 || actionButtons.children[0].textContent !== 'Enemy is thinking...') {
                actionButtons.innerHTML = '<div style="color: #ff6600; text-align: center; grid-column: 1/-1;">Enemy is thinking...</div>';
            }
            return;
        }
        
        // Check if autobattle is enabled
        if (this.currentCombat && this.currentCombat.isAutobattleEnabled()) {
            if (actionButtons.children.length === 0 || actionButtons.children[0].textContent !== 'AI is choosing action...') {
                actionButtons.innerHTML = '<div style="color: #00ff00; text-align: center; grid-column: 1/-1;">AI is choosing action...</div>';
            }
            
            // Only schedule autobattle if not already executing
            if (!this.currentCombat.autobattleExecuting) {
                // Perform autobattle action after a short delay
                setTimeout(() => {
                    if (this.currentCombat && this.currentCombat.isAutobattleEnabled() && !this.currentCombat.autobattleExecuting) {
                        const result = this.currentCombat.performAutobattleTurn();
                        // If autobattle failed, try again after a longer delay
                        if (!result && this.currentCombat.isAutobattleEnabled()) {
                            setTimeout(() => {
                                if (this.currentCombat && this.currentCombat.isAutobattleEnabled()) {
                                    this.currentCombat.performAutobattleTurn();
                                }
                            }, 2000);
                        }
                    }
                }, 1000);
            }
            
            return;
        }
        
        // Check if we need to update buttons (only if actions changed)
        const currentActionNames = Array.from(actionButtons.children).map(btn => {
            const nameElement = btn.querySelector('div:nth-child(2)');
            return nameElement ? nameElement.textContent : '';
        }).filter(name => name);
        
        const newActionNames = status.playerActions.map(action => action.name);
        
        // Only recreate buttons if actions actually changed
        if (currentActionNames.length !== newActionNames.length || 
            !currentActionNames.every((name, index) => name === newActionNames[index])) {
            
            // Clear existing buttons
            actionButtons.innerHTML = '';
            
            // Create action buttons
            status.playerActions.forEach(action => {
                const button = document.createElement('button');
                button.className = 'action-button';
                button.innerHTML = `
                    <div style="font-size: 1.5rem; margin-bottom: 5px;">${action.icon}</div>
                    <div style="font-weight: bold; margin-bottom: 3px;">${action.name}</div>
                    <div style="font-size: 0.8rem; opacity: 0.8;">${action.description}</div>
                `;
                
                button.style.cssText = `
                    background: linear-gradient(45deg, #bb0000, #ff6600);
                    color: white;
                    border: 2px solid #ffcc00;
                    border-radius: 8px;
                    padding: 15px;
                    cursor: pointer;
                    font-size: 0.9rem;
                    text-align: center;
                    transition: all 0.3s ease;
                    min-height: 80px;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                `;
                
                button.addEventListener('mouseenter', () => {
                    button.style.background = 'linear-gradient(45deg, #ff6600, #bb0000)';
                    button.style.transform = 'scale(1.05)';
                    button.style.boxShadow = '0 0 15px rgba(255, 204, 0, 0.5)';
                });
                
                button.addEventListener('mouseleave', () => {
                    button.style.background = 'linear-gradient(45deg, #bb0000, #ff6600)';
                    button.style.transform = 'scale(1)';
                    button.style.boxShadow = 'none';
                });
                
                button.addEventListener('click', () => {
                    this.performCombatAction(action.name);
                });
                
                actionButtons.appendChild(button);
            });
        }
    }
    
    // Update combat log
    updateCombatLog(status) {
        const logContent = document.querySelector('.log-content');
        if (!logContent) return;
        
        // Only update if log content actually changed
        const currentLogText = logContent.innerHTML;
        const newLogText = status.combatLog.map(log => 
            `<div style="margin-bottom: 5px;"><span style="color: #ffcc00;">[Turn ${log.turn}]</span> ${log.message}</div>`
        ).join('');
        
        if (currentLogText !== newLogText) {
            logContent.innerHTML = newLogText;
            
            // Auto-scroll to bottom
            const combatLog = document.querySelector('.combat-log');
            if (combatLog) {
                combatLog.scrollTop = combatLog.scrollHeight;
            }
        }
    }
    
    // Perform combat action
    performCombatAction(actionName) {
        if (!this.currentCombat) return;
        
        this.currentCombat.performPlayerAction(actionName);
    }
    
    // Toggle autobattle mode
    toggleAutobattle() {
        if (!this.currentCombat) return;
        
        const isEnabled = this.currentCombat.toggleAutobattle();
        const autobattleButton = document.getElementById('autobattle-button');
        
        if (autobattleButton) {
            if (isEnabled) {
                autobattleButton.style.background = 'linear-gradient(45deg, #aa0000, #ff0000)';
                autobattleButton.style.borderColor = '#880000';
                autobattleButton.textContent = 'STOP AUTO';
            } else {
                autobattleButton.style.background = 'linear-gradient(45deg, #006600, #00aa00)';
                autobattleButton.style.borderColor = '#004400';
                autobattleButton.textContent = 'AUTO BATTLE';
            }
        }
        
        // Force UI update
        this.updateCombatUI();
    }
    
    // Retreat from combat
    retreatFromCombat() {
        if (!this.currentCombat) return;
        
        // Move player back to start position
        this.playerPosition.x = START_POSITION.x;
        this.playerPosition.y = START_POSITION.y;
        
        // Store the enemy for potential re-engagement
        const retreatedEnemy = this.currentEnemy;
        
        this.endCombat();
        
        // Reset enemy's combat state but don't mark as defeated
        if (retreatedEnemy) {
            retreatedEnemy.inCombat = false;
        }
    }
    
    // End combat
    endCombat() {
        if (!this.currentCombat) return;
        
        const result = this.currentCombat.getCombatResult();
        const currentEnemy = this.currentEnemy; // Store reference to current enemy
        
        if (result) {
            if (result.winner === 'player') {
                // Player wins - handle victory
                this.handleCombatVictory(currentEnemy);
            } else {
                // Player loses - handle defeat
                this.handleCombatDefeat();
                
                // Reset enemy's health for potential re-engagement
                if (currentEnemy) {
                    // Reset enemy to initial state but don't mark as defeated
                    currentEnemy.hp = currentEnemy.maxHp;
                    currentEnemy.inCombat = false;
                }
            }
        }
        
        // Close combat interface
        const overlay = document.getElementById('combat-overlay');
        if (overlay) {
            document.body.removeChild(overlay);
        }
        
        // Clear combat update interval
        if (this.combatUpdateInterval) {
            clearInterval(this.combatUpdateInterval);
            this.combatUpdateInterval = null;
        }
        
        // Reset combat state
        this.inCombat = false;
        this.currentEnemy = null;
        this.currentCombat = null;
        this.isPlayerTurn = true;
        
        // Redraw grid
        this.drawGrid();
        this.highlightPossibleMoves();
        
        // Check remaining enemies
        const remainingEnemies = this.enemies.filter(e => !e.defeated).length;
        console.log(`Enemies remaining on map: ${remainingEnemies}`);
    }
    
    // Handle combat victory
    handleCombatVictory(enemy) {
        // Mark enemy as defeated
        enemy.defeated = true;
        enemy.discovered = true;
        
        // Calculate rewards based on enemy threat level
        const baseRewards = {
            experience: enemy.threat * 15,
            biomass: enemy.threat * 3 + Math.floor(Math.random() * 5),
            scrap: enemy.threat * 2 + Math.floor(Math.random() * 3),
            warpstone: Math.floor(Math.random() * enemy.threat),
            combatPoints: enemy.threat * 5 + Math.floor(Math.random() * 10)
        };
        
        // Bonus rewards for high-threat enemies
        if (enemy.threat >= 4) {
            baseRewards.experience += 20;
            baseRewards.biomass += 5;
            baseRewards.scrap += 3;
            baseRewards.combatPoints += 15;
        }
        
        if (enemy.threat >= 5) {
            baseRewards.experience += 30;
            baseRewards.warpstone += 2;
            baseRewards.combatPoints += 25;
        }
        
        // Apply rewards
        this.heroUpgrade.gainExperience(baseRewards.experience);
        this.resources[RESOURCE_TYPES.BIOMASS] += baseRewards.biomass;
        this.resources[RESOURCE_TYPES.SCRAP] += baseRewards.scrap;
        this.resources[RESOURCE_TYPES.WARPSTONE] += baseRewards.warpstone;
        this.combatPoints += baseRewards.combatPoints;
        this.totalCombatPoints += baseRewards.combatPoints;
        
        // Update combat statistics
        this.combatStats.enemiesDefeated++;
        this.combatStats.battlesWon++;
        
        // Check for achievements
        this.checkAchievements();
        
        // Update displays
        this.updateResourceDisplay();
        this.updateCharacterDisplay();
        
        // Chance to discover relic (15% base chance)
        let relicChance = this.relicSpawnChance;
        if (enemy.threat >= 4) relicChance += 0.1; // Higher chance for strong enemies
        if (enemy.threat >= 5) relicChance += 0.15; // Even higher for bosses
        
        if (Math.random() < relicChance) {
            this.discoverRelic();
        }
        
        // Show victory screen
        this.showCombatResultScreen('victory', enemy, baseRewards);
    }
    
    // Handle combat defeat
    handleCombatDefeat() {
        // Move player back to start position
        this.playerPosition.x = START_POSITION.x;
        this.playerPosition.y = START_POSITION.y;
        
        // Heal player to 50% health
        this.character.health = Math.max(1, Math.floor(this.character.maxHealth * 0.5));
        
        // Update combat statistics
        this.combatStats.battlesLost++;
        
        // Update character display
        this.updateCharacterDisplay();
        
        // Show defeat screen
        this.showCombatResultScreen('defeat', this.currentEnemy);
    }
    
    // Show combat result screen
    showCombatResultScreen(result, enemy, rewards = null) {
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.9);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 10000;
            animation: fadeIn 0.5s ease-out;
        `;
        
        let content = '';
        
        if (result === 'victory') {
            content = `
                <div style="
                    background: linear-gradient(135deg, rgba(0, 50, 0, 0.98), rgba(0, 100, 0, 0.99));
                    border: 4px solid #00ff00;
                    border-radius: 12px;
                    padding: 30px;
                    text-align: center;
                    max-width: 500px;
                    box-shadow: 0 0 50px rgba(0, 255, 0, 0.5);
                ">
                    <div style="font-size: 4rem; margin-bottom: 20px;">⚔️🏆⚔️</div>
                    <h1 style="
                        color: #00ff00;
                        font-size: 2.5rem;
                        margin-bottom: 20px;
                        text-shadow: 0 0 20px rgba(0, 255, 0, 0.8);
                        font-family: 'Trebuchet MS', serif;
                    ">VICTORY!</h1>
                    <h2 style="
                        color: #ffcc00;
                        font-size: 1.5rem;
                        margin-bottom: 15px;
                    ">${enemy.name} Defeated</h2>
                    
                    <div style="
                        background: rgba(0, 0, 0, 0.5);
                        border-radius: 8px;
                        padding: 20px;
                        margin: 20px 0;
                    ">
                        <h3 style="color: #00aaff; margin-bottom: 15px;">REWARDS EARNED</h3>
                        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; text-align: left;">
                            <div style="color: #fff;">Experience: <span style="color: #00ff00;">+${rewards.experience}</span></div>
                            <div style="color: #fff;">Biomass: <span style="color: #00aa00;">+${rewards.biomass}</span></div>
                            <div style="color: #fff;">Scrap: <span style="color: #ffaa00;">+${rewards.scrap}</span></div>
                            <div style="color: #fff;">Warpstone: <span style="color: #aa00ff;">+${rewards.warpstone}</span></div>
                            <div style="color: #fff;">Combat Points: <span style="color: #ff6600;">+${rewards.combatPoints}</span></div>
                        </div>
                    </div>
                    
                    <p style="
                        color: #e0e0e0;
                        font-size: 1.1rem;
                        margin-bottom: 25px;
                        font-style: italic;
                    ">The Emperor's light guides your path to glory!</p>
                    
                    <button onclick="this.parentElement.parentElement.remove()" style="
                        background: linear-gradient(45deg, #00aa00, #00ff00);
                        color: white;
                        border: none;
                        border-radius: 8px;
                        padding: 15px 30px;
                        font-size: 1.1rem;
                        font-weight: bold;
                        cursor: pointer;
                        transition: all 0.3s ease;
                    ">CONTINUE</button>
                </div>
            `;
        } else {
            content = `
                <div style="
                    background: linear-gradient(135deg, rgba(50, 0, 0, 0.98), rgba(100, 0, 0, 0.99));
                    border: 4px solid #ff0000;
                    border-radius: 12px;
                    padding: 30px;
                    text-align: center;
                    max-width: 500px;
                    box-shadow: 0 0 50px rgba(255, 0, 0, 0.5);
                ">
                    <div style="font-size: 4rem; margin-bottom: 20px;">💀⚰️💀</div>
                    <h1 style="
                        color: #ff0000;
                        font-size: 2.5rem;
                        margin-bottom: 20px;
                        text-shadow: 0 0 20px rgba(255, 0, 0, 0.8);
                        font-family: 'Trebuchet MS', serif;
                    ">DEFEAT</h1>
                    <h2 style="
                        color: #ff6600;
                        font-size: 1.5rem;
                        margin-bottom: 15px;
                    ">${enemy.name} was too strong</h2>
                    
                    <div style="
                        background: rgba(0, 0, 0, 0.5);
                        border-radius: 8px;
                        padding: 20px;
                        margin: 20px 0;
                    ">
                        <h3 style="color: #ffaa00; margin-bottom: 15px;">CONSEQUENCES</h3>
                        <div style="text-align: left; color: #e0e0e0;">
                            <div style="margin-bottom: 10px;">• Health reduced to 50%</div>
                            <div style="margin-bottom: 10px;">• Returned to starting position</div>
                            <div style="margin-bottom: 10px;">• Enemy remains on the battlefield</div>
                        </div>
                    </div>
                    
                    <p style="
                        color: #e0e0e0;
                        font-size: 1.1rem;
                        margin-bottom: 25px;
                        font-style: italic;
                    ">The Emperor's light still burns within you. Fight on!</p>
                    
                    <button onclick="this.parentElement.parentElement.remove()" style="
                        background: linear-gradient(45deg, #aa0000, #ff0000);
                        color: white;
                        border: none;
                        border-radius: 8px;
                        padding: 15px 30px;
                        font-size: 1.1rem;
                        font-weight: bold;
                        cursor: pointer;
                        transition: all 0.3s ease;
                    ">CONTINUE</button>
                </div>
            `;
        }
        
        overlay.innerHTML = content;
        document.body.appendChild(overlay);
        
        // Auto-close after 5 seconds
        setTimeout(() => {
            if (overlay.parentNode) {
                overlay.parentNode.removeChild(overlay);
            }
        }, 5000);
    }
    
    // Check for achievements
    checkAchievements() {
        const newAchievements = [];
        
        // First Blood - defeat first enemy
        if (!this.achievements.firstBlood && this.combatStats.enemiesDefeated >= 1) {
            this.achievements.firstBlood = true;
            newAchievements.push({
                name: 'First Blood',
                description: 'Defeat your first enemy',
                reward: { combatPoints: 50, experience: 100 }
            });
        }
        
        // Veteran - defeat 5 enemies
        if (!this.achievements.veteran && this.combatStats.enemiesDefeated >= 5) {
            this.achievements.veteran = true;
            newAchievements.push({
                name: 'Veteran',
                description: 'Defeat 5 enemies',
                reward: { combatPoints: 100, experience: 200, biomass: 10 }
            });
        }
        
        // Elite - defeat 10 enemies
        if (!this.achievements.elite && this.combatStats.enemiesDefeated >= 10) {
            this.achievements.elite = true;
            newAchievements.push({
                name: 'Elite',
                description: 'Defeat 10 enemies',
                reward: { combatPoints: 200, experience: 400, scrap: 15 }
            });
        }
        
        // Legendary - defeat 20 enemies
        if (!this.achievements.legendary && this.combatStats.enemiesDefeated >= 20) {
            this.achievements.legendary = true;
            newAchievements.push({
                name: 'Legendary',
                description: 'Defeat 20 enemies',
                reward: { combatPoints: 500, experience: 1000, warpstone: 10 }
            });
        }
        
        // Survivor - survive 3 defeats
        if (!this.achievements.survivor && this.combatStats.battlesLost >= 3) {
            this.achievements.survivor = true;
            newAchievements.push({
                name: 'Survivor',
                description: 'Survive 3 defeats',
                reward: { combatPoints: 150, experience: 300 }
            });
        }
        
        // Apply achievement rewards
        newAchievements.forEach(achievement => {
            if (achievement.reward.combatPoints) {
                this.combatPoints += achievement.reward.combatPoints;
                this.totalCombatPoints += achievement.reward.combatPoints;
            }
            if (achievement.reward.experience) {
                this.heroUpgrade.gainExperience(achievement.reward.experience);
            }
            if (achievement.reward.biomass) {
                this.resources[RESOURCE_TYPES.BIOMASS] += achievement.reward.biomass;
            }
            if (achievement.reward.scrap) {
                this.resources[RESOURCE_TYPES.SCRAP] += achievement.reward.scrap;
            }
            if (achievement.reward.warpstone) {
                this.resources[RESOURCE_TYPES.WARPSTONE] += achievement.reward.warpstone;
            }
        });
        
        // Show achievement notifications
        if (newAchievements.length > 0) {
            this.showAchievementNotification(newAchievements);
        }
    }
    
    // Show achievement notification
    showAchievementNotification(achievements) {
        achievements.forEach((achievement, index) => {
            setTimeout(() => {
                const notification = document.createElement('div');
                notification.style.cssText = `
                    position: fixed;
                    top: 20px;
                    left: 50%;
                    transform: translateX(-50%);
                    background: linear-gradient(45deg, #ffaa00, #ffcc00);
                    color: #000;
                    padding: 15px 25px;
                    border-radius: 8px;
                    box-shadow: 0 0 30px rgba(255, 170, 0, 0.8);
                    z-index: 10001;
                    animation: slideInDown 0.5s ease-out;
                    max-width: 400px;
                    text-align: center;
                    font-weight: bold;
                `;
                
                notification.innerHTML = `
                    <div style="font-size: 1.2rem; margin-bottom: 5px;">🏆 ACHIEVEMENT UNLOCKED! 🏆</div>
                    <div style="font-size: 1.1rem; margin-bottom: 8px;">${achievement.name}</div>
                    <div style="font-size: 0.9rem; opacity: 0.8;">${achievement.description}</div>
                `;
                
                document.body.appendChild(notification);
                
                setTimeout(() => {
                    notification.style.animation = 'slideOutUp 0.5s ease-out';
                    setTimeout(() => {
                        if (notification.parentNode) {
                            notification.parentNode.removeChild(notification);
                        }
                    }, 500);
                }, 3000);
            }, index * 1000);
        });
    }
    
    // Get all hidden enemies (for debugging or future features)
    getHiddenEnemies() {
        return this.enemies.filter(enemy => !enemy.discovered && !enemy.defeated);
    }
    
    // Get discovered enemies
    getDiscoveredEnemies() {
        return this.enemies.filter(enemy => enemy.discovered && !enemy.defeated);
    }
    
    // Get defeated enemies
    getDefeatedEnemies() {
        return this.enemies.filter(enemy => enemy.defeated);
    }
    
    // Update turn counter display
    updateTurnCounter() {
        const counterElement = document.getElementById('turnCounter');
        if (counterElement) {
            counterElement.textContent = this.remainingTurns;
            
            // Add critical styling when turns are low
            const turnCounterPanel = document.querySelector('.turn-counter');
            if (turnCounterPanel) {
                if (this.remainingTurns <= 5) {
                    turnCounterPanel.classList.add('critical');
                } else {
                    turnCounterPanel.classList.remove('critical');
                }
            }
        }
    }
    
    // Game Over state
    gameOver() {
        this.isGameOver = true;
        this.isPlayerTurn = false;
        
        console.log('GAME OVER! No moves remaining!');
        
        // Display brutal game over message
        this.showGameOverScreen();
    }
    
    // Show Game Over screen with Warhammer 40K styling
    showGameOverScreen() {
        // Create game over overlay
        const overlay = document.createElement('div');
        overlay.style.position = 'fixed';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.width = '100%';
        overlay.style.height = '100%';
        overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.9)';
        overlay.style.display = 'flex';
        overlay.style.justifyContent = 'center';
        overlay.style.alignItems = 'center';
        overlay.style.zIndex = '9999';
        overlay.style.animation = 'fadeIn 1s ease-out';
        
        // Game over content
        overlay.innerHTML = `
            <div class="wh40k-panel" style="
                padding: 40px;
                text-align: center;
                background: linear-gradient(135deg, rgba(10, 0, 0, 0.98), rgba(25, 5, 5, 0.99));
                border: 4px solid #bb0000;
                border-radius: 12px;
                box-shadow: 0 0 60px rgba(187, 0, 0, 0.8);
                max-width: 500px;
            ">
                <div style="font-size: 4rem; margin-bottom: 20px;">💀⚔️💀</div>
                <h1 style="
                    color: #bb0000;
                    font-size: 2.5rem;
                    margin-bottom: 20px;
                    text-shadow: 0 0 20px rgba(187, 0, 0, 0.8);
                    font-family: 'Trebuchet MS', serif;
                    letter-spacing: 3px;
                ">DOOM HAS COME</h1>
                <p style="
                    color: #ffcc00;
                    font-size: 1.2rem;
                    margin-bottom: 30px;
                    text-shadow: 0 0 10px rgba(255, 204, 0, 0.6);
                    font-style: italic;
                ">Your moves have been exhausted.<br>The Emperor's light fades...</p>
                <button onclick="location.reload()" class="wh40k-button primary" style="
                    padding: 15px 30px;
                    font-size: 1.1rem;
                    letter-spacing: 2px;
                ">FIGHT AGAIN</button>
            </div>
        `;
        
        document.body.appendChild(overlay);
    }
    
    // Draw the entire grid
    drawGrid(hoverPos = null) {
        // Clear canvas
        this.ctx.fillStyle = this.colors.background;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw grid lines
        this.ctx.strokeStyle = this.colors.grid;
        this.ctx.lineWidth = 1;
        
        // Vertical lines
        for (let x = 0; x <= this.gridSize; x++) {
            const xPos = x * this.cellSize;
            this.ctx.beginPath();
            this.ctx.moveTo(xPos, 0);
            this.ctx.lineTo(xPos, this.canvas.height);
            this.ctx.stroke();
        }
        
        // Horizontal lines
        for (let y = 0; y <= this.gridSize; y++) {
            const yPos = y * this.cellSize;
            this.ctx.beginPath();
            this.ctx.moveTo(0, yPos);
            this.ctx.lineTo(this.canvas.width, yPos);
            this.ctx.stroke();
        }
        
        // Draw start cell (center)
        this.drawCell(START_POSITION.x, START_POSITION.y, this.colors.startCell, 0.3);
        
        // Draw highlighted possible moves
        this.highlightedCells.forEach(cell => {
            const isHovering = hoverPos && hoverPos.x === cell.x && hoverPos.y === cell.y;
            const color = isHovering ? this.colors.possibleMoveHover : this.colors.possibleMove;
            this.drawCell(cell.x, cell.y, color, 0.4);
        });
        
        // Draw discovered enemies
        this.drawDiscoveredEnemies();
        
        // Draw built structures
        this.drawBuiltStructures();
        
        // Draw player
        this.drawPlayer();
        
        // Draw coordinates removed for cleaner look
    }
    
    // Draw a single cell with color
    drawCell(gridX, gridY, color, alpha = 1.0) {
        const canvasPos = this.gridToCanvas(gridX, gridY);
        
        this.ctx.fillStyle = color;
        this.ctx.globalAlpha = alpha;
        this.ctx.fillRect(
            canvasPos.x + 1, 
            canvasPos.y + 1, 
            this.cellSize - 2, 
            this.cellSize - 2
        );
        this.ctx.globalAlpha = 1.0;
    }
    
    // Draw player character
    drawPlayer() {
        const canvasPos = this.gridToCanvas(this.playerPosition.x, this.playerPosition.y);
        const centerX = canvasPos.x + this.cellSize / 2;
        const centerY = canvasPos.y + this.cellSize / 2;
        const radius = this.cellSize * 0.3;
        
        // Draw player as a circle
        this.ctx.fillStyle = this.colors.player;
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
        this.ctx.fill();
        
        // Add border
        this.ctx.strokeStyle = '#ffffff';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
        
        // Add inner glow
        const gradient = this.ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
        gradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
        gradient.addColorStop(1, 'rgba(187, 0, 0, 0.8)');
        this.ctx.fillStyle = gradient;
        this.ctx.fill();
    }
    
    // Draw discovered enemies on the grid
    drawDiscoveredEnemies() {
        this.enemies.forEach(enemy => {
            if (enemy.discovered && !enemy.defeated) {
                this.drawEnemy(enemy);
            }
        });
    }
    
    // Draw a single enemy
    drawEnemy(enemy) {
        const canvasPos = this.gridToCanvas(enemy.x, enemy.y);
        const centerX = canvasPos.x + this.cellSize / 2;
        const centerY = canvasPos.y + this.cellSize / 2;
        const radius = this.cellSize * 0.25;
        
        // Draw enemy background
        this.drawCell(enemy.x, enemy.y, this.colors.enemy, 0.6);
        
        // Draw enemy symbol (skull)
        this.ctx.fillStyle = '#000000';
        this.ctx.font = `${this.cellSize * 0.4}px Arial`;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText('💀', centerX, centerY);
        
        // Draw threat level indicator
        this.ctx.fillStyle = '#ff0000';
        this.ctx.font = `${this.cellSize * 0.2}px Arial`;
        this.ctx.fillText(enemy.threat.toString(), centerX + radius, centerY - radius);
    }
    
    // Draw built structures
    drawBuiltStructures() {
        const structures = this.battlefieldCard.getAllStructures();
        
        structures.forEach(structure => {
            const canvasPos = this.gridToCanvas(structure.position.x, structure.position.y);
            const centerX = canvasPos.x + this.cellSize / 2;
            const centerY = canvasPos.y + this.cellSize / 2;
            
            // Draw structure background based on type
            let bgColor = '#00aa00'; // Default green for structures
            if (structure.type === 'defensive') bgColor = '#0066aa';
            else if (structure.type === 'offensive') bgColor = '#aa0000';
            else if (structure.type === 'resource') bgColor = '#aa6600';
            else if (structure.type === 'support') bgColor = '#6600aa';
            else if (structure.type === 'special') bgColor = '#aa00aa';
            
            this.drawCell(structure.position.x, structure.position.y, bgColor, 0.4);
            
            // Draw structure icon
            this.ctx.fillStyle = '#ffffff';
            this.ctx.font = `${this.cellSize * 0.3}px Arial`;
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText(structure.icon, centerX, centerY);
            
            // Draw structure level or status indicator
            this.ctx.fillStyle = '#ffff00';
            this.ctx.font = `${this.cellSize * 0.15}px Arial`;
            this.ctx.fillText('★', centerX + this.cellSize * 0.3, centerY - this.cellSize * 0.3);
        });
    }
    
    // Draw coordinate labels (for debugging)
    drawCoordinates() {
        this.ctx.fillStyle = '#888';
        this.ctx.font = '10px Arial';
        this.ctx.textAlign = 'center';
        
        for (let x = 0; x < this.gridSize; x++) {
            for (let y = 0; y < this.gridSize; y++) {
                const canvasPos = this.gridToCanvas(x, y);
                const centerX = canvasPos.x + this.cellSize / 2;
                const centerY = canvasPos.y + 10;
                
                this.ctx.fillText(`${x},${y}`, centerX, centerY);
            }
        }
    }
    
    // Get game state for saving/loading
    getGameState() {
        return {
            playerPosition: {...this.playerPosition},
            gridSize: this.gridSize,
            remainingTurns: this.remainingTurns,
            isGameOver: this.isGameOver,
            enemies: this.enemies.map(enemy => ({...enemy})),
            enemyCount: this.enemyCount
        };
    }
    
    // Load game state
    loadGameState(state) {
        this.playerPosition = {...state.playerPosition};
        this.gridSize = state.gridSize;
        this.remainingTurns = state.remainingTurns || this.maxTurns;
        this.isGameOver = state.isGameOver || false;
        this.enemies = state.enemies || [];
        this.enemyCount = state.enemyCount || 0;
        
        // Regenerate enemies if none exist
        if (this.enemies.length === 0) {
            this.generateHiddenEnemies();
        }
        
        this.highlightPossibleMoves();
        this.updateTurnCounter();
    }
    
    // Resize grid (for future customization)
    resizeGrid(newSize) {
        this.gridSize = newSize;
        this.canvas.width = newSize * this.cellSize;
        this.canvas.height = newSize * this.cellSize;
        
        // Reset player to center
        this.playerPosition = {
            x: Math.floor(newSize / 2),
            y: Math.floor(newSize / 2)
        };
        
        // Reset turn counter
        this.remainingTurns = this.maxTurns;
        this.isGameOver = false;
        
        // Regenerate enemies for new grid size
        this.generateHiddenEnemies();
        
        this.highlightPossibleMoves();
        this.updateTurnCounter();
    }

    // New methods for enhanced systems

    // Discover a relic
    discoverRelic() {
        if (this.relics.length >= this.maxRelics) return false;
        
        const relicTypes = Object.keys(RELIC_TYPES);
        const randomType = relicTypes[Math.floor(Math.random() * relicTypes.length)];
        const rarity = this.getRandomRarity();
        
        const relic = new Relic(randomType, rarity);
        this.relics.push(relic);
        
        this.showRelicDiscovery(relic);
        return relic;
    }

    // Get random rarity based on probabilities
    getRandomRarity() {
        const rand = Math.random();
        if (rand < 0.5) return 'common';
        if (rand < 0.75) return 'uncommon';
        if (rand < 0.9) return 'rare';
        if (rand < 0.98) return 'epic';
        return 'legendary';
    }

    // Show relic discovery notification
    showRelicDiscovery(relic) {
        const notification = document.createElement('div');
        notification.className = 'relic-discovery';
        notification.innerHTML = `
            <div class="relic-content">
                <h3>🔮 RELIC DISCOVERED! 🔮</h3>
                <div class="relic-info">
                    <span class="relic-icon">${relic.icon}</span>
                    <span class="relic-name" style="color: ${relic.getRarityColor()}">${relic.name}</span>
                </div>
                <p class="relic-description">${relic.description}</p>
                <p class="relic-rarity">Rarity: ${relic.rarity.toUpperCase()}</p>
            </div>
        `;
        
        notification.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: linear-gradient(45deg, #1a1a1a, #333);
            color: white;
            padding: 20px;
            border-radius: 10px;
            border: 3px solid ${relic.getRarityColor()};
            box-shadow: 0 0 30px ${relic.getRarityColor()}40;
            z-index: 1000;
            min-width: 300px;
            text-align: center;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 4000);
    }

    // Collect resources from enemy
    collectResources(enemy) {
        if (!enemy.loot) return;
        
        for (const [resourceType, range] of Object.entries(enemy.loot)) {
            const amount = Array.isArray(range) ? 
                Math.floor(Math.random() * (range[1] - range[0] + 1)) + range[0] : 
                range;
            
            this.resources[resourceType] += amount;
            this.base.addResources(resourceType, amount);
        }
        
        this.updateResourceDisplay();
    }

    // Update resource display
    updateResourceDisplay() {
        const biomassEl = document.querySelector('#biomass span');
        const scrapEl = document.querySelector('#scrap span');
        const warpstoneEl = document.querySelector('#warpstone span');
        
        if (biomassEl) biomassEl.textContent = this.resources[RESOURCE_TYPES.BIOMASS];
        if (scrapEl) scrapEl.textContent = this.resources[RESOURCE_TYPES.SCRAP];
        if (warpstoneEl) warpstoneEl.textContent = this.resources[RESOURCE_TYPES.WARPSTONE];
        
        // Update combat points display if element exists
        const combatPointsEl = document.querySelector('#combatPoints span');
        if (combatPointsEl) combatPointsEl.textContent = this.combatPoints;
    }



    // Initialize character with upgrades and relics
    initializeCharacter() {
        if (!this.character) {
            this.character = {
                health: 100,
                maxHealth: 100,
                attack: 10,
                defense: 5,
                speed: 1.0,
                level: 1
            };
        }
        
        // Apply hero upgrades
        this.heroUpgrade.applyUpgrades(this.character);
        
        // Apply equipped relics
        this.relics.forEach(relic => {
            if (relic.isEquipped) {
                relic.applyEffects(this.character);
            }
        });
        
        this.updateCharacterDisplay();
    }

    // Update character display
    updateCharacterDisplay() {
        if (!this.character) return;
        
        const hpEl = document.getElementById('charHP');
        const maxHpEl = document.getElementById('charMaxHP');
        const attackEl = document.getElementById('charAttack');
        const defenseEl = document.getElementById('charDefense');
        const speedEl = document.getElementById('charSpeed');
        
        if (hpEl) hpEl.textContent = this.character.health;
        if (maxHpEl) maxHpEl.textContent = this.character.maxHealth;
        if (attackEl) attackEl.textContent = this.character.attack;
        if (defenseEl) defenseEl.textContent = this.character.defense;
        if (speedEl) speedEl.textContent = this.character.speed.toFixed(1);
        
        // Update HP bar
        const hpBar = document.querySelector('.hp-fill');
        if (hpBar) {
            const hpPercent = (this.character.health / this.character.maxHealth) * 100;
            hpBar.style.width = `${hpPercent}%`;
        }
    }

    // Open base management UI
    openBaseUI() {
        // This would open a modal with base management options
        console.log('Opening base management UI...');
        this.showBaseModal();
    }

    // Show base management modal
    showBaseModal() {
        const modal = document.createElement('div');
        modal.className = 'base-modal';
        modal.innerHTML = `
            <div class="base-content">
                <h2>🏰 Base Management</h2>
                <div class="base-info">
                    <p>Level: ${this.base.level}/${this.base.maxLevel}</p>
                    <p>Defense: ${this.base.defense}/${this.base.maxDefense}</p>
                    <p>Population: ${this.base.population}/${this.base.maxPopulation}</p>
                </div>
                <div class="base-structures">
                    <h3>Structures</h3>
                    ${this.base.structures.map(structure => 
                        `<div class="structure-item">
                            <span>${structure.icon} ${structure.name} (Level ${structure.level})</span>
                        </div>`
                    ).join('')}
                </div>
                <button onclick="this.parentElement.parentElement.remove()">Close</button>
            </div>
        `;
        
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1000;
        `;
        
        document.body.appendChild(modal);
    }

    // Add UI buttons for new systems
    addUIButtons() {
        const gameContainer = document.getElementById('gameContainer');
        if (!gameContainer) return;

        // Create button container
        const buttonContainer = document.createElement('div');
        buttonContainer.className = 'enhanced-ui-buttons';
        buttonContainer.style.cssText = `
            display: flex;
            gap: 10px;
            margin-top: 10px;
            justify-content: center;
        `;

        // Base button
        const baseBtn = document.createElement('button');
        baseBtn.textContent = '🏰 Base';
        baseBtn.className = 'enhanced-ui-btn';
        baseBtn.onclick = () => this.openBaseUI();
        buttonContainer.appendChild(baseBtn);

        // Crafting button
        const craftBtn = document.createElement('button');
        craftBtn.textContent = '🔧 Craft';
        craftBtn.className = 'enhanced-ui-btn';
        craftBtn.onclick = () => this.openCraftingUI();
        buttonContainer.appendChild(craftBtn);

        // Hero upgrades button
        const heroBtn = document.createElement('button');
        heroBtn.textContent = '⚔️ Hero';
        heroBtn.className = 'enhanced-ui-btn';
        heroBtn.onclick = () => this.openHeroUI();
        buttonContainer.appendChild(heroBtn);

        // Relics button
        const relicBtn = document.createElement('button');
        relicBtn.textContent = '🔮 Relics';
        relicBtn.className = 'enhanced-ui-btn';
        relicBtn.onclick = () => this.openRelicUI();
        buttonContainer.appendChild(relicBtn);

        // Add to game container
        gameContainer.appendChild(buttonContainer);

        // Add CSS for buttons
        const style = document.createElement('style');
        style.textContent = `
            .enhanced-ui-btn {
                background: linear-gradient(45deg, #bb0000, #ff6600);
                color: white;
                border: 2px solid #ffcc00;
                border-radius: 5px;
                padding: 8px 16px;
                cursor: pointer;
                font-weight: bold;
                transition: all 0.3s ease;
            }
            .enhanced-ui-btn:hover {
                background: linear-gradient(45deg, #ff6600, #bb0000);
                transform: scale(1.05);
                box-shadow: 0 0 15px rgba(255, 204, 0, 0.5);
            }
        `;
        document.head.appendChild(style);
    }

    // Open crafting UI
    openCraftingUI() {
        const modal = document.createElement('div');
        modal.className = 'crafting-modal';
        modal.innerHTML = `
            <div class="crafting-content">
                <h2>🔧 Crafting Station</h2>
                <div class="crafting-level">
                    <p>Crafting Level: ${this.crafting.craftingLevel}/${this.crafting.maxCraftingLevel}</p>
                </div>
                <div class="crafting-recipes">
                    <h3>Available Recipes</h3>
                    ${this.crafting.getAvailableRecipes().map(recipe => 
                        `<div class="recipe-item ${recipe.canCraft ? 'can-craft' : 'cannot-craft'}">
                            <span class="recipe-icon">${recipe.icon}</span>
                            <span class="recipe-name">${recipe.name}</span>
                            <span class="recipe-rarity">${recipe.rarity}</span>
                            <button ${!recipe.canCraft ? 'disabled' : ''} onclick="window.gridGameManager.craftItem('${recipe.name}')">
                                Craft
                            </button>
                        </div>`
                    ).join('')}
                </div>
                <button onclick="this.parentElement.parentElement.remove()">Close</button>
            </div>
        `;
        
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1000;
        `;
        
        document.body.appendChild(modal);
    }

    // Open hero UI
    openHeroUI() {
        const modal = document.createElement('div');
        modal.className = 'hero-modal';
        modal.innerHTML = `
            <div class="hero-content">
                <h2>⚔️ Hero Upgrades</h2>
                <div class="hero-info">
                    <p>Level: ${this.heroUpgrade.heroLevel}/${this.heroUpgrade.maxHeroLevel}</p>
                    <p>Experience: ${this.heroUpgrade.experience}/${this.heroUpgrade.experienceToNext}</p>
                    <p>Skill Points: ${this.heroUpgrade.skillPoints}</p>
                </div>
                <div class="hero-upgrades">
                    <h3>Available Upgrades</h3>
                    ${this.heroUpgrade.getAvailableUpgrades().map(upgrade => 
                        `<div class="upgrade-item ${upgrade.canAfford && !upgrade.isPurchased ? 'can-afford' : 'cannot-afford'}">
                            <span class="upgrade-name">${upgrade.name}</span>
                            <span class="upgrade-description">${upgrade.description}</span>
                            <button ${!upgrade.canAfford || upgrade.isPurchased ? 'disabled' : ''} onclick="window.gridGameManager.purchaseUpgrade('${upgrade.type}')">
                                ${upgrade.isPurchased ? 'Purchased' : 'Purchase'}
                            </button>
                        </div>`
                    ).join('')}
                </div>
                <button onclick="this.parentElement.parentElement.remove()">Close</button>
            </div>
        `;
        
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1000;
        `;
        
        document.body.appendChild(modal);
    }

    // Open relic UI
    openRelicUI() {
        const modal = document.createElement('div');
        modal.className = 'relic-modal';
        modal.innerHTML = `
            <div class="relic-content">
                <h2>🔮 Relics Collection</h2>
                <div class="relics-info">
                    <p>Relics Found: ${this.relics.length}/${this.maxRelics}</p>
                </div>
                <div class="relics-list">
                    ${this.relics.length === 0 ? '<p>No relics discovered yet. Defeat enemies to find relics!</p>' : 
                    this.relics.map((relic, index) => 
                        `<div class="relic-item">
                            <span class="relic-icon">${relic.icon}</span>
                            <span class="relic-name" style="color: ${relic.getRarityColor()}">${relic.name}</span>
                            <span class="relic-durability">${relic.durability}/${relic.maxDurability}</span>
                            <button onclick="window.gridGameManager.toggleRelic(${index})">
                                ${relic.isEquipped ? 'Unequip' : 'Equip'}
                            </button>
                        </div>`
                    ).join('')}
                </div>
                <button onclick="this.parentElement.parentElement.remove()">Close</button>
            </div>
        `;
        
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1000;
        `;
        
        document.body.appendChild(modal);
    }

    // Craft item
    craftItem(recipeName) {
        const craftedItem = this.crafting.craftItem(recipeName);
        if (craftedItem) {
            alert(`Successfully crafted ${craftedItem.name}!`);
            this.openCraftingUI(); // Refresh UI
        } else {
            alert('Cannot craft this item. Check your resources!');
        }
    }

    // Purchase upgrade
    purchaseUpgrade(upgradeType) {
        if (this.heroUpgrade.purchaseUpgrade(upgradeType)) {
            this.initializeCharacter(); // Reapply upgrades
            alert(`Upgrade purchased: ${this.heroUpgrade.upgrades[upgradeType].name}!`);
            this.openHeroUI(); // Refresh UI
        } else {
            alert('Cannot purchase this upgrade. Check your resources!');
        }
    }

    // Toggle relic equipment
    toggleRelic(relicIndex) {
        const relic = this.relics[relicIndex];
        if (!relic) return;

        if (relic.isEquipped) {
            relic.removeEffects(this.character);
            relic.isEquipped = false;
        } else {
            relic.applyEffects(this.character);
            relic.isEquipped = true;
        }

        this.updateCharacterDisplay();
        this.openRelicUI(); // Refresh UI
    }
    
    // Update persistent battlefield UI
    updateBattlefieldUI() {
        const { x, y } = this.playerPosition;
        const availableBuildings = this.battlefieldCard.getAvailableBuildings(x, y);
        const terrainType = this.battlefieldCard.getTerrainType(x, y);
        const terrainInfo = TERRAIN_BUILDING_TYPES[terrainType];
        const existingStructure = this.battlefieldCard.getStructureAt(x, y);
        
        // Update terrain information
        const terrainContent = document.getElementById('terrainContent');
        if (terrainContent && terrainInfo) {
            terrainContent.innerHTML = `
                <div style="text-align: center; margin-bottom: 15px;">
                    <div style="font-size: 2.5rem; margin-bottom: 10px;">${terrainInfo.icon}</div>
                    <h4 style="color: #ff6600; font-size: 1.2rem; margin-bottom: 5px;">${terrainInfo.name}</h4>
                    <p style="color: #e0e0e0; font-size: 0.9rem; margin-bottom: 10px;">${terrainInfo.description}</p>
                    <p style="color: #bb0000; font-size: 0.8rem;">Position: (${x}, ${y})</p>
                </div>
                
                ${existingStructure ? `
                    <div style="background: rgba(0, 255, 0, 0.1); border: 2px solid #00ff00; border-radius: 8px; padding: 12px; margin-top: 10px;">
                        <h5 style="color: #00ff00; margin-bottom: 8px; font-size: 0.9rem;">EXISTING STRUCTURE</h5>
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <span style="font-size: 1.5rem;">${existingStructure.icon}</span>
                            <div>
                                <div style="color: #fff; font-weight: bold; font-size: 0.9rem;">${existingStructure.name}</div>
                                <div style="color: #ccc; font-size: 0.7rem;">${existingStructure.description}</div>
                            </div>
                        </div>
                        <button onclick="window.gridGameManager.removeStructureAtPosition()" style="
                            background: linear-gradient(45deg, #ff0000, #cc0000);
                            color: white;
                            border: none;
                            border-radius: 4px;
                            padding: 6px 12px;
                            cursor: pointer;
                            margin-top: 8px;
                            font-size: 0.8rem;
                        ">Remove Structure</button>
                    </div>
                ` : ''}
            `;
        }
        
        // Update building cards
        const buildingCardsContent = document.getElementById('buildingCardsContent');
        if (buildingCardsContent) {
            if (availableBuildings.length > 0) {
                buildingCardsContent.innerHTML = `
                    <div class="building-cards-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px;">
                        ${availableBuildings.map(building => `
                            <div class="building-card" style="
                                background: linear-gradient(45deg, rgba(50, 50, 50, 0.9), rgba(70, 70, 70, 0.9));
                                border: 2px solid ${building.canBuild ? '#00ff00' : '#666'};
                                border-radius: 6px;
                                padding: 10px;
                                cursor: ${building.canBuild ? 'pointer' : 'not-allowed'};
                                transition: all 0.3s ease;
                                opacity: ${building.canBuild ? '1' : '0.6'};
                                font-size: 0.8rem;
                            " onclick="${building.canBuild ? `window.gridGameManager.buildStructure('${Object.keys(BATTLEFIELD_CARDS).find(key => BATTLEFIELD_CARDS[key].name === building.name)}')` : ''}">
                                <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
                                    <span style="font-size: 1.5rem;">${building.icon}</span>
                                    <div>
                                        <div style="color: #fff; font-weight: bold; font-size: 0.9rem;">${building.name}</div>
                                        <div style="color: #ffcc00; font-size: 0.7rem; text-transform: uppercase;">${building.rarity}</div>
                                    </div>
                                </div>
                                <div style="color: #ccc; font-size: 0.8rem; margin-bottom: 8px;">${building.description}</div>
                                <div style="color: #ff6600; font-size: 0.7rem; margin-bottom: 5px;">Cost: ${building.costText}</div>
                                <div style="color: #00aaff; font-size: 0.7rem;">Build Time: ${building.buildTime} turns</div>
                            </div>
                        `).join('')}
                    </div>
                `;
                
                // Add hover effects for building cards
                setTimeout(() => {
                    const buildingCards = buildingCardsContent.querySelectorAll('.building-card');
                    buildingCards.forEach(card => {
                        if (card.style.cursor === 'pointer') {
                            card.addEventListener('mouseenter', () => {
                                card.style.transform = 'scale(1.02)';
                                card.style.boxShadow = '0 0 10px rgba(0, 255, 0, 0.3)';
                            });
                            
                            card.addEventListener('mouseleave', () => {
                                card.style.transform = 'scale(1)';
                                card.style.boxShadow = 'none';
                            });
                        }
                    });
                }, 100);
            } else {
                buildingCardsContent.innerHTML = `
                    <div style="text-align: center; color: #666; font-style: italic; padding: 20px;">
                        No buildings available for this terrain type or insufficient resources.
                    </div>
                `;
            }
        }
    }
    
    // Build structure at current position
    buildStructure(buildingKey) {
        const { x, y } = this.playerPosition;
        const success = this.battlefieldCard.buildStructure(buildingKey, x, y);
        
        if (success) {
            // Redraw grid to show new structure
            this.drawGrid();
            this.highlightPossibleMoves();
            
            // Update the persistent UI to reflect the new structure
            this.updateBattlefieldUI();
            
            // Show success notification
            this.showNotification(`Successfully built ${BATTLEFIELD_CARDS[buildingKey].name}!`, 'success');
        } else {
            this.showNotification('Failed to build structure!', 'error');
        }
    }
    
    // Remove structure at current position
    removeStructureAtPosition() {
        const { x, y } = this.playerPosition;
        const success = this.battlefieldCard.removeStructure(x, y);
        
        if (success) {
            // Redraw grid
            this.drawGrid();
            this.highlightPossibleMoves();
            
            // Update the persistent UI to reflect the removed structure
            this.updateBattlefieldUI();
            
            this.showNotification('Structure removed!', 'info');
        }
    }
    
    // Show notification
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? 'linear-gradient(45deg, #00aa00, #00ff00)' : 
                         type === 'error' ? 'linear-gradient(45deg, #aa0000, #ff0000)' : 
                         'linear-gradient(45deg, #0066aa, #00aaff)'};
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            box-shadow: 0 0 20px rgba(0, 0, 0, 0.5);
            z-index: 10000;
            animation: slideInRight 0.5s ease-out;
            max-width: 300px;
        `;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.5s ease-out';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 500);
        }, 3000);
    }
}