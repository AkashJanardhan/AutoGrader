require('dotenv').config();
const express = require('express');
const { createClerkClient } = require('@clerk/clerk-sdk-node');
const cors = require('cors');
const multer = require('multer');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const { MongoClient } = require('mongodb');

const app = express();
//const clerkClient = createClerkClient({ apiKey: process.env.CLERK_API_KEY });
const clerkClient = createClerkClient({ apiKey: "sk_test_bKrAMO0VxEZGPKgQVzWm2MUws7o9tYJg3tn3Pe5LxW" });
//const client = new MongoClient(process.env.MONGODB_URI);
const client = new MongoClient("mongodb+srv://akashjanardhan:QqwKS36D2KhA5QZa@cluster0.ku5pw7r.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0");

const db = client.db("KnightAttackScores");
const resultsCollection = db.collection("Scores");

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
    origin: "*",
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
app.post("/upload/", upload.single('file'), async (req, res) => {
    if (!req.file) {
        return res.status(400).send("No file uploaded.");
    }
    const sessionToken = req.headers.authorization;
    const sessionId = req.headers['session-id'];
    const userId = req.headers['user-id'];
    
    const result = runTests(req.file.path, userId);

    try {
        const bestScore = await storeOrUpdateResults(userId, (result.passedCount / 8) * 100);
        return res.json({ filename: req.file.originalname, result: result.output, bestScore: bestScore});
    } catch (error) {
        console.error('Error updating results:', error);
        return res.status(500).send("Error updating results.");
    }
});

app.post("/submit/", async (req, res) => {
    const code = req.body.code;
    const userId = req.headers['user-id'];
    if (!code) {
        return res.status(400).send("No code provided.");
    }

    try {
        const result = await executePythonCode(code);
        const score = calculateScore(result.passed, result.total);
        const bestScore = await storeOrUpdateResults(userId, score);
        res.json({ result: result, bestScore: bestScore });
    } catch (error) {
        console.error('Error executing code:', error);
        res.status(500).send("Error executing code.");
    }
});

async function executePythonCode(code) {
    // Writing code to a temporary file and executing it or using a Python shell
    return new Promise((resolve, reject) => {
        const options = {
            mode: 'text',
            pythonOptions: ['-c'],
            args: [code]
        };
        PythonShell.runString(code, options, (err, results) => {
            if (err) reject(err);
            resolve({
                passed: parseResults(results),
                total: 8  // Assuming 8 test cases
            });
        });
    });
}

function calculateScore(passed, total) {
    return (passed / total) * 100; // Calculate percentage score
}

function runTests(filePath, userId) {
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

    //storeResults(userId, (passedCount / 8) * 100);

    output += results.join("\n");
    output += `\n> ${passedCount}/${testCases.length} tests passed`;
    return {output:output, passedCount:passedCount};
}

async function storeOrUpdateResults(email, score) {
    try {
      const existingRecord = await resultsCollection.findOne({ email });
      if (existingRecord) {
        if (score > existingRecord.score) {
          await resultsCollection.updateOne({ email }, { $set: { score } });
          return score;  // New best score is the current score
        }
        return existingRecord.score;  // Return existing best score
      } else {
        await resultsCollection.insertOne({ email, score });
        return score;  // New entry, so this is the best score
      }
    } catch (error) {
      console.error('Database operation failed', error);
      throw error;  // Re-throw to handle it in the calling function
    }
  }
  

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
