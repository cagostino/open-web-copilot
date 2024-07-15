import express from 'express';
import fetch from 'node-fetch';
import cors from 'cors';
import dotenv from 'dotenv';

console.log('Starting server...');

dotenv.config();
console.log('Environment variables loaded.');

const app = express();
const port = 3333;

console.log('Express app created.');

app.use(cors());
app.use(express.json());

console.log('Middleware set up.');

app.post('/generate', async (req, res) => {
  console.log('Received request to /generate');
  const { context } = req.body;
  console.log('Received context:', context);

  try {
    console.log('Sending request to Ollama...');
    const ollamaResponse = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: process.env.MODEL_NAME,
        prompt: 'What will follow on a new line is a piece of text that you must continue.   Do not provide any additional information. Reply with only the text that you generate that continues the text. Content: \n ' +   context + '. ',
        stream: false
      })
    });

    console.log('Received response from Ollama');
    const data = await ollamaResponse.json();
    console.log('Generated text:', data.response);
    res.json({ generatedText: data.response });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to generate text' });
  }
});

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});