# Google Docs Copilot
A chrome extension to allow users to use local large language models for auto complete suggestions on google docs.

The Google Docs Copilot is open source software protected by the GNU Lesser General Public License v3.0 ( LGPL-3.0-or-later ).



1. Serve the backend llm with ollama

```bash
ollama run llama3 #or other ollama models
```
If you want to use other models, be sure to change the MODEL_NAME param in the .env file to the correct model name. 


Start the node server

Install the necessary node packages: 
```bash


npm install dotenv
npm install express
npm install node-fetch
npm install cors
```


Run the node server:
```bash
node server.js
```

Load the chrome extension into your browser by doing "load unpacked" and selecting the folder containing these files.



