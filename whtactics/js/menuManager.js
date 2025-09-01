// Menu Manager class
class MenuManager {
    constructor() {
        this.selectedEquipment = null;
        this.selectedSeal = null;
        
        // Game configuration based on choices
        this.gameConfig = {
            startingEquipment: 'medkit', // 'medkit' or 'revive'
            emperorsSeal: 'shield', // only 'shield' seal available
            sealModifiers: {
                shield: {
                    healthMultiplier: 1.25,  // +25% health
                    shieldMultiplier: 1.50,  // +50% shield
                    resourceMultiplier: 0.85 // -15% resources
                }
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
        
        // Equipment selection
        document.querySelectorAll('.choice-item').forEach(item => {
            item.addEventListener('click', () => {
                this.selectEquipment(item.dataset.choice);
            });
        });
        
        // Seal selection
        document.querySelectorAll('.seal-item').forEach(item => {
            item.addEventListener('click', () => {
                this.selectSeal(item.dataset.seal);
            });
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
    
    selectEquipment(equipmentType) {
        this.selectedEquipment = equipmentType;
        this.gameConfig.startingEquipment = equipmentType;
        
        // Update UI
        document.querySelectorAll('.choice-item').forEach(item => {
            item.classList.remove('selected');
        });
        
        document.querySelector(`[data-choice="${equipmentType}"]`).classList.add('selected');
    }
    
    selectSeal(sealType) {
        this.selectedSeal = sealType;
        this.gameConfig.emperorsSeal = sealType;
        
        // Update UI
        document.querySelectorAll('.seal-item').forEach(item => {
            item.classList.remove('selected');
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
        
        console.log('Warhammer 40K Grid Tactics started with config:', this.gameConfig);
    }
    
    // Get game configuration
    getGameConfig() {
        return this.gameConfig;
    }
}