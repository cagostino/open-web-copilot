///* 
// * Copyright (C) 2024 NPC Worldwide, LLC
//*
//* This file is part of the Google Docs Copilot project.
//*
//* Google Docs Copilot is free software: you can redistribute it and/or modify
//* it under the terms of the GNU Lesser General Public License as published by
//* the Free Software Foundation, either version 3 of the License, or
//* (at your option) any later version.
//*
//* Google Docs Copilot is distributed in the hope that it will be useful,
//* but WITHOUT ANY WARRANTY; without even the implied warranty of
//* MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
//* GNU Lesser General Public License for more details.
//*
//* You should have received a copy of the GNU Lesser General Public License
//* along with Google Docs Copilot.  If not, see <https://www.gnu.org/licenses/>.
//*/

import express from 'express';
import fetch from 'node-fetch';
import cors from 'cors';
import dotenv from 'dotenv';


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
        model: process.env.MODEL_NAME, // Use the environment variable
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