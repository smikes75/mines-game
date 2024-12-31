import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [boardSize, setBoardSize] = useState({ rows: 9, cols: 9 });
  const [mineCount, setMineCount] = useState(10);
  const [board, setBoard] = useState([]);
  const [gameOver, setGameOver] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [flagsPlaced, setFlagsPlaced] = useState(0);

  // Inicializace herní desky
  const initializeBoard = () => {
    const newBoard = Array(boardSize.rows).fill().map(() =>
      Array(boardSize.cols).fill().map(() => ({
        isMine: false,
        isRevealed: false,
        isFlagged: false,
        neighborMines: 0
      }))
    );

    // Náhodné rozmístění min
    let minesToPlace = mineCount;
    while (minesToPlace > 0) {
      const row = Math.floor(Math.random() * boardSize.rows);
      const col = Math.floor(Math.random() * boardSize.cols);
      if (!newBoard[row][col].isMine) {
        newBoard[row][col].isMine = true;
        minesToPlace--;
      }
    }

    // Výpočet sousedních min
    for (let row = 0; row < boardSize.rows; row++) {
      for (let col = 0; col < boardSize.cols; col++) {
        if (!newBoard[row][col].isMine) {
          let count = 0;
          for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
              if (row + i >= 0 && row + i < boardSize.rows &&
                  col + j >= 0 && col + j < boardSize.cols &&
                  newBoard[row + i][col + j].isMine) {
                count++;
              }
            }
          }
          newBoard[row][col].neighborMines = count;
        }
      }
    }

    setBoard(newBoard);
    setGameOver(false);
    setGameWon(false);
    setFlagsPlaced(0);
  };

  // Odkrytí políčka
  const revealCell = (row, col) => {
    if (gameOver || gameWon || board[row][col].isFlagged || board[row][col].isRevealed) {
      return;
    }

    const newBoard = [...board];
    
    if (board[row][col].isMine) {
      newBoard[row][col].isRevealed = true;
      setBoard(newBoard);
      setGameOver(true);
      return;
    }

    const revealEmpty = (r, c) => {
      if (r < 0 || r >= boardSize.rows || c < 0 || c >= boardSize.cols ||
          newBoard[r][c].isRevealed || newBoard[r][c].isFlagged) {
        return;
      }

      newBoard[r][c].isRevealed = true;

      if (newBoard[r][c].neighborMines === 0) {
        for (let i = -1; i <= 1; i++) {
          for (let j = -1; j <= 1; j++) {
            revealEmpty(r + i, c + j);
          }
        }
      }
    };

    revealEmpty(row, col);
    setBoard(newBoard);
    checkWinCondition(newBoard);
  };

  // Označení vlajkou
  const toggleFlag = (row, col) => {
    if (gameOver || gameWon || board[row][col].isRevealed) {
      return;
    }

    const newBoard = [...board];
    if (!newBoard[row][col].isFlagged && flagsPlaced >= mineCount) {
      return;
    }

    newBoard[row][col].isFlagged = !newBoard[row][col].isFlagged;
    setBoard(newBoard);
    setFlagsPlaced(flagsPlaced + (newBoard[row][col].isFlagged ? 1 : -1));
    checkWinCondition(newBoard);
  };

  // Kontrola výherní podmínky
  const checkWinCondition = (currentBoard) => {
    const won = currentBoard.every((row) =>
      row.every((cell) =>
        (cell.isMine && cell.isFlagged) ||
        (!cell.isMine && cell.isRevealed)
      )
    );
    if (won) {
      setGameWon(true);
    }
  };

  useEffect(() => {
    initializeBoard();
  }, []);

  // Barvy čísel
  const getNumberColor = (num) => {
    const colors = {
      1: 'text-blue-600',
      2: 'text-green-600',
      3: 'text-red-600',
      4: 'text-purple-800',
      5: 'text-red-800',
      6: 'text-cyan-600',
      7: 'text-black',
      8: 'text-gray-600'
    };
    return colors[num] || '';
  };

  return (
    <div className="game-container">
      <div className="game-header">
        <div>🚩 {mineCount - flagsPlaced}</div>
        <button
          onClick={initializeBoard}
          className="new-game-button"
        >
          Nová hra
        </button>
      </div>

      <div className="board">
        {board.map((row, rowIndex) => (
          <div key={rowIndex} className="row">
            {row.map((cell, colIndex) => (
              <button
                key={`${rowIndex}-${colIndex}`}
                className={`cell ${cell.isRevealed ? 'revealed' : ''} ${getNumberColor(cell.neighborMines)}`}
                onClick={() => revealCell(rowIndex, colIndex)}
                onContextMenu={(e) => {
                  e.preventDefault();
                  toggleFlag(rowIndex, colIndex);
                }}
              >
                {cell.isRevealed ? (
                  cell.isMine ? '💣' : 
                  cell.neighborMines || ''
                ) : cell.isFlagged ? '🚩' : ''}
              </button>
            ))}
          </div>
        ))}
      </div>

      {(gameOver || gameWon) && (
        <div className={`game-message ${gameWon ? 'won' : 'lost'}`}>
          {gameWon ? 'Gratulujeme! Vyhráli jste!' : 'Game Over! Zkuste to znovu.'}
        </div>
      )}
    </div>
  );
}

export default App;