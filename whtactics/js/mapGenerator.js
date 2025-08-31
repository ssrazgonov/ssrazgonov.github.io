// Map Generator for creating the game grid
class MapGenerator {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.tiles = [];
        this.path = [];
    }
    
    // Initialize empty grid
    initializeGrid() {
        this.tiles = [];
        
        for (let y = 0; y < this.height; y++) {
            const row = [];
            for (let x = 0; x < this.width; x++) {
                row.push(new Tile(x, y));
            }
            this.tiles.push(row);
        }
        
        return this.tiles;
    }
    
    // Generate a loop path
    generateLoopPath() {
        // Clear any existing path
        this.path = [];
        
        // Define the starting position (off-center of the map)
        const startX = Math.floor(this.width * 0.35); // Move to the left side
        const startY = Math.floor(this.height * 0.35); // Move to the upper side
        
        // Create a rectangular path
        const pathWidth = Math.floor(this.width * 0.5);
        const pathHeight = Math.floor(this.height * 0.5);
        
        const leftX = startX;
        const rightX = leftX + pathWidth;
        const topY = startY;
        const bottomY = topY + pathHeight;
        
        // Top edge (left to right)
        for (let x = leftX; x <= rightX; x++) {
            // Minimal variance to ensure path integrity
            const variance = Math.random() < 0.15 ? (Math.random() > 0.5 ? 1 : -1) : 0;
            const y = Math.max(0, Math.min(this.height - 1, topY + variance));
            this.path.push({ x, y });
        }
        
        // Right edge (top to bottom)
        for (let y = topY + 1; y <= bottomY; y++) {
            const variance = Math.random() < 0.15 ? (Math.random() > 0.5 ? 1 : -1) : 0;
            const x = Math.max(0, Math.min(this.width - 1, rightX + variance));
            this.path.push({ x, y });
        }
        
        // Bottom edge (right to left)
        for (let x = rightX - 1; x >= leftX; x--) {
            const variance = Math.random() < 0.15 ? (Math.random() > 0.5 ? 1 : -1) : 0;
            const y = Math.max(0, Math.min(this.height - 1, bottomY + variance));
            this.path.push({ x, y });
        }
        
        // Left edge (bottom to top)
        for (let y = bottomY - 1; y > topY; y--) {
            const variance = Math.random() < 0.15 ? (Math.random() > 0.5 ? 1 : -1) : 0;
            const x = Math.max(0, Math.min(this.width - 1, leftX + variance));
            this.path.push({ x, y });
        }
        
        // Mark path tiles
        this.path.forEach(point => {
            if (
                point.x >= 0 && point.x < this.width &&
                point.y >= 0 && point.y < this.height
            ) {
                const tile = this.tiles[point.y][point.x];
                tile.setAsPath();
            }
        });
        
        // Mark placeable tiles (adjacent to path)
        this.markPlaceableTiles();
        
        return this.path;
    }
    
    // Mark tiles adjacent to the path as placeable
    markPlaceableTiles() {
        const directions = [
            { dx: -1, dy: 0 },
            { dx: 1, dy: 0 },
            { dx: 0, dy: -1 },
            { dx: 0, dy: 1 }
        ];
        
        this.path.forEach(pathPoint => {
            directions.forEach(dir => {
                const adjX = pathPoint.x + dir.dx;
                const adjY = pathPoint.y + dir.dy;
                
                if (
                    adjX >= 0 && adjX < this.width &&
                    adjY >= 0 && adjY < this.height
                ) {
                    const tile = this.tiles[adjY][adjX];
                    tile.setAsPlaceable();
                }
            });
        });
    }
    
    // Get starting position for character (first path tile)
    getStartingPosition() {
        if (this.path.length > 0) {
            const { x, y } = this.path[0];
            const canvasPos = gridToCanvas(x, y);
            return {
                gridX: x,
                gridY: y,
                canvasX: canvasPos.x,
                canvasY: canvasPos.y
            };
        }
        
        // Fallback to center
        const x = Math.floor(this.width / 2);
        const y = Math.floor(this.height / 2);
        const canvasPos = gridToCanvas(x, y);
        
        return {
            gridX: x,
            gridY: y,
            canvasX: canvasPos.x,
            canvasY: canvasPos.y
        };
    }
    
    // Get tile at grid position
    getTile(gridX, gridY) {
        if (
            gridX >= 0 && gridX < this.width &&
            gridY >= 0 && gridY < this.height
        ) {
            return this.tiles[gridY][gridX];
        }
        return null;
    }
    
    // Get all placeable tiles
    getPlaceableTiles() {
        const placeables = [];
        
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                if (this.tiles[y][x].isPlaceable && !this.tiles[y][x].isOccupied) {
                    placeables.push(this.tiles[y][x]);
                }
            }
        }
        
        return placeables;
    }
    
    // Reset all tiles' daily effects
    resetDailyEffects() {
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                this.tiles[y][x].resetDailyEffects();
            }
        }
    }
    
    // Draw the entire map
    draw(ctx) {
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                this.tiles[y][x].draw(ctx);
            }
        }
    }
}