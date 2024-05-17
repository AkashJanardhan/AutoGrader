import './ProblemDescription.css';  // Make sure the path is correct based on your file structure


function ProblemDescription() {
    return (
      <div style={{ backgroundColor: '#f7f7f7', padding: '20px', borderRadius: '8px', margin: '20px 0' }}>
        <h2>Knight Attack</h2>
        <p>
          A knight and a pawn are on a chess board. Can you figure out the minimum number of moves required for the
          knight to travel to the same position of the pawn? On a single move, the knight can move in an "L" shape;
          two spaces in any direction, then one space in a perpendicular direction. This means that on a single move,
          a knight has eight possible positions it can move to.
        </p>
        <p>
          Write a function, <code>knight_attack</code>, that takes in 5 arguments: n, kr, kc, pr, pc:
          <ul>
            <li><strong>n</strong> = the length of the chess board</li>
            <li><strong>kr</strong> = the starting row of the knight</li>
            <li><strong>kc</strong> = the starting column of the knight</li>
            <li><strong>pr</strong> = the row of the pawn</li>
            <li><strong>pc</strong> = the column of the pawn</li>
          </ul>
          The function should return a number representing the minimum number of moves required for the knight to land on top of the pawn.
          The knight cannot move out of bounds of the board. You can assume that rows and columns are 0-indexed. This means that if <strong>n = 8</strong>,
          there are 8 rows and 8 columns numbered 0 to 7. If it is not possible for the knight to attack the pawn, then return None.
        </p>
      </div>
    );
  }
  
  export default ProblemDescription;