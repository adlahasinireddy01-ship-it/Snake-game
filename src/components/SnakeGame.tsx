import React, { useState, useEffect, useCallback } from 'react';

type Point = { x: number; y: number };

const GRID_SIZE = 20;
const INITIAL_SNAKE: Point[] = [
  { x: 10, y: 10 },
  { x: 10, y: 11 },
  { x: 10, y: 12 },
];
const INITIAL_DIRECTION: Point = { x: 0, y: -1 }; // UP

const GAME_SPEED = 120; // ms

function randomFoodPosition(snake: Point[]): Point {
  while (true) {
    const x = Math.floor(Math.random() * GRID_SIZE);
    const y = Math.floor(Math.random() * GRID_SIZE);
    const collision = snake.some(segment => segment.x === x && segment.y === y);
    if (!collision) return { x, y };
  }
}

export function SnakeGame() {
  const [snake, setSnake] = useState<Point[]>(INITIAL_SNAKE);
  const [direction, setDirection] = useState<Point>(INITIAL_DIRECTION);
  const [nextDirection, setNextDirection] = useState<Point>(INITIAL_DIRECTION);
  const [food, setFood] = useState<Point>({ x: 5, y: 5 }); // Initial random will be set on mount to avoid hydration mismatch if SSR
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [highScore, setHighScore] = useState<number>(0);
  const [hasStarted, setHasStarted] = useState<boolean>(false);

  // Set initial food avoiding snake
  useEffect(() => {
    setFood(randomFoodPosition(INITIAL_SNAKE));
    const savedHighScore = localStorage.getItem('snakeHighScore');
    if (savedHighScore) {
      setHighScore(parseInt(savedHighScore, 10));
    }
  }, []);

  const resetGame = () => {
    setSnake(INITIAL_SNAKE);
    setDirection(INITIAL_DIRECTION);
    setNextDirection(INITIAL_DIRECTION);
    setFood(randomFoodPosition(INITIAL_SNAKE));
    setGameOver(false);
    setScore(0);
    setHasStarted(true);
    setIsPaused(false);
  };

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Prevent default scrolling for arrows and space
    if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "].includes(e.key)) {
      e.preventDefault();
    }

    if (e.key === ' ' || e.key === 'Escape') {
      if (gameOver) {
        resetGame();
      } else if (hasStarted) {
        setIsPaused(p => !p);
      } else {
        setHasStarted(true);
      }
      return;
    }

    setNextDirection(prevNextDir => {
      let newDir = prevNextDir;
      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          if (direction.y !== 1) newDir = { x: 0, y: -1 };
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          if (direction.y !== -1) newDir = { x: 0, y: 1 };
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          if (direction.x !== 1) newDir = { x: -1, y: 0 };
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          if (direction.x !== -1) newDir = { x: 1, y: 0 };
          break;
      }
      return newDir;
    });
  }, [direction, gameOver, hasStarted]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    if (gameOver || isPaused || !hasStarted) return;

    const moveSnake = () => {
      setSnake(prevSnake => {
        setDirection(nextDirection); // apply the queued direction

        const head = prevSnake[0];
        const newHead = {
          x: head.x + nextDirection.x,
          y: head.y + nextDirection.y,
        };

        // Wall collision
        if (
          newHead.x < 0 ||
          newHead.x >= GRID_SIZE ||
          newHead.y < 0 ||
          newHead.y >= GRID_SIZE
        ) {
          handleGameOver();
          return prevSnake;
        }

        // Self collision
        if (prevSnake.some(segment => segment.x === newHead.x && segment.y === newHead.y)) {
          handleGameOver();
          return prevSnake;
        }

        const newSnake = [newHead, ...prevSnake];

        // Food collision
        if (newHead.x === food.x && newHead.y === food.y) {
          setScore(s => {
            const newScore = s + 10;
            if (newScore > highScore) {
              setHighScore(newScore);
              localStorage.setItem('snakeHighScore', newScore.toString());
            }
            return newScore;
          });
          setFood(randomFoodPosition(newSnake));
          // Do not pop the tail, so it grows
        } else {
          newSnake.pop(); // Remove tail
        }

        return newSnake;
      });
    };

    const intervalId = setInterval(moveSnake, GAME_SPEED);
    return () => clearInterval(intervalId);
  }, [nextDirection, food, gameOver, isPaused, hasStarted, highScore]);

  const handleGameOver = () => {
    setGameOver(true);
  };

  // Rendering helpers
  const getGridCells = () => {
    const cells = [];
    for (let y = 0; y < GRID_SIZE; y++) {
      for (let x = 0; x < GRID_SIZE; x++) {
        const isHead = snake[0].x === x && snake[0].y === y;
        const isBody = snake.some((segment, idx) => idx !== 0 && segment.x === x && segment.y === y);
        const isFood = food.x === x && food.y === y;

        let cellClasses = "w-full h-full rounded-[2px] transition-all duration-75 ";
        
        if (isHead) {
          cellClasses += "bg-cyan-400 shadow-[0_0_12px_rgba(6,182,212,1)] z-10 relative";
        } else if (isBody) {
          cellClasses += "bg-cyan-600/80 shadow-[0_0_6px_rgba(8,145,178,0.5)]";
        } else if (isFood) {
          cellClasses += "bg-fuchsia-500 shadow-[0_0_12px_rgba(217,70,239,1)] scale-75 rounded-full animate-pulse z-10 relative";
        } else {
          // Subtle grid dots
          cellClasses += "bg-zinc-900/30 border border-zinc-800/10";
        }

        cells.push(
          <div key={`${x}-${y}`} className="p-[1px]">
            <div className={cellClasses} />
          </div>
        );
      }
    }
    return cells;
  };

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-2xl font-mono">
      {/* Score Header */}
      <div className="flex justify-between items-end w-full px-4 text-cyan-400 drop-shadow-[0_0_8px_rgba(6,182,212,0.8)]">
        <div className="flex flex-col">
          <span className="text-xs text-zinc-500 tracking-widest uppercase">Score</span>
          <span className="text-4xl font-bold leading-none">{score.toString().padStart(4, '0')}</span>
        </div>
        <div className="flex flex-col text-right">
          <span className="text-xs text-zinc-500 tracking-widest uppercase">High Score</span>
          <span className="text-2xl font-bold leading-none text-cyan-200/50">{highScore.toString().padStart(4, '0')}</span>
        </div>
      </div>

      {/* Game Board Container */}
      <div className="relative w-[min(90vw,400px)] aspect-square bg-zinc-950/80 rounded-lg p-2 border border-zinc-800 shadow-[0_0_30px_rgba(0,0,0,0.5),inset_0_0_20px_rgba(6,182,212,0.05)] overflow-hidden">
        {/* Subtle grid background scanlines */}
        <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(6,182,212,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,0.03)_1px,transparent_1px)] bg-[size:5%_5%]" />
        
        {/* The Grid */}
        <div 
          className="w-full h-full grid"
          style={{
            gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(0, 1fr))`,
            gridTemplateRows: `repeat(${GRID_SIZE}, minmax(0, 1fr))`,
          }}
        >
          {getGridCells()}
        </div>

        {/* Overlays */}
        {(!hasStarted || gameOver || isPaused) && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center z-20">
            {gameOver ? (
              <div className="animate-in zoom-in duration-300">
                <h2 className="text-4xl font-black text-fuchsia-500 mb-2 drop-shadow-[0_0_15px_rgba(217,70,239,0.8)] uppercase">System Failure</h2>
                <p className="text-zinc-400 mb-6 font-semibold">Final Score: {score}</p>
                <button 
                  onClick={resetGame}
                  className="px-6 py-3 bg-cyan-500/20 text-cyan-300 border border-cyan-400 rounded hover:bg-cyan-400 hover:text-black transition-all shadow-[0_0_15px_rgba(6,182,212,0.3)] hover:shadow-[0_0_25px_rgba(6,182,212,0.8)] font-bold uppercase tracking-wider relative overflow-hidden group"
                >
                  <span className="relative z-10">Reboot Sequence</span>
                  <div className="absolute inset-0 h-full w-0 bg-cyan-400 transition-all duration-300 ease-out group-hover:w-full z-0"></div>
                </button>
              </div>
            ) : !hasStarted ? (
              <div>
                <h2 className="text-3xl font-black text-cyan-400 mb-6 drop-shadow-[0_0_15px_rgba(6,182,212,0.8)] uppercase">Ready Player 1</h2>
                <div className="text-zinc-500 text-sm space-y-2 mb-8">
                  <p>Use <strong className="text-zinc-300">Arrow Keys</strong> or <strong className="text-zinc-300">WASD</strong> to move.</p>
                  <p>Press <strong className="text-zinc-300">Space</strong> to pause.</p>
                </div>
                <button 
                  onClick={() => setHasStarted(true)}
                  className="px-8 py-3 bg-cyan-500 text-black rounded hover:bg-cyan-400 transition-all shadow-[0_0_15px_rgba(6,182,212,0.6)] hover:shadow-[0_0_25px_rgba(6,182,212,1)] font-black uppercase tracking-widest animate-pulse"
                >
                  Start Game
                </button>
              </div>
            ) : isPaused ? (
              <div>
                <h2 className="text-3xl font-black text-cyan-400 mb-6 drop-shadow-[0_0_15px_rgba(6,182,212,0.8)] uppercase tracking-widest">Paused</h2>
                <button 
                  onClick={() => setIsPaused(false)}
                  className="px-6 py-2 bg-transparent text-cyan-400 border border-cyan-400 rounded hover:bg-cyan-400/10 transition-all shadow-[0_0_10px_rgba(6,182,212,0.3)] font-bold uppercase tracking-wider"
                >
                  Resume
                </button>
              </div>
            ) : null}
          </div>
        )}
      </div>

      {/* Mobile Controls (optional but good for a web app) */}
      <div className="grid grid-cols-3 gap-2 w-48 mt-4 sm:hidden">
        <div />
        <button className="control-btn" onClick={() => setNextDirection({ x: 0, y: -1 })}>↑</button>
        <div />
        <button className="control-btn" onClick={() => setNextDirection({ x: -1, y: 0 })}>←</button>
        <button className="control-btn bg-zinc-800" onClick={() => setNextDirection({ x: 0, y: 1 })}>↓</button>
        <button className="control-btn" onClick={() => setNextDirection({ x: 1, y: 0 })}>→</button>
      </div>

      <style>{`
        .control-btn {
          @apply aspect-square bg-zinc-900 border border-zinc-800 rounded-lg text-cyan-500 font-bold active:bg-zinc-800 shadow-[0_0_8px_rgba(0,0,0,0.5)] active:shadow-inner flex items-center justify-center text-xl hover:border-cyan-500/50 transition-colors;
        }
      `}</style>
    </div>
  );
}
