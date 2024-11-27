// Three.js setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Lighting
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(5, 10, 5);
scene.add(light);

// Ground types: grass, road, river
const groundTypes = ['grass', 'road', 'river'];
const playerSpeed = 0.1;  // Slower player movement speed
const obstacleSpeed = 0.05;  // Slower obstacle speed

// Terrain and Obstacle Arrays
let terrain = [];
let obstacles = [];

// Player setup
const playerGeometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
const playerMaterial = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
const player = new THREE.Mesh(playerGeometry, playerMaterial);
scene.add(player);
player.position.set(0, 0.25, 0);

// Camera positioning for a top-down angled view
camera.position.set(0, 12, 12);
camera.rotation.x = -Math.PI / 4;  // 45-degree tilt

// Generate terrain
function generateTerrain() {
    for (let i = 0; i < 20; i++) {
        const type = groundTypes[Math.floor(Math.random() * groundTypes.length)];
        createGroundSegment(type, i);
    }
}

// Create ground segments and add obstacles
function createGroundSegment(type, zIndex) {
    const groundGeometry = new THREE.PlaneGeometry(10, 1);
    const colorMap = { grass: 0x00ff00, road: 0x333333, river: 0x0000ff };
    const groundMaterial = new THREE.MeshStandardMaterial({ color: colorMap[type] });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.set(0, 0, -zIndex);
    scene.add(ground);
    terrain.push({ type, mesh: ground });

    if (type === 'road' || type === 'river') {
        createObstacles(type, zIndex);
    }
}

// Create obstacles (cars and logs) with slower speeds
function createObstacles(type, zIndex) {
    const obstacleGeometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
    const color = type === 'road' ? 0xff0000 : 0x8b4513;
    const material = new THREE.MeshStandardMaterial({ color });

    for (let i = -4; i <= 4; i += 3) {  // Wider gaps between obstacles
        const obstacle = new THREE.Mesh(obstacleGeometry, material);
        obstacle.position.set(i, 0.25, -zIndex);
        scene.add(obstacle);
        obstacles.push({ 
            mesh: obstacle, 
            type, 
            direction: (i % 2 === 0) ? 1 : -1 
        });
    }
}

// Update obstacles' positions and check for collisions
function updateObstacles() {
    obstacles.forEach((obstacle) => {
        obstacle.mesh.position.x += obstacle.direction * obstacleSpeed;
        if (obstacle.mesh.position.x > 5) obstacle.mesh.position.x = -5;
        if (obstacle.mesh.position.x < -5) obstacle.mesh.position.x = 5;

        if (checkCollision(player, obstacle.mesh)) {
            gameState.gameOver = true;
            alert('Game Over!');
        }
    });
}

// Collision detection
function checkCollision(obj1, obj2) {
    const distance = obj1.position.distanceTo(obj2.position);
    return distance < 0.5;
}

// Control player movement (slower increments)
document.addEventListener('keydown', (e) => {
    if (gameState.gameOver) return;
    switch (e.key) {
        case 'ArrowLeft':
            player.position.x -= 1;
            break;
        case 'ArrowRight':
            player.position.x += 1;
            break;
        case 'ArrowUp':
            player.position.z -= 1;
            break;
        case 'ArrowDown':
            player.position.z += 1;
            break;
    }
});

// Game state management
const gameState = { gameOver: false };

// Main animation loop with camera following
function animate() {
    if (gameState.gameOver) return;
    updateObstacles();

    // Smooth camera follow for better pacing
    camera.position.z = player.position.z + 8;
    camera.position.x += (player.position.x - camera.position.x) * 0.1;  // Smooth X movement
    camera.lookAt(player.position);

    renderer.render(scene, camera);
    requestAnimationFrame(animate);
}

// Initialize game setup
generateTerrain();
animate();
