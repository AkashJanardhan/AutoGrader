// FileUploader.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useClerk } from '@clerk/clerk-react';
import Loader from './loader';

function FileUploader() {
  const [file, setFile] = useState(null);
  const [results, setResults] = useState("");
  const [bestScore, setBestScore] = useState(null);
  const { session } = useClerk();
  const [token, setToken] = useState("");
  const [sessionId, setSessionId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [code, setCode] = useState(`import sys

def knight_attack(n, kr, kc, pr, PC):
   # Add your code logic here
   return n

if __name__ == "__main__":
    if len(sys.argv) != 6:
        print("Usage: python3 knight_attack.py <the length of the chess board> <the starting row of the knight> <the starting column of the knight> <the row of the pawn> <the column of the pawn>")
        sys.exit(1)

    n = int(sys.argv[1])
    kr = int(sys.argv[2])
    kc = int(sys.argv[3])
    pr = int(sys.argv[4])
    pc = int(sys.argv[5])
  
    result = knight_attack(n, kr, kc, pr, pc)
    print(result)`);

  useEffect(() => {
    if (session) {
        session.getToken().then(val => {
            setToken(val);
    });}
    }, [session]);

  useEffect(() => {
    if(session) {
        setSessionId(session.id)
    }
  }, [session]);

  const onFileChange = event => {
    setFile(event.target.files[0]);
  };

  const onFileUpload = () => {
    const formData = new FormData();
    console.log("Akash token",token);
    console.log("Akash session",session);
    console.log("Akash session id",sessionId);
    formData.append("file", file);
    setIsLoading(true);
    axios.post("http://18.237.76.206:3001/upload/", formData, {
      headers: {
        'Authorization': token,
        'Content-Type': 'multipart/form-data',
        'Session-Id' : sessionId,
        'user-id' : session.user.primaryEmailAddress
      }
    })
    .then(response => {
        setResults(response.data.result);
        setBestScore(response.data.bestScore);
        setIsLoading(false);
    })
    .catch(error => console.error('Error:', error));
  };

  return (
    <div>
      <p style={{ color: 'red' }}>Copy this entire code and use a local editor to finish your task</p>
      <p style={{ color: 'red' }}>Do not modify the main function or the function signature</p>
      <textarea
        value={code}
        readOnly
        onChange={e => setCode(e.target.value)}
        style={{ width: '100%', height: '350px', fontFamily: 'monospace' }}
      />
      <div style={{ padding: '20px', display:'flex', flexDirection:'column' }}>
        <input type="file" onChange={onFileChange} style={{ margin: '10px 0' }} />
        <button onClick={onFileUpload} style={{ padding: '10px 20px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
            Upload and Test
        </button>
        {
            isLoading?
                <Loader />
            :
            <pre style={{ marginTop: '20px' }}>{results}</pre>
        }
        {bestScore !== null && <pre><p>Best Score : {bestScore}</p></pre>}
        </div>
    </div>
  );
}

export default FileUploader;
