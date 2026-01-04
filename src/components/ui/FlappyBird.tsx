import React, { useRef, useEffect, useState, useCallback } from 'react';
import './FlappyBird.css';

const GAME_WIDTH = 320;
const GAME_HEIGHT = 480;
const BIRD_X = 60;
const BIRD_RADIUS = 16;
const GRAVITY = 0.4;
const FLAP_STRENGTH = -8;
const PIPE_WIDTH = 52;
const PIPE_GAP = 140;
const PIPE_SPEED = 2;
const PIPE_INTERVAL = 1800;

function getRandomPipeY() {
  return Math.floor(Math.random() * (GAME_HEIGHT - PIPE_GAP - 200)) + 100;
}

const FlappyBird: React.FC<{ onClose?: () => void }> = ({ onClose }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [gameRunning, setGameRunning] = useState(false);

  const gameState = useRef({
    birdY: GAME_HEIGHT / 2,
    birdVelocity: 0,
    pipes: [] as { x: number; topHeight: number; scored: boolean }[],
    lastPipeTime: 0,
    score: 0
  });

  const resetGame = useCallback(() => {
    gameState.current = {
      birdY: GAME_HEIGHT / 2,
      birdVelocity: 0,
      pipes: [],
      lastPipeTime: Date.now(),
      score: 0
    };
    setScore(0);
    setGameOver(false);
    setGameRunning(true);
  }, []);

  const flap = useCallback(() => {
    if (gameOver) {
      resetGame();
    } else {
      gameState.current.birdVelocity = FLAP_STRENGTH;
    }
  }, [gameOver, resetGame]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;

    const update = () => {
      if (!gameRunning) return;

      const state = gameState.current;

      // Bird physics
      state.birdVelocity += GRAVITY;
      state.birdY += state.birdVelocity;

      // Ground and ceiling collision
      if (state.birdY + BIRD_RADIUS > GAME_HEIGHT || state.birdY - BIRD_RADIUS < 0) {
        setGameOver(true);
        setGameRunning(false);
        return;
      }

      // Spawn pipes
      const now = Date.now();
      if (now - state.lastPipeTime > PIPE_INTERVAL) {
        state.pipes.push({
          x: GAME_WIDTH,
          topHeight: getRandomPipeY(),
          scored: false
        });
        state.lastPipeTime = now;
      }

      // Move pipes
      state.pipes.forEach(pipe => {
        pipe.x -= PIPE_SPEED;
      });

      // Remove off-screen pipes
      state.pipes = state.pipes.filter(pipe => pipe.x + PIPE_WIDTH > 0);

      // Collision detection
      for (const pipe of state.pipes) {
        const birdLeft = BIRD_X - BIRD_RADIUS;
        const birdRight = BIRD_X + BIRD_RADIUS;
        const birdTop = state.birdY - BIRD_RADIUS;
        const birdBottom = state.birdY + BIRD_RADIUS;

        const pipeLeft = pipe.x;
        const pipeRight = pipe.x + PIPE_WIDTH;

        if (
          birdRight > pipeLeft &&
          birdLeft < pipeRight &&
          (birdTop < pipe.topHeight || birdBottom > pipe.topHeight + PIPE_GAP)
        ) {
          setGameOver(true);
          setGameRunning(false);
          return;
        }
      }

      // Scoring
      for (const pipe of state.pipes) {
        if (!pipe.scored && pipe.x + PIPE_WIDTH < BIRD_X) {
          pipe.scored = true;
          state.score++;
          setScore(state.score);
        }
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

      // Background
      const gradient = ctx.createLinearGradient(0, 0, 0, GAME_HEIGHT);
      gradient.addColorStop(0, '#70c5ce');
      gradient.addColorStop(1, '#b8e6e0');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

      // Ground
      ctx.fillStyle = '#ded895';
      ctx.fillRect(0, GAME_HEIGHT - 40, GAME_WIDTH, 40);

      if (gameRunning || !gameOver) {
        const state = gameState.current;

        // Pipes
        ctx.fillStyle = '#5ec639';
        ctx.strokeStyle = '#4aa52a';
        ctx.lineWidth = 4;
        state.pipes.forEach(pipe => {
          // Top pipe
          ctx.fillRect(pipe.x, 0, PIPE_WIDTH, pipe.topHeight);
          ctx.strokeRect(pipe.x, 0, PIPE_WIDTH, pipe.topHeight);
          
          // Bottom pipe
          const bottomY = pipe.topHeight + PIPE_GAP;
          ctx.fillRect(pipe.x, bottomY, PIPE_WIDTH, GAME_HEIGHT - bottomY - 40);
          ctx.strokeRect(pipe.x, bottomY, PIPE_WIDTH, GAME_HEIGHT - bottomY - 40);
        });

        // Bird
        ctx.fillStyle = '#ffeb3b';
        ctx.strokeStyle = '#f7d500';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(BIRD_X, state.birdY, BIRD_RADIUS, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Eye
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(BIRD_X + 6, state.birdY - 4, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(BIRD_X + 8, state.birdY - 4, 2, 0, Math.PI * 2);
        ctx.fill();

        // Beak
        ctx.fillStyle = '#ff9800';
        ctx.beginPath();
        ctx.moveTo(BIRD_X + BIRD_RADIUS, state.birdY);
        ctx.lineTo(BIRD_X + BIRD_RADIUS + 8, state.birdY - 3);
        ctx.lineTo(BIRD_X + BIRD_RADIUS + 8, state.birdY + 3);
        ctx.fill();
      }

      // Score
      ctx.fillStyle = '#fff';
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 2;
      ctx.font = 'bold 36px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.strokeText(`${gameState.current.score}`, GAME_WIDTH / 2, 50);
      ctx.fillText(`${gameState.current.score}`, GAME_WIDTH / 2, 50);

      // Game Over screen
      if (gameOver) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

        ctx.fillStyle = '#fff';
        ctx.font = 'bold 48px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('Game Over', GAME_WIDTH / 2, GAME_HEIGHT / 2 - 20);

        ctx.font = 'bold 24px Arial';
        ctx.fillText(`Final Score: ${gameState.current.score}`, GAME_WIDTH / 2, GAME_HEIGHT / 2 + 30);

        ctx.font = 'bold 20px Arial';
        ctx.fillText('Click or Press SPACE to Restart', GAME_WIDTH / 2, GAME_HEIGHT / 2 + 80);
      }
    };

    const gameLoop = () => {
      update();
      draw();
      if (gameRunning) {
        animationId = requestAnimationFrame(gameLoop);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        flap();
      }
    };

    const handlePointerDown = () => {
      flap();
    };

    resetGame();
    gameLoop();

    window.addEventListener('keydown', handleKeyDown);
    canvas.addEventListener('mousedown', handlePointerDown);
    canvas.addEventListener('touchstart', handlePointerDown, { passive: false });

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      canvas.removeEventListener('mousedown', handlePointerDown);
      canvas.removeEventListener('touchstart', handlePointerDown);
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [gameRunning, gameOver, flap, resetGame]);

  return (
    <div className="flappybird-modal">
      <div className="flappybird-header">
        <span>🐦 Flappy Bird</span>
        {onClose && (
          <button className="flappybird-close" onClick={onClose}>×</button>
        )}
      </div>
      <canvas 
        ref={canvasRef} 
        width={GAME_WIDTH} 
        height={GAME_HEIGHT} 
        className="flappybird-canvas"
        tabIndex={0}
      />
      <div className="flappybird-instructions">
        Click or press SPACE to flap!
      </div>
    </div>
  );
};

export default FlappyBird;
