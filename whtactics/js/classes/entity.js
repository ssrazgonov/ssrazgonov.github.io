// Base class for all game entities
class Entity {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.visible = true;
        this.active = true;
        this.sprite = null;
    }

    // Update entity state
    update(deltaTime) {
        // To be overridden by subclasses
    }

    // Draw the entity
    draw(ctx) {
        if (!this.visible) return;
        
        if (this.sprite) {
            ctx.drawImage(this.sprite, this.x, this.y, this.width, this.height);
        } else {
            // Debug rectangle if no sprite is available
            ctx.fillStyle = 'rgba(255, 0, 0, 0.5)';
            ctx.fillRect(this.x, this.y, this.width, this.height);
            
            ctx.strokeStyle = 'red';
            ctx.lineWidth = 2;
            ctx.strokeRect(this.x, this.y, this.width, this.height);
        }
    }

    // Check collision with another entity
    collidesWith(entity) {
        return (
            this.x < entity.x + entity.width &&
            this.x + this.width > entity.x &&
            this.y < entity.y + entity.height &&
            this.y + this.height > entity.y
        );
    }

    // Get center coordinates
    getCenter() {
        return {
            x: this.x + this.width / 2,
            y: this.y + this.height / 2
        };
    }

    // Set entity position
    setPosition(x, y) {
        this.x = x;
        this.y = y;
    }

    // Set entity sprite
    setSprite(sprite) {
        this.sprite = sprite;
    }
}