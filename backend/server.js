const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

// ================================
// TEMPORARY LEADERBOARD
// ================================

let leaderboard = [];


// ================================
// HOME / HEALTH CHECK
// ================================

app.get("/", (req, res) => {

    res.json({
        success: true,
        message: "Snake Evolution Backend is Running!"
    });

});


// ================================
// SAVE SCORE
// ================================

app.post("/score", (req, res) => {

    const { name, score, level } = req.body;

    if (!name || score === undefined || level === undefined) {

        return res.status(400).json({
            success: false,
            message: "Name, score and level are required"
        });

    }

    const player = {
        name: String(name),
        score: Number(score),
        level: Number(level)
    };

    leaderboard.push(player);

    // Sort highest score first
    leaderboard.sort((a, b) => b.score - a.score);

    // Keep only top 5
    leaderboard = leaderboard.slice(0, 5);

    console.log("Score received:", player);

    res.json({
        success: true,
        message: "Score saved successfully",
        leaderboard: leaderboard
    });

});


// ================================
// GET LEADERBOARD
// ================================

app.get("/leaderboard", (req, res) => {

    res.json({
        success: true,
        leaderboard: leaderboard
    });

});


// ================================
// START SERVER
// ================================

const PORT = 3000;

app.listen(PORT, () => {

    console.log(
        `Snake Evolution backend running on http://localhost:${PORT}`
    );

});