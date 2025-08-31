/**
 * Telegram Web App Test Script
 * This script helps test Telegram integration functionality
 */

class TelegramTest {
    constructor() {
        this.testResults = [];
        this.testContainer = null;
        this.setupTestUI();
    }

    /**
     * Set up test UI
     */
    setupTestUI() {
        // Create test container
        this.testContainer = document.createElement('div');
        this.testContainer.id = 'telegram-test-container';
        this.testContainer.style.position = 'fixed';
        this.testContainer.style.bottom = '10px';
        this.testContainer.style.right = '10px';
        this.testContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        this.testContainer.style.color = 'white';
        this.testContainer.style.padding = '10px';
        this.testContainer.style.borderRadius = '5px';
        this.testContainer.style.zIndex = '9999';
        this.testContainer.style.maxWidth = '300px';
        this.testContainer.style.maxHeight = '200px';
        this.testContainer.style.overflow = 'auto';
        this.testContainer.style.fontSize = '12px';
        this.testContainer.style.fontFamily = 'monospace';
        
        // Add test button
        const testButton = document.createElement('button');
        testButton.textContent = 'Run Telegram Tests';
        testButton.style.marginBottom = '10px';
        testButton.style.padding = '5px';
        testButton.style.width = '100%';
        testButton.addEventListener('click', () => this.runTests());
        
        // Add close button
        const closeButton = document.createElement('button');
        closeButton.textContent = 'Close';
        closeButton.style.marginBottom = '10px';
        closeButton.style.padding = '5px';
        closeButton.style.width = '100%';
        closeButton.addEventListener('click', () => {
            document.body.removeChild(this.testContainer);
        });
        
        // Add results container
        const resultsContainer = document.createElement('div');
        resultsContainer.id = 'telegram-test-results';
        
        // Append elements
        this.testContainer.appendChild(testButton);
        this.testContainer.appendChild(closeButton);
        this.testContainer.appendChild(resultsContainer);
        
        // Add to body when DOM is ready
        if (document.body) {
            document.body.appendChild(this.testContainer);
        } else {
            document.addEventListener('DOMContentLoaded', () => {
                document.body.appendChild(this.testContainer);
            });
        }
    }
    
    /**
     * Run all tests
     */
    runTests() {
        this.testResults = [];
        this.logResult('Starting Telegram integration tests...');
        
        // Test if running in Telegram environment
        this.testTelegramEnvironment();
        
        // Test Telegram API availability
        this.testTelegramAPI();
        
        // Test save/load functionality
        this.testSaveLoadFunctionality();
        
        // Test UI adaptation
        this.testUIAdaptation();
        
        // Display final results
        this.displayResults();
    }
    
    /**
     * Test if running in Telegram environment
     */
    testTelegramEnvironment() {
        const isInTelegram = window.telegramIntegration && window.telegramIntegration.isInTelegram;
        this.logResult(`Running in Telegram: ${isInTelegram ? 'YES' : 'NO'}`);
        
        if (isInTelegram) {
            this.logResult('✅ Telegram environment detected');
        } else {
            this.logResult('⚠️ Not running in Telegram environment');
            this.logResult('ℹ️ Some tests will be skipped');
        }
    }
    
    /**
     * Test Telegram API availability
     */
    testTelegramAPI() {
        if (!window.telegramIntegration || !window.telegramIntegration.isInTelegram) {
            this.logResult('⏩ Skipping Telegram API test (not in Telegram)');
            return;
        }
        
        const tg = window.telegramIntegration.tg;
        
        if (tg) {
            this.logResult('✅ Telegram WebApp API available');
            
            // Check specific API features
            if (tg.MainButton) this.logResult('✅ MainButton API available');
            if (tg.BackButton) this.logResult('✅ BackButton API available');
            if (tg.CloudStorage) {
                this.logResult('✅ CloudStorage API available');
            } else {
                this.logResult('⚠️ CloudStorage API not available');
            }
        } else {
            this.logResult('❌ Telegram WebApp API not available');
        }
    }
    
    /**
     * Test save/load functionality
     */
    testSaveLoadFunctionality() {
        if (!window.telegramIntegration) {
            this.logResult('⏩ Skipping save/load test (telegramIntegration not found)');
            return;
        }
        
        // Test save function
        try {
            window.telegramIntegration.saveGameState();
            this.logResult('✅ Game state saved successfully');
        } catch (error) {
            this.logResult(`❌ Error saving game state: ${error.message}`);
        }
        
        // Test has saved game function
        try {
            const hasSavedGame = window.telegramIntegration.hasSavedGame();
            this.logResult(`✅ Has saved game check: ${hasSavedGame !== undefined ? hasSavedGame : 'Using callback'}`);
            
            // Test with callback
            window.telegramIntegration.hasSavedGame((result) => {
                this.logResult(`✅ Has saved game (callback): ${result}`);
            });
        } catch (error) {
            this.logResult(`❌ Error checking saved game: ${error.message}`);
        }
    }
    
    /**
     * Test UI adaptation
     */
    testUIAdaptation() {
        if (!window.telegramIntegration || !window.telegramIntegration.isInTelegram) {
            this.logResult('⏩ Skipping UI adaptation test (not in Telegram)');
            return;
        }
        
        // Check if body has telegram class
        const hasClass = document.body.classList.contains('in-telegram');
        this.logResult(`Body has 'in-telegram' class: ${hasClass ? 'YES' : 'NO'}`);
        
        // Test viewport dimensions
        const viewportWidth = window.telegramIntegration.tg.viewportStableWidth || window.telegramIntegration.tg.viewportWidth;
        const viewportHeight = window.telegramIntegration.tg.viewportHeight;
        
        this.logResult(`Telegram viewport: ${viewportWidth}x${viewportHeight}`);
        
        // Test adaptation function
        try {
            window.telegramIntegration.adaptLayoutForTelegram();
            this.logResult('✅ Layout adaptation function executed');
        } catch (error) {
            this.logResult(`❌ Error adapting layout: ${error.message}`);
        }
    }
    
    /**
     * Log a test result
     */
    logResult(message) {
        this.testResults.push(message);
        console.log(`[Telegram Test] ${message}`);
    }
    
    /**
     * Display test results in UI
     */
    displayResults() {
        const resultsContainer = document.getElementById('telegram-test-results');
        if (!resultsContainer) return;
        
        resultsContainer.innerHTML = '';
        
        this.testResults.forEach(result => {
            const resultElement = document.createElement('div');
            resultElement.textContent = result;
            resultElement.style.marginBottom = '5px';
            resultsContainer.appendChild(resultElement);
        });
    }
}

// Initialize test tool when script is loaded
window.telegramTest = new TelegramTest();