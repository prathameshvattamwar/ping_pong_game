const canvas = document.getElementById('pongCanvas');
const ctx = canvas.getContext('2d');
const playerScoreDisplay = document.querySelector('.player-score');
const computerScoreDisplay = document.querySelector('.computer-score');
const startButton = document.getElementById('startButton');
const pauseButton = document.getElementById('pauseButton');
const restartButton = document.getElementById('restartButton');
const pauseOverlay = document.getElementById('pauseOverlay');
const startOverlay = document.getElementById('startOverlay');

let ballX, ballY, ballSpeedX, ballSpeedY;
let playerY, computerY;
let playerScore = 0, computerScore = 0;
let gameRunning = false;
let isPaused = false;
let animationFrameId;

const paddleHeight = 100;
const paddleWidth = 10;
const ballRadius = 8;
const winningScore = 5;

function resizeCanvas() {
    const aspectRatio = 16 / 9;
    const maxWidth = 800;
    const maxHeight = window.innerHeight - 200;
    let width = Math.min(maxWidth, window.innerWidth - 40);
    let height = width / aspectRatio;

    if (height > maxHeight) {
        height = maxHeight;
        width = height * aspectRatio;
    }

    canvas.width = width;
    canvas.height = height;
    resetGameElements();
    drawInitialState(); // Draw board elements after resize
}


function drawRect(x, y, w, h, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, w, h);
}

function drawCircle(x, y, r, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2, false);
    ctx.closePath();
    ctx.fill();
}

function drawNet() {
    for (let i = 0; i < canvas.height; i += 15) {
        drawRect(canvas.width / 2 - 1, i, 2, 10, 'rgba(240, 240, 240, 0.3)');
    }
}

function drawScores() {
    playerScoreDisplay.textContent = `Player: ${playerScore}`;
    computerScoreDisplay.textContent = `Computer: ${computerScore}`;
}

function movePlayerPaddle(event) {
    if (!gameRunning || isPaused) return; // Only move if game is running and not paused

    const rect = canvas.getBoundingClientRect();
    const scaleY = canvas.height / rect.height;
    playerY = (event.clientY - rect.top) * scaleY - paddleHeight / 2;

    if (playerY < 0) playerY = 0;
    if (playerY > canvas.height - paddleHeight) playerY = canvas.height - paddleHeight;
}

function computerAI() {
    const paddleCenter = computerY + paddleHeight / 2;
    const dy = ballY - paddleCenter;
    const reactionSpeed = 0.085; // Slightly adjusted speed

    computerY += dy * reactionSpeed;

    if (computerY < 0) computerY = 0;
    if (computerY > canvas.height - paddleHeight) computerY = canvas.height - paddleHeight;
}


function moveBall() {
    ballX += ballSpeedX;
    ballY += ballSpeedY;

    if (ballY - ballRadius < 0 || ballY + ballRadius > canvas.height) {
        ballSpeedY = -ballSpeedY;
         if (ballY - ballRadius < 0) ballY = ballRadius;
         if (ballY + ballRadius > canvas.height) ballY = canvas.height - ballRadius;
    }

    if (ballX - ballRadius < paddleWidth && ballY > playerY && ballY < playerY + paddleHeight) {
        ballSpeedX = -ballSpeedX;
         let deltaY = ballY - (playerY + paddleHeight / 2);
         ballSpeedY = deltaY * 0.30;
         ballX = paddleWidth + ballRadius;
    }

    if (ballX + ballRadius > canvas.width - paddleWidth && ballY > computerY && ballY < computerY + paddleHeight) {
        ballSpeedX = -ballSpeedX;
        let deltaY = ballY - (computerY + paddleHeight / 2);
        ballSpeedY = deltaY * 0.30;
         ballX = canvas.width - paddleWidth - ballRadius;
    }

    if (ballX - ballRadius < 0) {
        computerScore++;
        resetBall();
    } else if (ballX + ballRadius > canvas.width) {
        playerScore++;
        resetBall();
    }
}

function resetBall() {
    drawScores();
    ballX = canvas.width / 2;
    ballY = canvas.height / 2;
    let initialSpeed = Math.min(5, canvas.width / 160);
    ballSpeedX = (Math.random() > 0.5 ? 1 : -1) * initialSpeed;
    ballSpeedY = (Math.random() * 2 - 1) * (initialSpeed * 0.6);
}

function resetGameElements(){
     playerY = canvas.height / 2 - paddleHeight / 2;
     computerY = canvas.height / 2 - paddleHeight / 2;
     resetBall();
}

function drawInitialState() {
    drawRect(0, 0, canvas.width, canvas.height, '#000000');
    drawNet();
    drawRect(0, playerY, paddleWidth, paddleHeight, '#f0f0f0');
    drawRect(canvas.width - paddleWidth, computerY, paddleWidth, paddleHeight, '#f0f0f0');
    drawCircle(ballX, ballY, ballRadius, '#ffffff');
}


function gameLoop() {
    if (isPaused || !gameRunning) return;

    drawRect(0, 0, canvas.width, canvas.height, '#000000');
    drawNet();
    drawRect(0, playerY, paddleWidth, paddleHeight, '#f0f0f0');
    drawRect(canvas.width - paddleWidth, computerY, paddleWidth, paddleHeight, '#f0f0f0');
    drawCircle(ballX, ballY, ballRadius, '#ffffff');

    moveBall();
    computerAI();

    animationFrameId = requestAnimationFrame(gameLoop);
}

function startGame() {
    if (gameRunning) return;
    gameRunning = true;
    isPaused = false;
    startOverlay.style.display = 'none';
    pauseOverlay.style.display = 'none';
    canvas.style.cursor = 'none';
    resizeCanvas(); // Ensure correct sizes before starting loop
    resetGameElements(); // Reset ball/paddle positions
    drawScores(); // Make sure scores are current
    cancelAnimationFrame(animationFrameId); // Clear previous frame request
    gameLoop();
}

function pauseGame() {
     if (!gameRunning) return; // Can't pause if not running
    isPaused = !isPaused;
    if (isPaused) {
        cancelAnimationFrame(animationFrameId);
        pauseOverlay.style.display = 'flex';
        canvas.style.cursor = 'default';
         pauseButton.textContent = 'Resume';
    } else {
        pauseOverlay.style.display = 'none';
        canvas.style.cursor = 'none';
        pauseButton.textContent = 'Pause';
        gameLoop();
    }
}

function restartGame() {
    gameRunning = false;
    isPaused = false;
    cancelAnimationFrame(animationFrameId);
    playerScore = 0;
    computerScore = 0;
    drawScores();
    resetGameElements();
    drawInitialState(); // Draw the reset state
    startOverlay.style.display = 'flex';
    pauseOverlay.style.display = 'none';
    canvas.style.cursor = 'default';
    pauseButton.textContent = 'Pause';
}

function handleFirstMouseMove(event){
     if (!gameRunning) {
         startGame();
         // Also update paddle position immediately based on this first move
         movePlayerPaddle(event);
         // Remove this specific listener after first move
         canvas.removeEventListener('mousemove', handleFirstMouseMove);
         // Add the regular game listener
         canvas.addEventListener('mousemove', movePlayerPaddle);
     } else {
         // If game is already running, just call the normal move function
          movePlayerPaddle(event);
     }
}

function handleKeyPress(e) {
    if (e.key.toLowerCase() === 'p') {
        pauseGame();
    } else if (e.key.toLowerCase() === 'r') {
         restartGame();
    }
}

// Initial Event Listeners Setup
window.addEventListener('resize', () => {
     if (gameRunning && !isPaused) {
         cancelAnimationFrame(animationFrameId);
         resizeCanvas();
         gameLoop();
     } else {
         resizeCanvas();
     }
});

startButton.addEventListener('click', startGame);
pauseButton.addEventListener('click', pauseGame);
restartButton.addEventListener('click', restartGame);
document.addEventListener('keydown', handleKeyPress);
canvas.addEventListener('mousemove', handleFirstMouseMove); // Listen for first move to start

// Initial Setup Call
resizeCanvas(); // Set initial size and draw board
drawScores();