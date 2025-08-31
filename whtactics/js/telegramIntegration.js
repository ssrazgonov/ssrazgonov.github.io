/**
 * Telegram Web App Integration
 * This script handles integration with Telegram Mini Apps (Web Apps) API
 */

class TelegramIntegration {
    constructor() {
        // Reference to Telegram WebApp API
        this.tg = window.Telegram?.WebApp;
        this.isInTelegram = !!this.tg;
        this.userData = null;
        
        // Initialize if in Telegram
        if (this.isInTelegram) {
            this.init();
        } else {
            console.log('Not running in Telegram Web App environment');
        }
    }
    
    /**
     * Initialize Telegram integration
     */
    init() {
        console.log('Initializing Telegram Web App integration...');
        
        // Expand to fullscreen mode
        this.tg.expand();
        
        // Get user data
        this.userData = this.tg.initDataUnsafe?.user || null;
        
        // Set up event listeners
        this.setupEventListeners();
        
        // Notify Telegram that the Web App is ready
        this.tg.ready();
        
        console.log('Telegram Web App integration initialized successfully!');
    }
    
    /**
     * Set up Telegram-specific event listeners
     */
    setupEventListeners() {
        // Handle back button if available
        if (this.tg.BackButton) {
            try {
                this.tg.BackButton.onClick(() => {
                    // Check current game state and handle back action
                    this.handleBackButton();
                });
            } catch (e) {
                console.log('BackButton API error:', e.message);
                // Create a custom back button if needed
                this.createCustomBackButton();
            }
        } else {
            // Create a custom back button if BackButton API is not available
            this.createCustomBackButton();
        }
        
        // Handle main button if available
        if (this.tg.MainButton) {
            this.tg.MainButton.onClick(() => {
                // Handle main button action based on current game state
                this.handleMainButton();
            });
        }
        
        // Handle viewport changes
        this.tg.onEvent('viewportChanged', this.handleViewportChanged.bind(this));
    }
    
    /**
     * Create a custom back button when Telegram's BackButton API is not available
     */
    createCustomBackButton() {
        // Check if custom back button already exists
        if (document.getElementById('customBackButton')) return;
        
        // Create a custom back button
        const backButton = document.createElement('button');
        backButton.id = 'customBackButton';
        backButton.className = 'custom-back-button';
        backButton.innerHTML = '&larr; Back';
        backButton.style.position = 'fixed';
        backButton.style.top = '10px';
        backButton.style.left = '10px';
        backButton.style.zIndex = '9999';
        backButton.style.padding = '8px 12px';
        backButton.style.backgroundColor = '#2481cc';
        backButton.style.color = 'white';
        backButton.style.border = 'none';
        backButton.style.borderRadius = '4px';
        backButton.style.cursor = 'pointer';
        backButton.style.display = 'none'; // Hidden by default
        
        // Add click event listener
        backButton.addEventListener('click', () => {
            this.handleBackButton();
        });
        
        // Add to document body
        document.body.appendChild(backButton);
    }
    
    /**
     * Handle back button press in Telegram
     */
    handleBackButton() {
        // Get current game state
        const inMainMenu = document.getElementById('mainMenu').style.display !== 'none';
        const inGameSetup = document.getElementById('gameSetup').style.display !== 'none';
        const inGame = document.getElementById('gameContainer').style.display !== 'none';
        
        if (inGame) {
            // Show confirmation dialog before exiting game
            if (confirm('Are you sure you want to exit the game? Your progress will be saved.')) {
                // Save game state if needed
                this.saveGameState();
                
                // Return to main menu
                document.getElementById('gameContainer').style.display = 'none';
                document.getElementById('mainMenu').style.display = 'block';
                
                // Hide back button when at main menu
                if (this.tg.BackButton) {
                    try {
                        this.tg.BackButton.hide();
                    } catch (e) {
                        console.log('BackButton API error:', e.message);
                    }
                }
                
                // Hide custom back button if it exists
                const customBackButton = document.getElementById('customBackButton');
                if (customBackButton) {
                    customBackButton.style.display = 'none';
                }
            }
        } else if (inGameSetup) {
            // Return to main menu from setup
            document.getElementById('gameSetup').style.display = 'none';
            document.getElementById('mainMenu').style.display = 'block';
            
            // Hide back button when at main menu
            if (this.tg.BackButton) {
                try {
                    this.tg.BackButton.hide();
                } catch (e) {
                    console.log('BackButton API error:', e.message);
                }
            }
            
            // Hide custom back button if it exists
            const customBackButton = document.getElementById('customBackButton');
            if (customBackButton) {
                customBackButton.style.display = 'none';
            }
        } else if (inMainMenu) {
            // At main menu, close the Web App
            this.tg.close();
        }
    }
    
    /**
     * Handle main button press in Telegram
     */
    handleMainButton() {
        // Implement based on current game state
        const inMainMenu = document.getElementById('mainMenu').style.display !== 'none';
        const inGameSetup = document.getElementById('gameSetup').style.display !== 'none';
        
        if (inMainMenu) {
            // Start game setup
            document.getElementById('startGameBtn').click();
        } else if (inGameSetup) {
            // Start the game
            window.startGridGame();
            
            // Show back button when in game
            if (this.tg.BackButton) {
                try {
                    this.tg.BackButton.show();
                } catch (e) {
                    console.log('BackButton API error:', e.message);
                }
            }
            
            // Show custom back button if it exists
            const customBackButton = document.getElementById('customBackButton');
            if (customBackButton) {
                customBackButton.style.display = 'block';
            }
        }
    }
    
    /**
     * Handle viewport changes in Telegram
     */
    handleViewportChanged(event) {
        // Adjust game layout based on new viewport size
        this.adaptLayoutForTelegram();
    }
    
    /**
     * Adapt game layout for Telegram Web App
     */
    adaptLayoutForTelegram() {
        // Get viewport dimensions
        const viewportHeight = this.tg.viewportHeight;
        const viewportWidth = this.tg.viewportStableWidth || this.tg.viewportWidth;
        
        // Show custom back button if needed
        const customBackButton = document.getElementById('customBackButton');
        if (customBackButton) {
            const inGame = document.getElementById('gameContainer').style.display !== 'none';
            const inGameSetup = document.getElementById('gameSetup').style.display !== 'none';
            const inMainMenu = document.getElementById('mainMenu').style.display !== 'none';
            
            // Show custom back button only in game or setup screens
            if (inGame || inGameSetup) {
                customBackButton.style.display = 'block';
            } else {
                customBackButton.style.display = 'none';
            }
        }
        
        // Adjust game container size
        const gameContainer = document.getElementById('gameContainer');
        if (gameContainer) {
            gameContainer.style.width = `${viewportWidth}px`;
            gameContainer.style.height = `${viewportHeight}px`;
        }
        
        // Adjust canvas size if needed
        const canvas = document.getElementById('gameCanvas');
        if (canvas) {
            // Recalculate canvas size while maintaining aspect ratio
            const aspectRatio = canvas.width / canvas.height;
            let newWidth = viewportWidth;
            let newHeight = newWidth / aspectRatio;
            
            // Ensure canvas fits within viewport
            if (newHeight > viewportHeight) {
                newHeight = viewportHeight;
                newWidth = newHeight * aspectRatio;
            }
            
            canvas.style.width = `${newWidth}px`;
            canvas.style.height = `${newHeight}px`;
            
            // Notify game manager about resize if available
            if (window.gridGameManager) {
                window.gridGameManager.handleResize();
            }
        }
    }
    
    /**
     * Show Telegram main button with custom text
     */
    showMainButton(text) {
        if (this.tg.MainButton) {
            this.tg.MainButton.setText(text);
            this.tg.MainButton.show();
        }
    }
    
    /**
     * Hide Telegram main button
     */
    hideMainButton() {
        if (this.tg.MainButton) {
            this.tg.MainButton.hide();
        }
    }
    
    /**
     * Save game state to Telegram Cloud Storage
     */
    saveGameState() {
        // Only proceed if in Telegram and game manager exists
        if (!this.isInTelegram || !window.gridGameManager) return;
        
        try {
            // Get game state from game manager
            const gameState = {
                playerPosition: window.gridGameManager.playerPosition,
                playerHealth: window.gridGameManager.playerHealth,
                discoveredEnemies: window.gridGameManager.discoveredEnemies,
                defeatedEnemies: window.gridGameManager.defeatedEnemies,
                builtStructures: window.gridGameManager.builtStructures,
                turnCounter: window.gridGameManager.turnCounter,
                resources: window.gridGameManager.resources,
                relics: window.gridGameManager.relics,
                discoveredRelics: window.gridGameManager.discoveredRelics,
                // Save achievements and combat stats
                achievements: window.gridGameManager.achievements,
                combatStats: window.gridGameManager.combatStats,
                timestamp: Date.now()
            };
            
            // Convert to string for storage
            const gameStateString = JSON.stringify(gameState);
            
            // Use Telegram Cloud Storage API if available
            if (this.tg.CloudStorage) {
                try {
                    this.tg.CloudStorage.setItem('gameState', gameStateString, (error, success) => {
                        if (error) {
                            console.error('Telegram Cloud Storage error:', error);
                            // Fallback to localStorage
                            localStorage.setItem('telegramGameState', gameStateString);
                        } else {
                            console.log('Game state saved to Telegram Cloud Storage');
                        }
                    });
                } catch (e) {
                    console.error('CloudStorage API error:', e.message);
                    // Fallback to localStorage on error
                    localStorage.setItem('telegramGameState', gameStateString);
                    console.log('Game state saved to localStorage (CloudStorage API error)');
                }
            } else {
                // Fallback to localStorage if Cloud Storage API is not available
                localStorage.setItem('telegramGameState', gameStateString);
                console.log('Game state saved to localStorage (Telegram Cloud Storage not available)');
            }
        } catch (error) {
            console.error('Error saving game state:', error);
        }
    }
    
    /**
     * Load game state from Telegram Cloud Storage
     * @param {Function} callback - Optional callback function(success, error)
     */
    loadGameState(callback) {
        // Only proceed if in Telegram and game manager exists
        if (!this.isInTelegram || !window.gridGameManager) {
            if (callback) callback(false, 'Not in Telegram or game manager not initialized');
            return false;
        }
        
        // Function to apply game state once retrieved
        const applyGameState = (gameStateString) => {
            if (!gameStateString) {
                console.log('No saved game state found');
                if (callback) callback(false, 'No saved game state found');
                return false;
            }
            
            try {
                // Parse saved state
                const gameState = JSON.parse(gameStateString);
                
                // Apply saved state to game manager
                window.gridGameManager.playerPosition = gameState.playerPosition;
                window.gridGameManager.playerHealth = gameState.playerHealth;
                window.gridGameManager.discoveredEnemies = gameState.discoveredEnemies;
                window.gridGameManager.defeatedEnemies = gameState.defeatedEnemies;
                window.gridGameManager.builtStructures = gameState.builtStructures;
                
                // Apply additional state properties if they exist
                if (gameState.turnCounter) window.gridGameManager.turnCounter = gameState.turnCounter;
                if (gameState.resources) window.gridGameManager.resources = gameState.resources;
                if (gameState.relics) window.gridGameManager.relics = gameState.relics;
                if (gameState.discoveredRelics) window.gridGameManager.discoveredRelics = gameState.discoveredRelics;
                
                // Load achievements and combat stats if they exist
                if (gameState.achievements) window.gridGameManager.achievements = gameState.achievements;
                if (gameState.combatStats) window.gridGameManager.combatStats = gameState.combatStats;
                
                // Redraw game
                window.gridGameManager.drawGrid();
                
                console.log('Game state loaded successfully');
                if (callback) callback(true);
                return true;
            } catch (error) {
                console.error('Error parsing game state:', error);
                if (callback) callback(false, error);
                return false;
            }
        };
        
        // Try to load from Telegram Cloud Storage first
        if (this.tg.CloudStorage) {
            try {
                this.tg.CloudStorage.getItem('gameState', (error, value) => {
                    if (error) {
                        console.error('Telegram Cloud Storage error:', error);
                    // Fallback to localStorage
                    const localState = localStorage.getItem('telegramGameState');
                    return applyGameState(localState);
                } else {
                    return applyGameState(value);
                }
            });
            } catch (e) {
                console.error('CloudStorage API error:', e.message);
                // Fallback to localStorage on error
                const localState = localStorage.getItem('telegramGameState');
                return applyGameState(localState);
            }
        } else {
            // Fallback to localStorage if Cloud Storage API is not available
            const localState = localStorage.getItem('telegramGameState');
            return applyGameState(localState);
        }
    }
    
    /**
     * Check if user has a saved game
     * @param {Function} callback - Optional callback function(hasSavedGame)
     * @returns {Boolean} - Returns result directly if using localStorage, or via callback if using Cloud Storage
     */
    hasSavedGame(callback) {
        // If not in Telegram, return false
        if (!this.isInTelegram) {
            if (callback) callback(false);
            return false;
        }
        
        try {
            // Check Telegram Cloud Storage if available
            if (this.tg.CloudStorage) {
                try {
                    this.tg.CloudStorage.getItem('gameState', (error, value) => {
                        if (error || !value) {
                            // Fallback to localStorage
                            const hasLocalSave = !!localStorage.getItem('telegramGameState');
                            if (callback) callback(hasLocalSave);
                            return hasLocalSave;
                        } else {
                            if (callback) callback(true);
                            return true;
                        }
                    });
                    // Return undefined since we're using callback
                    return undefined;
                } catch (e) {
                    console.log('CloudStorage API error:', e.message);
                    // Fallback to localStorage on error
                    const hasLocalSave = !!localStorage.getItem('telegramGameState');
                    if (callback) callback(hasLocalSave);
                    return hasLocalSave;
                }
            } else {
                // Fallback to localStorage
                const hasLocalSave = !!localStorage.getItem('telegramGameState');
                if (callback) callback(hasLocalSave);
                return hasLocalSave;
            }
        } catch (e) {
            console.log('Error checking saved game:', e.message);
            // Fallback to localStorage on any error
            const hasLocalSave = !!localStorage.getItem('telegramGameState');
            if (callback) callback(hasLocalSave);
            return hasLocalSave;
        }
    }
    
    /**
     * Get Telegram user data
     */
    getUserData() {
        return this.userData;
    }
}

// Create global instance
window.telegramIntegration = new TelegramIntegration();

// Override menu manager methods to integrate with Telegram
document.addEventListener('DOMContentLoaded', () => {
    // Wait for menu manager to be initialized
    setTimeout(() => {
        if (window.menuManager && window.telegramIntegration.isInTelegram) {
            // Store original methods
            const originalShowMainMenu = window.menuManager.showMainMenu;
            const originalShowGameSetup = window.menuManager.showGameSetup;
            
            // Override showMainMenu
            window.menuManager.showMainMenu = function() {
                // Call original method
                originalShowMainMenu.call(window.menuManager);
                
                // Update Telegram UI
                if (window.telegramIntegration.isInTelegram) {
                    // Hide back button at main menu
                    if (window.telegramIntegration.tg.BackButton) {
                        try {
                            window.telegramIntegration.tg.BackButton.hide();
                        } catch (e) {
                            console.log('BackButton API error in showMainMenu override:', e.message);
                        }
                    }
                    
                    // Hide custom back button if it exists
                    const customBackButton = document.getElementById('customBackButton');
                    if (customBackButton) {
                        customBackButton.style.display = 'none';
                    }
                    
                    // Show main button for starting game
                    window.telegramIntegration.showMainButton('Start Game');
                    
                    // Check for saved game
                    if (window.telegramIntegration.hasSavedGame()) {
                        // Add continue button to menu
                        const menuButtons = document.querySelector('.menu-buttons');
                        if (menuButtons && !document.getElementById('continueTelegramGameBtn')) {
                            const continueBtn = document.createElement('button');
                            continueBtn.id = 'continueTelegramGameBtn';
                            continueBtn.className = 'menu-button';
                            continueBtn.textContent = 'Continue Saved Game';
                            continueBtn.addEventListener('click', () => {
                                // Start game and load saved state
                                window.startGridGame();
                                window.telegramIntegration.loadGameState();
                            });
                            menuButtons.insertBefore(continueBtn, document.getElementById('infoBtn'));
                        }
                    }
                }
            };
            
            // Override showGameSetup
            window.menuManager.showGameSetup = function() {
                // Call original method
                originalShowGameSetup.call(window.menuManager);
                
                // Update Telegram UI
                if (window.telegramIntegration.isInTelegram) {
                    // Show back button in setup
                    if (window.telegramIntegration.tg.BackButton) {
                        try {
                            window.telegramIntegration.tg.BackButton.show();
                        } catch (e) {
                            console.log('BackButton API error in showGameSetup override:', e.message);
                        }
                    }
                    
                    // Show custom back button if it exists
                    const customBackButton = document.getElementById('customBackButton');
                    if (customBackButton) {
                        customBackButton.style.display = 'block';
                    }
                    
                    // Update main button text
                    window.telegramIntegration.showMainButton('Begin Battle');
                }
            };
        }
    }, 500); // Short delay to ensure menu manager is initialized
});