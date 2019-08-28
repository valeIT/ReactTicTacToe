import React from "react";
import ReactDOM from "react-dom";
import "./index.css";

function Square(props) {
  return (
    <button className="square" onClick={props.onClick}>
      {props.value}
    </button>
  );
}

class Board extends React.Component {
  renderSquare(i) {
    // const winning = this.props.winningSquares.contains(i);
    let winning = false;
    for (var k = 0; k < this.props.winningSquares.length; k++) {
      if (this.props.winningSquares[k] === i) {
        winning = true;
      }
    }
    let content = this.props.squares[i];
    if (winning) {
      content = "|" + this.props.squares[i] + "|";
    } else {
      content = this.props.squares[i];
    }
    return <Square value={content} onClick={() => this.props.onClick(i)} />;
  }

  renderBoard() {
    const items = [];
    for (
      let y = 0;
      y < this.props.squares.length;
      y = y + this.props.squares.length / 3
    ) {
      items.push(this.renderRow(y));
    }
    return items;
  }

  renderRow(i) {
    return <div className="board-row">{this.renderColumnsPerRow(i)}</div>;
  }

  renderColumnsPerRow(i) {
    const items = [];
    for (let y = 0; y < this.props.squares.length / 3; y++) {
      items.push(this.renderSquare(i + y));
    }
    return items;
  }
  render() {
    return <div>{this.renderBoard()}</div>;
  }
}

class Game extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      reverseHistory: false,
      history: [
        {
          squares: Array(9).fill(null)
        }
      ],
      stepNumber: 0,
      xIsNext: true
    };
  }

  handleReverseHistoryClick() {
    this.setState({
      reverseHistory: !this.state.reverseHistory
    });
  }

  handleBoardClick(i) {
    const history = this.state.history.slice(0, this.state.stepNumber + 1);
    const current = history[history.length - 1];
    const squares = current.squares.slice();
    if (this.calculateWinner(squares) || squares[i]) {
      return;
    }
    squares[i] = this.state.xIsNext ? "X" : "O";
    this.setState({
      history: history.concat([
        {
          squares: squares
        }
      ]),
      stepNumber: history.length,
      xIsNext: !this.state.xIsNext
    });
  }

  jumpTo(step) {
    this.setState({
      stepNumber: step,
      xIsNext: step % 2 === 0
    });
  }

  lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
  ];

  calculateWinner(squares) {
    for (let i = 0; i < this.lines.length; i++) {
      const [a, b, c] = this.lines[i];
      if (
        squares[a] &&
        squares[a] === squares[b] &&
        squares[a] === squares[c]
      ) {
        return [squares[a], i];
      }
    }
    return null;
  }

  currentMove(step, move) {
    if (move === 0) {
      //should not be called for 1st move
      return "";
    }
    const previous = this.state.history[move - 1];
    const currentSquares = step.squares;
    let diff;
    for (var i = 0; i < previous.squares.length; i++) {
      if (previous.squares[i] !== currentSquares[i]) {
        diff = i;
        break;
      }
      diff = null;
    }
    if (diff === null) {
      return "";
    }
    const humanReadablePos = diff + 1;
    return "" + currentSquares[diff] + "->" + humanReadablePos;
  }

  render() {
    const history = this.state.history;
    const current = history[this.state.stepNumber];
    const winner = this.calculateWinner(current.squares);

    const moves = history.map((step, move) => {
      const bold = move === this.state.stepNumber;
      const desc = move
        ? "Go to move " + this.currentMove(step, move)
        : "Go to game start";
      const boldDesc = bold ? "<b>" + desc + "</b>" : desc;
      return (
        <li value={move + 1} key={move}>
          <button onClick={() => this.jumpTo(move)}>{boldDesc}</button>
        </li>
      );
    });

    const reverseButtonDesc = this.state.reverseHistory
      ? "Change to Reversed History"
      : "Change to Linear History";
    const reverseButton = (
      <button onClick={() => this.handleReverseHistoryClick()}>
        {reverseButtonDesc}
      </button>
    );
    if (!this.state.reverseHistory) {
      moves.reverse();
    }

    // let draw = current.contains(null) && !winner;
    let draw = true;
    for (var k = 0; k < current.squares.length; k++) {
      if (current.squares[k] === null || winner) {
        draw = false;
      }
    }

    let status;
    let winningSquares;
    if (winner) {
      status = "Winner: " + winner[0];
      winningSquares = this.lines[winner[1]];
    } else {
      if (draw) {
        status = "Draw";
      } else {
        status = "Next player: " + (this.state.xIsNext ? "X" : "O");
      }
      winningSquares = [];
    }

    return (
      <div className="game">
        <div className="game-board">
          <Board
            squares={current.squares}
            winningSquares={winningSquares}
            onClick={i => this.handleBoardClick(i)}
          />
        </div>
        <div className="game-info">
          <div>{status}</div>
          <ol>{moves}</ol>
          <div>{reverseButton}</div>
        </div>
      </div>
    );
  }
}

// ========================================

ReactDOM.render(<Game />, document.getElementById("root"));
