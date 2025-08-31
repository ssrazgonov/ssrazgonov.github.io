// Main game initialization - Grid System
document.addEventListener('DOMContentLoaded', () => {
    console.log('Warhammer 40K Grid Tactics initializing...');
    
    // Initialize menu system
    const menuManager = new MenuManager();
    
    // Store references
    window.menuManager = menuManager;
    window.gridGameManager = null;
    
    // Check if running in Telegram
    const isInTelegram = !!window.Telegram?.WebApp;
    
    // Override the startGame function to use grid system
    window.startGridGame = function() {
        console.log('Starting grid-based game...');
        
        // Hide menu screens
        document.getElementById('gameLoader').style.display = 'none';
        document.getElementById('mainMenu').style.display = 'none';
        document.getElementById('gameSetup').style.display = 'none';
        
        // Show game container
        document.getElementById('gameContainer').style.display = 'flex';
        
        // Initialize grid game manager
        window.gridGameManager = new GridGameManager();
        window.gridGameManager.init();
        
        // If in Telegram, show back button and adapt layout
        if (isInTelegram && window.telegramIntegration) {
            window.telegramIntegration.tg.BackButton.show();
            window.telegramIntegration.adaptLayoutForTelegram();
            
            // Hide main button during gameplay
            window.telegramIntegration.hideMainButton();
            
            // Set up auto-save at regular intervals
        const autoSaveInterval = setInterval(() => {
            if (window.gridGameManager) {
                window.telegramIntegration.saveGameState();
                console.log('Auto-saved game state');
                
                // Override endTurn method if not already done
                if (window.gridGameManager && !window.gridGameManager._telegramEndTurnOverridden) {
                    const originalEndTurn = window.gridGameManager.endTurn;
                    window.gridGameManager.endTurn = function() {
                        // Call original method
                        originalEndTurn.apply(this, arguments);
                        
                        // Save game state after turn ends
                        window.telegramIntegration.saveGameState();
                    };
                    window.gridGameManager._telegramEndTurnOverridden = true;
                }
            } else {
                // Clear interval if game manager no longer exists
                clearInterval(autoSaveInterval);
            }
        }, 30000); // 30000 ms = 30 seconds
        }
        
        console.log('Grid game initialized successfully!');
    };
    
    // Add window resize handler for Telegram
    window.addEventListener('resize', () => {
        if (isInTelegram && window.telegramIntegration && window.gridGameManager) {
            window.telegramIntegration.adaptLayoutForTelegram();
        }
    });
});

// Show game instructions
function showInstructions(content) {
    // Remove existing modal if present
    const existingModal = document.getElementById('instructionsModal');
    if (existingModal) {
        document.body.removeChild(existingModal);
    }
    
    // Create modal container
    const modal = document.createElement('div');
    modal.id = 'instructionsModal';
    modal.style.position = 'fixed';
    modal.style.top = '0';
    modal.style.left = '0';
    modal.style.width = '100%';
    modal.style.height = '100%';
    modal.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    modal.style.display = 'flex';
    modal.style.justifyContent = 'center';
    modal.style.alignItems = 'center';
    modal.style.zIndex = '1000';
    
    // Create modal content
    const modalContent = document.createElement('div');
    modalContent.style.backgroundColor = '#1c1c20';
    modalContent.style.color = '#e0e0e0';
    modalContent.style.padding = '20px';
    modalContent.style.borderRadius = '5px';
    modalContent.style.maxWidth = '600px';
    modalContent.style.maxHeight = '80%';
    modalContent.style.overflowY = 'auto';
    modalContent.innerHTML = content;
    
    // Create close button
    const closeButton = document.createElement('button');
    closeButton.textContent = 'Close';
    closeButton.style.marginTop = '20px';
    closeButton.style.padding = '8px 16px';
    closeButton.style.backgroundColor = '#bb0000';
    closeButton.style.color = 'white';
    closeButton.style.border = 'none';
    closeButton.style.borderRadius = '4px';
    closeButton.style.cursor = 'pointer';
    
    closeButton.addEventListener('click', () => {
        document.body.removeChild(modal);
    });
    
    // Append elements
    modalContent.appendChild(closeButton);
    modal.appendChild(modalContent);
    document.body.appendChild(modal);
    
    // Close modal when clicking outside content
    modal.addEventListener('click', (event) => {
        if (event.target === modal) {
            document.body.removeChild(modal);
        }
    });
}