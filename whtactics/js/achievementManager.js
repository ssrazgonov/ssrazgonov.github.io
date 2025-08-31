// Achievement Manager class
class AchievementManager {
    constructor(gridGameManager) {
        this.gridGameManager = gridGameManager;
        this.achievementListElement = null;
        this.achievementData = [
            {
                id: 'firstBlood',
                name: 'First Blood',
                description: 'Defeat your first enemy',
                reward: { combatPoints: 50, experience: 100 }
            },
            {
                id: 'veteran',
                name: 'Veteran',
                description: 'Defeat 5 enemies',
                reward: { combatPoints: 100, experience: 200, biomass: 10 }
            },
            {
                id: 'elite',
                name: 'Elite',
                description: 'Defeat 10 enemies',
                reward: { combatPoints: 200, experience: 400, scrap: 15 }
            },
            {
                id: 'legendary',
                name: 'Legendary',
                description: 'Defeat 20 enemies',
                reward: { combatPoints: 500, experience: 1000, warpstone: 10 }
            },
            {
                id: 'survivor',
                name: 'Survivor',
                description: 'Survive 3 defeats',
                reward: { combatPoints: 150, experience: 300 }
            }
        ];
    }

    // Create and show the achievement list UI
    showAchievementList() {
        // Create overlay
        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.7);
            z-index: 10000;
            display: flex;
            justify-content: center;
            align-items: center;
        `;

        // Create achievement list container
        const container = document.createElement('div');
        container.className = 'achievement-list wh40k-panel';
        container.style.cssText = `
            width: 90%;
            max-width: 600px;
            max-height: 80vh;
            background: #1a1a1a;
            border: 2px solid #444;
            border-radius: 5px;
            padding: 20px;
            color: #ddd;
            overflow-y: auto;
            position: relative;
            box-shadow: 0 0 20px rgba(0, 0, 0, 0.8);
        `;

        // Create header
        const header = document.createElement('div');
        header.style.cssText = `
            text-align: center;
            margin-bottom: 20px;
            border-bottom: 1px solid #444;
            padding-bottom: 10px;
        `;
        
        const title = document.createElement('h2');
        title.textContent = 'Achievements';
        title.style.cssText = `
            font-family: 'Cinzel', serif;
            color: #ffaa00;
            margin: 0 0 10px 0;
            text-shadow: 0 0 5px rgba(255, 170, 0, 0.5);
        `;
        
        header.appendChild(title);
        
        // Create close button
        const closeButton = document.createElement('button');
        closeButton.textContent = '×';
        closeButton.style.cssText = `
            position: absolute;
            top: 10px;
            right: 10px;
            background: none;
            border: none;
            color: #aaa;
            font-size: 24px;
            cursor: pointer;
            padding: 0;
            width: 30px;
            height: 30px;
            line-height: 30px;
            text-align: center;
        `;
        closeButton.addEventListener('click', () => {
            document.body.removeChild(overlay);
        });
        
        // Create achievement list
        const achievementList = document.createElement('div');
        achievementList.className = 'achievement-items';
        this.achievementListElement = achievementList;
        
        // Add elements to container
        container.appendChild(closeButton);
        container.appendChild(header);
        container.appendChild(achievementList);
        
        // Add container to overlay
        overlay.appendChild(container);
        
        // Add overlay to body
        document.body.appendChild(overlay);
        
        // Populate achievement list
        this.updateAchievementList();
    }
    
    // Update the achievement list with current status
    updateAchievementList() {
        if (!this.achievementListElement) return;
        
        // Clear current list
        this.achievementListElement.innerHTML = '';
        
        // Add each achievement to the list
        this.achievementData.forEach(achievement => {
            const isUnlocked = this.gridGameManager.achievements[achievement.id] === true;
            
            const achievementItem = document.createElement('div');
            achievementItem.className = `achievement-item ${isUnlocked ? 'unlocked' : 'locked'}`;
            achievementItem.style.cssText = `
                display: flex;
                margin-bottom: 15px;
                padding: 10px;
                background: ${isUnlocked ? 'rgba(255, 170, 0, 0.1)' : 'rgba(50, 50, 50, 0.3)'};
                border: 1px solid ${isUnlocked ? '#ffaa00' : '#444'};
                border-radius: 5px;
                transition: all 0.3s ease;
            `;
            
            // Achievement icon
            const icon = document.createElement('div');
            icon.className = 'achievement-icon';
            icon.style.cssText = `
                width: 50px;
                height: 50px;
                min-width: 50px;
                background: ${isUnlocked ? 'linear-gradient(45deg, #ffaa00, #ffcc00)' : '#333'};
                border-radius: 50%;
                display: flex;
                justify-content: center;
                align-items: center;
                margin-right: 15px;
                box-shadow: ${isUnlocked ? '0 0 10px rgba(255, 170, 0, 0.5)' : 'none'};
            `;
            
            const iconText = document.createElement('span');
            iconText.textContent = isUnlocked ? '🏆' : '?';
            iconText.style.cssText = `
                font-size: ${isUnlocked ? '24px' : '20px'};
                color: ${isUnlocked ? '#000' : '#777'};
            `;
            
            icon.appendChild(iconText);
            
            // Achievement info
            const info = document.createElement('div');
            info.className = 'achievement-info';
            info.style.cssText = `
                flex-grow: 1;
            `;
            
            const name = document.createElement('div');
            name.className = 'achievement-name';
            name.textContent = achievement.name;
            name.style.cssText = `
                font-weight: bold;
                font-size: 16px;
                color: ${isUnlocked ? '#ffaa00' : '#aaa'};
                margin-bottom: 5px;
            `;
            
            const description = document.createElement('div');
            description.className = 'achievement-description';
            description.textContent = achievement.description;
            description.style.cssText = `
                font-size: 14px;
                color: ${isUnlocked ? '#ddd' : '#777'};
                margin-bottom: 5px;
            `;
            
            // Reward info
            const reward = document.createElement('div');
            reward.className = 'achievement-reward';
            reward.style.cssText = `
                font-size: 12px;
                color: ${isUnlocked ? '#ffcc00' : '#666'};
            `;
            
            let rewardText = 'Reward: ';
            if (achievement.reward.combatPoints) {
                rewardText += `${achievement.reward.combatPoints} Combat Points`;
            }
            if (achievement.reward.experience) {
                rewardText += `, ${achievement.reward.experience} XP`;
            }
            if (achievement.reward.biomass) {
                rewardText += `, ${achievement.reward.biomass} Biomass`;
            }
            if (achievement.reward.scrap) {
                rewardText += `, ${achievement.reward.scrap} Scrap`;
            }
            if (achievement.reward.warpstone) {
                rewardText += `, ${achievement.reward.warpstone} Warpstone`;
            }
            
            reward.textContent = rewardText;
            
            // Add elements to info
            info.appendChild(name);
            info.appendChild(description);
            info.appendChild(reward);
            
            // Add elements to achievement item
            achievementItem.appendChild(icon);
            achievementItem.appendChild(info);
            
            // Add achievement item to list
            this.achievementListElement.appendChild(achievementItem);
        });
    }
}

// Export the class
window.AchievementManager = AchievementManager;