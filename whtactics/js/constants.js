// Game Constants - Grid-based Movement System
const GRID_SIZE = 10; // 10x10 grid
const CELL_SIZE = 50; // Size of each cell in pixels
const GAME_WIDTH = GRID_SIZE * CELL_SIZE; // 500px
const GAME_HEIGHT = GRID_SIZE * CELL_SIZE; // 500px
const TILE_SIZE = CELL_SIZE;
const MOVEMENT_SPEED = 1; // Not used in turn-based system

// Grid positions
const START_POSITION = {
    x: Math.floor(GRID_SIZE / 2), // Center of grid (5,5)
    y: Math.floor(GRID_SIZE / 2)
};

// Movement directions (King moves in chess - 8 directions)
const MOVEMENT_DIRECTIONS = [
    {x: -1, y: -1}, // Top-left
    {x: 0, y: -1},  // Top
    {x: 1, y: -1},  // Top-right
    {x: -1, y: 0},  // Left
    {x: 1, y: 0},   // Right
    {x: -1, y: 1},  // Bottom-left
    {x: 0, y: 1},   // Bottom
    {x: 1, y: 1}    // Bottom-right
];

// Resources
const RESOURCE_TYPES = {
    BIOMASS: 'biomass',
    SCRAP: 'scrap',
    WARPSTONE: 'warpstone'
};

// Factions
const FACTIONS = {
    IMPERIUM: 'imperium',
    CHAOS: 'chaos',
    TYRANIDS: 'tyranids',
    ORKS: 'orks',
    NECRONS: 'necrons'
};

// Terrain Types
const TERRAIN_TYPES = {
    EMPTY: 'empty',
    BATTLEFIELD: 'battlefield',
    FORGE: 'forge',
    WARP_RIFT: 'warpRift',
    RUINS: 'ruins',
    SETTLEMENT: 'settlement',
    OUTPOST: 'outpost',
    GROVE: 'grove',
    MOUNTAIN: 'mountain',
    WASTELAND: 'wasteland',
    PLAINS: 'plains',
    HILLS: 'hills',
    FOREST: 'forest',
    WARPSTONE_DEPOSIT: 'warpstoneDeposit'
};

// Character Classes
const CHARACTER_CLASSES = {
    SPACE_MARINE: {
        name: 'Space Marine',
        baseHP: 100,
        baseAttack: 10,
        baseDefense: 5,
        baseSpeed: 1.0,
        faction: FACTIONS.IMPERIUM,
        abilities: ['bolterFire', 'chainswordSlash']
    },
    CHAOS_MARINE: {
        name: 'Chaos Marine',
        baseHP: 90,
        baseAttack: 12,
        baseDefense: 3,
        baseSpeed: 1.0,
        faction: FACTIONS.CHAOS,
        abilities: ['boltPistol', 'demonicStrength']
    }
};

// Enemy Types
const ENEMY_TYPES = {
    TYRANID_WARRIOR: {
        name: 'Tyranid Warrior',
        hp: 80,
        attack: 8,
        defense: 3,
        speed: 0.9,
        faction: FACTIONS.TYRANIDS,
        loot: {
            [RESOURCE_TYPES.BIOMASS]: [5, 10]
        },
        spawnWeight: 10,
        attackOptions: ['Slash', 'Poison', 'Screech'],
        weakAgainst: 'Block',
        strongAgainst: 'Attack'
    },
    ORK_BOY: {
        name: 'Ork Boy',
        hp: 60,
        attack: 7,
        defense: 2,
        speed: 1.1,
        faction: FACTIONS.ORKS,
        loot: {
            [RESOURCE_TYPES.SCRAP]: [3, 7]
        },
        spawnWeight: 15,
        attackOptions: ['Smash', 'Charge', 'Shoot'],
        weakAgainst: 'Dodge',
        strongAgainst: 'Block'
    },
    NECRON_WARRIOR: {
        name: 'Necron Warrior',
        hp: 70,
        attack: 9,
        defense: 4,
        speed: 0.8,
        faction: FACTIONS.NECRONS,
        loot: {
            [RESOURCE_TYPES.WARPSTONE]: [2, 4]
        },
        spawnWeight: 8,
        attackOptions: ['Gauss', 'Repair', 'Phase'],
        weakAgainst: 'Attack',
        strongAgainst: 'Dodge'
    },
    CHAOS_CULTIST: {
        name: 'Chaos Cultist',
        hp: 40,
        attack: 5,
        defense: 1,
        speed: 1.0,
        faction: FACTIONS.CHAOS,
        loot: {
            [RESOURCE_TYPES.BIOMASS]: [1, 3],
            [RESOURCE_TYPES.WARPSTONE]: [1, 2]
        },
        spawnWeight: 20,
        attackOptions: ['Stab', 'Curse', 'Sacrifice'],
        weakAgainst: 'Attack',
        strongAgainst: 'Block'
    }
};

// Card Types
const CARD_TYPES = {
    BATTLEFIELD: {
        name: 'Battlefield',
        description: 'Spawns additional enemies each loop',
        type: TERRAIN_TYPES.BATTLEFIELD,
        effects: {
            spawnRateModifier: 1.5
        }
    },
    FORGE: {
        name: 'Forge',
        description: 'Provides Scrap resources each day',
        type: TERRAIN_TYPES.FORGE,
        effects: {
            resources: {
                [RESOURCE_TYPES.SCRAP]: [2, 5]
            }
        }
    },
    WARP_RIFT: {
        name: 'Warp Rift',
        description: 'Spawns Chaos enemies and provides Warpstone',
        type: TERRAIN_TYPES.WARP_RIFT,
        effects: {
            spawnFaction: FACTIONS.CHAOS,
            resources: {
                [RESOURCE_TYPES.WARPSTONE]: [1, 3]
            }
        }
    },
    RUINS: {
        name: 'Imperial Ruins',
        description: 'Small chance to find equipment',
        type: TERRAIN_TYPES.RUINS,
        effects: {
            treasureChance: 0.2
        }
    },
    TYRANID_HIVE: {
        name: 'Tyranid Hive',
        description: 'Spawns Tyranid enemies and provides Biomass',
        type: TERRAIN_TYPES.SETTLEMENT,
        effects: {
            spawnFaction: FACTIONS.TYRANIDS,
            resources: {
                [RESOURCE_TYPES.BIOMASS]: [3, 6]
            }
        }
    },
    ORK_CAMP: {
        name: 'Ork Camp',
        description: 'Spawns Ork enemies and provides Scrap',
        type: TERRAIN_TYPES.OUTPOST,
        effects: {
            spawnFaction: FACTIONS.ORKS,
            resources: {
                [RESOURCE_TYPES.SCRAP]: [2, 4]
            }
        }
    }
};

// Warhammer 40K Upgrade Branches - Each resource dedicated to thematic upgrades
const UPGRADE_BRANCHES = {
    // BIOLOGICAL UPGRADES - Enhanced with Biomass
    biological: {
        name: 'Biological Enhancements',
        description: 'Augment your flesh with bio-engineered improvements',
        resource: RESOURCE_TYPES.BIOMASS,
        color: '#88ff88',
        upgrades: {
            enhanced_physiology: {
                name: 'Enhanced Physiology',
                description: 'Strengthen your body with bio-augmentation',
                baseCost: 8,
                costMultiplier: 1.4,
                statIncrease: 15,
                statType: 'maxHp',
                maxLevel: 8,
                loreText: 'The flesh is weak, but it can be made stronger'
            },
            adrenal_glands: {
                name: 'Adrenal Glands',
                description: 'Boost combat reflexes with enhanced glands',
                baseCost: 12,
                costMultiplier: 1.5,
                statIncrease: 0.15,
                statType: 'speed',
                maxLevel: 6,
                loreText: 'Lightning-fast reactions in the face of death'
            },
            regenerative_tissue: {
                name: 'Regenerative Tissue',
                description: 'Accelerated healing through bio-modification',
                baseCost: 15,
                costMultiplier: 1.6,
                statIncrease: 2,
                statType: 'defense',
                maxLevel: 10,
                loreText: 'Wounds close swiftly through gene-craft mastery'
            },
            expanded_neural_capacity: {
                name: 'Expanded Neural Capacity',
                description: 'Enhance cognitive function and memory',
                baseCost: 20,
                costMultiplier: 2.0,
                statIncrease: 3,
                statType: 'inventorySize',
                maxLevel: 4,
                loreText: 'The mind is the sharpest weapon of all'
            }
        }
    },
    
    // TECHNICAL UPGRADES - Enhanced with Scrap
    technical: {
        name: 'Mechanicus Augmentations',
        description: 'Replace weak flesh with blessed machinery',
        resource: RESOURCE_TYPES.SCRAP,
        color: '#ffaa66',
        upgrades: {
            bionic_limbs: {
                name: 'Bionic Limbs',
                description: 'Replace limbs with superior mechanical parts',
                baseCost: 10,
                costMultiplier: 1.3,
                statIncrease: 3,
                statType: 'attack',
                maxLevel: 12,
                loreText: 'The strength of steel surpasses mortal flesh'
            },
            servo_skull_companion: {
                name: 'Servo-Skull Companion',
                description: 'A loyal skull-drone to aid in combat',
                baseCost: 15,
                costMultiplier: 1.4,
                statIncrease: 2,
                statType: 'attack',
                maxLevel: 8,
                loreText: 'Even in death, I serve the Omnissiah'
            },
            reinforced_skeleton: {
                name: 'Reinforced Skeleton',
                description: 'Adamantium-laced bone structure',
                baseCost: 18,
                costMultiplier: 1.5,
                statIncrease: 20,
                statType: 'maxHp',
                maxLevel: 6,
                loreText: 'Unbreakable as the Machine God\'s will'
            },
            cogitator_implant: {
                name: 'Cogitator Implant',
                description: 'Machine-spirit enhanced tactical awareness',
                baseCost: 25,
                costMultiplier: 1.8,
                statIncrease: 0.2,
                statType: 'speed',
                maxLevel: 5,
                loreText: 'Logic and efficiency guide your actions'
            }
        }
    },
    
    // PSIONIC UPGRADES - Enhanced with Warpstone
    psionic: {
        name: 'Psychic Disciplines',
        description: 'Harness the dangerous power of the Warp',
        resource: RESOURCE_TYPES.WARPSTONE,
        color: '#8888ff',
        upgrades: {
            minor_telepathy: {
                name: 'Minor Telepathy',
                description: 'Basic mind-reading and enemy anticipation',
                baseCost: 3,
                costMultiplier: 1.6,
                statIncrease: 0.1,
                statType: 'speed',
                maxLevel: 8,
                loreText: 'Glimpse the thoughts of your foes'
            },
            psychic_ward: {
                name: 'Psychic Ward',
                description: 'Mental barriers against Chaos corruption',
                baseCost: 5,
                costMultiplier: 1.7,
                statIncrease: 3,
                statType: 'defense',
                maxLevel: 6,
                loreText: 'The Emperor protects the faithful mind'
            },
            force_projection: {
                name: 'Force Projection',
                description: 'Channel warp energy into devastating attacks',
                baseCost: 8,
                costMultiplier: 1.8,
                statIncrease: 4,
                statType: 'attack',
                maxLevel: 7,
                loreText: 'Unleash the power that lurks beyond the veil'
            },
            battle_prescience: {
                name: 'Battle Prescience',
                description: 'Foresee enemy movements in combat',
                baseCost: 12,
                costMultiplier: 2.0,
                statIncrease: 25,
                statType: 'maxHp',
                maxLevel: 4,
                loreText: 'Knowledge of what is to come grants power'
            }
        }
    }
};

// Legacy - now use UPGRADE_BRANCHES instead
// const UPGRADE_COSTS = UPGRADE_BRANCHES;

// Item Templates
const ITEM_TEMPLATES = {
    // Weapons
    BOLT_PISTOL: {
        name: 'Bolt Pistol',
        description: 'Standard-issue Imperial sidearm',
        type: 'weapon',
        rarity: 'common',
        stats: {
            attack: 2
        }
    },
    CHAINSWORD: {
        name: 'Chainsword',
        description: 'Serrated blade with motorized teeth',
        type: 'weapon',
        rarity: 'common',
        stats: {
            attack: 3
        }
    },
    POWER_SWORD: {
        name: 'Power Sword',
        description: 'Energy-enhanced blade that cuts through armor',
        type: 'weapon',
        rarity: 'uncommon',
        stats: {
            attack: 5
        }
    },
    PLASMA_GUN: {
        name: 'Plasma Gun',
        description: 'Fires superheated plasma bolts',
        type: 'weapon',
        rarity: 'rare',
        stats: {
            attack: 8
        }
    },
    
    // Armor
    FLAK_ARMOR: {
        name: 'Flak Armor',
        description: 'Basic Imperial Guard protection',
        type: 'armor',
        rarity: 'common',
        stats: {
            defense: 1,
            maxHp: 10
        }
    },
    CARAPACE_ARMOR: {
        name: 'Carapace Armor',
        description: 'Heavy plates that can stop most small arms fire',
        type: 'armor',
        rarity: 'uncommon',
        stats: {
            defense: 3,
            maxHp: 20,
            speed: -0.1
        }
    },
    POWER_ARMOR: {
        name: 'Power Armor',
        description: 'Mechanized armor worn by Space Marines',
        type: 'armor',
        rarity: 'rare',
        stats: {
            defense: 5,
            maxHp: 50,
            attack: 1
        }
    },
    
    // Accessories
    COMBAT_STIMMS: {
        name: 'Combat Stimms',
        description: 'Increases reaction speed',
        type: 'accessory',
        rarity: 'common',
        stats: {
            speed: 0.2
        }
    },
    REFRACTOR_FIELD: {
        name: 'Refractor Field',
        description: 'Energy field that deflects attacks',
        type: 'accessory',
        rarity: 'uncommon',
        stats: {
            defense: 2
        }
    },
    IRON_HALO: {
        name: 'Iron Halo',
        description: 'Awarded to the most elite warriors',
        type: 'accessory',
        rarity: 'rare',
        stats: {
            maxHp: 25,
            defense: 2,
            attack: 1
        }
    },
    
    // Consumables
    MEDI_KIT: {
        name: 'Medi-Kit',
        description: 'Restores health',
        type: 'consumable',
        rarity: 'common',
        stackable: true,
        effect: {
            hp: 30
        }
    },
    COMBAT_DRUGS: {
        name: 'Combat Drugs',
        description: 'Temporarily increases attack power',
        type: 'consumable',
        rarity: 'uncommon',
        stackable: true,
        effect: {
            tempAttack: 5,
            duration: 3 // 3 combats
        }
    },
    HOLY_UNGUENT: {
        name: 'Holy Unguent',
        description: 'Blessed oil that purifies and heals',
        type: 'consumable',
        rarity: 'rare',
        effect: {
            hp: 50,
            tempDefense: 3,
            duration: 2
        }
    }
};

// Relic Types
const RELIC_TYPES = {
    EMPEROR_SWORD: {
        name: 'Emperor\'s Sword',
        rarity: 'legendary',
        effect: 'doublesAttack',
        description: 'The legendary blade of the Emperor himself',
        icon: '⚔️',
        stats: { attack: 20, defense: 5 }
    },
    CHAOS_AMULET: {
        name: 'Chaos Amulet',
        rarity: 'epic',
        effect: 'warpResistance',
        description: 'Protects against warp corruption',
        icon: '🔮',
        stats: { defense: 10, health: 50 }
    },
    NECRON_STAFF: {
        name: 'Necron Staff',
        rarity: 'rare',
        effect: 'energyDrain',
        description: 'Drains enemy energy on hit',
        icon: '⚡',
        stats: { attack: 15, speed: 0.2 }
    },
    ORK_CHOPPA: {
        name: 'Ork Choppa',
        rarity: 'common',
        effect: 'brutalStrike',
        description: 'A crude but effective weapon',
        icon: '🪓',
        stats: { attack: 8 }
    },
    TYRANID_FANG: {
        name: 'Tyranid Fang',
        rarity: 'uncommon',
        effect: 'poisonDamage',
        description: 'Inflicts poison damage over time',
        icon: '🦷',
        stats: { attack: 6, poison: 3 }
    }
};

// Base Building Types (Simplified - only battlefield structures are used)
const BASE_STRUCTURES = {};

// Crafting Recipes
const CRAFTING_RECIPES = {
    POWER_SWORD: {
        name: 'Power Sword',
        rarity: 'rare',
        materials: {
            [RESOURCE_TYPES.SCRAP]: 25,
            [RESOURCE_TYPES.WARPSTONE]: 10
        },
        stats: { attack: 15, defense: 3 },
        effect: 'powerField',
        description: 'A sword with a power field generator'
    },
    PLASMA_RIFLE: {
        name: 'Plasma Rifle',
        rarity: 'epic',
        materials: {
            [RESOURCE_TYPES.SCRAP]: 40,
            [RESOURCE_TYPES.WARPSTONE]: 20
        },
        stats: { attack: 25, speed: -0.1 },
        effect: 'plasmaBurst',
        description: 'High-powered plasma weapon'
    },
    TERMINATOR_ARMOR: {
        name: 'Terminator Armor',
        rarity: 'legendary',
        materials: {
            [RESOURCE_TYPES.SCRAP]: 80,
            [RESOURCE_TYPES.WARPSTONE]: 40,
            [RESOURCE_TYPES.BIOMASS]: 20
        },
        stats: { defense: 20, health: 100, speed: -0.3 },
        effect: 'teleport',
        description: 'Heavy tactical dreadnought armor'
    },
    HEALING_POTION: {
        name: 'Healing Potion',
        rarity: 'common',
        materials: {
            [RESOURCE_TYPES.BIOMASS]: 15
        },
        effect: 'heal',
        healAmount: 50,
        description: 'Restores health'
    },
    WARP_BOMB: {
        name: 'Warp Bomb',
        rarity: 'rare',
        materials: {
            [RESOURCE_TYPES.WARPSTONE]: 25,
            [RESOURCE_TYPES.SCRAP]: 15
        },
        effect: 'areaDamage',
        damage: 100,
        description: 'Explosive warp device'
    }
};

// Hero Upgrade Types
const HERO_UPGRADES = {
    WEAPON_MASTERY: {
        name: 'Weapon Mastery',
        cost: { [RESOURCE_TYPES.SCRAP]: 30 },
        effect: 'attackBoost',
        value: 5,
        description: 'Increase attack damage'
    },
    ARMOR_TRAINING: {
        name: 'Armor Training',
        cost: { [RESOURCE_TYPES.SCRAP]: 25 },
        effect: 'defenseBoost',
        value: 3,
        description: 'Increase defense rating'
    },
    WARRIOR_SPIRIT: {
        name: 'Warrior Spirit',
        cost: { [RESOURCE_TYPES.BIOMASS]: 20 },
        effect: 'healthBoost',
        value: 25,
        description: 'Increase maximum health'
    },
    LIGHTNING_REFLEXES: {
        name: 'Lightning Reflexes',
        cost: { [RESOURCE_TYPES.WARPSTONE]: 15 },
        effect: 'speedBoost',
        value: 0.2,
        description: 'Increase movement speed'
    },
    WARRIOR_LEGACY: {
        name: 'Warrior Legacy',
        cost: { [RESOURCE_TYPES.WARPSTONE]: 50, [RESOURCE_TYPES.SCRAP]: 30 },
        effect: 'allStatsBoost',
        value: 2,
        description: 'Increase all stats'
    }
};

// Combat System Constants
const COMBAT_ACTIONS = {
    ATTACK: {
        name: 'Attack',
        description: 'Basic attack with your weapon',
        damage: 15,
        accuracy: 85,
        icon: '⚔️',
        type: 'physical'
    },
    HEAVY_ATTACK: {
        name: 'Heavy Attack',
        description: 'Powerful but slower attack',
        damage: 25,
        accuracy: 70,
        icon: '🔨',
        type: 'physical',
        cooldown: 2
    },
    RAPID_FIRE: {
        name: 'Rapid Fire',
        description: 'Quick multiple attacks',
        damage: 8,
        accuracy: 90,
        icon: '🔫',
        type: 'ranged',
        hits: 3
    },
    DEFEND: {
        name: 'Defend',
        description: 'Block incoming damage',
        blockChance: 60,
        blockAmount: 50,
        icon: '🛡️',
        type: 'defensive'
    },
    DODGE: {
        name: 'Dodge',
        description: 'Try to avoid the attack',
        dodgeChance: 40,
        icon: '💨',
        type: 'defensive'
    },
    SPECIAL_ABILITY: {
        name: 'Special Ability',
        description: 'Use your unique power',
        damage: 30,
        accuracy: 80,
        icon: '⭐',
        type: 'special',
        cooldown: 3
    }
};

// Enemy Combat Actions
const ENEMY_ACTIONS = {
    TYRANID_WARRIOR: {
        SLASH: { name: 'Slash', damage: 12, accuracy: 80, icon: '🦷' },
        POISON: { name: 'Poison Strike', damage: 8, accuracy: 75, icon: '☠️', effect: 'poison' },
        SCREECH: { name: 'Screech', damage: 5, accuracy: 90, icon: '🗣️', effect: 'stun' }
    },
    ORK_BOY: {
        CHOP: { name: 'Chop', damage: 15, accuracy: 75, icon: '🪓' },
        HEADBUTT: { name: 'Headbutt', damage: 10, accuracy: 85, icon: '💥', effect: 'stun' },
        WAAAGH: { name: 'WAAAGH!', damage: 20, accuracy: 60, icon: '💪', effect: 'berserk' }
    },
    NECRON_WARRIOR: {
        GAUSS_BLAST: { name: 'Gauss Blast', damage: 18, accuracy: 85, icon: '⚡' },
        PHASE: { name: 'Phase Shift', damage: 0, accuracy: 100, icon: '👻', effect: 'dodge' },
        RECONSTRUCT: { name: 'Reconstruct', damage: 0, accuracy: 100, icon: '🔧', effect: 'heal' }
    },
    CHAOS_MARINE: {
        BOLTER_SHOT: { name: 'Bolter Shot', damage: 16, accuracy: 80, icon: '🔫' },
        CHAOS_BLAST: { name: 'Chaos Blast', damage: 25, accuracy: 70, icon: '🔥', effect: 'burn' },
        DEMONIC_STRENGTH: { name: 'Demonic Strength', damage: 30, accuracy: 65, icon: '👹', effect: 'berserk' }
    }
};

// Combat Effects
const COMBAT_EFFECTS = {
    POISON: { name: 'Poison', duration: 3, damagePerTurn: 5, description: 'Takes damage over time' },
    BURN: { name: 'Burn', duration: 2, damagePerTurn: 8, description: 'Burning damage' },
    STUN: { name: 'Stunned', duration: 1, effect: 'skipTurn', description: 'Cannot act next turn' },
    BERSERK: { name: 'Berserk', duration: 2, effect: 'damageBoost', value: 1.5, description: 'Increased damage but reduced accuracy' }
};

// Battlefield Cards - Possible buildings on each cell
const BATTLEFIELD_CARDS = {
    // Shield Generator - Restores hero shield energy
    SHIELD_GENERATOR: {
        name: 'Shield Generator',
        description: 'Restores hero shield energy to maximum. 1 use, then 5-turn cooldown.',
        cost: { [RESOURCE_TYPES.WARPSTONE]: 25, [RESOURCE_TYPES.SCRAP]: 15 },
        icon: '🛡️',
        type: 'utility',
        effects: { shieldRestore: 'full', uses: 1, cooldown: 5 },
        buildTime: 3,
        rarity: 'uncommon',
        usesRemaining: 1,
        cooldownRemaining: 0,
        allowedTerrain: ['PLAINS', 'HILLS', 'MOUNTAIN', 'WARPSTONE_DEPOSIT']
    },
    
    // Medical Hospital - Restores hero health
    MEDICAL_HOSPITAL: {
        name: 'Medical Hospital',
        description: 'Restores hero health to maximum. 1 use, then 5-turn cooldown.',
        cost: { [RESOURCE_TYPES.BIOMASS]: 30, [RESOURCE_TYPES.SCRAP]: 20 },
        icon: '🏥',
        type: 'support',
        effects: { healthRestore: 'full', uses: 1, cooldown: 5 },
        buildTime: 3,
        rarity: 'uncommon',
        usesRemaining: 1,
        cooldownRemaining: 0,
        allowedTerrain: ['PLAINS', 'FOREST', 'RUINS']
    },
    
    // Outpost - Restores 10 turn points
    OUTPOST: {
        name: 'Outpost',
        description: 'Restores 10 turn points. 1 use, then 5-turn cooldown.',
        cost: { [RESOURCE_TYPES.SCRAP]: 35, [RESOURCE_TYPES.BIOMASS]: 15 },
        icon: '🏛️',
        type: 'command',
        effects: { turnPointsRestore: 10, uses: 1, cooldown: 5 },
        buildTime: 2,
        rarity: 'uncommon',
        usesRemaining: 1,
        cooldownRemaining: 0,
        allowedTerrain: ['PLAINS', 'HILLS', 'MOUNTAIN', 'RUINS']
    },
    
    // Plasma Reactor - Generates energy for Space Marine equipment
    PLASMA_REACTOR: {
        name: 'Plasma Reactor',
        description: 'Advanced plasma energy generator that powers Space Marine equipment and provides combat bonuses. 1 use, then 5-turn cooldown.',
        cost: { [RESOURCE_TYPES.WARPSTONE]: 40, [RESOURCE_TYPES.SCRAP]: 30 },
        icon: '⚡',
        type: 'utility',
        effects: { plasmaBoost: 'full', uses: 1, cooldown: 5 },
        buildTime: 4,
        rarity: 'rare',
        usesRemaining: 1,
        cooldownRemaining: 0,
        allowedTerrain: ['WARPSTONE_DEPOSIT', 'RUINS']
    }
};

// Terrain building types that affect available buildings
const TERRAIN_BUILDING_TYPES = {
    PLAINS: {
        name: 'Plains',
        description: 'Open terrain suitable for most structures',
        availableBuildings: ['SHIELD_GENERATOR', 'MEDICAL_HOSPITAL', 'OUTPOST', 'PLASMA_REACTOR'],
        icon: '🌾'
    },
    HILLS: {
        name: 'Hills',
        description: 'Elevated terrain with defensive advantages',
        availableBuildings: ['SHIELD_GENERATOR', 'MEDICAL_HOSPITAL', 'OUTPOST', 'PLASMA_REACTOR'],
        icon: '⛰️'
    },
    FOREST: {
        name: 'Forest',
        description: 'Dense vegetation with abundant biomass',
        availableBuildings: ['SHIELD_GENERATOR', 'MEDICAL_HOSPITAL', 'OUTPOST'],
        icon: '🌲'
    },
    RUINS: {
        name: 'Ruins',
        description: 'Ancient structures with valuable scrap',
        availableBuildings: ['SHIELD_GENERATOR', 'MEDICAL_HOSPITAL', 'OUTPOST', 'PLASMA_REACTOR'],
        icon: '🏛️'
    },
    WARPSTONE_DEPOSIT: {
        name: 'Warpstone Deposit',
        description: 'Chaotic energy emanates from this area',
        availableBuildings: ['SHIELD_GENERATOR', 'MEDICAL_HOSPITAL', 'OUTPOST', 'PLASMA_REACTOR'],
        icon: '💎'
    },
    MOUNTAIN: {
        name: 'Mountain',
        description: 'Rocky peaks that provide excellent defensive positions',
        availableBuildings: ['SHIELD_GENERATOR', 'MEDICAL_HOSPITAL', 'OUTPOST', 'PLASMA_REACTOR'],
        icon: '🏔️'
    },
    WASTELAND: {
        name: 'Wasteland',
        description: 'Barren, corrupted land where few structures can survive',
        availableBuildings: ['SHIELD_GENERATOR', 'MEDICAL_HOSPITAL', 'OUTPOST'],
        icon: '☠️'
    }
};