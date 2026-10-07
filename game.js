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

const easyBtn = document.getElementById("easyBtn");
const mediumBtn = document.getElementById("mediumBtn");
const hardBtn = document.getElementById("hardBtn");

const gridSize = 20;
const tileCount = canvas.width / gridSize;

let snake = [];
let food = null;
let obstacles = [];

let direction = { x: 1, y: 0 };
let nextDirection = { x: 1, y: 0 };

let score = 0;
let level = 1;

let highScore =
    Number(localStorage.getItem("snakeHighScore")) || 0;

let gameRunning = false;
let gamePaused = false;
let gameOver = false;
let levelTransition = false;

let gameLoop = null;
let transitionTimer = null;

let difficulty = "easy";

const difficultySettings = {
    easy: 150,
    medium: 120,
    hard: 90
};


// ==========================================
// SOUND SYSTEM
// ==========================================

let audioContext = null;

function initAudio() {

    if (!audioContext) {

        const AudioContext =
            window.AudioContext ||
            window.webkitAudioContext;

        if (AudioContext) {
            audioContext = new AudioContext();
        }
    }

    if (
        audioContext &&
        audioContext.state === "suspended"
    ) {
        audioContext.resume();
    }
}


function playTone(
    frequency,
    duration,
    type = "square",
    volume = 0.12
) {

    if (!audioContext) {
        return;
    }

    const oscillator =
        audioContext.createOscillator();

    const gainNode =
        audioContext.createGain();

    oscillator.type = type;

    oscillator.frequency.setValueAtTime(
        frequency,
        audioContext.currentTime
    );

    gainNode.gain.setValueAtTime(
        volume,
        audioContext.currentTime
    );

    gainNode.gain.exponentialRampToValueAtTime(
        0.001,
        audioContext.currentTime + duration
    );

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.start();

    oscillator.stop(
        audioContext.currentTime + duration
    );
}


function playEatSound() {

    initAudio();

    playTone(
        750,
        0.10,
        "square",
        0.12
    );

    setTimeout(function () {

        playTone(
            1000,
            0.08,
            "square",
            0.10
        );

    }, 70);
}


function playLevelUpSound() {

    initAudio();

    playTone(
        500,
        0.12,
        "square",
        0.12
    );

    setTimeout(function () {

        playTone(
            700,
            0.12,
            "square",
            0.12
        );

    }, 120);

    setTimeout(function () {

        playTone(
            900,
            0.18,
            "square",
            0.14
        );

    }, 240);
}


function playGameOverSound() {

    initAudio();

    playTone(
        300,
        0.18,
        "sawtooth",
        0.14
    );

    setTimeout(function () {

        playTone(
            200,
            0.22,
            "sawtooth",
            0.14
        );

    }, 180);

    setTimeout(function () {

        playTone(
            120,
            0.35,
            "sawtooth",
            0.16
        );

    }, 400);
}


function playStartSound() {

    initAudio();

    playTone(
        500,
        0.08,
        "square",
        0.10
    );

    setTimeout(function () {

        playTone(
            750,
            0.10,
            "square",
            0.12
        );

    }, 100);
}


function playPauseSound() {

    initAudio();

    playTone(
        350,
        0.10,
        "triangle",
        0.10
    );
}


// ==========================================
// INITIAL VALUES
// ==========================================

highScoreDisplay.textContent = highScore;
levelDisplay.textContent = level;


// ==========================================
// DIFFICULTY
// ==========================================

function selectDifficulty(selectedDifficulty) {

    if (gameRunning) {
        return;
    }

    difficulty = selectedDifficulty;

    easyBtn.classList.remove("active");
    mediumBtn.classList.remove("active");
    hardBtn.classList.remove("active");

    if (difficulty === "easy") {
        easyBtn.classList.add("active");
    }

    if (difficulty === "medium") {
        mediumBtn.classList.add("active");
    }

    if (difficulty === "hard") {
        hardBtn.classList.add("active");
    }
}


// ==========================================
// SPEED
// ==========================================

function getCurrentSpeed() {

    const baseSpeed =
        difficultySettings[difficulty];

    if (level === 1) {
        return baseSpeed;
    }

    if (level === 2) {
        return Math.round(baseSpeed * 0.82);
    }

    if (level === 3) {
        return Math.round(baseSpeed * 0.68);
    }

    return Math.round(baseSpeed * 0.55);
}


// ==========================================
// OBSTACLE COUNT
// ==========================================

function getObstacleCount() {

    if (level === 1) {
        return 3;
    }

    if (level === 2) {
        return 5;
    }

    if (level === 3) {
        return 8;
    }

    return 11;
}


// ==========================================
// CREATE OBSTACLES
// ==========================================

function createObstacles() {

    obstacles = [];

    const requiredCount =
        getObstacleCount();

    let attempts = 0;

    while (
        obstacles.length < requiredCount &&
        attempts < 1000
    ) {

        attempts++;

        const obstacle = {
            x: Math.floor(Math.random() * tileCount),
            y: Math.floor(Math.random() * tileCount)
        };

        // Keep starting area clear
        if (
            obstacle.x >= 6 &&
            obstacle.x <= 11 &&
            obstacle.y >= 8 &&
            obstacle.y <= 12
        ) {
            continue;
        }

        // Don't overlap another obstacle
        let overlapsObstacle = false;

        for (let existing of obstacles) {

            if (
                existing.x === obstacle.x &&
                existing.y === obstacle.y
            ) {

                overlapsObstacle = true;
                break;
            }
        }

        if (overlapsObstacle) {
            continue;
        }

        // Don't place obstacle on food
        if (
            food &&
            obstacle.x === food.x &&
            obstacle.y === food.y
        ) {
            continue;
        }

        obstacles.push(obstacle);
    }
}


// ==========================================
// OBSTACLE COLLISION
// ==========================================

function checkObstacleCollision(head) {

    for (let obstacle of obstacles) {

        if (
            head.x === obstacle.x &&
            head.y === obstacle.y
        ) {
            return true;
        }
    }

    return false;
}


// ==========================================
// DRAW OBSTACLES
// ==========================================

function drawObstacles() {

    for (let obstacle of obstacles) {

        const x = obstacle.x * gridSize;
        const y = obstacle.y * gridSize;

        // Cyan glow
        ctx.shadowColor = "#22d3ee";
        ctx.shadowBlur = 12;

        // Dark blue box
        ctx.fillStyle = "#164e63";

        ctx.fillRect(
            x + 2,
            y + 2,
            gridSize - 4,
            gridSize - 4
        );

        ctx.shadowBlur = 0;

        // Cyan border
        ctx.strokeStyle = "#22d3ee";
        ctx.lineWidth = 2;

        ctx.strokeRect(
            x + 2,
            y + 2,
            gridSize - 4,
            gridSize - 4
        );

        // Inner blue area
        ctx.fillStyle = "#0e7490";

        ctx.fillRect(
            x + 5,
            y + 5,
            gridSize - 10,
            gridSize - 10
        );

        // Warning symbol
        ctx.fillStyle = "#facc15";

        ctx.font = "bold 13px Arial";

        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        ctx.fillText(
            "⚠",
            x + gridSize / 2,
            y + gridSize / 2
        );
    }

    ctx.textBaseline = "alphabetic";
}


// ==========================================
// START GAME
// ==========================================

function startGame() {

    initAudio();

    clearInterval(gameLoop);
    clearTimeout(transitionTimer);

    snake = [
        { x: 10, y: 10 },
        { x: 9, y: 10 },
        { x: 8, y: 10 },
        { x: 7, y: 10 }
    ];

    direction = {
        x: 1,
        y: 0
    };

    nextDirection = {
        x: 1,
        y: 0
    };

    score = 0;
    level = 1;

    gameRunning = true;
    gamePaused = false;
    gameOver = false;
    levelTransition = false;

    scoreDisplay.textContent = score;
    levelDisplay.textContent = level;

    pauseBtn.textContent = "⏸ Pause";

    gameOverScreen.style.display = "none";

    createFood();
    createObstacles();

    playStartSound();

    gameLoop = setInterval(
        updateGame,
        getCurrentSpeed()
    );

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

    for (let obstacle of obstacles) {

        if (
            obstacle.x === food.x &&
            obstacle.y === food.y
        ) {

            createFood();
            return;
        }
    }
}


// ==========================================
// ROUNDED RECTANGLE
// ==========================================

function drawRoundedRect(
    x,
    y,
    width,
    height,
    radius
) {

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

    const gradient =
        ctx.createLinearGradient(
            x,
            y,
            x + gridSize,
            y + gridSize
        );

    gradient.addColorStop(0, "#7cffb2");
    gradient.addColorStop(0.5, "#20e878");
    gradient.addColorStop(1, "#079447");

    ctx.fillStyle = gradient;

    ctx.shadowColor = "#00ff88";
    ctx.shadowBlur = 14;

    drawRoundedRect(
        x + 1,
        y + 1,
        gridSize - 2,
        gridSize - 2,
        7
    );

    ctx.shadowBlur = 0;

    let eye1;
    let eye2;

    if (direction.x === 1) {

        eye1 = {
            x: x + 14,
            y: y + 6
        };

        eye2 = {
            x: x + 14,
            y: y + 14
        };

    } else if (direction.x === -1) {

        eye1 = {
            x: x + 6,
            y: y + 6
        };

        eye2 = {
            x: x + 6,
            y: y + 14
        };

    } else if (direction.y === -1) {

        eye1 = {
            x: x + 6,
            y: y + 6
        };

        eye2 = {
            x: x + 14,
            y: y + 6
        };

    } else {

        eye1 = {
            x: x + 6,
            y: y + 14
        };

        eye2 = {
            x: x + 14,
            y: y + 14
        };
    }

    ctx.fillStyle = "white";

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

    ctx.fillStyle = "#111827";

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
}


// ==========================================
// DRAW SNAKE BODY
// ==========================================

function drawSnakeBody(part) {

    const x = part.x * gridSize;
    const y = part.y * gridSize;

    const gradient =
        ctx.createLinearGradient(
            x,
            y,
            x + gridSize,
            y + gridSize
        );

    gradient.addColorStop(0, "#45f58b");
    gradient.addColorStop(1, "#079447");

    ctx.fillStyle = gradient;

    ctx.shadowColor =
        "rgba(0,255,120,0.45)";

    ctx.shadowBlur = 7;

    drawRoundedRect(
        x + 2,
        y + 2,
        gridSize - 4,
        gridSize - 4,
        6
    );

    ctx.shadowBlur = 0;

    ctx.fillStyle =
        "rgba(255,255,255,0.18)";

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
// DRAW FOOD
// ==========================================

function drawFood() {

    const centerX =
        food.x * gridSize +
        gridSize / 2;

    const centerY =
        food.y * gridSize +
        gridSize / 2;

    ctx.shadowColor = "#ff1744";
    ctx.shadowBlur = 18;

    ctx.fillStyle = "#ff1744";

    ctx.beginPath();

    ctx.arc(
        centerX,
        centerY,
        7,
        0,
        Math.PI * 2
    );

    ctx.fill();

    ctx.shadowBlur = 0;

    ctx.fillStyle = "#ffffff";

    ctx.beginPath();

    ctx.arc(
        centerX - 2,
        centerY - 3,
        2,
        0,
        Math.PI * 2
    );

    ctx.fill();

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
}


// ==========================================
// DRAW GAME OVER
// ==========================================

function drawGameOver() {

    ctx.fillStyle =
        "rgba(0, 0, 0, 0.72)";

    ctx.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
    );

    ctx.textAlign = "center";

    ctx.shadowColor = "#ff3366";
    ctx.shadowBlur = 25;

    ctx.fillStyle = "#ff4d6d";

    ctx.font = "bold 56px Arial";

    ctx.fillText(
        "GAME OVER",
        canvas.width / 2,
        canvas.height / 2 - 50
    );

    ctx.shadowBlur = 0;

    ctx.fillStyle = "#ffffff";

    ctx.font = "bold 24px Arial";

    ctx.fillText(
        "Score: " + score,
        canvas.width / 2,
        canvas.height / 2
    );

    ctx.fillStyle = "#67e8f9";

    ctx.font = "18px Arial";

    ctx.fillText(
        "Level: " + level,
        canvas.width / 2,
        canvas.height / 2 + 35
    );

    ctx.fillStyle = "#cbd5e1";

    ctx.font = "16px Arial";

    ctx.fillText(
        "Click Restart or Play Again",
        canvas.width / 2,
        canvas.height / 2 + 75
    );
}


// ==========================================
// DRAW GAME
// ==========================================

function drawGame() {

    // Background
    ctx.fillStyle = "#020617";

    ctx.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
    );

    // Grid
    ctx.strokeStyle =
        "rgba(255,255,255,0.035)";

    ctx.lineWidth = 1;

    for (
        let x = 0;
        x <= canvas.width;
        x += gridSize
    ) {

        ctx.beginPath();

        ctx.moveTo(x, 0);

        ctx.lineTo(
            x,
            canvas.height
        );

        ctx.stroke();
    }

    for (
        let y = 0;
        y <= canvas.height;
        y += gridSize
    ) {

        ctx.beginPath();

        ctx.moveTo(0, y);

        ctx.lineTo(
            canvas.width,
            y
        );

        ctx.stroke();
    }

    // Obstacles
    drawObstacles();

    // Food
    if (food) {
        drawFood();
    }

    // Snake
    snake.forEach(function (part, index) {

        if (index === 0) {
            drawSnakeHead(part);
        } else {
            drawSnakeBody(part);
        }

    });

    // Pause screen
    if (gamePaused && !gameOver) {

        ctx.fillStyle =
            "rgba(0,0,0,0.6)";

        ctx.fillRect(
            0,
            0,
            canvas.width,
            canvas.height
        );

        ctx.fillStyle = "white";

        ctx.textAlign = "center";

        ctx.font = "bold 42px Arial";

        ctx.fillText(
            "PAUSED",
            canvas.width / 2,
            canvas.height / 2
        );
    }

    // Game over screen
    if (gameOver) {
        drawGameOver();
    }
}


// ==========================================
// LEVEL TRANSITION
// ==========================================

function showLevelTransition(newLevel) {

    levelTransition = true;

    clearInterval(gameLoop);

    playLevelUpSound();

    const overlay =
        document.createElement("div");

    overlay.style.position = "fixed";
    overlay.style.left = "0";
    overlay.style.top = "0";
    overlay.style.width = "100%";
    overlay.style.height = "100%";

    overlay.style.background =
        "rgba(2, 6, 23, 0.88)";

    overlay.style.display = "flex";

    overlay.style.alignItems = "center";

    overlay.style.justifyContent = "center";

    overlay.style.zIndex = "9999";

    overlay.innerHTML = `
        <div style="
            text-align:center;
            padding:40px;
            background:#081428;
            border:2px solid #22d3ee;
            border-radius:24px;
            box-shadow:0 0 30px rgba(34,211,238,0.4);
        ">

            <div style="
                font-size:45px;
                margin-bottom:10px;
            ">
                🚀
            </div>

            <h2 style="
                margin:0;
                font-size:50px;
                color:#4ade80;
            ">
                LEVEL ${newLevel}
            </h2>

            <p style="
                color:#cbd5e1;
                font-size:18px;
                margin-top:12px;
            ">
                Speed is increasing!
            </p>

            <p style="
                color:#22d3ee;
                font-size:16px;
                margin-top:8px;
            ">
                More obstacles ahead!
            </p>

        </div>
    `;

    document.body.appendChild(overlay);

    transitionTimer =
        setTimeout(function () {

            overlay.remove();

            levelTransition = false;

            // Create more obstacles
            createObstacles();

            gameLoop =
                setInterval(
                    updateGame,
                    getCurrentSpeed()
                );

            drawGame();

        }, 1600);
}


// ==========================================
// CHECK LEVEL
// ==========================================

function checkLevelProgression() {

    let newLevel = level;

    if (score >= 20) {

        newLevel = 4;

    } else if (score >= 10) {

        newLevel = 3;

    } else if (score >= 5) {

        newLevel = 2;
    }

    if (
        newLevel > level &&
        !levelTransition
    ) {

        level = newLevel;

        levelDisplay.textContent =
            level;

        showLevelTransition(level);
    }
}


// ==========================================
// UPDATE GAME
// ==========================================

function updateGame() {

    if (
        !gameRunning ||
        gamePaused ||
        gameOver ||
        levelTransition
    ) {
        return;
    }

    direction = nextDirection;

    const head = {

        x:
            snake[0].x +
            direction.x,

        y:
            snake[0].y +
            direction.y
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

    // Obstacle collision
    if (checkObstacleCollision(head)) {

        endGame();

        return;
    }

    snake.unshift(head);

    // Food collision
    if (
        head.x === food.x &&
        head.y === food.y
    ) {

        score++;

        scoreDisplay.textContent =
            score;

        playEatSound();

        // High score
        if (score > highScore) {

            highScore = score;

            highScoreDisplay.textContent =
                highScore;

            localStorage.setItem(
                "snakeHighScore",
                highScore
            );
        }

        createFood();

        checkLevelProgression();

    } else {

        snake.pop();
    }

    drawGame();
}


// ==========================================
// GAME OVER
// ==========================================

function endGame() {

    gameRunning = false;
    gamePaused = false;
    gameOver = true;
    levelTransition = false;

    clearInterval(gameLoop);
    clearTimeout(transitionTimer);

    finalScore.textContent = score;

    gameOverScreen.style.display = "none";

    playGameOverSound();

    // Send score to backend
    fetch(
        "http://localhost:3000/score",
        {
            method: "POST",

            headers: {
                "Content-Type":
                    "application/json"
            },

            body: JSON.stringify({
                name: "Player",
                score: score,
                level: level
            })
        }
    )
    .then(function (response) {
        return response.json();
    })
    .then(function (data) {

        console.log(
            "Backend response:",
            data
        );

    })
    .catch(function (error) {

        console.log(
            "Backend error:",
            error
        );

    });

    drawGame();
}


// ==========================================
// PAUSE
// ==========================================

function togglePause() {

    if (
        !gameRunning ||
        gameOver ||
        levelTransition
    ) {
        return;
    }

    gamePaused = !gamePaused;

    if (gamePaused) {

        pauseBtn.textContent =
            "▶ Resume";

    } else {

        pauseBtn.textContent =
            "⏸ Pause";
    }

    playPauseSound();

    drawGame();
}


// ==========================================
// RESTART
// ==========================================

function restartGame() {

    clearInterval(gameLoop);
    clearTimeout(transitionTimer);

    startGame();
}


// ==========================================
// KEYBOARD CONTROLS
// ==========================================

document.addEventListener(
    "keydown",
    function (event) {

        if (
            !gameRunning ||
            gameOver ||
            levelTransition
        ) {
            return;
        }

        if (event.key === "ArrowUp") {

            if (direction.y !== 1) {

                nextDirection = {
                    x: 0,
                    y: -1
                };
            }

            event.preventDefault();

        }

        else if (
            event.key === "ArrowDown"
        ) {

            if (direction.y !== -1) {

                nextDirection = {
                    x: 0,
                    y: 1
                };
            }

            event.preventDefault();

        }

        else if (
            event.key === "ArrowLeft"
        ) {

            if (direction.x !== 1) {

                nextDirection = {
                    x: -1,
                    y: 0
                };
            }

            event.preventDefault();

        }

        else if (
            event.key === "ArrowRight"
        ) {

            if (direction.x !== -1) {

                nextDirection = {
                    x: 1,
                    y: 0
                };
            }

            event.preventDefault();

        }

        else if (event.key === " ") {

            togglePause();

            event.preventDefault();

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

easyBtn.addEventListener(
    "click",
    function () {
        selectDifficulty("easy");
    }
);

mediumBtn.addEventListener(
    "click",
    function () {
        selectDifficulty("medium");
    }
);

hardBtn.addEventListener(
    "click",
    function () {
        selectDifficulty("hard");
    }
);


// ==========================================
// INITIAL SCREEN
// ==========================================

ctx.fillStyle = "#020617";

ctx.fillRect(
    0,
    0,
    canvas.width,
    canvas.height
);

ctx.fillStyle = "#ffffff";

ctx.font =
    "bold 26px Arial";

ctx.textAlign = "center";

ctx.fillText(
    "🐍 Press Start Game",
    canvas.width / 2,
    canvas.height / 2
);