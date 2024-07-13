import express from 'express';
import fetch from 'node-fetch';
import cors from 'cors';

const app = express();
const port = 3333;

app.use(cors());
app.use(express.json());

app.post('/generate', async (req, res) => {
  const { context } = req.body;
  console.log('Received context:', context);

  try {
    const ollamaResponse = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: "llama3",
        prompt: 'Please finish the following item: "" ' + context + ' "".  Do not provide any additional information. Reply with only the text that should be added to complete the item.',
        stream: false
      })
    });

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