// Upgrade Manager class - Warhammer 40K Enhancement Branches
class UpgradeManager {
    constructor(gameManager) {
        this.gameManager = gameManager;
        this.character = null; // Will be set when character is available
        this.isOpen = false;
        this.container = null;
        this.initialized = false;
        this.currentBranch = 'biological'; // Default selected branch
        
        // Initialize upgrade UI
        this.createUpgradeUI();
        this.setupEventListeners();
        
        // Setup listener for when character becomes available
        this.setupCharacterListener();
    }
    
    // Setup listener for character initialization
    setupCharacterListener() {
        // Check if character already exists
        if (this.gameManager.character) {
            this.character = this.gameManager.character;
            this.initialized = true;
            return;
        }
        
        // Listen for game initialization event
        document.addEventListener('game-initialized', () => {
            this.character = this.gameManager.character;
            this.initialized = true;
            console.log('UpgradeManager: Character reference established');
        });
    }
    
    // Create upgrade UI elements
    createUpgradeUI() {
        // Create upgrade container
        this.container = document.createElement('div');
        this.container.id = 'upgrade-container';
        this.container.className = 'upgrade-container';
        this.container.style.display = 'none';
        
        // Apply styles
        this.applyUpgradeStyles();
        
        // Create upgrade content
        this.createUpgradeContent();
        
        // Add to game area
        document.querySelector('.game-area').appendChild(this.container);
    }
    
    // Apply upgrade UI styles
    applyUpgradeStyles() {
        this.container.style.position = 'absolute';
        this.container.style.top = '50%';
        this.container.style.left = '50%';
        this.container.style.transform = 'translate(-50%, -50%)';
        this.container.style.width = '80%';
        this.container.style.maxWidth = '900px';
        this.container.style.height = '80%';
        this.container.style.maxHeight = '700px';
        this.container.style.backgroundColor = 'rgba(20, 20, 25, 0.95)';
        this.container.style.border = '2px solid #555';
        this.container.style.borderRadius = '8px';
        this.container.style.padding = '20px';
        this.container.style.color = 'white';
        this.container.style.zIndex = '1000';
        this.container.style.overflowY = 'auto';
        this.container.style.boxShadow = '0 0 30px rgba(0, 0, 0, 0.8)';
    }
    
    // Create upgrade content
    createUpgradeContent() {
        // Header with branch tabs
        const header = document.createElement('div');
        header.className = 'upgrade-header';
        header.innerHTML = `
            <div class="upgrade-tabs">
                <button id="biological-tab" class="branch-button active" data-branch="biological">Biological</button>
                <button id="technical-tab" class="branch-button" data-branch="technical">Mechanicus</button>
                <button id="psionic-tab" class="branch-button" data-branch="psionic">Psychic</button>
                <button id="close-upgrades" class="close-button">×</button>
            </div>
            <div id="branch-description" class="branch-description">
                <span id="branch-name">Biological Enhancements</span>
                <p id="branch-desc">Augment your flesh with bio-engineered improvements</p>
            </div>
        `;
        header.style.display = 'flex';
        header.style.flexDirection = 'column';
        header.style.marginBottom = '20px';
        header.style.borderBottom = '2px solid #444';
        header.style.paddingBottom = '15px';
        
        // Tab and UI styling
        const style = document.createElement('style');
        style.textContent = `
            .upgrade-tabs {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 10px;
            }
            .branch-button {
                padding: 10px 20px;
                background: #2a2a2e;
                color: white;
                border: 1px solid #444;
                border-radius: 5px;
                cursor: pointer;
                margin-right: 10px;
                transition: all 0.3s ease;
                flex-grow: 1;
                text-align: center;
            }
            .branch-button:hover {
                background: #3a3a3e;
                border-color: #bb0000;
            }
            .branch-button.active {
                background: #bb0000;
                border-color: #ff0000;
            }
            .branch-description {
                text-align: center;
            }
            #branch-name {
                font-size: 1.2em;
                color: #ffcc00;
                font-weight: bold;
            }
            #branch-desc {
                margin: 5px 0 0 0;
                color: #ccc;
                font-style: italic;
            }
            .close-button {
                background: none;
                border: none;
                color: white;
                font-size: 24px;
                cursor: pointer;
                padding: 5px 10px;
                margin-left: 10px;
            }
            .close-button:hover {
                color: #bb0000;
            }
            .upgrade-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
                gap: 15px;
                max-height: calc(100vh - 250px);
                overflow-y: auto;
            }
        `;
        document.head.appendChild(style);
        
        // Content area for upgrades
        const contentArea = document.createElement('div');
        contentArea.id = 'upgrade-content';
        contentArea.style.height = 'calc(100% - 120px)';
        
        // Create upgrades grid
        const upgradesGrid = document.createElement('div');
        upgradesGrid.id = 'upgrades-grid';
        upgradesGrid.className = 'upgrade-grid';
        contentArea.appendChild(upgradesGrid);
        
        // Add elements to container
        this.container.appendChild(header);
        this.container.appendChild(contentArea);
    }
    
    // Populate upgrade branch with current upgrades
    populateBranchUpgrades(branchKey) {
        const branch = UPGRADE_BRANCHES[branchKey];
        if (!branch) return;
        
        const upgradesGrid = document.getElementById('upgrades-grid');
        if (!upgradesGrid) return;
        
        // Clear existing upgrades
        upgradesGrid.innerHTML = '';
        
        // Update branch info
        document.getElementById('branch-name').textContent = branch.name;
        document.getElementById('branch-desc').textContent = branch.description;
        
        // Create upgrade cards for this branch
        Object.entries(branch.upgrades).forEach(([upgradeKey, upgradeData]) => {
            const upgradeCard = this.createUpgradeCard(branchKey, upgradeKey, upgradeData, branch);
            upgradesGrid.appendChild(upgradeCard);
        });
    }
    
    // Create upgrade card for a specific upgrade
    createUpgradeCard(branchKey, upgradeKey, upgradeData, branch) {
        // Initialize upgrade levels if not exists
        if (!this.character.upgradelevels) {
            this.character.upgradelevels = {};
        }
        if (!this.character.upgradelevels[branchKey]) {
            this.character.upgradelevels[branchKey] = {};
        }
        
        const currentLevel = this.character.upgradelevels[branchKey][upgradeKey] || 0;
        const cost = Math.floor(upgradeData.baseCost * Math.pow(upgradeData.costMultiplier, currentLevel));
        const canAfford = this.character.resources[branch.resource] >= cost;
        const maxedOut = currentLevel >= upgradeData.maxLevel;
        
        const card = document.createElement('div');
        card.className = 'upgrade-card';
        card.style.background = 'rgba(42, 42, 46, 0.8)';
        card.style.border = `2px solid ${branch.color}`;
        card.style.borderRadius = '8px';
        card.style.padding = '15px';
        card.style.transition = 'all 0.3s ease';
        card.style.cursor = maxedOut ? 'default' : 'pointer';
        
        if (maxedOut) {
            card.style.opacity = '0.6';
            card.style.borderColor = '#444';
        } else if (!canAfford) {
            card.style.opacity = '0.7';
        }
        
        // Current value calculation
        const currentValue = this.getCurrentStatValue(upgradeData.statType);
        const nextValue = currentValue + upgradeData.statIncrease;
        const totalIncrease = currentLevel * upgradeData.statIncrease;
        
        card.innerHTML = `
            <h3 style="color: ${branch.color}; margin-bottom: 8px; font-size: 1.1em;">${upgradeData.name}</h3>
            <p style="color: #ccc; margin-bottom: 10px; font-size: 0.9em; line-height: 1.3;">${upgradeData.description}</p>
            
            <div style="margin-bottom: 12px; font-size: 0.9em;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                    <span>Level:</span>
                    <span style="color: ${branch.color};">${currentLevel}/${upgradeData.maxLevel}</span>
                </div>
                ${currentLevel > 0 ? `
                <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                    <span>Current Bonus:</span>
                    <span style="color: #88ff88;">+${this.formatStatValue(upgradeData.statType, totalIncrease)}</span>
                </div>
                ` : ''}
                ${!maxedOut ? `
                <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                    <span>Next Bonus:</span>
                    <span style="color: #ffcc00;">+${this.formatStatValue(upgradeData.statType, upgradeData.statIncrease)}</span>
                </div>
                ` : ''}
            </div>
            
            ${!maxedOut ? `
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                    <span style="font-weight: bold;">Cost:</span>
                    <span style="color: ${canAfford ? branch.color : '#ff6666'}; font-weight: bold;">
                        ${cost} ${branch.resource}
                    </span>
                </div>
            ` : `
                <div style="text-align: center; color: #ffcc00; font-weight: bold; margin-bottom: 10px;">
                    MASTERED
                </div>
            `}
            
            <div style="font-size: 0.8em; color: #aaa; font-style: italic; text-align: center; border-top: 1px solid #555; padding-top: 8px;">
                "${upgradeData.loreText}"
            </div>
        `;
        
        // Add hover effects and click handler
        if (!maxedOut) {
            if (canAfford) {
                card.addEventListener('mouseenter', () => {
                    card.style.transform = 'translateY(-2px)';
                    card.style.boxShadow = `0 4px 15px ${branch.color}40`;
                });
                
                card.addEventListener('mouseleave', () => {
                    card.style.transform = 'translateY(0)';
                    card.style.boxShadow = 'none';
                });
                
                card.addEventListener('click', () => {
                    this.purchaseUpgrade(branchKey, upgradeKey, upgradeData, branch, cost);
                });
            }
        }
        
        return card;
    }
    
    // Purchase an upgrade
    purchaseUpgrade(branchKey, upgradeKey, upgradeData, branch, cost) {
        // Check if can afford
        if (this.character.resources[branch.resource] < cost) {
            return;
        }
        
        // Initialize upgrade levels if not exists
        if (!this.character.upgradelevels) {
            this.character.upgradelevels = {};
        }
        if (!this.character.upgradelevels[branchKey]) {
            this.character.upgradelevels[branchKey] = {};
        }
        
        const currentLevel = this.character.upgradelevels[branchKey][upgradeKey] || 0;
        if (currentLevel >= upgradeData.maxLevel) return;
        
        // Deduct resources
        this.character.resources[branch.resource] -= cost;
        
        // Apply upgrade
        this.character.upgradelevels[branchKey][upgradeKey] = currentLevel + 1;
        
        // Apply stat increase based on type
        switch(upgradeData.statType) {
            case 'maxHp':
                this.character.maxHp += upgradeData.statIncrease;
                this.character.hp += upgradeData.statIncrease; // Also heal current HP
                break;
            case 'attack':
                this.character.attack += upgradeData.statIncrease;
                break;
            case 'defense':
                this.character.defense += upgradeData.statIncrease;
                break;
            case 'speed':
                this.character.speed += upgradeData.statIncrease;
                break;
            case 'inventorySize':
                this.character.inventorySize += upgradeData.statIncrease;
                break;
        }
        
        console.log(`Enhanced ${upgradeData.name} to level ${this.character.upgradelevels[branchKey][upgradeKey]}!`);
        
        // Show notification
        if (this.gameManager.uiManager) {
            this.gameManager.uiManager.showNotification(
                `Enhanced: ${upgradeData.name} (Level ${this.character.upgradelevels[branchKey][upgradeKey]})`, 
                3000
            );
        }
        
        // Dispatch character updated event to refresh UI
        document.dispatchEvent(new CustomEvent('character-updated'));
        
        // Refresh current branch display
        this.populateBranchUpgrades(this.currentBranch);
        this.gameManager.updateUI();
    }
    
    // Setup event listeners
    setupEventListeners() {
        // Branch tab switching
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('branch-button')) {
                this.switchBranch(e.target.dataset.branch);
            } else if (e.target.id === 'close-upgrades') {
                this.toggleUpgrades(false);
            }
        });
        
        // Keyboard shortcut
        document.addEventListener('keydown', (e) => {
            if (e.key === 'u' || e.key === 'U') {
                this.toggleUpgrades();
            }
        });
    }
    
    // Switch between upgrade branches
    switchBranch(branchKey) {
        // Update branch buttons
        document.querySelectorAll('.branch-button').forEach(btn => {
            btn.classList.remove('active');
        });
        
        document.querySelector(`[data-branch="${branchKey}"]`).classList.add('active');
        
        // Update current branch
        this.currentBranch = branchKey;
        
        // Populate upgrades for this branch
        this.populateBranchUpgrades(branchKey);
    }
    
    // Toggle upgrade UI
    toggleUpgrades(state = !this.isOpen) {
        // Don't open if character isn't available yet
        if (!this.character || !this.initialized) {
            console.warn('Cannot open upgrades - character not available yet');
            return;
        }
        
        this.isOpen = state;
        this.container.style.display = this.isOpen ? 'block' : 'none';
        
        if (this.isOpen) {
            // Populate current branch upgrades when opening
            this.populateBranchUpgrades(this.currentBranch);
            
            // Pause game
            if (this.gameManager) {
                this.gameManager.previousTimeScale = this.gameManager.timeScale;
                this.gameManager.timeScale = 0.1;
            }
        } else {
            // Resume game
            if (this.gameManager && this.gameManager.previousTimeScale) {
                this.gameManager.timeScale = this.gameManager.previousTimeScale;
            }
        }
    }
    
    // Get current stat value for display
    getCurrentStatValue(statType) {
        if (!this.character) return 0;
        
        switch(statType) {
            case 'maxHp': return this.character.maxHp;
            case 'attack': return this.character.attack;
            case 'defense': return this.character.defense;
            case 'speed': return this.character.speed.toFixed(1);
            case 'inventorySize': return this.character.inventorySize;
            default: return 0;
        }
    }
    
    // Format stat value for display
    formatStatValue(statType, value) {
        switch(statType) {
            case 'speed': return value.toFixed(1);
            default: return value;
        }
    }
    
    // Get resource color for display
    getResourceColor(resource) {
        const colors = {
            [RESOURCE_TYPES.BIOMASS]: '#88ff88',
            [RESOURCE_TYPES.SCRAP]: '#ffaa66',
            [RESOURCE_TYPES.WARPSTONE]: '#8888ff'
        };
        return colors[resource] || '#ffffff';
    }
}