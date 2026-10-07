# 🐍 Snake Evolution

## Classic Arcade Game Clone

Snake Evolution is a modern web-based version of the classic Snake arcade game, developed as part of our hackathon project for **Problem Statement 14 – Classic Arcade Game**.

The game combines the classic Snake gameplay with multiple difficulty levels, progressive levels, obstacles, sound effects, scoring, and a leaderboard system.

---

## 🎯 Problem Statement

Develop a clone of a classic arcade game that provides an engaging and interactive gaming experience while demonstrating programming, frontend, backend, and game-development concepts.

---

## 💡 Our Solution

We developed **Snake Evolution**, a browser-based Snake game where players control a growing snake, collect food, avoid obstacles, and progress through increasingly difficult levels.

The game includes:

- Multiple difficulty levels
- Score and high-score tracking
- Progressive levels
- Dynamic obstacles
- Sound effects
- Pause and restart functionality
- Game-over detection
- Backend leaderboard

---

## ✨ Features

### 🎮 Gameplay
- Classic Snake movement
- Arrow-key controls
- Food collection
- Snake growth
- Wall collision detection
- Self-collision detection
- Obstacle collision detection

### ⚡ Difficulty Levels

| Difficulty | Speed |
|---|---|
| 🟢 Easy | Slow |
| 🟡 Medium | Moderate |
| 🔴 Hard | Fast |

### 🏆 Level Progression

The game becomes more challenging as the player's score increases.

- Level 1 → 3 obstacles
- Level 2 → 5 obstacles
- Level 3 → 8 obstacles
- Level 4 → 11 obstacles

### 🔊 Sound Effects

The game provides sound feedback for:

- Starting the game
- Eating food
- Level progression
- Pausing
- Game over

### 📊 Leaderboard

Player scores can be submitted to the backend and the top 5 scores are maintained.

---

## 🕹️ Controls

| Key | Action |
|---|---|
| ⬆️ Arrow Up | Move Up |
| ⬇️ Arrow Down | Move Down |
| ⬅️ Arrow Left | Move Left |
| ➡️ Arrow Right | Move Right |
| Space | Pause / Resume |

---

## 🛠️ Technologies Used

### Frontend
- HTML
- CSS
- JavaScript
- HTML5 Canvas
- Web Audio API

### Backend
- Node.js
- Express.js
- CORS

### Development Tools
- Visual Studio Code
- Git
- GitHub
- Vercel

---

## 📁 Project Structure

```text
PS14-Classic-Arcade-Game/
│
├── frontend/
│   ├── index.html
│   ├── style.css
│   └── game.js
│
├── backend/
│   ├── server.js
│   ├── package.json
│   └── package-lock.json
│
├── .gitignore
└── README.md
