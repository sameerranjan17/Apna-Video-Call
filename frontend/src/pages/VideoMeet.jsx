import React, { useRef, useState, useEffect } from "react";
import { TextField, Button, IconButton } from "@mui/material";
import io from "socket.io-client";
// import {Input} from "@mui/base";
import VideocamIcon from "@mui/icons-material/Videocam";
import VideocamOffIcon from "@mui/icons-material/VideocamOff";
import styles from "../styles/videoComponent.module.css";
import CallEndIcon from "@mui/icons-material/CallEnd";
import MicIcon from "@mui/icons-material/Mic";
import MicOffIcon from "@mui/icons-material/MicOff";
import ScreenShareIcon from "@mui/icons-material/ScreenShare";
import ScreenShareStopIcon from "@mui/icons-material/StopScreenShare";
import ChatIcon from "@mui/icons-material/Chat";
import {useNavigate} from "react-router-dom";
// import Badge from "@mui/icons-material/Badge"
import { Badge } from "@mui/material";

// const server_url = "http://localhost:8000";

const server_url = import.meta.env.VITE_BACKEND_URL || "https://apna-video-call-frontend-p8z6.onrender.com";

const peerConfigConnections = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
};

// Move helper functions outside to keep the component clean
const getBlackSilence = () => {
  const ctx = new AudioContext();
  const oscillator = ctx.createOscillator();
  const dst = oscillator.connect(ctx.createMediaStreamDestination());
  oscillator.start();
  const canvas = Object.assign(document.createElement("canvas"), {
    width: 640,
    height: 480,
  });
  canvas.getContext("2d").fillRect(0, 0, 640, 480);
  const stream = canvas.captureStream();
  return new MediaStream([
    stream.getVideoTracks()[0],
    dst.stream.getAudioTracks()[0],
  ]);
};

export default function VideoMeetComponent() {
  var socketRef = useRef();
  let socketIdRef = useRef();

  let localVideoRef = useRef();
  const connections = useRef({}); // Using a ref for connections is better for WebRTC

  let [videoAvailable, setVideoAvailable] = useState(true);
  let [audioAvailable, setAudioAvailable] = useState(true);
  let [video, setVideo] = useState(true);
  let [audio, setAudio] = useState(true);
  let [screen, setScreen] = useState();
  let [showModal, setShowModal] = useState(true);
  let [screenAvailable, setScreenAvailable] = useState();
  let [messages, setMessages] = useState([]);
  let [message, setMessage] = useState("");
  let [newMessages, setNewMessages] = useState(3);
  let [askForUsername, setAskForUsername] = useState(true);
  let [username, setUsername] = useState("");

  const videoRef = useRef([]);
  let [videos, setVideos] = useState([]);

  //  working code
  const getPermissions = async () => {
    try {
      const userMediaStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      if (userMediaStream) {
        window.localStream = userMediaStream;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = userMediaStream;
        }
        setVideoAvailable(true);
        setAudioAvailable(true);
      }
      // 2. Check for Screen Sharing support
      if (navigator.mediaDevices.getDisplayMedia) {
        setScreenAvailable(true);
      } else {
        setScreenAvailable(false);
      }
    } catch (err) {
      console.error("Permissions denied or error:", err);
      setVideoAvailable(false);
      setAudioAvailable(false);
    }
  };

  useEffect(() => {
    getPermissions();
  }, []);

  const silence = () => {
    let ctx = new AudioContext();
    let oscillator = ctx.createOscillator();
    let dst = oscillator.connect(ctx.createMediaStreamDestination());
    oscillator.start();
    ctx.resume();
    return Object.assign(dst.stream.getAudioTracks()[0], { enabled: false });
  };

  const black = ({ width = 640, height = 480 } = {}) => {
    let canvas = Object.assign(document.createElement("canvas"), {
      width,
      height,
    });
    canvas.getContext("2d").fillRect(0, 0, width, height);
    let stream = canvas.captureStream();
    return Object.assign(stream.getVideoTracks()[0], { enabled: false });
  };

  let getUserMediaSuccess = (stream) => {
    try {
      window.localStream.getTracks().forEach((track) => track.stop());
    } catch (e) {
      console.log(e);
    }
    window.localStream = stream;
    if (localVideoRef.current) localVideoRef.current.srcObject = stream;

    for (let id in connections.current) {
      if (id === socketIdRef.current) continue;

      connections.current[id].addStream(window.localStream);
      connections.current[id].createOffer().then((description) => {
        connections.current[id].setLocalDescription(description).then(() => {
          socketRef.current.emit(
            "signal",
            id,
            JSON.stringify({ sdp: connections.current[id].localDescription }),
          );
        });
      });
    }

    stream.getTracks().forEach((track) => {
      track.onended = () => {
        setVideo(false);
        setAudio(false);
        try {
          localVideoRef.current.srcObject
            .getTracks()
            .forEach((track) => track.stop());
        } catch (e) {
          console.log(e);
        }

        // TODO BlackSilence
        let blackSilence = (...args) =>
          new MediaStream([black(...args), silence()]);
        window.localStream = blackSilence();
        localVideoRef.current.srcObject = window.localStream;

        getUserMedia();
      };
    });
  };

  let getUserMedia = () => {
    if ((video && videoAvailable) || (audio && audioAvailable)) {
      navigator.mediaDevices
        .getUserMedia({ video: video, audio: audio })
        .then(getUserMediaSuccess)
        .catch((e) => console.log(e));
    } else {
      try {
        localVideoRef.current.srcObject
          .getTracks()
          .forEach((track) => track.stop());
      } catch (e) {}
    }
  };

  useEffect(() => {
    if (video !== undefined && audio !== undefined) {
      getUserMedia();
    }
  }, [audio, video]);

  let gotMessageFromServer = (fromId, message) => {
    var signal = JSON.parse(message);
    if (fromId !== socketIdRef.current) {
      const pc = connections.current[fromId];
      if (signal.sdp) {
        pc.setRemoteDescription(new RTCSessionDescription(signal.sdp)).then(
          () => {
            if (signal.sdp.type === "offer") {
              pc.createAnswer().then((description) => {
                pc.setLocalDescription(description).then(() => {
                  socketRef.current.emit(
                    "signal",
                    fromId,
                    JSON.stringify({ sdp: pc.localDescription }),
                  );
                });
              });
            }
          },
        );
      }
      if (signal.ice) {
        pc.addIceCandidate(new RTCIceCandidate(signal.ice)).catch((e) =>
          console.log(e),
        );
      }
    }
  };

  let addMessage = (data, sender, socketIdSender) => {
    
    setMessages((prevMessages)=>[
      ...prevMessages,
      {sender: sender, data: data} 
    ]);

    if(socketIdSender !== socketIdRef.current){
      setNewMessages((prevMessages)=> prevMessages+1)
    }
  };

  let connectToSocketServer = () => {
    socketRef.current = io.connect(server_url, { secure: false });
    socketRef.current.on("signal", gotMessageFromServer);

    socketRef.current.on("connect", () => {
      socketRef.current.emit("join-call", window.location.href);
      socketIdRef.current = socketRef.current.id;

      socketRef.current.on('chat-message', addMessage)


      socketRef.current.on("user-left", (id) => {
        setVideos((videos) => videos.filter((v) => v.socketId !== id));
      });

      //   ice candidate is used to establish direct connection b/w 2 candidates
      socketRef.current.on("user-joined", (id, clients) => {
        clients.forEach((socketListId) => {
          const pc = new RTCPeerConnection(peerConfigConnections);
          connections.current[socketListId] = pc;

          pc.onicecandidate = (event) => {
            if (event.candidate !== null) {
              socketRef.current.emit(
                "signal",
                socketListId,
                JSON.stringify({ ice: event.candidate }),
              );
            } //sending on signaling server i.e doing letter pass on to signaling server then signaling server send to all clients such that a connection will setup between those clients
          };

          pc.ontrack = (event) => {
            setVideos((prev) => {
              if (prev.find((v) => v.socketId === socketListId)) return prev;
              return [
                ...prev,
                { socketId: socketListId, stream: event.streams[0] },
              ];
            });
          };

          if (window.localStream) {
            pc.addStream(window.localStream);
          }
        });

        if (id === socketIdRef.current) {
          for (let id2 in connections.current) {
            connections.current[id2].createOffer().then((description) => {
              connections.current[id2]
                .setLocalDescription(description)
                .then(() => {
                  socketRef.current.emit(
                    "signal",
                    id2,
                    JSON.stringify({
                      sdp: connections.current[id2].localDescription,
                    }),
                  );
                });
            });
          }
        }
      });
    });
  };

  const handleConnect = () => {
    setAskForUsername(false);
    connectToSocketServer();
  };

  let routeTo = useNavigate();

  let connect = () => {
    setAskForUsername(false);
    getMedia();
  };

  let handleVideo = () => {
    setVideo(!video);
  };

  let handleAudio = () => {
    setAudio(!audio);
  };

  let getDisplayMediaSuccess = (stream) => {
    try {
      window.localStream.getTracks().forEach((track) => track.stop());
    } catch (e) {
      console.log(e);

      window.localStream = stream;
      localVideoRef.current.srcObject = stream;

      for (let id in connections.current) {
        if (id === socketIdRef.current) continue;

        connections[id].addStream(window.localStream);
        connections[id].createOffer().then((description) => [
          connections[id]
            .setLocalDescription(description)
            .then(() => {
              socketRef.current.emit(
                "signal",
                id,
                JSON.stringify({ sdp: connections[id].localDescription }),
              );
            })
            .catch((e) => console.log(e)),
        ]);
      }
    }
  };
  let getDisplayMedia = () => {
    if (screen) {
      if (navigator.mediaDevices.getDisplayMedia) {
        navigator.mediaDevices
          .getDisplayMedia({ video: true, audio: true })
          .then(getDisplayMediaSuccess)
          .then((stream) => {})
          .catch((err) => console.log(err));
      }
    }
  };

  useEffect(() => {
    if (screen !== undefined) {
      getDisplayMedia();
    }
  }, [screen]);

  let handleScreen = () => {
    setScreen(!screen);
  };

  let sendMessage = () => {
    socketRef.current.emit("chat-message", message, username);
    setMessage("");
  }

  let handleEndCall = () => {
    try{
      let tracks = localVideoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop())
    }catch(e){
    
    }

    routeTo("/home")
  }
  return (
    <div>
      {askForUsername === true ? (
        <div>
          <h2>Enter into Lobby</h2>
          {/* Username  */}
          {/* this is just to check if user is binding or not */}
          <TextField
            id="outlined-basic"
            label="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            variant="outlined"
          />
          <Button variant="contained" onClick={handleConnect}>
            Connect
          </Button>
          <div>
            <video
              ref={localVideoRef}
              autoPlay
              muted
              playsInline
              style={{ width: "100%", maxWidth: "400px" }}
            />
          </div>
        </div>
      ) : (
        <div className={styles.meetVideoContainer}>
          {showModal ? (
            <div className={styles.chatRoom}>
              <div className={styles.chatContainer}>
                     <h1>Chat</h1>

                     <div className={styles.chattingDisplay}>

                      {messages.length > 0  ? messages.map((item, index)=> {
                        return(
                          <div style={{marginBottom: "20px"}}key={index}>
                            <p style={{fontWeight: "bold"}}>{item.sender}</p>
                            <p>{item.data}</p>
                          </div>
                        )
                      }): <p>No Messages Yet</p>}
                     </div>

                <div className={styles.chattingArea}>
                  {message}
                  <TextField value={message} onChange={(e) => setMessage(e.target.value)}     id="outlined-basic" label="Enter your chat" variant="outlined" />
                  <Button variant="contained" onClick={sendMessage}>Send</Button>
                </div>
              </div>
         
            </div>
          ) : (
            <></>
          )}

          <div className={styles.buttonContainers}>
            <IconButton onClick={handleVideo} style={{ color: "white" }}>
              {video === true ? <VideocamIcon /> : <VideocamOffIcon />}
            </IconButton>
            <IconButton onClick={handleEndCall}     style={{ color: "red" }}>
              <CallEndIcon />
            </IconButton>
            <IconButton onClick={handleAudio} style={{ color: "white" }}>
              {audio === true ? <MicIcon /> : <MicOffIcon />}
            </IconButton>
            {screenAvailable === true ? (
              <IconButton onClick={handleScreen} style={{ color: "white" }}>
                {screen === true ? (
                  <ScreenShareIcon />
                ) : (
                  <ScreenShareStopIcon />
                )}
              </IconButton>
            ) : (
              <></>
            )}

            <Badge
              badgeContent={newMessages}
              max={99}
              color="secondary"
              sx={{ "& .MuiBadge-badge": { right: 8, top: 8 } }} // Adjusts position relative to the icon
            >
              <IconButton
                onClick={() => setShowModal(!showModal)}
                style={{ color: "white" }}
              >
                <ChatIcon />
              </IconButton>
            </Badge>
          </div>

          {/* 1. Local Video (The Floating "Self" View) */}
          <video
            className={styles.meetUserVideo}
            ref={localVideoRef}
            autoPlay
            muted
          />

          {/* 2. Remote Videos (The Tiled Grid) */}
          <div className={styles.conferenceView}>
            {videos.map((video) => (
              <div key={video.socketId} className={styles.videoWrapper}>
                <RemoteVideo stream={video.stream} socketId={video.socketId} />
              </div>
            ))}
          </div>

          {/* 1. Local Video (Pinned Host) */}
          <video
            className={styles.meetUserVideo}
            ref={localVideoRef}
            autoPlay
            muted
            playsInline
          />
        </div>
      )}
    </div>
  );
}

const RemoteVideo = ({ stream, socketId }) => {
  const ref = useRef();
  useEffect(() => {
    if (ref.current && stream) ref.current.srcObject = stream;
  }, [stream]);

  return (
    <div style={{ position: "relative" }}>
      <video
        ref={ref}
        autoPlay
        playsInline
        style={{ width: "100%", height: "auto", display: "block" }}
      />
      {/* Optional: Add a label for the socket ID */}
      <span
        style={{
          position: "absolute",
          bottom: 5,
          left: 5,
          color: "white",
          backgroundColor: "rgba(0,0,0,0.5)",
          padding: "2px 5px",
        }}
      >
        {socketId}
      </span>
    </div>
  );
};
