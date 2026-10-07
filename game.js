const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const scoreDisplay = document.getElementById("score");
const highScoreDisplay = document.getElementById("highScore");
const levelDisplay = document.getElementById("level");

const startBtn = document.getElementById("startBtn");
const pauseBtn = document.getElementById("pauseBtn");
const restartBtn = document.getElementById("restartBtn");

const gameOverScreen = document.getElementById("gameOver");
const finalScore = document.getElementById("finalScore");
const gameOverRestart = document.getElementById("gameOverRestart");

const gridSize = 20;
const tileCount = canvas.width / gridSize;

let snake = [];
let food;
let direction;
let nextDirection;

let score = 0;
let level = 1;
let highScore = Number(localStorage.getItem("snakeHighScore")) || 0;

let gameRunning = false;
let gamePaused = false;
let gameLoop;
let speed = 120;

highScoreDisplay.textContent = highScore;
levelDisplay.textContent = level;


// ==========================================
// START GAME
// ==========================================

function startGame() {

    snake = [
        { x: 10, y: 10 },
        { x: 9, y: 10 },
        { x: 8, y: 10 },
        { x: 7, y: 10 }
    ];

    direction = { x: 1, y: 0 };
    nextDirection = { x: 1, y: 0 };

    score = 0;
    level = 1;
    speed = 120;

    scoreDisplay.textContent = score;
    levelDisplay.textContent = level;

    gameOverScreen.style.display = "none";

    gameRunning = true;
    gamePaused = false;

    pauseBtn.textContent = "Pause";

    createFood();

    clearInterval(gameLoop);

    gameLoop = setInterval(updateGame, speed);

    drawGame();
}


// ==========================================
// CREATE FOOD
// ==========================================

function createFood() {

    food = {
        x: Math.floor(Math.random() * tileCount),
        y: Math.floor(Math.random() * tileCount)
    };

    for (let part of snake) {

        if (
            part.x === food.x &&
            part.y === food.y
        ) {
            createFood();
            return;
        }
    }
}


// ==========================================
// ROUNDED RECTANGLE
// ==========================================

function roundedRect(x, y, width, height, radius) {

    ctx.beginPath();

    ctx.roundRect(
        x,
        y,
        width,
        height,
        radius
    );

    ctx.fill();
}


// ==========================================
// DRAW SNAKE HEAD
// ==========================================

function drawSnakeHead(part) {

    const x = part.x * gridSize;
    const y = part.y * gridSize;

    // Glow
    ctx.shadowColor = "#00ff88";
    ctx.shadowBlur = 15;

    // Head gradient
    const gradient = ctx.createLinearGradient(
        x,
        y,
        x + gridSize,
        y + gridSize
    );

    gradient.addColorStop(0, "#65ff9a");
    gradient.addColorStop(0.5, "#19e66f");
    gradient.addColorStop(1, "#00a844");

    ctx.fillStyle = gradient;

    roundedRect(
        x + 1,
        y + 1,
        gridSize - 2,
        gridSize - 2,
        7
    );

    ctx.shadowBlur = 0;

    // Eye positions
    let eye1;
    let eye2;

    if (direction.x === 1) {

        eye1 = {
            x: x + 14,
            y: y + 5
        };

        eye2 = {
            x: x + 14,
            y: y + 14
        };

    } else if (direction.x === -1) {

        eye1 = {
            x: x + 6,
            y: y + 5
        };

        eye2 = {
            x: x + 6,
            y: y + 14
        };

    } else if (direction.y === -1) {

        eye1 = {
            x: x + 5,
            y: y + 6
        };

        eye2 = {
            x: x + 14,
            y: y + 6
        };

    } else {

        eye1 = {
            x: x + 5,
            y: y + 14
        };

        eye2 = {
            x: x + 14,
            y: y + 14
        };
    }

    // White eyes
    ctx.fillStyle = "#ffffff";

    ctx.beginPath();
    ctx.arc(
        eye1.x,
        eye1.y,
        3,
        0,
        Math.PI * 2
    );
    ctx.fill();

    ctx.beginPath();
    ctx.arc(
        eye2.x,
        eye2.y,
        3,
        0,
        Math.PI * 2
    );
    ctx.fill();

    // Pupils
    ctx.fillStyle = "#111111";

    ctx.beginPath();
    ctx.arc(
        eye1.x,
        eye1.y,
        1.5,
        0,
        Math.PI * 2
    );
    ctx.fill();

    ctx.beginPath();
    ctx.arc(
        eye2.x,
        eye2.y,
        1.5,
        0,
        Math.PI * 2
    );
    ctx.fill();

    // Tongue
    ctx.strokeStyle = "#ff4d88";
    ctx.lineWidth = 2;

    if (direction.x === 1) {

        ctx.beginPath();

        ctx.moveTo(x + 19, y + 10);
        ctx.lineTo(x + 23, y + 10);

        ctx.stroke();

        ctx.beginPath();

        ctx.moveTo(x + 23, y + 10);
        ctx.lineTo(x + 26, y + 7);

        ctx.stroke();

        ctx.beginPath();

        ctx.moveTo(x + 23, y + 10);
        ctx.lineTo(x + 26, y + 13);

        ctx.stroke();
    }
}


// ==========================================
// DRAW SNAKE BODY
// ==========================================

function drawSnakeBody(part, index) {

    const x = part.x * gridSize;
    const y = part.y * gridSize;

    const gradient = ctx.createLinearGradient(
        x,
        y,
        x + gridSize,
        y + gridSize
    );

    gradient.addColorStop(0, "#32f17e");
    gradient.addColorStop(1, "#079447");

    ctx.fillStyle = gradient;

    ctx.shadowColor = "rgba(0,255,120,0.5)";
    ctx.shadowBlur = 8;

    roundedRect(
        x + 2,
        y + 2,
        gridSize - 4,
        gridSize - 4,
        6
    );

    ctx.shadowBlur = 0;

    // Body highlight
    ctx.fillStyle = "rgba(255,255,255,0.18)";

    ctx.beginPath();

    ctx.arc(
        x + 7,
        y + 6,
        2,
        0,
        Math.PI * 2
    );

    ctx.fill();
}


// ==========================================
// DRAW APPLE FOOD
// ==========================================

function drawFood() {

    const centerX = food.x * gridSize + gridSize / 2;
    const centerY = food.y * gridSize + gridSize / 2;

    // Apple glow
    ctx.shadowColor = "#ff1744";
    ctx.shadowBlur = 20;

    // Apple gradient
    const gradient = ctx.createRadialGradient(
        centerX - 3,
        centerY - 4,
        2,
        centerX,
        centerY,
        10
    );

    gradient.addColorStop(0, "#ffb0c0");
    gradient.addColorStop(0.3, "#ff4d6d");
    gradient.addColorStop(0.7, "#e60032");
    gradient.addColorStop(1, "#9c001f");

    ctx.fillStyle = gradient;

    // Left part of apple
    ctx.beginPath();

    ctx.arc(
        centerX - 3,
        centerY + 1,
        6,
        0,
        Math.PI * 2
    );

    ctx.fill();

    // Right part of apple
    ctx.beginPath();

    ctx.arc(
        centerX + 3,
        centerY + 1,
        6,
        0,
        Math.PI * 2
    );

    ctx.fill();

    // Bottom of apple
    ctx.beginPath();

    ctx.moveTo(
        centerX - 7,
        centerY + 2
    );

    ctx.quadraticCurveTo(
        centerX,
        centerY + 11,
        centerX + 7,
        centerY + 2
    );

    ctx.fill();

    ctx.shadowBlur = 0;

    // Apple shine
    ctx.fillStyle = "#ffffff";

    ctx.beginPath();

    ctx.ellipse(
        centerX - 4,
        centerY - 3,
        2,
        3,
        -0.5,
        0,
        Math.PI * 2
    );

    ctx.fill();

    // Small second shine
    ctx.fillStyle = "rgba(255,255,255,0.5)";

    ctx.beginPath();

    ctx.arc(
        centerX - 1,
        centerY - 6,
        1,
        0,
        Math.PI * 2
    );

    ctx.fill();

    // Apple stem
    ctx.strokeStyle = "#713c18";
    ctx.lineWidth = 2;

    ctx.beginPath();

    ctx.moveTo(
        centerX,
        centerY - 6
    );

    ctx.lineTo(
        centerX + 2,
        centerY - 10
    );

    ctx.stroke();

    // Green leaf
    ctx.fillStyle = "#55ff88";

    ctx.beginPath();

    ctx.ellipse(
        centerX + 5,
        centerY - 8,
        4,
        2,
        -0.5,
        0,
        Math.PI * 2
    );

    ctx.fill();

    // Leaf vein
    ctx.strokeStyle = "#18a85a";
    ctx.lineWidth = 1;

    ctx.beginPath();

    ctx.moveTo(
        centerX + 3,
        centerY - 8
    );

    ctx.lineTo(
        centerX + 7,
        centerY - 8
    );

    ctx.stroke();
}


// ==========================================
// DRAW GAME
// ==========================================

function drawGame() {

    // Background
    ctx.fillStyle = "#08001a";

    ctx.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
    );

    // Grid
    ctx.strokeStyle = "rgba(255,255,255,0.035)";
    ctx.lineWidth = 1;

    for (
        let x = 0;
        x <= canvas.width;
        x += gridSize
    ) {

        ctx.beginPath();

        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);

        ctx.stroke();
    }

    for (
        let y = 0;
        y <= canvas.height;
        y += gridSize
    ) {

        ctx.beginPath();

        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);

        ctx.stroke();
    }

    // Food
    drawFood();

    // Snake
    snake.forEach((part, index) => {

        if (index === 0) {

            drawSnakeHead(part);

        } else {

            drawSnakeBody(part, index);
        }
    });

    // Pause overlay
    if (gamePaused) {

        ctx.fillStyle = "rgba(0,0,0,0.55)";

        ctx.fillRect(
            0,
            0,
            canvas.width,
            canvas.height
        );

        ctx.fillStyle = "#ffffff";

        ctx.font = "bold 42px Arial";

        ctx.textAlign = "center";

        ctx.fillText(
            "PAUSED",
            canvas.width / 2,
            canvas.height / 2
        );

        ctx.font = "18px Arial";

        ctx.fillText(
            "Press Space or Resume",
            canvas.width / 2,
            canvas.height / 2 + 35
        );
    }
}


// ==========================================
// UPDATE GAME
// ==========================================

function updateGame() {

    if (!gameRunning || gamePaused) {
        return;
    }

    direction = nextDirection;

    const head = {
        x: snake[0].x + direction.x,
        y: snake[0].y + direction.y
    };

    // Wall collision
    if (
        head.x < 0 ||
        head.x >= tileCount ||
        head.y < 0 ||
        head.y >= tileCount
    ) {

        endGame();

        return;
    }

    // Snake collision
    for (let part of snake) {

        if (
            head.x === part.x &&
            head.y === part.y
        ) {

            endGame();

            return;
        }
    }

    snake.unshift(head);

    // Food collision
    if (
        head.x === food.x &&
        head.y === food.y
    ) {

        score++;

        scoreDisplay.textContent = score;

        // High score
        if (score > highScore) {

            highScore = score;

            highScoreDisplay.textContent = highScore;

            localStorage.setItem(
                "snakeHighScore",
                highScore
            );
        }

        createFood();

        increaseDifficulty();

    } else {

        snake.pop();
    }

    drawGame();
}


// ==========================================
// INCREASE DIFFICULTY
// ==========================================

function increaseDifficulty() {

    let newSpeed;
    let newLevel;

    if (score < 5) {

        newSpeed = 120;
        newLevel = 1;

    } else if (score < 10) {

        newSpeed = 95;
        newLevel = 2;

    } else if (score < 20) {

        newSpeed = 75;
        newLevel = 3;

    } else {

        newSpeed = 55;
        newLevel = 4;
    }

    if (newLevel !== level) {

        level = newLevel;

        levelDisplay.textContent = level;
    }

    if (newSpeed !== speed) {

        speed = newSpeed;

        clearInterval(gameLoop);

        gameLoop = setInterval(
            updateGame,
            speed
        );
    }
}


// ==========================================
// GAME OVER
// ==========================================

function endGame() {

    gameRunning = false;

    clearInterval(gameLoop);

    finalScore.textContent = score;

    gameOverScreen.style.display = "block";

    fetch("http://localhost:3000/score", {

        method: "POST",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify({
            score: score,
            level: level
        })

    })
    .then(response => response.json())

    .then(data => {

        console.log(
            "Backend response:",
            data
        );

    })

    .catch(error => {

        console.error(
            "Backend error:",
            error
        );
    });
}


// ==========================================
// PAUSE / RESUME
// ==========================================

function togglePause() {

    if (!gameRunning) {
        return;
    }

    gamePaused = !gamePaused;

    if (gamePaused) {

        pauseBtn.textContent = "Resume";

    } else {

        pauseBtn.textContent = "Pause";
    }

    drawGame();
}


// ==========================================
// RESTART
// ==========================================

function restartGame() {

    clearInterval(gameLoop);

    startGame();
}


// ==========================================
// KEYBOARD CONTROLS
// ==========================================

document.addEventListener(
    "keydown",
    function(event) {

        if (!gameRunning) {
            return;
        }

        switch (event.key) {

            case "ArrowUp":

                if (direction.y !== 1) {

                    nextDirection = {
                        x: 0,
                        y: -1
                    };
                }

                event.preventDefault();

                break;


            case "ArrowDown":

                if (direction.y !== -1) {

                    nextDirection = {
                        x: 0,
                        y: 1
                    };
                }

                event.preventDefault();

                break;


            case "ArrowLeft":

                if (direction.x !== 1) {

                    nextDirection = {
                        x: -1,
                        y: 0
                    };
                }

                event.preventDefault();

                break;


            case "ArrowRight":

                if (direction.x !== -1) {

                    nextDirection = {
                        x: 1,
                        y: 0
                    };
                }

                event.preventDefault();

                break;


            case " ":

                togglePause();

                event.preventDefault();

                break;
        }
    }
);


// ==========================================
// BUTTON EVENTS
// ==========================================

startBtn.addEventListener(
    "click",
    startGame
);

pauseBtn.addEventListener(
    "click",
    togglePause
);

restartBtn.addEventListener(
    "click",
    restartGame
);

gameOverRestart.addEventListener(
    "click",
    restartGame
);


// ==========================================
// INITIAL SCREEN
// ==========================================

ctx.fillStyle = "#08001a";

ctx.fillRect(
    0,
    0,
    canvas.width,
    canvas.height
);

ctx.fillStyle = "#ffffff";

ctx.font = "bold 28px Arial";

ctx.textAlign = "center";

ctx.fillText(
    "🐍 Press Start Game",
    canvas.width / 2,
    canvas.height / 2
);