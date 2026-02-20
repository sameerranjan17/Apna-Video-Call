let IS_PROD = true;

const server = IS_PROD
  ? "https://https://apna-video-call-backend-ejep.onrender.com"
  : "http://localhost:8000";

export default server;
