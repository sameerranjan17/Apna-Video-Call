import React, { useState, useContext } from "react";
import { AuthContext } from "../contexts/AuthContext";
import withAuth from "../utils/withAuth";
import { useNavigate } from "react-router-dom";
import "../App.css";
import { Button, IconButton } from "@mui/material";
import { Restore as RestoreIcon } from "@mui/icons-material";
import {TextField} from "@mui/material";
// import "../styles/videoComponent.module.css"
import styles from "../styles/videoComponent.module.css";

function HomeComponent() {

  let navigate = useNavigate();
  const [meetingCode, setMeetingCode] = useState("");

  const {addToUserHistory} = useContext(AuthContext);
  let handleJoinVideoCall = async () => {
    await addToUserHistory(meetingCode)
    navigate(`/${meetingCode}`);
  };
  return (
    <>
      <div className="navBar">
        <div style={{ display: "inline-flex", alignItems: "end" }}></div>

        <h2>Zynk</h2>
    

      <div style={{ display: "flex", alignItems: "center" }}></div>
      <IconButton onClick={
        ()=>{
          navigate("/history")
        }
      }>
        <RestoreIcon />
      </IconButton>
      <p>History</p>
      
      <Button
        onClick={() => {
          localStorage.removeItem("token");
          navigate("/auth");
        }}
      >
        Logout
      </Button>
      </div>

      <div className="meetContainer">
        <div className="leftPanel">
          <div>
            <h2>Providing Quality Video Call Just Like Quality Education </h2>
          <div style={{display: 'flex', gap: "10px"}}>
              <TextField onChange={e => setMeetingCode(e.target.value)} id="outlined-basic" label="Meeting Code" variant="outlined" />
              <Button onClick={handleJoinVideoCall} variant='contained'>Join</Button>
          </div>
          </div>
        </div>
        <div className="rightPanel">
          <img srcSet="/logo3.png" alt=""/>
        </div>
      </div>
        
    </>
  );
}

export default withAuth(HomeComponent);
