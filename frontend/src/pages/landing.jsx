import React from "react"
import "../App.css";
import { Link, useNavigate } from "react-router-dom"; 




export default function LandingPage() {
  const router = useNavigate();
  return (
    <> {/* Add this Fragment wrapper */}
     <div className="landingPageContainer">
       <nav>
         <div className="navHeader">
           <h2>Zynk</h2>
         </div>
         <div className="navlist">
           <p onClick={()=>{
            router("/aljk23")
            // window.location.href = "/ssmcc12"     //here giving some random gibberish
           }}>Join as Guest</p>
            {/* <p onClick={()=>{
            router("/auth")
           }}></p> */}
           <p onClick={()=>{
             router("/auth")
           }}>Register</p>
           <div onClick={()=>{
             router("/auth")
           }}   role="button">
             <p>Login</p>
           </div>
         </div>
       </nav>

       <div className="landingMainContainer">
         <div>
           <h1><span style={{color: "#FF9839"}}>Connect</span> with your loved ones</h1>

           <p>Cover a distance by Apna Video Call</p>
           <div role="button">
             <Link to={"/auth"}>Get Started</Link>
           </div>
         </div>
         <div>
           <img src="/mobile.png" alt="Mobile App Preview" />
         </div>
          </div>
     </div>
    </>
  )  
}
