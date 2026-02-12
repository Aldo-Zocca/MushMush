const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Remove instructions after first click
document.getElementById('instructions').addEventListener('click', () => {
    document.getElementById('instructions').style.display = 'none';
});

class Mushroom {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.age = 0;
        this.maxAge = 300;
        this.rootNetwork = new RootNetwork(x, y, this);
        this.size = Math.random() * 30 + 20;
        this.capColor = this.generateCapColor();
    }

    generateCapColor() {
        const colors = [
            { r: 255, g: 120, b: 80 },   // Rusty red
            { r: 200, g: 100, b: 120 },  // Pinkish
            { r: 220, g: 130, b: 60 },   // Orange-brown
            { r: 180, g: 90, b: 100 },   // Mauve
            { r: 240, g: 140, b: 100 }   // Peachy
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    update() {
        this.age++;
        this.rootNetwork.update();
    }

    draw() {
        const alpha = Math.max(0, 1 - (this.age / this.maxAge) * 0.5);
        
        // Draw stem
        ctx.fillStyle = `rgba(220, 200, 180, ${alpha * 0.9})`;
        ctx.fillRect(this.x - 6, this.y + 5, 12, 25);

        // Draw mushroom cap with gradient
        const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size);
        const capColor = this.capColor;
        gradient.addColorStop(0, `rgba(${capColor.r}, ${capColor.g}, ${capColor.b}, ${alpha})`);
        gradient.addColorStop(0.7, `rgba(${Math.max(0, capColor.r - 50)}, ${Math.max(0, capColor.g - 50)}, ${Math.max(0, capColor.b - 50)}, ${alpha * 0.8})`);
        gradient.addColorStop(1, `rgba(0, 0, 0, ${alpha * 0.3})`);

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.ellipse(this.x, this.y, this.size, this.size * 0.6, 0, 0, Math.PI * 2);
        ctx.fill();

        // Draw gills
        ctx.strokeStyle = `rgba(150, 100, 80, ${alpha * 0.6})`;
        ctx.lineWidth = 1;
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI;
            const x1 = this.x + Math.cos(angle - Math.PI / 2) * this.size;
            const y1 = this.y + Math.sin(angle - Math.PI / 2) * this.size * 0.6;
            const x2 = this.x + Math.cos(angle - Math.PI / 2) * (this.size * 0.3);
            const y2 = this.y + Math.sin(angle - Math.PI / 2) * (this.size * 0.18) + 10;
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.stroke();
        }

        this.rootNetwork.draw();
    }

    isAlive() {
        return this.age < this.maxAge;
    }

    getPosition() {
        return { x: this.x, y: this.y };
    }
}

class RootNetwork {
    constructor(x, y, mushroom) {
        this.startX = x;
        this.startY = y;
        this.mushroom = mushroom;
        this.segments = [];
        this.branchChance = 0.02;
        this.maxSegments = 150;
        
        // Initialize root segments
        for (let i = 0; i < 5; i++) {
            this.segments.push(new RootSegment(x, y, Math.random() * Math.PI * 2));
        }
    }

    update() {
        for (let segment of this.segments) {
            segment.update();
        }

        // Spawn new segments
        if (this.segments.length < this.maxSegments && Math.random() < this.branchChance) {
            const parent = this.segments[Math.floor(Math.random() * this.segments.length)];
            const angle = parent.angle + (Math.random() - 0.5) * 0.4;
            this.segments.push(new RootSegment(parent.x, parent.y, angle));
        }
    }

    draw() {
        for (let segment of this.segments) {
            segment.draw();
        }
    }

    getAllSegments() {
        return this.segments;
    }
}

class RootSegment {
    constructor(x, y, angle, parent = null) {
        this.x = x;
        this.y = y;
        this.angle = angle;
        this.parent = parent;
        this.length = Math.random() * 15 + 5;
        this.age = 0;
        this.maxAge = 200;
        this.vx = Math.cos(angle) * 1;
        this.vy = Math.sin(angle) * 1;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.age++;

        // Slight gravity and random drift
        this.vy += 0.1;
        this.vx += (Math.random() - 0.5) * 0.2;
    }

    draw() {
        const alpha = Math.max(0, 1 - (this.age / this.maxAge) * 0.7);
        const neonGlow = `rgba(0, 255, 136, ${alpha * 0.8})`;
        
        // Draw root segment with glow effect
        ctx.strokeStyle = neonGlow;
        ctx.lineWidth = Math.random() * 1 + 0.5;
        ctx.lineCap = 'round';
        ctx.shadowColor = `rgba(0, 255, 136, ${alpha * 0.6})`;
        ctx.shadowBlur = 10;

        ctx.beginPath();
        if (this.parent) {
            ctx.moveTo(this.parent.x, this.parent.y);
        }
        ctx.lineTo(this.x, this.y);
        ctx.stroke();

        ctx.shadowColor = 'transparent';
    }
}

class MushMushEcosystem {
    constructor() {
        this.mushrooms = [];
        this.maxMushrooms = 20;
        this.attractionRange = 300;
        this.mergeThreshold = 50;
    }

    addMushroom(x, y) {
        if (this.mushrooms.length < this.maxMushrooms) {
            this.mushrooms.push(new Mushroom(x, y));
        }
    }

    update() {
        // Update all mushrooms
        for (let mushroom of this.mushrooms) {
            mushroom.update();
        }

        // Check for merging rhizome networks
        this.checkForMerge();

        // Remove dead mushrooms
        this.mushrooms = this.mushrooms.filter(m => m.isAlive());
    }

    checkForMerge() {
        if (this.mushrooms.length < 2) return;

        for (let i = 0; i < this.mushrooms.length; i++) {
            for (let j = i + 1; j < this.mushrooms.length; j++) {
                const m1 = this.mushrooms[i];
                const m2 = this.mushrooms[j];
                
                const distance = Math.hypot(m1.x - m2.x, m1.y - m2.y);

                // Gradually increase attraction range based on proximity
                if (distance < this.attractionRange && distance > this.mergeThreshold) {
                    this.mergeNetworks(m1, m2, distance);
                }
            }
        }
    }

    mergeNetworks(m1, m2, distance) {
        // Make roots grow towards each other
        const mergeInfluence = Math.max(0, 1 - (distance / this.attractionRange));

        for (let segment of m1.rootNetwork.segments) {
            const dirX = m2.x - segment.x;
            const dirY = m2.y - segment.y;
            const dist = Math.hypot(dirX, dirY);
            if (dist > 0) {
                segment.vx += (dirX / dist) * mergeInfluence * 0.3;
                segment.vy += (dirY / dist) * mergeInfluence * 0.3;
            }
        }

        for (let segment of m2.rootNetwork.segments) {
            const dirX = m1.x - segment.x;
            const dirY = m1.y - segment.y;
            const dist = Math.hypot(dirX, dirY);
            if (dist > 0) {
                segment.vx += (dirX / dist) * mergeInfluence * 0.3;
                segment.vy += (dirY / dist) * mergeInfluence * 0.3;
            }
        }
    }

    draw() {
        for (let mushroom of this.mushrooms) {
            mushroom.draw();
        }
    }
}

const ecosystem = new MushMushEcosystem();

// Click handler
canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    ecosystem.addMushroom(x, y);
});

// Touch handler for mobile
canvas.addEventListener('touchstart', (e) => {
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    ecosystem.addMushroom(x, y);
    e.preventDefault();
});

// Animation loop
function animate() {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ecosystem.update();
    ecosystem.draw();

    requestAnimationFrame(animate);
}

// Handle window resize
window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});

animate();