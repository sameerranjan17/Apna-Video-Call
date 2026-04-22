let IS_PROD = false;

const server = IS_PROD
  ? "https://apna-video-call-backend-ejep.onrender.com"
  : "http://localhost:8000";

export default server;
