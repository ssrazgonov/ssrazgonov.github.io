// Hero Upgrade System for Warhammer 40K Grid Tactics
class HeroUpgrade {
    constructor(base) {
        this.base = base;
        this.upgrades = HERO_UPGRADES;
        this.purchasedUpgrades = [];
        this.heroLevel = 1;
        this.maxHeroLevel = 10;
        this.experience = 0;
        this.experienceToNext = 100;
        this.skillPoints = 0;
    }

    // Purchase an upgrade
    purchaseUpgrade(upgradeType) {
        const upgrade = this.upgrades[upgradeType];
        if (!upgrade) return false;

        // Check if already purchased
        if (this.purchasedUpgrades.includes(upgradeType)) return false;

        // Check if we can afford it
        if (!this.base.canAfford(upgrade.cost)) return false;

        // Pay the cost
        this.base.spendResources(upgrade.cost);

        // Add upgrade
        this.purchasedUpgrades.push(upgradeType);
        return true;
    }

    // Apply upgrade effects to character
    applyUpgrades(character) {
        for (const upgradeType of this.purchasedUpgrades) {
            const upgrade = this.upgrades[upgradeType];
            if (!upgrade) continue;

            switch (upgrade.effect) {
                case 'attackBoost':
                    character.attack += upgrade.value;
                    break;
                case 'defenseBoost':
                    character.defense += upgrade.value;
                    break;
                case 'healthBoost':
                    character.maxHealth += upgrade.value;
                    character.health = Math.min(character.health, character.maxHealth);
                    break;
                case 'speedBoost':
                    character.speed += upgrade.value;
                    break;
                case 'allStatsBoost':
                    character.attack += upgrade.value;
                    character.defense += upgrade.value;
                    character.maxHealth += upgrade.value * 10;
                    character.speed += upgrade.value * 0.1;
                    break;
            }
        }
    }

    // Gain experience
    gainExperience(amount) {
        this.experience += amount;
        
        while (this.experience >= this.experienceToNext && this.heroLevel < this.maxHeroLevel) {
            this.levelUp();
        }
    }

    // Level up hero
    levelUp() {
        this.experience -= this.experienceToNext;
        this.heroLevel++;
        this.skillPoints += 2;
        this.experienceToNext = Math.floor(this.experienceToNext * 1.5);
        
        // Show level up notification
        this.showLevelUpNotification();
    }

    // Show level up notification
    showLevelUpNotification() {
        const notification = document.createElement('div');
        notification.className = 'level-up-notification';
        notification.innerHTML = `
            <div class="notification-content">
                <h3>🎉 LEVEL UP! 🎉</h3>
                <p>Hero reached level ${this.heroLevel}!</p>
                <p>+2 Skill Points gained</p>
            </div>
        `;
        
        notification.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: linear-gradient(45deg, #bb0000, #ff6600);
            color: white;
            padding: 20px;
            border-radius: 10px;
            border: 3px solid #ffcc00;
            box-shadow: 0 0 30px rgba(255, 204, 0, 0.5);
            z-index: 1000;
            animation: levelUpPulse 2s ease-in-out;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 3000);
    }

    // Get available upgrades
    getAvailableUpgrades() {
        return Object.keys(this.upgrades).map(upgradeType => {
            const upgrade = this.upgrades[upgradeType];
            return {
                type: upgradeType,
                ...upgrade,
                canAfford: this.base.canAfford(upgrade.cost),
                isPurchased: this.purchasedUpgrades.includes(upgradeType)
            };
        });
    }

    // Get hero info
    getHeroInfo() {
        return {
            level: this.heroLevel,
            maxLevel: this.maxHeroLevel,
            experience: this.experience,
            experienceToNext: this.experienceToNext,
            skillPoints: this.skillPoints,
            purchasedUpgrades: this.purchasedUpgrades,
            availableUpgrades: this.getAvailableUpgrades()
        };
    }

    // Reset hero (for new game)
    resetHero() {
        this.purchasedUpgrades = [];
        this.heroLevel = 1;
        this.experience = 0;
        this.experienceToNext = 100;
        this.skillPoints = 0;
    }

    // Get upgrade cost multiplier
    getUpgradeCostMultiplier() {
        return 1 + (this.purchasedUpgrades.length * 0.2); // 20% increase per upgrade
    }

    // Calculate total stat bonuses
    getTotalStatBonuses() {
        const bonuses = {
            attack: 0,
            defense: 0,
            health: 0,
            speed: 0
        };

        for (const upgradeType of this.purchasedUpgrades) {
            const upgrade = this.upgrades[upgradeType];
            if (!upgrade) continue;

            switch (upgrade.effect) {
                case 'attackBoost':
                    bonuses.attack += upgrade.value;
                    break;
                case 'defenseBoost':
                    bonuses.defense += upgrade.value;
                    break;
                case 'healthBoost':
                    bonuses.health += upgrade.value;
                    break;
                case 'speedBoost':
                    bonuses.speed += upgrade.value;
                    break;
                case 'allStatsBoost':
                    bonuses.attack += upgrade.value;
                    bonuses.defense += upgrade.value;
                    bonuses.health += upgrade.value * 10;
                    bonuses.speed += upgrade.value * 0.1;
                    break;
            }
        }

        return bonuses;
    }
}
