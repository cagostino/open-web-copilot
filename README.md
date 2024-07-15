# Open Web Copilot
A chrome extension to allow users to use local large language models for auto complete suggestions on online text editors. Currently supports google docs.

The Open Web Copilot is open source software protected by the GNU Lesser General Public License v3.0 ( LGPL-3.0-or-later ).


1. Clone this repo:
```bash
git clone https://github.com/cagostino/open-web-copilot.git
```
3. Serve the backend llm with ollama

```bash
ollama run llama3 #or other ollama models
```
If you want to use other models, be sure to change the MODEL_NAME param in the .env file to the correct model name.
Smaller ones like phi3, qwen, deepseek-coder are good options if your hardware is not as powerful.



3.Install the necessary node packages: 
```bash


npm install dotenv
npm install express
npm install node-fetch
npm install cors
```

4.
Run the node server:
```bash
node server.js
```
5.
Load the chrome extension into your browser by doing "load unpacked" and selecting the folder containing these files.

Once it's ready and running, as you add new text to your doc it will periodically send it to the LLM for suggestions after you've finished typing. Clicking on the suggestion box copies it to one's clipboard. 

Planned improvements

1. Changing the behavior of the suggestion box to auto fill in to the document at the cursor upon clicking.
2. Support llama-cpp -like servers and OpenAI + Claude + other providers through API keys.
3. Expanding to support suggestions in other online text editors (Overleaf, OneDrive Word+PPT, other Google Drive services).


