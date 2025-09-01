// Menu Manager class
class MenuManager {
    constructor() {
        this.selectedEquipment = null;
        this.selectedSeal = null;
        
        // Equipment and Seal data
        this.equipmentData = {
            medkit: {
                name: 'Medi-Kit',
                icon: '⚕',
                description: 'Standard Imperial medical supplies for field operations. Provides immediate healing and can be used multiple times.',
                quantity: 2,
                effects: [
                    { type: 'buff', text: 'Restores 30% health when used' },
                    { type: 'buff', text: 'Can be used 2 times per battle' },
                    { type: 'neutral', text: 'Standard issue equipment' }
                ]
            },
            revive: {
                name: 'Revive Pack',
                icon: '⚡',
                description: 'Emergency revival system that automatically activates when the bearer falls in battle.',
                quantity: 1,
                effects: [
                    { type: 'buff', text: 'Auto-revives with 20% health upon death' },
                    { type: 'buff', text: 'One-time use per battle' },
                    { type: 'debuff', text: 'Takes 2 turns to recover after revival' }
                ]
            },
            grenade: {
                name: 'Frag Grenade',
                icon: '💣',
                description: 'High-explosive fragmentation device effective against groups of enemies.',
                quantity: 3,
                effects: [
                    { type: 'buff', text: 'Area damage to all enemies in range' },
                    { type: 'buff', text: 'Can be thrown up to 3 tiles away' },
                    { type: 'neutral', text: 'Limited ammunition' }
                ]
            },
            shield: {
                name: 'Energy Shield',
                icon: '🛡️',
                description: 'Personal energy barrier that absorbs incoming damage before health.',
                quantity: 1,
                effects: [
                    { type: 'buff', text: 'Provides 50 shield points' },
                    { type: 'buff', text: 'Regenerates 5 shield per turn' },
                    { type: 'neutral', text: 'Takes time to recharge when depleted' }
                ]
            },
            stim: {
                name: 'Combat Stim',
                icon: '💉',
                description: 'Performance-enhancing chemical cocktail that temporarily boosts combat capabilities.',
                quantity: 2,
                effects: [
                    { type: 'buff', text: '+50% attack damage for 3 turns' },
                    { type: 'buff', text: '+25% movement speed for 3 turns' },
                    { type: 'debuff', text: '-20% health after effect wears off' }
                ]
            },
            scanner: {
                name: 'Tactical Scanner',
                icon: '📡',
                description: 'Advanced sensor array that reveals enemy positions and weaknesses.',
                quantity: 1,
                effects: [
                    { type: 'buff', text: 'Reveals all enemies on the map' },
                    { type: 'buff', text: 'Shows enemy health and stats' },
                    { type: 'neutral', text: 'One-time use per battle' }
                ]
            }
        };
        
        this.sealData = {
            shield: {
                name: 'Seal of Protection',
                icon: '🛡️',
                description: 'The Emperor\'s divine protection surrounds the bearer, enhancing defensive capabilities.',
                effects: [
                    { type: 'buff', text: '+25% Maximum health' },
                    { type: 'buff', text: '+50% Shield capacity' },
                    { type: 'debuff', text: '-15% Resource gathering' }
                ]
            },
            strength: {
                name: 'Seal of Strength',
                icon: '⚔️',
                description: 'The Emperor\'s might flows through the bearer, granting enhanced combat prowess.',
                effects: [
                    { type: 'buff', text: '+40% Attack damage' },
                    { type: 'buff', text: '+20% Critical hit chance' },
                    { type: 'debuff', text: '-10% Movement speed' }
                ]
            },
            speed: {
                name: 'Seal of Swiftness',
                icon: '⚡',
                description: 'The Emperor\'s grace grants the bearer exceptional speed and agility.',
                effects: [
                    { type: 'buff', text: '+35% Movement speed' },
                    { type: 'buff', text: '+25% Evasion chance' },
                    { type: 'debuff', text: '-15% Attack damage' }
                ]
            },
            wisdom: {
                name: 'Seal of Wisdom',
                icon: '🧠',
                description: 'The Emperor\'s knowledge guides the bearer, enhancing tactical awareness.',
                effects: [
                    { type: 'buff', text: '+30% Resource gathering' },
                    { type: 'buff', text: '+25% Experience gain' },
                    { type: 'debuff', text: '-10% Maximum health' }
                ]
            }
        };
        
        // Game configuration
        this.gameConfig = {
            startingEquipment: 'medkit',
            emperorsSeal: 'shield',
            sealModifiers: {
                shield: { health: 1.25, shield: 1.5, resourceGathering: 0.85 },
                strength: { attack: 1.4, critChance: 1.2, speed: 0.9 },
                speed: { speed: 1.35, evasion: 1.25, attack: 0.85 },
                wisdom: { resourceGathering: 1.3, expGain: 1.25, health: 0.9 }
            }
        };
        
        this.init();
    }
    
    init() {
        // Show loader first
        this.showLoader();
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Simulate loading time
        setTimeout(() => {
            this.showMainMenu();
        }, 3000);
    }
    
    setupEventListeners() {
        // Main menu buttons
        document.getElementById('startGameBtn').addEventListener('click', () => {
            this.showGameSetup();
        });
        
        document.getElementById('infoBtn').addEventListener('click', () => {
            this.showInfo();
        });
        
        // Game setup buttons
        document.getElementById('backToMenuBtn').addEventListener('click', () => {
            this.showMainMenu();
        });
        
        document.getElementById('startExpeditionBtn').addEventListener('click', () => {
            this.startGame();
        });
        
        // Equipment grid selection
        document.querySelectorAll('.equipment-slot').forEach(slot => {
            slot.addEventListener('click', () => {
                this.showEquipmentModal(slot.dataset.equipment);
            });
        });
        
        // Seal grid selection
        document.querySelectorAll('.seal-slot').forEach(slot => {
            slot.addEventListener('click', () => {
                this.showSealModal(slot.dataset.seal);
            });
        });
        
        // Modal close button
        document.getElementById('closeModal').addEventListener('click', () => {
            this.hideModal();
        });
        
        // Modal overlay click to close
        document.getElementById('equipmentModal').addEventListener('click', (e) => {
            if (e.target.id === 'equipmentModal') {
                this.hideModal();
            }
        });
        
        // Equip button
        document.getElementById('equipButton').addEventListener('click', () => {
            this.equipSelectedItem();
        });
    }
    
    showLoader() {
        document.getElementById('gameLoader').style.display = 'flex';
        document.getElementById('mainMenu').style.display = 'none';
        document.getElementById('gameSetup').style.display = 'none';
        document.getElementById('gameContainer').style.display = 'none';
        
        // Add loading animation
        const loadingText = document.querySelector('.loading-text');
        const messages = [
            'In the grim darkness of the far future...',
            'There is only war...',
            'The Emperor protects...',
            'Loading battlefield data...',
            'Preparing for eternal conflict...'
        ];
        
        let messageIndex = 0;
        const messageInterval = setInterval(() => {
            loadingText.textContent = messages[messageIndex];
            messageIndex = (messageIndex + 1) % messages.length;
        }, 600);
        
        // Clear interval when loading is done
        setTimeout(() => {
            clearInterval(messageInterval);
        }, 3000);
    }
    
    showMainMenu() {
        document.getElementById('gameLoader').style.display = 'none';
        document.getElementById('mainMenu').style.display = 'flex';
        document.getElementById('gameSetup').style.display = 'none';
        document.getElementById('gameContainer').style.display = 'none';
    }
    
    showGameSetup() {
        document.getElementById('gameLoader').style.display = 'none';
        document.getElementById('mainMenu').style.display = 'none';
        document.getElementById('gameSetup').style.display = 'flex';
        document.getElementById('gameContainer').style.display = 'none';
        
        // Set default selections
        this.selectEquipment('medkit');
        this.selectSeal('shield');
    }
    
    showInfo() {
        // TODO: Implement info/codex screen
        alert('Codex coming soon! Learn about the grim darkness of the 41st millennium...');
    }
    
    showEquipmentModal(equipmentType) {
        const equipment = this.equipmentData[equipmentType];
        if (!equipment) return;
        
        // Update modal content
        document.getElementById('modalTitle').textContent = 'Equipment Info';
        document.getElementById('modalIcon').textContent = equipment.icon;
        document.getElementById('modalName').textContent = equipment.name;
        document.getElementById('modalDescription').textContent = equipment.description;
        
        // Update effects
        const effectsContainer = document.getElementById('modalEffects');
        effectsContainer.innerHTML = '';
        equipment.effects.forEach(effect => {
            const effectDiv = document.createElement('div');
            effectDiv.className = `effect ${effect.type}`;
            effectDiv.textContent = effect.text;
            effectsContainer.appendChild(effectDiv);
        });
        
        // Update equip button
        const equipButton = document.getElementById('equipButton');
        equipButton.textContent = this.selectedEquipment === equipmentType ? 'Equipped' : 'Equip';
        equipButton.className = this.selectedEquipment === equipmentType ? 'equip-button equipped' : 'equip-button';
        
        // Store current item type
        this.currentModalItem = { type: 'equipment', id: equipmentType };
        
        // Show modal
        document.getElementById('equipmentModal').style.display = 'flex';
    }
    
    showSealModal(sealType) {
        const seal = this.sealData[sealType];
        if (!seal) return;
        
        // Update modal content
        document.getElementById('modalTitle').textContent = 'Emperor\'s Seal';
        document.getElementById('modalIcon').textContent = seal.icon;
        document.getElementById('modalName').textContent = seal.name;
        document.getElementById('modalDescription').textContent = seal.description;
        
        // Update effects
        const effectsContainer = document.getElementById('modalEffects');
        effectsContainer.innerHTML = '';
        seal.effects.forEach(effect => {
            const effectDiv = document.createElement('div');
            effectDiv.className = `effect ${effect.type}`;
            effectDiv.textContent = effect.text;
            effectsContainer.appendChild(effectDiv);
        });
        
        // Update equip button
        const equipButton = document.getElementById('equipButton');
        equipButton.textContent = this.selectedSeal === sealType ? 'Equipped' : 'Equip';
        equipButton.className = this.selectedSeal === sealType ? 'equip-button equipped' : 'equip-button';
        
        // Store current item type
        this.currentModalItem = { type: 'seal', id: sealType };
        
        // Show modal
        document.getElementById('equipmentModal').style.display = 'flex';
    }
    
    hideModal() {
        document.getElementById('equipmentModal').style.display = 'none';
        this.currentModalItem = null;
    }
    
    equipSelectedItem() {
        if (!this.currentModalItem) return;
        
        if (this.currentModalItem.type === 'equipment') {
            this.selectEquipment(this.currentModalItem.id);
        } else if (this.currentModalItem.type === 'seal') {
            this.selectSeal(this.currentModalItem.id);
        }
        
        this.hideModal();
    }
    
    selectEquipment(equipmentType) {
        this.selectedEquipment = equipmentType;
        this.gameConfig.startingEquipment = equipmentType;
        
        // Update visual selection
        document.querySelectorAll('.equipment-slot').forEach(slot => {
            slot.classList.remove('selected');
        });
        document.querySelector(`[data-equipment="${equipmentType}"]`).classList.add('selected');
    }
    
    selectSeal(sealType) {
        this.selectedSeal = sealType;
        this.gameConfig.emperorsSeal = sealType;
        
        // Update visual selection
        document.querySelectorAll('.seal-slot').forEach(slot => {
            slot.classList.remove('selected');
        });
        document.querySelector(`[data-seal="${sealType}"]`).classList.add('selected');
    }
    
    startGame() {
        // Use the new grid game system
        if (window.startGridGame) {
            window.startGridGame();
        } else {
            console.error('Grid game system not available');
        }
        
        // Apply seal modifiers to the game
        this.applySealModifiers();
        
        console.log('Warhammer 40K Grid Tactics started with config:', this.gameConfig);
    }
    
    applySealModifiers() {
        if (window.gridGameManager && this.gameConfig.emperorsSeal) {
            const modifiers = this.gameConfig.sealModifiers[this.gameConfig.emperorsSeal];
            if (modifiers) {
                // Apply modifiers to player stats
                const player = window.gridGameManager.player;
                if (player) {
                    if (modifiers.health) {
                        player.maxHealth = Math.floor(player.maxHealth * modifiers.health);
                        player.health = player.maxHealth;
                    }
                    if (modifiers.shield) {
                        player.maxShield = Math.floor(player.maxShield * modifiers.shield);
                        player.shield = player.maxShield;
                    }
                    if (modifiers.attack) {
                        player.attack = Math.floor(player.attack * modifiers.attack);
                    }
                    if (modifiers.speed) {
                        player.speed = player.speed * modifiers.speed;
                    }
                }
            }
        }
    }
    
    // Get game configuration
    getGameConfig() {
        return this.gameConfig;
    }
}