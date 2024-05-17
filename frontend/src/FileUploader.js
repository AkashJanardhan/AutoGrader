// FileUploader.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useClerk } from '@clerk/clerk-react';

function FileUploader() {
  const [file, setFile] = useState(null);
  const [results, setResults] = useState("");
  const { session } = useClerk();
  const [token, setToken] = useState("");
  const [sessionId, setSessionId] = useState("");

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

    axios.post("http://localhost:3001/upload/", formData, {
      headers: {
        'Authorization': token,
        'Content-Type': 'multipart/form-data',
        'Session-Id' : sessionId,
        'user-id' : session.user.primaryEmailAddress
      }
    })
    .then(response => setResults(response.data.result))
    .catch(error => console.error('Error:', error));
  };

  return (
    <div>
      <input type="file" onChange={onFileChange} />
      <button onClick={onFileUpload}>Upload and Test</button>
      <pre>{results}</pre>
    </div>
  );
}

export default FileUploader;
