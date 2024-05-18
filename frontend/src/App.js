import React from 'react';
import { ClerkProvider, SignedIn, SignedOut, SignIn, UserButton,useClerk, useUser } from '@clerk/clerk-react';
import { BrowserRouter as Router } from 'react-router-dom';
import FileUploader from './FileUploader';
import ProblemDescription from './ProblemDescription';
import './App.css';


function App() {
  const PUBLISHABLE_KEY = "pk_test_aW52aXRpbmctbW9jY2FzaW4tMzAuY2xlcmsuYWNjb3VudHMuZGV2JA";

  if (!PUBLISHABLE_KEY) {
    throw new Error("Missing Publishable Key");
  }

  return (
    <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
      <Router>
        <div className="app-container">
          <SignedIn>
            <Header />
            <div className="content">
              <div className="left-panel">
                <ProblemDescription />
              </div>
              <div className="right-panel">
                <FileUploader />
              </div>
            </div>
          </SignedIn>
          <div className="sign-out-container">
            <SignedOut>
              <SignIn />
            </SignedOut>
          </div>
        </div>
      </Router>
    </ClerkProvider>
  );
}

function Header() {
  const { user } = useUser();
  const { signOut } = useClerk();

  return (
    <div className="header">
      <div className="user-details">
        Welcome, {user?.firstName || 'User'}
      </div>
      <button onClick={() => signOut()} className="logout-button">
        Logout
      </button>
    </div>
  );
}

export default App;
