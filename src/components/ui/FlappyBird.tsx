import React, { useRef, useEffect, useState } from 'react';
import './FlappyBird.css';

const GAME_WIDTH = 320;
const GAME_HEIGHT = 480;
const BIRD_SIZE = 32;
const GRAVITY = 0.5;
const FLAP_STRENGTH = -7;
const PIPE_WIDTH = 52;
const PIPE_GAP = 120;
const PIPE_INTERVAL = 1500;

function getRandomPipeY() {
  return Math.floor(Math.random() * (GAME_HEIGHT - PIPE_GAP - 80)) + 40;
}

const FlappyBird: React.FC<{ onClose?: () => void }> = ({ onClose }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [running, setRunning] = useState(true);

  useEffect(() => {
    let animationId: number;
    let birdY = GAME_HEIGHT / 2;
    let birdV = 0;
    let pipes: { x: number; y: number; scored: boolean }[] = [];
    let lastPipeTime = Date.now();
    let localScore = 0;
    setScore(0);
    setGameOver(false);
    setRunning(true);

    function reset() {
      birdY = GAME_HEIGHT / 2;
      birdV = 0;
      pipes = [];
      lastPipeTime = Date.now();
      localScore = 0;
      setScore(0);
      setGameOver(false);
      setRunning(true);
    }

    function draw() {
      const ctx = canvasRef.current?.getContext('2d');
      if (!ctx) return;
      ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
      // Draw background
      ctx.fillStyle = '#70c5ce';
      ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
      // Draw pipes
      ctx.fillStyle = '#5ec639';
      pipes.forEach(({ x, y }) => {
        ctx.fillRect(x, 0, PIPE_WIDTH, y);
        ctx.fillRect(x, y + PIPE_GAP, PIPE_WIDTH, GAME_HEIGHT - y - PIPE_GAP);
      });
      // Draw bird
      ctx.fillStyle = '#ffeb3b';
      ctx.beginPath();
      ctx.arc(60, birdY, BIRD_SIZE / 2, 0, 2 * Math.PI);
      ctx.fill();
      // Draw score
      ctx.fillStyle = '#222';
      ctx.font = '24px Arial';
      ctx.fillText(`Score: ${localScore}`, 10, 30);
      if (gameOver) {
        ctx.fillStyle = 'rgba(0,0,0,0.6)';
        ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
        ctx.fillStyle = '#fff';
        ctx.font = '32px Arial';
        ctx.fillText('Game Over', 70, 200);
        ctx.font = '20px Arial';
        ctx.fillText('Press Space to Restart', 40, 250);
      }
    }

    function update() {
      if (!running) return;
      // Bird physics
      birdV += GRAVITY;
      birdY += birdV;
      // Pipes
      if (Date.now() - lastPipeTime > PIPE_INTERVAL) {
        pipes.push({ x: GAME_WIDTH, y: getRandomPipeY(), scored: false });
        lastPipeTime = Date.now();
      }
      pipes.forEach((pipe) => (pipe.x -= 2));
      if (pipes.length && pipes[0].x < -PIPE_WIDTH) pipes.shift();
      // Collision
      pipes.forEach(({ x, y }) => {
        if (
          60 + BIRD_SIZE / 2 > x &&
          60 - BIRD_SIZE / 2 < x + PIPE_WIDTH &&
          (birdY - BIRD_SIZE / 2 < y || birdY + BIRD_SIZE / 2 > y + PIPE_GAP)
        ) {
          setGameOver(true);
          setRunning(false);
        }
      });
      if (birdY + BIRD_SIZE / 2 > GAME_HEIGHT || birdY - BIRD_SIZE / 2 < 0) {
        setGameOver(true);
        setRunning(false);
      }
      // Score: only increment when bird fully passes a pipe
      pipes.forEach((pipe) => {
        if (!pipe.scored && pipe.x + PIPE_WIDTH < 60 - BIRD_SIZE / 2) {
          pipe.scored = true;
          localScore++;
          setScore(localScore);
        }
      });
    }

    function loop() {
      update();
      draw();
      if (running) animationId = requestAnimationFrame(loop);
    }
    loop();
    function flap() {
      if (gameOver) {
        reset();
      } else {
        birdV = FLAP_STRENGTH;
      }
    }
    function handleKey(e: KeyboardEvent) {
      if (e.code === 'Space') {
        flap();
      }
    }
    function handleClick() {
      flap();
    }
    window.addEventListener('keydown', handleKey);
    canvasRef.current?.addEventListener('mousedown', handleClick);
    canvasRef.current?.addEventListener('touchstart', handleClick);
    return () => {
      window.removeEventListener('keydown', handleKey);
      canvasRef.current?.removeEventListener('mousedown', handleClick);
      canvasRef.current?.removeEventListener('touchstart', handleClick);
      cancelAnimationFrame(animationId);
    };
    // eslint-disable-next-line
  }, []);

  return (
    <div className="flappybird-modal">
      <div className="flappybird-header">
        <span>Flappy Bird (for fun while you wait!)</span>
        {onClose && (
          <button className="flappybird-close" onClick={onClose}>&times;</button>
        )}
      </div>
      <canvas ref={canvasRef} width={GAME_WIDTH} height={GAME_HEIGHT} className="flappybird-canvas" />
      <div className="flappybird-score">Score: {score}</div>
    </div>
  );
};

export default FlappyBird;
