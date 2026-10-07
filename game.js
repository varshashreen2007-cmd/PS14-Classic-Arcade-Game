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

let highScore =
    Number(localStorage.getItem("snakeHighScore")) || 0;

let gameRunning = false;
let gamePaused = false;

let gameLoop;

let speed = 120;

highScoreDisplay.textContent = highScore;
levelDisplay.textContent = level;


// ================================
// START GAME
// ================================

function startGame() {

    snake = [
        { x: 10, y: 10 },
        { x: 9, y: 10 },
        { x: 8, y: 10 }
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


// ================================
// CREATE FOOD
// ================================

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


// ================================
// DRAW GAME
// ================================

function drawGame() {

    // Clear canvas
    ctx.fillStyle = "#000000";

    ctx.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
    );


    // Draw food
    ctx.fillStyle = "#ef4444";

    ctx.beginPath();

    ctx.arc(
        food.x * gridSize + gridSize / 2,
        food.y * gridSize + gridSize / 2,
        gridSize / 2 - 2,
        0,
        Math.PI * 2
    );

    ctx.fill();


    // Draw snake
    snake.forEach((part, index) => {

        if (index === 0) {
            ctx.fillStyle = "#22c55e";
        } else {
            ctx.fillStyle = "#16a34a";
        }

        ctx.fillRect(
            part.x * gridSize + 1,
            part.y * gridSize + 1,
            gridSize - 2,
            gridSize - 2
        );
    });
}


// ================================
// UPDATE GAME
// ================================

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


    // Self collision
    for (let part of snake) {

        if (
            head.x === part.x &&
            head.y === part.y
        ) {

            endGame();
            return;
        }
    }


    // Add new head
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

            highScoreDisplay.textContent =
                highScore;

            localStorage.setItem(
                "snakeHighScore",
                highScore
            );
        }


        createFood();

        increaseDifficulty();

    } else {

        // Remove tail
        snake.pop();
    }


    drawGame();
}


// ================================
// DIFFICULTY SYSTEM
// ================================

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


    // Update level
    if (newLevel !== level) {

        level = newLevel;

        levelDisplay.textContent = level;
    }


    // Update speed
    if (newSpeed !== speed) {

        speed = newSpeed;

        clearInterval(gameLoop);

        gameLoop =
            setInterval(updateGame, speed);
    }
}


// ================================
// GAME OVER + BACKEND CONNECTION
// ================================

function endGame() {

    gameRunning = false;

    clearInterval(gameLoop);

    finalScore.textContent = score;

    gameOverScreen.style.display = "block";


    // Send score and level to backend
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


// ================================
// PAUSE / RESUME
// ================================

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
}


// ================================
// RESTART
// ================================

function restartGame() {

    clearInterval(gameLoop);

    startGame();
}


// ================================
// KEYBOARD CONTROLS
// ================================

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


// ================================
// BUTTON EVENTS
// ================================

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


// ================================
// INITIAL SCREEN
// ================================

ctx.fillStyle = "#000000";

ctx.fillRect(
    0,
    0,
    canvas.width,
    canvas.height
);

ctx.fillStyle = "#ffffff";

ctx.font = "24px Arial";

ctx.textAlign = "center";

ctx.fillText(
    "Press Start Game",
    canvas.width / 2,
    canvas.height / 2
);