// Utility Functions

/**
 * Get a random integer between min (inclusive) and max (inclusive)
 */
function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Get a random value from a range [min, max]
 */
function getRandomValue(range) {
    if (Array.isArray(range)) {
        return getRandomInt(range[0], range[1]);
    }
    return range;
}

/**
 * Calculate distance between two points
 */
function calculateDistance(x1, y1, x2, y2) {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}

/**
 * Linear interpolation between two values
 */
function lerp(start, end, t) {
    return start * (1 - t) + end * t;
}

/**
 * Check if a point is inside a rectangle
 */
function pointInRect(x, y, rect) {
    return x >= rect.x && 
           x <= rect.x + rect.width && 
           y >= rect.y && 
           y <= rect.y + rect.height;
}

/**
 * Convert grid coordinates to canvas coordinates
 */
function gridToCanvas(gridX, gridY) {
    return {
        x: gridX * TILE_SIZE,
        y: gridY * TILE_SIZE
    };
}

/**
 * Convert canvas coordinates to grid coordinates
 */
function canvasToGrid(canvasX, canvasY) {
    return {
        x: Math.floor(canvasX / TILE_SIZE),
        y: Math.floor(canvasY / TILE_SIZE)
    };
}

/**
 * Draw text with a stroke
 */
function drawTextWithStroke(ctx, text, x, y, fillStyle, strokeStyle, lineWidth = 3, fontSize = 16, align = 'center') {
    ctx.font = `${fontSize}px Arial`;
    ctx.textAlign = align;
    
    // Draw stroke
    ctx.strokeStyle = strokeStyle;
    ctx.lineWidth = lineWidth;
    ctx.strokeText(text, x, y);
    
    // Draw fill
    ctx.fillStyle = fillStyle;
    ctx.fillText(text, x, y);
}

/**
 * Create and load an image
 */
function loadImage(src) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = src;
    });
}

/**
 * Preload multiple images
 */
async function preloadImages(imageMap) {
    const promises = Object.entries(imageMap).map(async ([key, src]) => {
        try {
            const img = await loadImage(src);
            return [key, img];
        } catch (error) {
            console.error(`Failed to load image: ${src}`, error);
            return [key, null];
        }
    });
    
    const results = await Promise.all(promises);
    return Object.fromEntries(results);
}

/**
 * Deep clone an object
 */
function deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
}

/**
 * Shuffle an array
 */
function shuffleArray(array) {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
}