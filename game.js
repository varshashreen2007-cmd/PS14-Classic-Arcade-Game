const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const scoreDisplay = document.getElementById("score");
const highScoreDisplay = document.getElementById("highScore");

const startBtn = document.getElementById("startBtn");
const pauseBtn = document.getElementById("pauseBtn");
const restartBtn = document.getElementById("restartBtn");

const gameOverScreen = document.getElementById("gameOver");
const finalScore = document.getElementById("finalScore");
const gameOverRestart = document.getElementById("gameOverRestart");

const gridSize = 20;
const tileCount = canvas.width / gridSize;

let snake;
let food;
let direction;
let nextDirection;

let score = 0;
let highScore = Number(localStorage.getItem("snakeHighScore")) || 0;

let gameRunning = false;
let gamePaused = false;
let gameLoop;

let speed = 120;

highScoreDisplay.textContent = highScore;


// Start the game
function startGame() {

    snake = [
        { x: 10, y: 10 },
        { x: 9, y: 10 },
        { x: 8, y: 10 }
    ];

    direction = { x: 1, y: 0 };
    nextDirection = { x: 1, y: 0 };

    score = 0;
    speed = 120;

    scoreDisplay.textContent = score;

    gameOverScreen.style.display = "none";

    createFood();

    gameRunning = true;
    gamePaused = false;

    pauseBtn.textContent = "Pause";

    clearInterval(gameLoop);
    gameLoop = setInterval(updateGame, speed);
}


// Create food at random position
function createFood() {

    food = {
        x: Math.floor(Math.random() * tileCount),
        y: Math.floor(Math.random() * tileCount)
    };

    // Make sure food does not appear inside snake
    for (let part of snake) {
        if (part.x === food.x && part.y === food.y) {
            createFood();
            return;
        }
    }
}


// Draw the game
function drawGame() {

    // Clear canvas
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

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


// Update game
function updateGame() {

    if (!gameRunning || gamePaused) {
        return;
    }

    direction = nextDirection;

    const head = {
        x: snake[0].x + direction.x,
        y: snake[0].y + direction.y
    };


    // Check wall collision
    if (
        head.x < 0 ||
        head.x >= tileCount ||
        head.y < 0 ||
        head.y >= tileCount
    ) {
        endGame();
        return;
    }


    // Check self collision
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


    // Check food
    if (
        head.x === food.x &&
        head.y === food.y
    ) {

        score++;

        scoreDisplay.textContent = score;

        // Update high score
        if (score > highScore) {

            highScore = score;

            highScoreDisplay.textContent = highScore;

            localStorage.setItem(
                "snakeHighScore",
                highScore
            );
        }

        createFood();

        // Increase difficulty
        increaseDifficulty();

    } else {

        // Remove tail if food wasn't eaten
        snake.pop();
    }


    drawGame();
}


// Increase game speed as score increases
function increaseDifficulty() {

    let newSpeed;

    if (score < 5) {
        newSpeed = 120;
    } else if (score < 10) {
        newSpeed = 95;
    } else if (score < 20) {
        newSpeed = 75;
    } else {
        newSpeed = 55;
    }

    if (newSpeed !== speed) {

        speed = newSpeed;

        clearInterval(gameLoop);

        gameLoop = setInterval(updateGame, speed);
    }
}


// Game over
function endGame() {

    gameRunning = false;

    clearInterval(gameLoop);

    finalScore.textContent = score;

    gameOverScreen.style.display = "block";
}


// Pause / Resume
function togglePause() {

    if (!gameRunning) {
        return;
    }

    gamePaused = !gamePaused;

    pauseBtn.textContent =
        gamePaused ? "Resume" : "Pause";
}


// Restart
function restartGame() {

    clearInterval(gameLoop);

    startGame();
}


// Keyboard controls
document.addEventListener("keydown", function(event) {

    if (!gameRunning) {
        return;
    }

    switch (event.key) {

        case "ArrowUp":

            if (direction.y !== 1) {
                nextDirection = { x: 0, y: -1 };
            }

            event.preventDefault();
            break;


        case "ArrowDown":

            if (direction.y !== -1) {
                nextDirection = { x: 0, y: 1 };
            }

            event.preventDefault();
            break;


        case "ArrowLeft":

            if (direction.x !== 1) {
                nextDirection = { x: -1, y: 0 };
            }

            event.preventDefault();
            break;


        case "ArrowRight":

            if (direction.x !== -1) {
                nextDirection = { x: 1, y: 0 };
            }

            event.preventDefault();
            break;


        case " ":

            togglePause();
            event.preventDefault();
            break;
    }

});


// Button events
startBtn.addEventListener("click", startGame);

pauseBtn.addEventListener("click", togglePause);

restartBtn.addEventListener("click", restartGame);

gameOverRestart.addEventListener("click", restartGame);


// Initial screen
ctx.fillStyle = "#000";
ctx.fillRect(0, 0, canvas.width, canvas.height);

ctx.fillStyle = "#ffffff";
ctx.font = "24px Arial";
ctx.textAlign = "center";

ctx.fillText(
    "Press Start Game",
    canvas.width / 2,
    canvas.height / 2
);