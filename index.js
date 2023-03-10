console.log(gsap);
const canvas = document.querySelector('canvas');
const c = canvas.getContext('2d');

canvas.width = innerWidth;
canvas.height = innerHeight;

const scoreEl = document.querySelector('#scoreEl');
const modalEl = document.querySelector('#modalEl');
const startGameBtn = document.querySelector('#startGameBtn');
const bigScoreEl = document.querySelector('#bigScoreEl');
const highScoreEl = document.querySelector('#highScoreEl');
let highScore = localStorage.getItem('dot-invaders:highScore') || 0;
highScoreEl.innerHTML = highScore;

class Player {
    constructor(x, y, radius, color) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
    }
    
    draw() {
        c.beginPath();
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        c.fillStyle = this.color;
        c.fill()
    }
}

class Projectile {
    constructor(x, y, radius, color, velocity) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.velocity = velocity;
    }

    draw() {
        c.beginPath();
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        c.fillStyle = this.color;
        c.fill()
    }

    update() {
        this.draw();
        this.x += this.velocity.x;
        this.y += this.velocity.y;
    }
}

class Enemy {
    constructor(x, y, radius, color, velocity) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.velocity = velocity;
    }

    draw() {
        c.beginPath();
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        c.fillStyle = this.color;
        c.fill()
    }

    update() {
        this.draw();
        this.x += this.velocity.x;
        this.y += this.velocity.y;
    }
}
const friction = 0.99;
class Particle {
    constructor(x, y, radius, color, velocity) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.velocity = velocity;
        this.alpha = 1;
    }

    draw() {
        c.save();
        c.globalAlpha = this.alpha;
        c.beginPath();
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        c.fillStyle = this.color;
        c.fill();
        c.restore();
    }

    update() {
        this.velocity.x *= friction;
        this.velocity.y *= friction;
        this.draw();
        this.x += this.velocity.x;
        this.y += this.velocity.y;
        this.alpha -= 0.01;
    }
}

const x = canvas.width / 2;
const y = canvas.height / 2;

let player = new Player(x, y, 10, 'white');
let projectiles = [];
let enemies = [];
let particles = [];

const init = () => {
    player = new Player(x, y, 10, 'white');
    projectiles = [];
    enemies = [];
    particles = [];
    score = 0;
    scoreEl.innerHTML = score;
    bigScoreEl.innerHTML = score;
    highScoreEl.innerHTML = highScore;
}

const spawnEnemies = () => {
    setInterval(() => {
        let x;
        let y;
        const radius = Math.random() * (30 - 4) + 4;
        if(Math.random() < 0.5){
        x = Math.random() < 0.5 ? 0 - radius : canvas.width + radius;
        y = Math.random() * canvas.height;
        // y = Math.random() < 0.5 ? 0 - radius : canvas.height + radius;
        } else {
            x = Math.random() * canvas.width;
            // y = Math.random() * canvas.height;
            y = Math.random() < 0.5 ? 0 - radius : canvas.height + radius;
        }
        const color = `hsl(${Math.random() * 360}, 50%, 50%)`;
        const angle = Math.atan2(canvas.height/2 - y, canvas.width/2 - x);
    const velocity = {
        x: Math.cos(angle),
        y: Math.sin(angle)
    }
        // console.log('eenemy created');
        enemies.push(new Enemy(x, y, radius, color, velocity));
    }, 1000);
}
let animationId;
let score = 0;
const animate = () => {
    animationId = requestAnimationFrame(animate);
    c.fillStyle = 'rgba(0, 0, 0, 0.1)';
    c.fillRect(0, 0, canvas.width, canvas.height);
    player.draw();
    particles.forEach((particle, index) => {
        if(particle.alpha <= 0) {
            particles.splice(index, 1)
        } else {
            particle.update();
        }
        particle.update();
    })
    projectiles.forEach((projectile, index) => {
        projectile.update();
        if(projectile.x + projectile.radius < 0 || projectile.x  - projectile.radius > canvas.width || projectile.y + projectile.radius < 0 || projectile.y - projectile.radius > canvas.height){
            setTimeout(() => {
            projectiles.splice(index, 1);
            }, 0)
        }
    });

    enemies.forEach((enemy, index) => {
        enemy.update();

        const dist = Math.hypot(player.x - enemy.x, player.y - enemy.y);
        if(dist - enemy.radius - player.radius < 1) {
            cancelAnimationFrame(animationId);
            modalEl.style.display = "flex";
            bigScoreEl.innerHTML = score;
            if(score > highScore) {
                highScore = score;
            }
            localStorage.setItem('dot-invaders:highScore', highScore);
            highScoreEl.innerHTML = highScore;
        }

        projectiles.forEach((projectile, projIndex) => {
            const dist = Math.hypot(projectile.x - enemy.x, projectile.y - enemy.y);
            if (dist - enemy.radius - projectile.radius < 1) {
                

                //create explosions
                for(let i = 0; i < enemy.radius * 2; i++){
                    particles.push(new Particle(projectile.x, projectile.y, Math.random() * 2, enemy.color, {
                        x: (Math.random() - 0.5) * (Math.random() * 8),
                        y: (Math.random() - 0.5) * (Math.random() * 8)
                    }));
                }
                if(enemy.radius - 10 > 5){
                score += 100;
                scoreEl.innerHTML = score;
                    gsap.to(enemy, {
                         radius: enemy.radius - 10
                    });
                    setTimeout(() => {
                        projectiles.splice(projIndex, 1);
                    }, 0)
                } else {
                setTimeout(() => {
                    score += 250;
                    scoreEl.innerHTML = score;
                    console.log(score);
                    enemies.splice(index, 1);
                    projectiles.splice(projIndex, 1);
                }, 0)
            }
            }
        })
    })
}

addEventListener('click', (e) => {
    // console.log(projectiles);
    const angle = Math.atan2(e.clientY - canvas.height/2, e.clientX - canvas.width/2);
    const velocity = {
        x: Math.cos(angle) * 5,
        y: Math.sin(angle) * 5
    }
    projectiles.push(
        new Projectile(
            canvas.width / 2,
            canvas.height /2,
            5,
            'white',
            velocity
        )
    );
});

startGameBtn.addEventListener('click', () => {
    init();
    animate();
    spawnEnemies();
    modalEl.style.display = "none";
})
