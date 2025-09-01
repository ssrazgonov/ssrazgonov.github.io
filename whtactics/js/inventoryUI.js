// InventoryUI manager
class InventoryUI {
    constructor(gameManager) {
        this.gameManager = gameManager;
        this.character = null; // Will be set later when character exists
        this.isOpen = false;
        this.currentFilter = 'all';
        this.dragData = null;

        // We'll delay UI creation until the character is available
        this.initialized = false;

        // Setup initialization event listener
        this.setupInitListener();
    }

    // Setup listener for game initialization
    setupInitListener() {
        // Check if character already exists
        if (this.gameManager.character) {
            this.initializeInventoryUI();
            return;
        }

        // If not, wait for game init event
        document.addEventListener('game-initialized', () => {
            this.initializeInventoryUI();
        });
    }

    // Initialize inventory UI once character exists
    initializeInventoryUI() {
        if (this.initialized) return;

        this.character = this.gameManager.character;

        if (!this.character) {
            console.warn('Cannot initialize inventory yet - character not found, will retry later');
            // Set a retry timer
            setTimeout(() => this.setupInitListener(), 500);
            return;
        }

        // Create UI elements
        this.createInventoryUI();

        // Setup event listeners
        this.setupEventListeners();

        this.initialized = true;
        console.log('Inventory UI initialized');
    }

    // Create the inventory UI elements
    createInventoryUI() {
        // Create inventory container
        this.container = document.createElement('div');
        this.container.id = 'inventory-container';
        this.container.className = 'inventory-container';
        this.container.style.display = 'none'; // Hidden by default

        // Add styles
        this.applyStyles();

        // Create inner structure
        this.createInventoryContent();

        // Add to game area
        document.querySelector('.game-area').appendChild(this.container);
    }

    // Apply inventory styles
    applyStyles() {
        this.container.style.position = 'absolute';
        this.container.style.top = '50%';
        this.container.style.left = '50%';
        this.container.style.transform = 'translate(-50%, -50%)';
        this.container.style.width = '70%';
        this.container.style.maxWidth = '800px';
        this.container.style.height = '70%';
        this.container.style.maxHeight = '600px';
        this.container.style.backgroundColor = 'rgba(20, 20, 25, 0.95)';
        this.container.style.border = '2px solid #555';
        this.container.style.borderRadius = '5px';
        this.container.style.padding = '15px';
        this.container.style.color = 'white';
        this.container.style.zIndex = '1000';
        this.container.style.overflowY = 'auto';
        this.container.style.boxShadow = '0 0 20px rgba(0, 0, 0, 0.7)';
    }

    // Create inventory content
    createInventoryContent() {
        // Header
        const header = document.createElement('div');
        header.className = 'inventory-header';
        header.innerHTML = `
            <h2>Inventory</h2>
            <button id="close-inventory" class="inventory-close-btn">×</button>
        `;
        header.style.display = 'flex';
        header.style.justifyContent = 'space-between';
        header.style.alignItems = 'center';
        header.style.borderBottom = '1px solid #555';
        header.style.paddingBottom = '10px';
        header.style.marginBottom = '15px';

        // Close button style
        const closeBtn = header.querySelector('.inventory-close-btn');
        closeBtn.style.background = 'none';
        closeBtn.style.border = 'none';
        closeBtn.style.color = 'white';
        closeBtn.style.fontSize = '24px';
        closeBtn.style.cursor = 'pointer';
        closeBtn.style.padding = '0 10px';

        // Add event listener to close button
        closeBtn.addEventListener('click', () => this.toggleInventory(false));

        // Add header to container
        this.container.appendChild(header);

        // Create inventory sections
        this.createEquipmentSection();
        this.createItemsSection();
        this.createStatsSection();
    }

    // Create equipment section
    createEquipmentSection() {
        const section = document.createElement('div');
        section.className = 'inventory-section equipment-section';
        section.innerHTML = `
            <h3>Equipment</h3>
            <div class="equipment-slots">
                <div class="equipment-slot" data-slot="weapon">
                    <div class="slot-label">Weapon</div>
                    <div class="slot-item empty"></div>
                </div>
                <div class="equipment-slot" data-slot="armor">
                    <div class="slot-label">Armor</div>
                    <div class="slot-item empty"></div>
                </div>
                <div class="equipment-slot" data-slot="accessory">
                    <div class="slot-label">Accessory</div>
                    <div class="slot-item empty"></div>
                </div>
            </div>
        `;
        section.style.marginBottom = '20px';

        // Style equipment slots
        const slots = section.querySelectorAll('.equipment-slot');
        slots.forEach(slot => {
            slot.style.display = 'inline-block';
            slot.style.width = '100px';
            slot.style.height = '120px';
            slot.style.margin = '0 10px';
            slot.style.textAlign = 'center';

            const slotItem = slot.querySelector('.slot-item');
            slotItem.style.width = '80px';
            slotItem.style.height = '80px';
            slotItem.style.margin = '5px auto';
            slotItem.style.backgroundColor = 'rgba(40, 40, 40, 0.5)';
            slotItem.style.border = '2px solid #555';
            slotItem.style.borderRadius = '5px';
        });

        this.container.appendChild(section);
    }

    // Create items section (inventory grid)
    createItemsSection() {
        const section = document.createElement('div');
        section.className = 'inventory-section items-section';
        section.innerHTML = `
            <div style="display:flex;justify-content:space-between;align-items:center;gap:10px;">
                <h3 style="margin:0;">Items</h3>
                <div class="inventory-filters" id="inventory-filters">
                    <button data-filter="all" class="inv-filter active">All</button>
                    <button data-filter="weapon" class="inv-filter">Weapons</button>
                    <button data-filter="armor" class="inv-filter">Armor</button>
                    <button data-filter="accessory" class="inv-filter">Accessories</button>
                    <button data-filter="consumable" class="inv-filter">Consumables</button>
                </div>
            </div>
            <div class="inventory-grid" id="inventory-grid"></div>
        `;
        section.style.marginBottom = '20px';

        // Create inventory grid
        const grid = section.querySelector('.inventory-grid');
        grid.style.display = 'grid';
        grid.style.gridTemplateColumns = 'repeat(6, 1fr)';
        grid.style.gap = '10px';
        grid.style.padding = '10px';

        // Create inventory slots
        const inventorySize = this.character?.inventorySize || 12; // Default to 12 slots if character is null
        for (let i = 0; i < inventorySize; i++) {
            const slot = document.createElement('div');
            slot.className = 'inventory-slot';
            slot.setAttribute('data-slot-index', i);
            slot.style.width = '64px';
            slot.style.height = '64px';
            slot.style.backgroundColor = 'rgba(40, 40, 40, 0.5)';
            slot.style.border = '1px solid #555';
            slot.style.borderRadius = '4px';
            slot.style.display = 'flex';
            slot.style.justifyContent = 'center';
            slot.style.alignItems = 'center';
            slot.style.position = 'relative';
            slot.style.userSelect = 'none';

            // Enable drop targets
            slot.addEventListener('dragover', (e) => e.preventDefault());
            slot.addEventListener('drop', (e) => this.onDropToInventorySlot(e, i));

            grid.appendChild(slot);
        }

        // Filters events
        const filters = section.querySelectorAll('.inv-filter');
        filters.forEach(btn => {
            btn.style.background = '#2a2a2e';
            btn.style.color = 'white';
            btn.style.border = '1px solid #444';
            btn.style.borderRadius = '4px';
            btn.style.cursor = 'pointer';
            btn.style.padding = '4px 8px';
            btn.addEventListener('click', () => this.setFilter(btn.getAttribute('data-filter'), filters));
        });

        this.container.appendChild(section);
    }

    // Create character stats section
    createStatsSection() {
        const section = document.createElement('div');
        section.className = 'inventory-section stats-section';
        section.innerHTML = `
            <h3>Character Stats</h3>
            <div class="stats-container">
                <div class="stat-item"><div class="stat-label">Level:</div><div class="stat-value" id="inv-stat-level"></div></div>
                <div class="stat-item"><div class="stat-label">XP:</div><div class="stat-value" id="inv-stat-xp"></div></div>
                <div class="stat-item"><div class="stat-label">Health:</div><div class="stat-value" id="inv-stat-hp"></div></div>
                <div class="stat-item"><div class="stat-label">Attack:</div><div class="stat-value" id="inv-stat-attack"></div></div>
                <div class="stat-item"><div class="stat-label">Defense:</div><div class="stat-value" id="inv-stat-defense"></div></div>
                <div class="stat-item"><div class="stat-label">Speed:</div><div class="stat-value" id="inv-stat-speed"></div></div>
                <div class="stat-item"><div class="stat-label">Attack Speed:</div><div class="stat-value" id="inv-stat-as"></div></div>
                <div class="stat-item"><div class="stat-label">DPS (approx):</div><div class="stat-value" id="inv-stat-dps"></div></div>
                <div class="stat-item"><div class="stat-label">Inventory Size:</div><div class="stat-value" id="inv-stat-invsize"></div></div>
                <div class="stat-item"><div class="stat-label">Resources:</div><div class="stat-value" id="inv-stat-resources"></div></div>
            </div>
        `;

        // Style stats container
        const statsContainer = section.querySelector('.stats-container');
        statsContainer.style.display = 'grid';
        statsContainer.style.gridTemplateColumns = 'repeat(2, 1fr)';
        statsContainer.style.gap = '10px';

        // Style stat items
        const statItems = section.querySelectorAll('.stat-item');
        statItems.forEach(item => {
            item.style.display = 'flex';
            item.style.gap = '10px';
        });

        this.container.appendChild(section);
    }

    // Setup event listeners
    setupEventListeners() {
        // Listen for inventory button click
        document.addEventListener('keydown', (e) => {
            if (e.key === 'i' || e.key === 'I') {
                this.toggleInventory();
            }
        });

        // Listen for inventory changes
        document.addEventListener('inventory-changed', (e) => {
            if (e.detail && e.detail.character) {
                this.updateInventoryUI();
            }
        });

        // Listen for equipment changes
        document.addEventListener('equipment-changed', (e) => {
            if (e.detail && e.detail.character) {
                this.updateEquipmentUI();
                this.updateStatsUI();
            }
        });

        // Add inventory button to game UI
        this.addInventoryButton();
    }

    // Add inventory button to the game UI
    addInventoryButton() {
        const button = document.createElement('button');
        button.id = 'inventory-button';
        button.textContent = 'Inventory (I)';
        button.className = 'game-button';

        // Style the button
        button.style.position = 'absolute';
        button.style.bottom = '10px';
        button.style.right = '10px';
        button.style.padding = '8px 15px';
        button.style.backgroundColor = '#2a2a2e';
        button.style.color = 'white';
        button.style.border = '1px solid #444';
        button.style.borderRadius = '4px';
        button.style.cursor = 'pointer';

        // Add event listener
        button.addEventListener('click', () => {
            this.toggleInventory();
        });

        // Add to game area
        document.querySelector('.game-area').appendChild(button);
    }

    // Toggle inventory visibility
    toggleInventory(state = !this.isOpen) {
        this.isOpen = state;
        this.container.style.display = this.isOpen ? 'block' : 'none';

        // Update UI if opening
        if (this.isOpen) {
            this.updateInventoryUI();
            this.updateEquipmentUI();
            this.updateStatsUI();

            // Pause game when inventory is open
            if (this.gameManager) {
                this.gameManager.previousTimeScale = this.gameManager.timeScale;
                this.gameManager.timeScale = 0.1; // Nearly paused
            }
        } else {
            // Resume game when inventory is closed
            if (this.gameManager && this.gameManager.previousTimeScale) {
                this.gameManager.timeScale = this.gameManager.previousTimeScale;
            }
        }
    }

    // Update the inventory grid display
    updateInventoryUI() {
        const grid = document.getElementById('inventory-grid');
        if (!grid) return;

        // Ensure we have a character
        if (!this.character) {
            this.character = this.gameManager?.character;
            if (!this.character) return;
        }

        // Clear all slots first
        const slots = grid.querySelectorAll('.inventory-slot');
        slots.forEach(slot => {
            while (slot.firstChild) slot.removeChild(slot.firstChild);
            slot.classList.remove('filled');
        });

        // Filter items by current filter
        const visibleItems = this.character.inventory
            .map((it, idx) => ({ it, idx }))
            .filter(({ it }) => this.currentFilter === 'all' || it.type === this.currentFilter);

        // Place filtered items sequentially
        visibleItems.forEach(({ it, idx }, pos) => {
            if (pos >= slots.length) return;
            const slot = slots[pos];
            slot.classList.add('filled');

            const itemElement = document.createElement('div');
            itemElement.className = `inventory-item ${it.rarity}`;
            itemElement.setAttribute('data-item-id', it.id);
            itemElement.setAttribute('data-inv-index', idx);
            itemElement.draggable = true;

            itemElement.style.backgroundColor = this.getItemBackgroundColor(it.type);
            itemElement.style.width = '56px';
            itemElement.style.height = '56px';
            itemElement.style.display = 'flex';
            itemElement.style.justifyContent = 'center';
            itemElement.style.alignItems = 'center';
            itemElement.style.cursor = 'grab';

            itemElement.textContent = it.name.substring(0, 2).toUpperCase();

            if (it.stackable && it.quantity > 1) {
                const quantityBadge = document.createElement('span');
                quantityBadge.className = 'item-quantity';
                quantityBadge.textContent = it.quantity;
                quantityBadge.style.position = 'absolute';
                quantityBadge.style.bottom = '0';
                quantityBadge.style.right = '0';
                quantityBadge.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
                quantityBadge.style.padding = '1px 3px';
                quantityBadge.style.fontSize = '0.8em';
                quantityBadge.style.borderRadius = '3px';
                itemElement.appendChild(quantityBadge);
            }

            // Drag handlers
            itemElement.addEventListener('dragstart', (e) => {
                this.dragData = { source: 'inventory', index: idx, itemId: it.id };
                e.dataTransfer.setData('text/plain', JSON.stringify(this.dragData));
            });

            // Double click: equip/use
            itemElement.addEventListener('dblclick', () => {
                if (it.isEquippable && it.isEquippable()) {
                    this.character.equipItem(it.id);
                } else if (it.usable) {
                    this.character.useItem(it.id);
                }
            });

            // Context/click actions
            this.addItemEventListeners(itemElement, it);

            slot.appendChild(itemElement);
        });
    }

    // Update the equipment slots display
    updateEquipmentUI() {
        // Ensure we have a character
        if (!this.character) {
            this.character = this.gameManager?.character;
            if (!this.character) return;
        }

        // Update each equipment slot
        Object.entries(this.character.equipment).forEach(([slot, item]) => {
            const slotElement = document.querySelector(`.equipment-slot[data-slot="${slot}"] .slot-item`);
            if (!slotElement) return;

            // Clear slot
            while (slotElement.firstChild) {
                slotElement.removeChild(slotElement.firstChild);
            }

            if (item) {
                // Remove 'empty' class
                slotElement.classList.remove('empty');

                // Create item element
                const itemElement = document.createElement('div');
                itemElement.className = `equipment-item ${item.rarity}`;
                itemElement.setAttribute('data-item-id', item.id);
                itemElement.draggable = true;

                // Add background color based on type
                itemElement.style.backgroundColor = this.getItemBackgroundColor(item.type);
                itemElement.style.width = '100%';
                itemElement.style.height = '100%';
                itemElement.style.display = 'flex';
                itemElement.style.justifyContent = 'center';
                itemElement.style.alignItems = 'center';
                itemElement.style.cursor = 'pointer';

                // Add item name as text
                itemElement.textContent = item.name.substring(0, 2).toUpperCase();

                // Add item to slot
                slotElement.appendChild(itemElement);

                // Add tooltip
                slotElement.title = `${item.name} (${item.rarity})\n${item.description}`;

                // Add event listener for unequipping
                itemElement.addEventListener('click', () => {
                    this.character.unequipItem(slot);
                });

                // Drag start from equipment
                itemElement.addEventListener('dragstart', (e) => {
                    this.dragData = { source: 'equipment', slot, itemId: item.id };
                    e.dataTransfer.setData('text/plain', JSON.stringify(this.dragData));
                });
            } else {
                // Add 'empty' class
                slotElement.classList.add('empty');
                slotElement.title = `Empty ${slot} slot`;
            }

            // Enable dropping inventory item to equip
            const equipSlotEl = slotElement;
            equipSlotEl.addEventListener('dragover', (e) => e.preventDefault());
            equipSlotEl.addEventListener('drop', (e) => this.onDropToEquipmentSlot(e, slot));
        });
    }

    // Update character stats display
    updateStatsUI() {
        // Ensure we have a character
        if (!this.character) {
            this.character = this.gameManager?.character;
            if (!this.character) return;
        }
        const ch = this.character;
        const resourcesText = ch.resources ? Object.entries(ch.resources).map(([k,v]) => `${k}: ${v}`).join(', ') : '-';
        const dps = (ch.attack * (ch.attackSpeed || 1)).toFixed(1);

        const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
        set('inv-stat-level', ch.level ?? '-');
        set('inv-stat-xp', `${ch.experience ?? 0} / ${ch.experienceToNextLevel ?? 0}`);
        set('inv-stat-hp', `${ch.hp} / ${ch.maxHp}`);
        set('inv-stat-attack', ch.attack);
        set('inv-stat-defense', ch.defense);
        set('inv-stat-speed', (ch.speed ?? 1).toFixed(1));
        set('inv-stat-as', (ch.attackSpeed ?? 1).toFixed(2));
        set('inv-stat-dps', dps);
        set('inv-stat-invsize', ch.inventorySize ?? 12);
        set('inv-stat-resources', resourcesText);
    }

    // Add event listeners to an item in the inventory
    addItemEventListeners(itemElement, item) {
        // Show tooltip on hover
        itemElement.title = `${item.name} (${item.rarity})\n${item.description || ''}`;

        // Add click handler
        itemElement.addEventListener('click', (e) => {
            this.showItemActions(e, item);
        });
    }

    // Handle filter changes
    setFilter(filter, buttons) {
        this.currentFilter = filter;
        if (buttons) {
            buttons.forEach(b => b.classList.toggle('active', b.getAttribute('data-filter') === filter));
        }
        this.updateInventoryUI();
    }

    // Drop handling: inventory slot
    onDropToInventorySlot(event, targetIndex) {
        event.preventDefault();
        if (!this.character) return;
        let data = this.dragData;
        try { data = JSON.parse(event.dataTransfer.getData('text/plain')); } catch {}
        if (!data) return;

        if (data.source === 'equipment') {
            // Unequip from slot, add back to inventory (push), then reorder to targetIndex
            const slot = data.slot;
            if (this.character.unequipItem(slot)) {
                // Move last item (just added) to targetIndex
                const inv = this.character.inventory;
                const moved = inv.pop();
                inv.splice(Math.min(targetIndex, inv.length), 0, moved);
                document.dispatchEvent(new CustomEvent('inventory-changed', { detail: { character: this.character } }));
            }
        } else if (data.source === 'inventory') {
            // Reorder items by swapping positions
            const fromIdx = data.index;
            const inv = this.character.inventory;
            if (fromIdx >= 0 && fromIdx < inv.length) {
                const [moved] = inv.splice(fromIdx, 1);
                inv.splice(Math.min(targetIndex, inv.length), 0, moved);
                document.dispatchEvent(new CustomEvent('inventory-changed', { detail: { character: this.character } }));
            }
        }
    }

    // Drop handling: equipment slot
    onDropToEquipmentSlot(event, targetSlot) {
        event.preventDefault();
        if (!this.character) return;
        let data = this.dragData;
        try { data = JSON.parse(event.dataTransfer.getData('text/plain')); } catch {}
        if (!data) return;

        if (data.source === 'inventory') {
            // Attempt to equip the dragged item. Equip API selects slot based on item.
            this.character.equipItem(data.itemId);
        } else if (data.source === 'equipment') {
            // Moving between equipment slots not supported; treat as unequip->equip if compatible
            if (data.slot !== targetSlot) {
                const equipped = this.character.equipment[data.slot];
                if (equipped) {
                    // Try to unequip then equip (will pick correct slot)
                    this.character.unequipItem(data.slot);
                    this.character.equipItem(equipped.id);
                }
            }
        }
    }

    // Show item action menu
    showItemActions(event, item) {
        // Remove any existing item menu
        const existingMenu = document.getElementById('item-action-menu');
        if (existingMenu) {
            existingMenu.remove();
        }
        
        // Create menu
        const menu = document.createElement('div');
        menu.id = 'item-action-menu';
        menu.style.position = 'absolute';
        menu.style.zIndex = '1001';
        menu.style.backgroundColor = 'rgba(40, 40, 40, 0.95)';
        menu.style.border = '1px solid #555';
        menu.style.borderRadius = '4px';
        menu.style.padding = '5px 0';
        menu.style.minWidth = '120px';
        
        // Position menu near the clicked item
        const rect = event.target.getBoundingClientRect();
        menu.style.left = `${rect.right + 5}px`;
        menu.style.top = `${rect.top}px`;
        
        // Add action buttons
        if (item.isEquippable()) {
            this.addActionButton(menu, 'Equip', () => {
                this.character.equipItem(item.id);
                menu.remove();
            });
        }
        
        if (item.usable) {
            this.addActionButton(menu, 'Use', () => {
                this.character.useItem(item.id);
                menu.remove();
            });
        }
        
        this.addActionButton(menu, 'Drop', () => {
            this.character.removeItem(item.id);
            menu.remove();
        });
        
        // Add close button
        this.addActionButton(menu, 'Cancel', () => {
            menu.remove();
        });
        
        // Add menu to document
        document.body.appendChild(menu);
        
        // Close menu when clicking elsewhere
        const closeMenuListener = (e) => {
            if (!menu.contains(e.target) && e.target !== event.target) {
                menu.remove();
                document.removeEventListener('click', closeMenuListener);
            }
        };
        
        // Delay adding the listener to prevent immediate closure
        setTimeout(() => {
            document.addEventListener('click', closeMenuListener);
        }, 100);
    }
    
    // Add an action button to the menu
    addActionButton(menu, text, callback) {
        const button = document.createElement('button');
        button.className = 'item-action-button';
        button.textContent = text;
        button.style.display = 'block';
        button.style.width = '100%';
        button.style.padding = '5px 10px';
        button.style.textAlign = 'left';
        button.style.background = 'none';
        button.style.border = 'none';
        button.style.color = 'white';
        button.style.cursor = 'pointer';
        
        button.addEventListener('mouseover', () => {
            button.style.backgroundColor = 'rgba(80, 80, 80, 0.7)';
        });
        
        button.addEventListener('mouseout', () => {
            button.style.backgroundColor = 'transparent';
        });
        
        button.addEventListener('click', callback);
        
        menu.appendChild(button);
    }
    
    // Get background color for item based on type
    getItemBackgroundColor(type) {
        const typeColors = {
            'weapon': 'rgba(139, 0, 0, 0.7)',    // Dark red
            'armor': 'rgba(75, 75, 75, 0.7)',    // Dark gray
            'accessory': 'rgba(218, 165, 32, 0.7)', // Goldenrod
            'consumable': 'rgba(0, 100, 0, 0.7)', // Dark green
            'misc': 'rgba(75, 0, 130, 0.7)'      // Indigo
        };
        
        return typeColors[type] || 'rgba(50, 50, 50, 0.7)';
    }
}