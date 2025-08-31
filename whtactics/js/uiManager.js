// UI Manager class
class UIManager {
    constructor(gameManager) {
        this.gameManager = gameManager;
        this.cardDeck = document.getElementById('cardDeck');
        this.characterInfo = document.getElementById('characterInfo');
        
        // Enemy counter system
        this.enemyCounter = {
            total: 0,
            tyranids: 0,
            orks: 0,
            necrons: 0,
            chaos: 0
        };
        
        // Notification preferences
        this.notificationPreferences = {
            enemySpawn: true,
            itemFound: true,
            resourceGain: true,
            loopComplete: true
        };
        
        // Setup UI elements
        this.setupUI();
    }
    
    // Setup initial UI
    setupUI() {
        // Create UI buttons
        this.createControlButtons();
        
        // Create enemy counter display
        this.createEnemyCounter();
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Update initial character info
        this.updateCharacterInfo();
    }
    
    // Create control buttons
    createControlButtons() {
        // Create control panel with gothic styling
        const controlPanel = document.createElement('div');
        controlPanel.className = 'control-panel wh40k-panel';
        controlPanel.style.position = 'absolute';
        controlPanel.style.bottom = '15px';
        controlPanel.style.left = '15px';
        controlPanel.style.display = 'flex';
        controlPanel.style.gap = '8px';
        controlPanel.style.padding = '10px';
        controlPanel.style.borderRadius = '6px';
        document.querySelector('.game-area').appendChild(controlPanel);
        
        // Speed controls with gothic styling
        this.createSpeedControls(controlPanel);
        
        // Add notification settings button with Warhammer styling
        const notifButton = document.createElement('button');
        notifButton.textContent = '⚙️';
        notifButton.title = 'Notification Settings';
        notifButton.className = 'settings-button wh40k-button';
        notifButton.style.padding = '8px 12px';
        notifButton.style.fontSize = '14px';
        notifButton.style.marginLeft = '8px';
        
        notifButton.addEventListener('click', () => {
            this.showNotificationSettings();
        });
        
        // Add upgrade button with Warhammer styling
        const upgradeButton = document.createElement('button');
        upgradeButton.textContent = '⚡';
        upgradeButton.title = 'Enhancements (U)';
        upgradeButton.className = 'upgrade-button wh40k-button primary';
        upgradeButton.style.padding = '8px 12px';
        upgradeButton.style.fontSize = '14px';
        
        // Add achievements button with Warhammer styling
        const achievementsButton = document.createElement('button');
        achievementsButton.textContent = '🏆';
        achievementsButton.title = 'Achievements (A)';
        achievementsButton.className = 'achievements-button wh40k-button';
        achievementsButton.style.padding = '8px 12px';
        achievementsButton.style.fontSize = '14px';
        achievementsButton.style.marginLeft = '8px';
        upgradeButton.style.marginLeft = '5px';
        
        upgradeButton.addEventListener('click', () => {
            if (this.gameManager.upgradeManager && this.gameManager.character) {
                this.gameManager.upgradeManager.toggleUpgrades();
            } else {
                this.showNotification('Enhancements not available yet - wait for game to load', 2000);
            }
        });
        
        // Add event listener for achievements button
        achievementsButton.addEventListener('click', () => {
            if (window.achievementManager) {
                window.achievementManager.showAchievementsList();
            } else {
                this.showNotification('Achievements not available yet - wait for game to load', 2000);
            }
        });
        
        controlPanel.appendChild(notifButton);
        controlPanel.appendChild(upgradeButton);
        controlPanel.appendChild(achievementsButton);
    }
    
    // Create speed control buttons with gothic styling
    createSpeedControls(parent) {
        const speeds = [
            { label: '1x', value: 1 },
            { label: '2x', value: 2 },
            { label: '4x', value: 4 }
        ];
        
        speeds.forEach(speed => {
            const button = document.createElement('button');
            button.textContent = speed.label;
            button.className = speed.value === 1 ? 'speed-button wh40k-button primary' : 'speed-button wh40k-button';
            button.style.padding = '8px 12px';
            button.style.minWidth = '35px';
            button.style.fontSize = '12px';
            button.style.fontWeight = 'bold';
            
            button.addEventListener('click', () => {
                this.setGameSpeed(speed.value);
                
                // Update button styles
                document.querySelectorAll('.speed-button').forEach(btn => {
                    btn.className = 'speed-button wh40k-button';
                });
                button.className = 'speed-button wh40k-button primary';
            });
            
            parent.appendChild(button);
        });
    }
    
    // Create enemy counter display with Warhammer 40K loading screen style
    createEnemyCounter() {
        const enemyCounterPanel = document.createElement('div');
        enemyCounterPanel.id = 'enemyCounter';
        enemyCounterPanel.className = 'enemy-counter-panel wh40k-panel';
        enemyCounterPanel.style.position = 'absolute';
        enemyCounterPanel.style.top = '15px';
        enemyCounterPanel.style.right = '15px';
        enemyCounterPanel.style.width = '280px';
        enemyCounterPanel.style.padding = '15px';
        enemyCounterPanel.style.background = 'linear-gradient(135deg, rgba(10, 5, 5, 0.98) 0%, rgba(20, 10, 10, 0.99) 50%, rgba(15, 5, 5, 0.98) 100%)';
        enemyCounterPanel.style.border = '2px solid #bb0000';
        enemyCounterPanel.style.borderRadius = '8px';
        enemyCounterPanel.style.boxShadow = '0 0 25px rgba(187, 0, 0, 0.3), inset 0 0 20px rgba(0, 0, 0, 0.6)';
        enemyCounterPanel.style.fontFamily = "'Trebuchet MS', serif";
        
        // Create header
        const header = document.createElement('div');
        header.style.textAlign = 'center';
        header.style.marginBottom = '12px';
        header.style.borderBottom = '1px solid #666';
        header.style.paddingBottom = '8px';
        
        const title = document.createElement('h3');
        title.textContent = 'XENOS THREAT ASSESSMENT';
        title.style.margin = '0';
        title.style.color = '#bb0000';
        title.style.fontSize = '14px';
        title.style.fontWeight = 'bold';
        title.style.letterSpacing = '1px';
        title.style.textShadow = '0 0 8px rgba(187, 0, 0, 0.8)';
        title.style.animation = 'etherealGlow 3s ease-in-out infinite';
        
        const subtitle = document.createElement('div');
        subtitle.textContent = 'Emperor Protects';
        subtitle.style.color = '#ffcc00';
        subtitle.style.fontSize = '10px';
        subtitle.style.fontStyle = 'italic';
        subtitle.style.marginTop = '2px';
        subtitle.style.textShadow = '0 0 5px rgba(255, 204, 0, 0.6)';
        
        header.appendChild(title);
        header.appendChild(subtitle);
        
        // Create loading-style bars for each faction
        const factions = [
            { key: 'total', name: 'TOTAL HOSTILES', color: '#bb0000', icon: '☠' },
            { key: 'tyranids', name: 'TYRANIDS', color: '#8844ff', icon: '🦂' },
            { key: 'orks', name: 'ORKS', color: '#44aa44', icon: '⚔' },
            { key: 'necrons', name: 'NECRONS', color: '#44ffaa', icon: '💀' },
            { key: 'chaos', name: 'CHAOS', color: '#ff4444', icon: '🔥' }
        ];
        
        const factionContainer = document.createElement('div');
        factionContainer.style.display = 'flex';
        factionContainer.style.flexDirection = 'column';
        factionContainer.style.gap = '8px';
        
        factions.forEach(faction => {
            const factionRow = document.createElement('div');
            factionRow.style.display = 'flex';
            factionRow.style.alignItems = 'center';
            factionRow.style.justifyContent = 'space-between';
            factionRow.style.padding = '6px 8px';
            factionRow.style.background = 'rgba(0, 0, 0, 0.3)';
            factionRow.style.borderRadius = '4px';
            factionRow.style.border = '1px solid #444';
            factionRow.style.transition = 'all 0.3s ease';
            
            const leftSide = document.createElement('div');
            leftSide.style.display = 'flex';
            leftSide.style.alignItems = 'center';
            leftSide.style.gap = '6px';
            
            const icon = document.createElement('span');
            icon.textContent = faction.icon;
            icon.style.fontSize = '12px';
            
            const label = document.createElement('span');
            label.textContent = faction.name;
            label.style.color = '#ccc';
            label.style.fontSize = '11px';
            label.style.fontWeight = 'bold';
            label.style.letterSpacing = '0.5px';
            
            leftSide.appendChild(icon);
            leftSide.appendChild(label);
            
            const rightSide = document.createElement('div');
            rightSide.style.display = 'flex';
            rightSide.style.alignItems = 'center';
            rightSide.style.gap = '8px';
            
            // Loading bar style progress
            const progressBar = document.createElement('div');
            progressBar.style.width = '60px';
            progressBar.style.height = '6px';
            progressBar.style.background = 'rgba(0, 0, 0, 0.6)';
            progressBar.style.borderRadius = '3px';
            progressBar.style.overflow = 'hidden';
            progressBar.style.border = '1px solid #333';
            
            const progressFill = document.createElement('div');
            progressFill.id = `enemy-progress-${faction.key}`;
            progressFill.style.height = '100%';
            progressFill.style.width = '0%';
            progressFill.style.background = `linear-gradient(90deg, ${faction.color}, ${faction.color}88)`;
            progressFill.style.transition = 'width 0.5s ease';
            progressFill.style.boxShadow = `0 0 4px ${faction.color}66`;
            
            progressBar.appendChild(progressFill);
            
            const count = document.createElement('span');
            count.id = `enemy-count-${faction.key}`;
            count.textContent = '0';
            count.style.color = faction.color;
            count.style.fontSize = '12px';
            count.style.fontWeight = 'bold';
            count.style.minWidth = '20px';
            count.style.textAlign = 'right';
            count.style.textShadow = `0 0 4px ${faction.color}`;
            
            rightSide.appendChild(progressBar);
            rightSide.appendChild(count);
            
            factionRow.appendChild(leftSide);
            factionRow.appendChild(rightSide);
            
            factionContainer.appendChild(factionRow);
        });
        
        enemyCounterPanel.appendChild(header);
        enemyCounterPanel.appendChild(factionContainer);
        
        // Add mobile toggle functionality
        if (window.innerWidth <= 767) {
            enemyCounterPanel.addEventListener('click', (e) => {
                if (e.target === enemyCounterPanel || e.target.closest('.enemy-counter-panel::after')) {
                    enemyCounterPanel.classList.toggle('expanded');
                }
            });
            
            // Add touch handler for the hamburger button
            const handleTouch = (e) => {
                const rect = enemyCounterPanel.getBoundingClientRect();
                const hamburgerArea = {
                    left: rect.right - 10,
                    right: rect.right + 30,
                    top: rect.top + 10,
                    bottom: rect.top + 50
                };
                
                if (e.touches && e.touches.length > 0) {
                    const touch = e.touches[0];
                    if (touch.clientX >= hamburgerArea.left && 
                        touch.clientX <= hamburgerArea.right &&
                        touch.clientY >= hamburgerArea.top && 
                        touch.clientY <= hamburgerArea.bottom) {
                        e.preventDefault();
                        enemyCounterPanel.classList.toggle('expanded');
                    }
                }
            };
            
            enemyCounterPanel.addEventListener('touchstart', handleTouch, { passive: false });
        }
        
        // Auto-collapse on desktop
        window.addEventListener('resize', () => {
            if (window.innerWidth > 767) {
                enemyCounterPanel.classList.remove('expanded');
            }
        });
        
        document.querySelector('.game-area').appendChild(enemyCounterPanel);
    }
    
    // Update enemy counter with loading-style animations
    updateEnemyCounter(action, enemy) {
        const faction = enemy.faction;
        
        if (action === 'spawned') {
            this.enemyCounter.total++;
            this.enemyCounter[faction] = (this.enemyCounter[faction] || 0) + 1;
        } else if (action === 'defeated') {
            this.enemyCounter.total = Math.max(0, this.enemyCounter.total - 1);
            this.enemyCounter[faction] = Math.max(0, (this.enemyCounter[faction] || 0) - 1);
        }
        
        // Update display with animations
        this.updateEnemyCounterDisplay();
    }
    
    // Update the visual display of enemy counters
    updateEnemyCounterDisplay() {
        const maxEnemies = 15; // Maximum for progress bar calculation
        
        Object.entries(this.enemyCounter).forEach(([faction, count]) => {
            const countElement = document.getElementById(`enemy-count-${faction}`);
            const progressElement = document.getElementById(`enemy-progress-${faction}`);
            
            if (countElement && progressElement) {
                // Update count with loading-style effect
                countElement.style.transition = 'all 0.3s ease';
                countElement.style.transform = 'scale(1.2)';
                countElement.textContent = count;
                
                // Reset scale after animation
                setTimeout(() => {
                    countElement.style.transform = 'scale(1)';
                }, 300);
                
                // Update progress bar
                const percentage = Math.min((count / maxEnemies) * 100, 100);
                progressElement.style.width = percentage + '%';
                
                // Add pulsing effect for high enemy counts
                if (count > 10) {
                    progressElement.style.animation = 'gothicPulse 1s ease-in-out infinite';
                } else {
                    progressElement.style.animation = 'none';
                }
                
                // Change color intensity based on count
                const intensity = Math.min(count / 5, 1);
                const colors = {
                    total: '#bb0000',
                    tyranids: '#8844ff', 
                    orks: '#44aa44',
                    necrons: '#44ffaa',
                    chaos: '#ff4444'
                };
                
                const baseColor = colors[faction] || '#bb0000';
                progressElement.style.background = `linear-gradient(90deg, ${baseColor}, ${baseColor}${Math.floor(intensity * 255).toString(16).padStart(2, '0')})`;
                progressElement.style.boxShadow = `0 0 ${4 + intensity * 6}px ${baseColor}${Math.floor(intensity * 102).toString(16).padStart(2, '0')}`;
            }
        });
    }
    
    // Setup event listeners
    setupEventListeners() {
        // Listen for character stat changes
        document.addEventListener('character-updated', () => {
            this.updateCharacterInfo();
        });
        
        // Listen for equipment changes
        document.addEventListener('equipment-changed', () => {
            this.updateCharacterInfo();
        });
        
        // Listen for combat events
        document.addEventListener('combat-start', (event) => {
            this.showCombatUI(event.detail.character, event.detail.enemy);
        });
        
        document.addEventListener('combat-end', () => {
            this.hideCombatUI();
        });
        
        // Listen for enemy spawn events
        document.addEventListener('enemy-spawned', (event) => {
            if (event.detail && event.detail.enemy) {
                this.updateEnemyCounter('spawned', event.detail.enemy);
                
                if (this.notificationPreferences.enemySpawn) {
                    this.showEnemySpawnNotification(event.detail.enemy);
                }
            }
        });
        
        // Listen for enemy death events
        document.addEventListener('enemy-defeated', (event) => {
            if (event.detail && event.detail.enemy) {
                this.updateEnemyCounter('defeated', event.detail.enemy);
            }
        });
        
        // Listen for item found events
        document.addEventListener('item-found', (event) => {
            if (this.notificationPreferences.itemFound && event.detail && event.detail.item) {
                this.showItemFoundNotification(event.detail.item);
            }
        });
        
        // Listen for resource gain events
        document.addEventListener('resource-gained', (event) => {
            if (this.notificationPreferences.resourceGain && 
                event.detail && 
                event.detail.resourceType && 
                event.detail.amount) {
                this.showResourceGainNotification(
                    event.detail.resourceType,
                    event.detail.amount
                );
            }
        });
        
        // Listen for loop completion events
        document.addEventListener('loop-completed', (event) => {
            if (this.notificationPreferences.loopComplete && 
                event.detail && 
                event.detail.loopCount) {
                this.showLoopCompletedNotification(event.detail.loopCount);
            }
        });
        
        // Listen for card-related events
        document.addEventListener('card-dealt', () => {
            this.updateCardDeck();
        });
    }
    
    // Update character info display
    updateCharacterInfo() {
        if (!this.gameManager.character) return;
        
        const character = this.gameManager.character;
        
        // Update character name
        const nameElement = this.characterInfo.querySelector('h3');
        if (nameElement) nameElement.textContent = character.name;
        
        // Update stats
        document.getElementById('charHP').textContent = character.hp;
        document.getElementById('charMaxHP').textContent = character.maxHp;
        document.getElementById('charAttack').textContent = character.attack;
        document.getElementById('charDefense').textContent = character.defense;
        document.getElementById('charSpeed').textContent = character.speed.toFixed(1);
        
        // Update HP bar with gothic styling
        const hpBar = document.querySelector('.hp-fill');
        if (hpBar) {
            const hpPercentage = (character.hp / character.maxHp) * 100;
            hpBar.style.width = hpPercentage + '%';
            
            // Update HP bar color based on health percentage
            if (hpPercentage > 60) {
                hpBar.style.background = 'linear-gradient(90deg, #44ff44, #66ff66)';
                hpBar.style.boxShadow = '0 0 8px rgba(68, 255, 68, 0.5)';
            } else if (hpPercentage > 25) {
                hpBar.style.background = 'linear-gradient(90deg, #ffaa44, #ffcc66)';
                hpBar.style.boxShadow = '0 0 8px rgba(255, 170, 68, 0.5)';
            } else {
                hpBar.style.background = 'linear-gradient(90deg, #ff4444, #ff6666)';
                hpBar.style.boxShadow = '0 0 8px rgba(255, 68, 68, 0.5)';
            }
        }
        
        // Update resources
        Object.entries(character.resources).forEach(([type, amount]) => {
            const element = document.getElementById(type);
            if (element) {
                const spanElement = element.querySelector('span span');
                if (spanElement) {
                    spanElement.textContent = amount;
                }
            }
        });
    }
    
    // Show combat UI
    showCombatUI(character, enemy) {
        // Create combat popup if it doesn't exist
        if (!document.getElementById('combatPopup')) {
            const popup = document.createElement('div');
            popup.id = 'combatPopup';
            popup.className = 'combat-popup';
            popup.style.position = 'absolute';
            popup.style.top = '50%';
            popup.style.left = '50%';
            popup.style.transform = 'translate(-50%, -50%)';
            popup.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
            popup.style.padding = '20px';
            popup.style.borderRadius = '5px';
            popup.style.color = 'white';
            popup.style.display = 'none';
            popup.style.zIndex = '10';
            popup.style.minWidth = '350px';
            popup.style.textAlign = 'center';
            popup.style.boxShadow = '0 0 20px rgba(255, 0, 0, 0.4)';
            popup.style.border = '2px solid #bb0000';
            
            document.querySelector('.game-area').appendChild(popup);
        }
        
        const popup = document.getElementById('combatPopup');
        popup.style.display = 'block';
        
        // Update combat popup content
        let popupContent = `
            <h3 style="margin-bottom:15px;font-size:20px;color:#bb0000;">COMBAT ENCOUNTER</h3>
            <div class="combat-participants" style="display:flex;justify-content:space-between;margin-bottom:20px;">
                <div class="combat-character" style="flex:1;padding:10px;background:rgba(30,70,130,0.5);border-radius:5px;">
                    <strong style="color:#88ccff;">${character.name}</strong>
                    <div>HP: <span style="color:#ff8888;">${character.hp}</span>/<span>${character.maxHp}</span></div>
                    <div>ATK: ${character.attack}</div>
                    <div>DEF: ${character.defense}</div>
                </div>
                <div class="combat-vs" style="padding:10px 15px;font-weight:bold;font-size:20px;align-self:center;color:#ffcc00;">VS</div>
                <div class="combat-enemy" style="flex:1;padding:10px;background:rgba(130,30,30,0.5);border-radius:5px;">
                    <strong style="color:#ff8888;">${enemy.name}</strong>
                    <div>HP: <span style="color:#ff8888;">${enemy.hp}</span>/<span>${enemy.maxHp}</span></div>
                    <div>ATK: ${enemy.attack}</div>
                    <div>DEF: ${enemy.defense}</div>
                </div>
            </div>
        `;
        
        // Enemy's next move indicator (if available)
        if (enemy.nextMove) {
            popupContent += `
                <div class="enemy-move" style="margin:15px 0;padding:10px;background:rgba(130,30,30,0.3);border-radius:5px;">
                    <p>${enemy.name} prepares to <strong style="color:#ff8888;">${enemy.nextMove}</strong>!</p>
                    <p>What will you do?</p>
                </div>
            `;
        } else {
            popupContent += `
                <div class="enemy-move" style="margin:15px 0;padding:10px;background:rgba(60,60,60,0.3);border-radius:5px;">
                    <p>${enemy.name} is preparing its next move...</p>
                </div>
            `;
        }
        
        // Combat actions
        popupContent += `
            <div class="combat-actions" style="margin-top:20px;display:flex;justify-content:center;gap:10px;">
                <button id="combat-attack" class="combat-btn" style="padding:8px 15px;background:#bb0000;color:white;border:none;border-radius:5px;cursor:pointer;font-weight:bold;">Attack</button>
                <button id="combat-block" class="combat-btn" style="padding:8px 15px;background:#0066bb;color:white;border:none;border-radius:5px;cursor:pointer;font-weight:bold;">Block</button>
                <button id="combat-dodge" class="combat-btn" style="padding:8px 15px;background:#009933;color:white;border:none;border-radius:5px;cursor:pointer;font-weight:bold;">Dodge</button>
            </div>
            <div style="margin-top:15px;display:flex;justify-content:center;">
                <label style="display:flex;align-items:center;cursor:pointer;">
                    <input type="checkbox" id="auto-combat-toggle" ${character.combatMode === 'auto' ? 'checked' : ''} style="margin-right:5px;">
                    <span>Auto Combat</span>
                </label>
            </div>
            <div id="combat-log" style="margin-top:15px;padding:10px;background:rgba(0,0,0,0.5);border-radius:5px;text-align:left;max-height:100px;overflow-y:auto;font-size:12px;">
                <p>Combat with ${enemy.name} has begun!</p>
            </div>
        `;
        
        popup.innerHTML = popupContent;
        
        // Add event listeners to buttons
        document.getElementById('combat-attack').addEventListener('click', () => {
            this.handleCombatAction('Attack', character, enemy);
        });
        
        document.getElementById('combat-block').addEventListener('click', () => {
            this.handleCombatAction('Block', character, enemy);
        });
        
        document.getElementById('combat-dodge').addEventListener('click', () => {
            this.handleCombatAction('Dodge', character, enemy);
        });
        
        // Add event listener to auto-combat toggle
        document.getElementById('auto-combat-toggle').addEventListener('change', (e) => {
            character.combatMode = e.target.checked ? 'auto' : 'interactive';
            this.updateCombatUI(character, enemy);
            console.log(`Combat mode switched to: ${character.combatMode}`);
        });
    }
    
    // Update combat UI during battle
    updateCombatUI(character, enemy) {
        const popup = document.getElementById('combatPopup');
        if (!popup) return;
        
        // Update health values
        const charHealth = popup.querySelector('.combat-character div:first-of-type span:first-of-type');
        if (charHealth) charHealth.textContent = character.hp;
        
        const enemyHealth = popup.querySelector('.combat-enemy div:first-of-type span:first-of-type');
        if (enemyHealth) enemyHealth.textContent = enemy.hp;
        
        // Update enemy move status
        const enemyMoveDiv = popup.querySelector('.enemy-move');
        if (enemyMoveDiv && enemy.nextMove) {
            enemyMoveDiv.innerHTML = `
                <p>${enemy.name} prepares to <strong style="color:#ff8888;">${enemy.nextMove}</strong>!</p>
                <p>What will you do?</p>
            `;
        } else if (enemyMoveDiv) {
            enemyMoveDiv.innerHTML = `
                <p>${enemy.name} is preparing its next move...</p>
            `;
        }
        
        // Update buttons based on combat mode
        const combatButtons = popup.querySelectorAll('.combat-btn');
        if (character.combatMode === 'auto') {
            combatButtons.forEach(btn => {
                btn.style.opacity = '0.5';
                btn.disabled = true;
            });
        } else {
            combatButtons.forEach(btn => {
                btn.style.opacity = '1';
                btn.disabled = enemy.nextMove === null; // Only enable if enemy has made a move
            });
        }
        
        // Update auto-combat toggle
        const autoCombatToggle = document.getElementById('auto-combat-toggle');
        if (autoCombatToggle) {
            autoCombatToggle.checked = character.combatMode === 'auto';
        }
    }
    
    // Handle player combat action
    handleCombatAction(action, character, enemy) {
        if (!enemy.nextMove) {
            this.addCombatLogMessage("Wait for the enemy to prepare!");
            return;
        }
        
        // Store enemy's move before it gets reset
        const enemyMove = enemy.nextMove;
        
        // Process the combat move
        const result = character.performCombatMove(action);
        
        // Update UI
        this.updateCombatUI(character, enemy);
        
        // Add result to combat log
        switch (result) {
            case 'player-advantage':
                this.addCombatLogMessage(`Your ${action} countered the enemy's ${enemyMove}! Critical hit!`, 'player-advantage');
                break;
            case 'enemy-advantage':
                this.addCombatLogMessage(`The enemy's ${enemyMove} overpowered your ${action}!`, 'enemy-advantage');
                break;
            case 'neutral':
                this.addCombatLogMessage(`You exchanged blows with the enemy.`, 'neutral');
                break;
        }
    }
    
    // Add message to combat log
    addCombatLogMessage(message, type = 'info') {
        const combatLog = document.getElementById('combat-log');
        if (!combatLog) return;
        
        const entry = document.createElement('p');
        entry.textContent = message;
        
        // Style based on message type
        switch (type) {
            case 'player-advantage':
                entry.style.color = '#88ff88';
                break;
            case 'enemy-advantage':
                entry.style.color = '#ff8888';
                break;
            case 'neutral':
                entry.style.color = '#ffcc00';
                break;
            default:
                entry.style.color = '#ffffff';
        }
        
        combatLog.appendChild(entry);
        combatLog.scrollTop = combatLog.scrollHeight; // Scroll to bottom
    }
    
    // Hide combat UI
    hideCombatUI() {
        const popup = document.getElementById('combatPopup');
        if (popup) {
            // Add fade-out animation
            popup.style.opacity = '0';
            popup.style.transition = 'opacity 0.3s ease-out';
            
            // Remove after animation completes
            setTimeout(() => {
                popup.style.display = 'none';
                popup.style.opacity = '1'; // Reset for next time
                popup.style.transition = '';
            }, 300);
        }
    }
    
    // Update card deck display
    updateCardDeck() {
        // Clear current cards
        this.cardDeck.innerHTML = '';
        
        // Add cards
        this.gameManager.cards.forEach(card => {
            this.cardDeck.appendChild(card.element);
        });
    }
    
    // Set game speed
    setGameSpeed(speedMultiplier) {
        if (this.gameManager) {
            this.gameManager.timeScale = speedMultiplier;
        }
    }
    
    // Show a notification message
    showNotification(message, duration = 3000) {
        // Create notification element if it doesn't exist
        if (!document.getElementById('notification')) {
            const notification = document.createElement('div');
            notification.id = 'notification';
            notification.style.position = 'fixed';
            notification.style.top = '20px';
            notification.style.left = '50%';
            notification.style.transform = 'translateX(-50%)';
            notification.style.backgroundColor = 'rgba(0, 0, 0, 0.9)';
            notification.style.color = 'white';
            notification.style.padding = '12px 24px';
            notification.style.borderRadius = '6px';
            notification.style.border = '2px solid #bb0000';
            notification.style.boxShadow = '0 0 20px rgba(187, 0, 0, 0.5)';
            notification.style.display = 'none';
            notification.style.zIndex = '2000';
            notification.style.fontFamily = "'Trebuchet MS', serif";
            notification.style.fontWeight = 'bold';
            notification.style.textShadow = '0 0 5px rgba(0, 0, 0, 0.8)';
            notification.style.maxWidth = '400px';
            notification.style.textAlign = 'center';
            notification.style.pointerEvents = 'none';
            
            document.body.appendChild(notification);
        }
        
        const notification = document.getElementById('notification');
        notification.textContent = message;
        notification.style.display = 'block';
        notification.style.opacity = '0';
        notification.style.transition = 'opacity 0.3s ease';
        
        // Fade in
        setTimeout(() => {
            notification.style.opacity = '1';
        }, 10);
        
        // Hide notification after duration
        setTimeout(() => {
            notification.style.opacity = '0';
            setTimeout(() => {
                notification.style.display = 'none';
            }, 300);
        }, duration);
    }
    
    // Show a modal notification with additional details and options
    showModalNotification(title, content, options = {}) {
        // Remove any existing modal
        const existingModal = document.getElementById('modal-notification');
        if (existingModal) {
            existingModal.remove();
        }
        
        // Create modal container
        const modal = document.createElement('div');
        modal.id = 'modal-notification';
        modal.style.position = 'absolute';
        modal.style.top = '50%';
        modal.style.left = '50%';
        modal.style.transform = 'translate(-50%, -50%)';
        modal.style.backgroundColor = 'rgba(20, 20, 25, 0.95)';
        modal.style.border = '2px solid ' + (options.borderColor || '#555');
        modal.style.borderRadius = '5px';
        modal.style.padding = '15px';
        modal.style.color = 'white';
        modal.style.zIndex = '1000';
        modal.style.minWidth = '300px';
        modal.style.maxWidth = '400px';
        modal.style.boxShadow = '0 0 20px rgba(0, 0, 0, 0.7)';
        
        // Create header
        const header = document.createElement('div');
        header.style.display = 'flex';
        header.style.justifyContent = 'space-between';
        header.style.alignItems = 'center';
        header.style.borderBottom = '1px solid #555';
        header.style.paddingBottom = '10px';
        header.style.marginBottom = '10px';
        
        // Add title
        const titleElement = document.createElement('h3');
        titleElement.textContent = title;
        titleElement.style.margin = '0';
        titleElement.style.color = options.titleColor || '#bb0000';
        
        // Add close button
        const closeBtn = document.createElement('button');
        closeBtn.textContent = '×';
        closeBtn.style.background = 'none';
        closeBtn.style.border = 'none';
        closeBtn.style.color = 'white';
        closeBtn.style.fontSize = '24px';
        closeBtn.style.cursor = 'pointer';
        closeBtn.style.padding = '0 5px';
        
        header.appendChild(titleElement);
        header.appendChild(closeBtn);
        
        // Add content
        const contentElement = document.createElement('div');
        contentElement.innerHTML = content;
        contentElement.style.margin = '10px 0';
        
        // Add footer for options
        const footer = document.createElement('div');
        footer.style.marginTop = '15px';
        footer.style.display = 'flex';
        footer.style.justifyContent = 'space-between';
        footer.style.alignItems = 'center';
        
        // Assemble modal
        modal.appendChild(header);
        modal.appendChild(contentElement);
        modal.appendChild(footer);
        
        // Add options if provided
        if (options.checkbox) {
            const optionDiv = document.createElement('div');
            optionDiv.style.display = 'flex';
            optionDiv.style.alignItems = 'center';
            
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.id = options.checkbox.id;
            checkbox.style.marginRight = '5px';
            
            const label = document.createElement('label');
            label.textContent = options.checkbox.label;
            label.htmlFor = options.checkbox.id;
            label.style.fontSize = '0.9em';
            label.style.cursor = 'pointer';
            
            // Add event listener for checkbox
            checkbox.addEventListener('change', options.checkbox.onChange);
            
            optionDiv.appendChild(checkbox);
            optionDiv.appendChild(label);
            footer.appendChild(optionDiv);
        }
        
        // Add confirm button if provided
        if (options.confirmButton) {
            const confirmBtn = document.createElement('button');
            confirmBtn.textContent = options.confirmButton.label || 'OK';
            confirmBtn.style.padding = '5px 15px';
            confirmBtn.style.backgroundColor = '#bb0000';
            confirmBtn.style.color = 'white';
            confirmBtn.style.border = 'none';
            confirmBtn.style.borderRadius = '3px';
            confirmBtn.style.cursor = 'pointer';
            
            confirmBtn.addEventListener('click', () => {
                if (options.confirmButton.onClick) {
                    options.confirmButton.onClick();
                }
                modal.remove();
            });
            
            footer.appendChild(confirmBtn);
        } else {
            // Add a default OK button if no confirm button is provided
            const okBtn = document.createElement('button');
            okBtn.textContent = 'OK';
            okBtn.style.padding = '5px 15px';
            okBtn.style.backgroundColor = '#333';
            okBtn.style.color = 'white';
            okBtn.style.border = 'none';
            okBtn.style.borderRadius = '3px';
            okBtn.style.cursor = 'pointer';
            
            okBtn.addEventListener('click', () => {
                modal.remove();
            });
            
            footer.appendChild(okBtn);
        }
        
        // Add close button functionality
        closeBtn.addEventListener('click', () => {
            modal.remove();
        });
        
        // Add to game area
        document.querySelector('.game-area').appendChild(modal);
        
        // Add fade-in animation
        modal.style.opacity = '0';
        modal.style.transition = 'opacity 0.3s ease-in';
        
        // Trigger animation
        setTimeout(() => {
            modal.style.opacity = '1';
        }, 10);
        
        // Auto-close after duration if specified
        if (options.duration) {
            setTimeout(() => {
                if (document.body.contains(modal)) {
                    modal.style.opacity = '0';
                    setTimeout(() => modal.remove(), 300);
                }
            }, options.duration);
        }
        
        return modal;
    }
    
    // Show enemy spawn notification
    showEnemySpawnNotification(enemy) {
        // Create content for notification
        const content = `
            <div style="display:flex;align-items:center;margin-bottom:10px;">
                <div style="width:50px;height:50px;background-color:rgba(130,30,30,0.5);border-radius:5px;margin-right:15px;display:flex;justify-content:center;align-items:center;font-weight:bold;font-size:24px;">${enemy.name.charAt(0)}</div>
                <div>
                    <strong>${enemy.name}</strong> has appeared!
                    <div style="margin-top:5px;font-size:0.9em;">
                        <div>HP: ${enemy.hp}/${enemy.maxHp}</div>
                        <div>Faction: ${enemy.faction.charAt(0).toUpperCase() + enemy.faction.slice(1)}</div>
                    </div>
                </div>
            </div>
        `;
        
        // Show modal notification
        this.showModalNotification('Enemy Spotted!', content, {
            borderColor: '#bb0000',
            titleColor: '#ff8888',
            duration: 5000,
            checkbox: {
                id: 'disable-enemy-spawn-notifications',
                label: 'Don\'t show enemy spawn notifications',
                onChange: (e) => {
                    this.notificationPreferences.enemySpawn = !e.target.checked;
                }
            }
        });
    }
    
    // Show item found notification
    showItemFoundNotification(item) {
        if (!this.notificationPreferences.itemFound) return;
        
        // Create content for notification
        const content = `
            <div style="display:flex;align-items:center;margin-bottom:10px;">
                <div style="width:50px;height:50px;background-color:rgba(70,100,30,0.5);border-radius:5px;margin-right:15px;display:flex;justify-content:center;align-items:center;font-weight:bold;font-size:24px;">${item.name.charAt(0)}</div>
                <div>
                    <strong>${item.name}</strong> found!
                    <div style="margin-top:5px;font-size:0.9em;">
                        <div>Type: ${item.type.charAt(0).toUpperCase() + item.type.slice(1)}</div>
                        <div>Rarity: ${item.rarity.charAt(0).toUpperCase() + item.rarity.slice(1)}</div>
                    </div>
                </div>
            </div>
        `;
        
        // Show modal notification
        this.showModalNotification('Item Found!', content, {
            borderColor: '#22aa44',
            titleColor: '#66cc88',
            duration: 4000,
            checkbox: {
                id: 'disable-item-found-notifications',
                label: 'Don\'t show item found notifications',
                onChange: (e) => {
                    this.notificationPreferences.itemFound = !e.target.checked;
                }
            }
        });
    }
    
    // Show resource gain notification
    showResourceGainNotification(resourceType, amount) {
        if (!this.notificationPreferences.resourceGain) return;
        
        // Define resource colors
        const resourceColors = {
            [RESOURCE_TYPES.BIOMASS]: { bg: '#407040', text: '#88ff88' },
            [RESOURCE_TYPES.SCRAP]: { bg: '#704040', text: '#ffaa66' },
            [RESOURCE_TYPES.WARPSTONE]: { bg: '#404070', text: '#8888ff' },
            'default': { bg: '#555555', text: '#ffffff' }
        };
        
        const resourceColor = resourceColors[resourceType] || resourceColors['default'];
        const resourceName = resourceType.charAt(0).toUpperCase() + resourceType.slice(1);
        
        // Create content for notification
        const content = `
            <div style="display:flex;align-items:center;margin-bottom:10px;">
                <div style="width:50px;height:50px;background-color:${resourceColor.bg};border-radius:5px;margin-right:15px;display:flex;justify-content:center;align-items:center;font-weight:bold;font-size:24px;color:${resourceColor.text};">+${amount}</div>
                <div>
                    <strong>${amount} ${resourceName}</strong> collected!
                    <div style="margin-top:5px;font-size:0.9em;">
                        <div>Added to your inventory</div>
                    </div>
                </div>
            </div>
        `;
        
        // Show modal notification
        this.showModalNotification('Resource Gained!', content, {
            borderColor: resourceColor.bg,
            titleColor: resourceColor.text,
            duration: 3000,
            checkbox: {
                id: 'disable-resource-gain-notifications',
                label: 'Don\'t show resource gain notifications',
                onChange: (e) => {
                    this.notificationPreferences.resourceGain = !e.target.checked;
                }
            }
        });
    }
    
    // Show loop completion notification
    showLoopCompletedNotification(loopCount) {
        if (!this.notificationPreferences.loopComplete) return;
        
        // Create content for notification
        const content = `
            <div style="text-align:center;padding:10px;">
                <div style="font-size:32px;color:#ffcc00;margin-bottom:10px;">Loop ${loopCount} Completed</div>
                <div style="margin-top:10px;font-size:0.9em;">
                    <p>The journey continues...</p>
                    <p>Stay alert for new enemies and opportunities!</p>
                </div>
            </div>
        `;
        
        // Show modal notification
        this.showModalNotification('Loop Completed!', content, {
            borderColor: '#ffcc00',
            titleColor: '#ffcc00',
            duration: 5000,
            checkbox: {
                id: 'disable-loop-complete-notifications',
                label: 'Don\'t show loop completion notifications',
                onChange: (e) => {
                    this.notificationPreferences.loopComplete = !e.target.checked;
                }
            }
        });
    }
    
    // Show notification settings modal
    showNotificationSettings() {
        // Create content for notification settings
        const content = `
            <div class="settings-container" style="display:flex;flex-direction:column;gap:15px;">
                <div class="settings-item">
                    <label style="display:flex;align-items:center;gap:10px;cursor:pointer;">
                        <input type="checkbox" id="setting-enemy-spawn" ${this.notificationPreferences.enemySpawn ? 'checked' : ''}>
                        <span>Enemy spawn notifications</span>
                    </label>
                    <div style="margin-top:5px;font-size:0.8em;color:#aaa;margin-left:25px;">
                        Notification when a new enemy appears on the map
                    </div>
                </div>
                
                <div class="settings-item">
                    <label style="display:flex;align-items:center;gap:10px;cursor:pointer;">
                        <input type="checkbox" id="setting-item-found" ${this.notificationPreferences.itemFound ? 'checked' : ''}>
                        <span>Item found notifications</span>
                    </label>
                    <div style="margin-top:5px;font-size:0.8em;color:#aaa;margin-left:25px;">
                        Notification when you find a new item
                    </div>
                </div>
                
                <div class="settings-item">
                    <label style="display:flex;align-items:center;gap:10px;cursor:pointer;">
                        <input type="checkbox" id="setting-resource-gain" ${this.notificationPreferences.resourceGain ? 'checked' : ''}>
                        <span>Resource gain notifications</span>
                    </label>
                    <div style="margin-top:5px;font-size:0.8em;color:#aaa;margin-left:25px;">
                        Notification when you collect resources
                    </div>
                </div>
                
                <div class="settings-item">
                    <label style="display:flex;align-items:center;gap:10px;cursor:pointer;">
                        <input type="checkbox" id="setting-loop-complete" ${this.notificationPreferences.loopComplete ? 'checked' : ''}>
                        <span>Loop completion notifications</span>
                    </label>
                    <div style="margin-top:5px;font-size:0.8em;color:#aaa;margin-left:25px;">
                        Notification when you complete a loop around the path
                    </div>
                </div>
            </div>
        `;
        
        // Show settings modal
        const modal = this.showModalNotification('Notification Settings', content, {
            borderColor: '#444',
            titleColor: '#ffffff',
            confirmButton: {
                label: 'Save',
                onClick: () => {
                    this.notificationPreferences.enemySpawn = document.getElementById('setting-enemy-spawn').checked;
                    this.notificationPreferences.itemFound = document.getElementById('setting-item-found').checked;
                    this.notificationPreferences.resourceGain = document.getElementById('setting-resource-gain').checked;
                    this.notificationPreferences.loopComplete = document.getElementById('setting-loop-complete').checked;
                }
            }
        });
        
        return modal;
    }
}