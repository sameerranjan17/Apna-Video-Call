// src/environment.js

const IS_PROD = false;

const server = IS_PROD ? 
    "https://your-deployed-api.com" : 
    "http://localhost:8000"; 
export default server;