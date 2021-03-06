import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

function Square(props) {
  const squareStyle = props.highlight ?
        { background:'#bada55' } :
        { background:'none' };
  return (
    <button style={squareStyle} className="square" onClick={props.onClick}>
      {props.value}
    </button>
  );
}

class Board extends React.Component {
  renderSquare(i) {
    return (
        <Square 
          value={this.props.squares[i]}
          highlight = {this.props.winningSquares.includes(i)}
          onClick={() => this.props.onClick(i)}
        />
    );
  }
  
  renderRows(winningSquares) {
    let rows = [];
    for (var row = 0; row < 3; row++) {
      let cols = [];
        for (var col = 0; col < 3; col++) {
          cols.push(this.renderSquare(3*row + col, winningSquares));
        }
      rows.push(<div className="board-row">{cols}</div>);
      }
    return rows;
  }
  
  render() {
    return (
      <div>
        {this.renderRows(this.winningSquares)}
      </div>
    );
  }
}

class Game extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      history: [{
        squares: Array(9).fill(null),
        move: '',
      }],
      stepNumber: 0,
      xIsNext: true,
      reverseList: false,
    };
  }
  
  handleClick(i) {
    const history = this.state.history.slice(0, this.state.stepNumber + 1);
    const current = history[history.length - 1];
    const squares = current.squares.slice();
    if (calculateWinner(squares) || squares[i]) {
      return;
    }
    squares[i] = this.state.xIsNext ? 'X' : 'O';
    let x = i % 3;
    let y = Math.floor(i / 3);
    this.setState({
      history: history.concat([{
        squares: squares,
        move: squares[i] + ' at (' + x + ', ' + y + ')',
      }]),
      stepNumber: history.length,
      xIsNext: !this.state.xIsNext,
    });
  }
  
  jumpTo(step) {
    this.setState({
      stepNumber: step,
      xIsNext: (step % 2) === 0,
    });
  }
  
  render() {
    const history = this.state.history;
    const current = history[this.state.stepNumber];
    const winningSquares = calculateWinner(current.squares);
    
    const moves = history.map((step, move) => {
      const desc = move ?
        'Go to move #' + move + ' ' + history[move].move :
        'Go to game start';
      const buttonStyle = step === current ?
        { fontWeight:'bold' } :
        { fontWeight:'normal' };
      return (
        <li key={move}>
          <button style={buttonStyle} onClick={() => this.jumpTo(move)}>{desc}</button>
        </li>
      );
    });
    
    let status;
    if (winningSquares) {
      status = 'Winner: ' + current.squares[winningSquares[0]];
    } else if (detectTie(current.squares)) {
      status = 'Cat\'s Game (tie)';
    }
    else {
      status = 'Next player: ' + (this.state.xIsNext ? 'X' : 'O');
    }
    
    return (
      <div className="game">
        <div className="game-board">
          <Board
            squares={current.squares}
            winningSquares={winningSquares ? winningSquares : []}
            onClick={(i) => this.handleClick(i)}
          />
          
        </div>
        <div className="game-info">
          <div>{status}</div>
          <div><button onClick={
            () => this.setState(prevState => ({
              reverseList: !prevState.reverseList}))}>
            {this.state.reverseList ? 'Click for ascending' :
            'Click for descending'}</button>
          </div>
          {this.state.reverseList ? <ol reversed>{moves.reverse()}</ol> :
            <ol>{moves}</ol>}
        </div>
      </div>
    );
  }
}

// ========================================

ReactDOM.render(
  <Game />,
  document.getElementById('root')
);

function calculateWinner(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return [a,b,c];
    }
  }
  return null;
}

function detectTie(squares) {
  if (squares.includes(null)) {
    return false;
  }
  return true;
}