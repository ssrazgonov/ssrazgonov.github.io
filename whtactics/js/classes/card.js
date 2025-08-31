// Card class
class Card {
    constructor(cardType) {
        this.type = cardType;
        this.name = cardType.name;
        this.description = cardType.description;
        this.effects = cardType.effects;
        this.isSelected = false;
        
        // UI properties
        this.element = null;
        this.createCardElement();
    }
    
    // Create DOM element for this card
    createCardElement() {
        this.element = document.createElement('div');
        this.element.className = 'card';
        this.element.setAttribute('data-card-name', this.name);
        
        // Card title
        const titleElement = document.createElement('div');
        titleElement.className = 'card-title';
        titleElement.textContent = this.name;
        
        // Placeholder image (can be replaced with actual images later)
        const imageElement = document.createElement('div');
        imageElement.className = 'card-image';
        imageElement.style.backgroundColor = this.getCardColor();
        
        // Add elements to card
        this.element.appendChild(imageElement);
        this.element.appendChild(titleElement);
        
        // Add tooltip with description
        this.element.title = this.description;
        
        // Add click handler
        this.element.addEventListener('click', () => this.select());
    }
    
    // Get card color based on type
    getCardColor() {
        switch (this.type.type) {
            case TERRAIN_TYPES.BATTLEFIELD:
                return '#8B0000';
            case TERRAIN_TYPES.FORGE:
                return '#CD5C5C';
            case TERRAIN_TYPES.WARP_RIFT:
                return '#800080';
            case TERRAIN_TYPES.RUINS:
                return '#A9A9A9';
            case TERRAIN_TYPES.SETTLEMENT:
                return '#228B22';
            case TERRAIN_TYPES.OUTPOST:
                return '#6B8E23';
            default:
                return '#555555';
        }
    }
    
    // Select this card
    select() {
        // Deselect all other cards
        document.querySelectorAll('.card').forEach(cardElement => {
            cardElement.classList.remove('selected');
        });
        
        this.isSelected = true;
        this.element.classList.add('selected');
        
        // Dispatch event that card was selected
        const event = new CustomEvent('card-selected', { 
            detail: { card: this }
        });
        document.dispatchEvent(event);
    }
    
    // Deselect this card
    deselect() {
        this.isSelected = false;
        if (this.element) {
            this.element.classList.remove('selected');
        }
    }
    
    // Remove card from deck
    removeFromDeck() {
        if (this.element && this.element.parentNode) {
            this.element.parentNode.removeChild(this.element);
        }
    }
    
    // Draw the card (for canvas rendering if needed)
    draw(ctx, x, y, width, height) {
        // Background
        ctx.fillStyle = this.getCardColor();
        ctx.fillRect(x, y, width, height);
        
        // Border
        ctx.strokeStyle = this.isSelected ? '#FFD700' : '#000000';
        ctx.lineWidth = this.isSelected ? 3 : 1;
        ctx.strokeRect(x, y, width, height);
        
        // Title
        drawTextWithStroke(
            ctx,
            this.name,
            x + width / 2,
            y + height - 10,
            'white',
            'black',
            2,
            12
        );
    }
}