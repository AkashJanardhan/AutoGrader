require('dotenv').config();
const express = require('express');
const { createClerkClient } = require('@clerk/clerk-sdk-node');
const cors = require('cors');
const multer = require('multer');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const app = express();
const clerkClient = createClerkClient({ apiKey: process.env.CLERK_API_KEY });

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'temp/');  // Directory where files will be saved
    },
    filename: (req, file, cb) => {
        cb(null, 'solution.py');  // Saving file as 'solution.py'
    }
});
const upload = multer({ storage: storage });

app.use(cors({
    origin: "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type", "Authorization", "Session-Id", 'user-id']
}));

app.use(express.json());

const requireAuth = async (req, res, next) => {
  try {
    
    const sessionToken = req.headers.authorization;
    const sessionId = req.headers['session-id'];
    const userId = req.headers['user-id'];
    console.log("Akash token",sessionToken);
    console.log("Akash id",sessionId);
    console.log("Akash userid",userId);
    if (!sessionToken) {
      return res.status(401).send("No authorization token found.");
    }
    console.log("Here 1");
    const session = await clerkClient.sessions.verifySession(sessionId, sessionToken);
    console.log("Here 2");
    req.user = session.userId;
    console.log("Here 3");
    next();
    console.log("Here 4");
  } catch (err) {
    return res.status(401).send("Invalid session.");
  }
};

//app.post("/upload/", upload.single('file'), requireAuth, (req, res) => {
app.post("/upload/", upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).send("No file uploaded.");
    }
    const sessionToken = req.headers.authorization;
    const sessionId = req.headers['session-id'];
    const userId = req.headers['user-id'];
    console.log("Akash token",sessionToken);
    console.log("Akash id",sessionId);
    console.log("Akash userid",userId);
    const result = runTests(req.file.path);
    return res.json({ filename: req.file.originalname, result: result });
});

function runTests(filePath) {
    const testCases = fs.readFileSync('testcases.txt', 'utf8').split('\n');
    let results = [];
    let passedCount = 0;
    let output = "> building source...\n> executing " + testCases.length + " tests...\n";

    testCases.forEach((caseLine, index) => {
        const parts = caseLine.trim().split(' ');
        if (parts.length !== 6) return;
        const [n, kr, kc, pr, pc, expected] = parts;
        const startTime = Date.now();
        const command = `python3 ${filePath} ${n} ${kr} ${kc} ${pr} ${pc}`;
        try {
            const result = execSync(command).toString().trim();
            const duration = Date.now() - startTime;
            const resultText = result === expected ?
                `test_${index.toString().padStart(2, '0')} [PASS] ${duration}ms` :
                `test_${index.toString().padStart(2, '0')} [FAIL] ${duration}ms`;
            results.push(resultText);
            if (result === expected) passedCount++;
        } catch (err) {
            results.push(`test_${index.toString().padStart(2, '0')} [ERROR] ${err.message}`);
        }
    });

    output += results.join("\n");
    output += `\n> ${passedCount}/${testCases.length} tests passed`;
    return output;
}

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
