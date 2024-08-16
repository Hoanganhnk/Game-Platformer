const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const player = {
    x: 50,
    y: 50,
    width: 50,
    height: 50,
    color: 'blue',
    speed: 5,
    dx: 0,
    dy: 0,
    gravity: 0.5,
    jumpPower: -12,
    onGround: false
};

const enemy = {
    x: 300,
    y: 520,
    width: 30,
    height: 30,
    color: 'red',
    speed: 2,
    dx: 2
};

const targetArea = {
    width: 30,
    height: 30,
    color: 'yellow',
    x: 0,
    y: 0
};

let score = 0;
let scoreInterval;

const levels = [
    {
        platforms: [
            { x: 0, y: 550, width: 800, height: 50, color: 'green' },
            { x: 200, y: 400, width: 100, height: 20, color: 'green' },
            { x: 400, y: 300, width: 100, height: 20, color: 'green' },
            { x: 600, y: 250, width: 100, height: 20, color: 'green' },
            { x: 100, y: 250, width: 100, height: 20, color: 'green' },
            { x: 400, y: 200, width: 100, height: 20, color: 'green' },
            { x: 600, y: 200, width: 100, height: 20, color: 'green' }
        ],
        enemies: [
            { x: 300, y: 520, width: 30, height: 30, color: 'red', speed: 2, dx: 2 }
        ]
    },
    {
        platforms: [
            { x: 0, y: 565, width: 800, height: 50, color: 'green' },
            { x: 150, y: 465, width: 100, height: 20, color: 'green' },
            { x: 350, y: 365, width: 100, height: 20, color: 'green' },
            { x: 550, y: 265, width: 100, height: 20, color: 'green' },
            { x: 200, y: 175, width: 100, height: 20, color: 'green' },
            { x: 500, y: 175, width: 100, height: 20, color: 'green' }
        ],
        enemies: [
            { x: 200, y: 520, width: 30, height: 30, color: 'red', speed: 2, dx: 15 },
            { x: 500, y: 520, width: 30, height: 30, color: 'red', speed: 20, dx: 20 }
        ]
    }
];

let currentLevel = 0;
const platforms = [];

function loadLevel(level) {
    platforms.length = 0;
    level.platforms.forEach(p => platforms.push({...p}));
    if (level.enemies.length > 0) {
        enemy.x = level.enemies[0].x;
        enemy.y = level.enemies[0].y;
        enemy.dx = level.enemies[0].dx;
    }
    // Đặt vị trí của khu vực mục tiêu10
    if (currentLevel === 0 && platforms.length > 6) {
        const targetPlatform = platforms[6]; // Nền tảng cuối cùng trong màn 1
        targetArea.x = targetPlatform.x + (targetPlatform.width / 2) - (targetArea.width / 2);
        targetArea.y = targetPlatform.y - targetArea.height - 30; // Cách nền tảng 30px
    } else if (currentLevel === 1 && platforms.length > 5) {
        const targetPlatform = platforms[5]; // Nền tảng thứ 6 trong màn 2
        targetArea.x = targetPlatform.x + (targetPlatform.width / 2) - (targetArea.width / 2);
        targetArea.y = targetPlatform.y - targetArea.height - 50; // Cách nền tảng 50px
    }
    // Đặt lại vị trí của người chơi khi chuyển cấp độ
    if (currentLevel === 0) {
        player.x = 50; // Đặt lại vị trí X cho người chơi
        player.y = canvas.height - player.height; // Đặt người chơi ở mặt đất
    } else {
        player.x = 50; // Hoặc điều chỉnh vị trí cho phù hợp với cấp độ mới
        player.y = canvas.height - player.height; // Đặt người chơi ở mặt đất của màn mới
    }
    player.dx = 0;
    player.dy = 0;
    player.onGround = false;
}

function drawPlayer() {
    ctx.fillStyle = player.color;
    ctx.fillRect(player.x, player.y, player.width, player.height);
}

function drawEnemy() {
    ctx.fillStyle = enemy.color;
    ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
}

function drawPlatforms() {
    platforms.forEach(platform => {
        ctx.fillStyle = platform.color;
        ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
    });
}

function drawTarget() {
    ctx.fillStyle = targetArea.color;
    ctx.fillRect(targetArea.x, targetArea.y, targetArea.width, targetArea.height);
}

function clear() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function update() {
    clear();
    drawPlayer();
    drawPlatforms();
    drawEnemy();
    drawTarget(); // Vẽ khu vực mục tiêu
    updateEnemy();
    updateScore();

    player.x += player.dx;
    player.y += player.dy;

    // Giới hạn chuyển động ngang (trái và phải)
    if (player.x < 0) {
        player.x = 0;
    }
    if (player.x + player.width > canvas.width) {
        player.x = canvas.width - player.width;
    }

    // Gravity
    if (!player.onGround) {
        player.dy += player.gravity;
    }

    player.onGround = false;
    platforms.forEach(platform => {
        if (player.x < platform.x + platform.width &&
            player.x + player.width > platform.x &&
            player.y + player.height <= platform.y + 10 &&
            player.y + player.height >= platform.y) {
            player.dy = 0;
            player.onGround = true;
            player.y = platform.y - player.height;
        }
    });

    if (player.y + player.height >= canvas.height) {
        player.dy = 0;
        player.onGround = true;
        player.y = canvas.height - player.height;
    }

    // Kiểm tra khi người chơi chạm vào khu vực mục tiêu
    if (player.x < targetArea.x + targetArea.width &&
        player.x + player.width > targetArea.x &&
        player.y < targetArea.y + targetArea.height &&
        player.y + player.height > targetArea.y &&
        player.onGround) { // Kiểm tra xem người chơi có đứng trên mặt đất
        if (currentLevel === 1) {
            alert("Bạn đã hoàn thành tất cả các cấp độ!");
            document.location.reload(); // Dừng trò chơi và tải lại
        } else {
            currentLevel++;
            if (currentLevel >= levels.length) {
                currentLevel = levels.length - 1; // Đảm bảo không vượt quá số cấp độ
                alert("Bạn đã hoàn thành tất cả các cấp độ!");
                document.location.reload(); // Dừng trò chơi và tải lại
            } else {
                alert("Chuyển sang cấp độ tiếp theo!");
                loadLevel(levels[currentLevel]);
            }
        }
    }

    requestAnimationFrame(update);
}

function updateEnemy() {
    enemy.x += enemy.dx;
    if (enemy.x + enemy.width > canvas.width || enemy.x < 0) {
        enemy.dx *= -1; // Đổi hướng
    }

    if (player.x < enemy.x + enemy.width &&
        player.x + player.width > enemy.x &&
        player.y < enemy.y + enemy.height &&
        player.y + player.height > enemy.y) {
        alert("Game Over!");
        document.location.reload(); // Tải lại trò chơi
    }
}

function moveRight() {
    player.dx = player.speed;
}

function moveLeft() {
    player.dx = -player.speed;
}

function jump() {
    if (player.onGround) {
        player.dy = player.jumpPower;
        player.onGround = false;
    }
}

function stop() {
    player.dx = 0;
}

function startScoreTimer() {
    scoreInterval = setInterval(() => {
        score += 1;
    }, 500);
}

function updateScore() {
    ctx.fillStyle = 'white';
    ctx.font = '24px Arial';
    ctx.fillText('Score: ' + score, 10, 30);
}

document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') {
        moveRight();
    } else if (e.key === 'ArrowLeft') {
        moveLeft();
    } else if (e.key === 'ArrowUp') {
        jump();
    }
});

document.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
        stop();
    }
});

loadLevel(levels[currentLevel]);
startScoreTimer(); // Bắt đầu tính điểm
update();