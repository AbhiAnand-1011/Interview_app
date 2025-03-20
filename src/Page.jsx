import { useSelector } from "react-redux";
import { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { logout } from "./ReduxStore";
import { signOut } from "firebase/auth";
import { auth } from "./firebase";
import socket from "./socket/socket";
import './Page.css';
const peer = new RTCPeerConnection({
    iceServers: [
        { urls: "stun:stun.l.google.com:19302" }, 
        { urls: "stun:stun1.l.google.com:19302" }
    ]
});
export default function Page(){

const user=useSelector((state)=>state.user.data);
const dispatch=useDispatch();
const [userData,setUserData]=useState(null)
const [active_users,setActive_users]=useState([]);
const [self_id,setId]=useState("");
const [onCall,setOnCall]=useState(false);
const [remotePeerId,setRemoteId]=useState("");


    peer.addEventListener("icecandidate",(event)=>{
        if (event.candidate) {
            console.log("Sending ICE candidate:", event.candidate);
            socket.emit("ice-candidate", { candidate: event.candidate, to: remotePeerId });
        }
    })
    peer.addEventListener("iceconnectionstatechange", () => {
        console.log("ICE Connection State:", peer.iceConnectionState);
    
        if (peer.iceConnectionState === "failed") {
            console.error("ICE connection failed! Check STUN/TURN server.");
        }
    });

    useEffect(()=>{
        if(!user){
            window.location.assign("/Signup");
        }
        
         setUserData(user);
         console.log(user);
         socket.on("client_id",(id)=>{
            setId(id);
         });
         socket.on("users",(data)=>{
            console.log(data);
           setActive_users(data);
         })
         socket.on("incomingOffer",async(data)=>{
            setRemoteId(data.from);
            await addLocalTracks();
            if (peer.signalingState !== "stable") {
                console.warn("Invalid state:", peer.signalingState);
                return;
            }
            peer.addEventListener("track", async (event) => {
    
                console.log("Track event received. Adding remote stream.");
                
                const remoteVideo = document.getElementById("remote");
                
                if (event.streams.length > 0) {
                    if (!remoteVideo.srcObject) {  
                        remoteVideo.srcObject = event.streams[0];
                
                        remoteVideo.onloadedmetadata = () => {
                            console.log(" Metadata loaded, playing...");
                            remoteVideo.play().catch((err) => console.warn(" Play failed:", err));
                        };
                    } else {
                        console.warn(" Remote video stream already set!");
                    }
                    console.log("Remote stream set successfully.");
                    const localStream=await navigator.mediaDevices.getUserMedia({
                        video:true,
                        audio:true
                    })
                    for(const track of localStream.getTracks()){
                        peer.addTrack(track,localStream);
                    }
                } else {
                    console.warn("No stream found in track event.");
                }
            });
            await peer.setRemoteDescription(new RTCSessionDescription(data.offer));
            const answer=await peer.createAnswer();
            await peer.setLocalDescription(new RTCSessionDescription(answer));
            socket.emit("accepted",{answer:answer,to:data.from});
            console.log("Offer recieved from",data.from);
          

         });
         socket.on("incomingAnswer",async(data)=>{
            console.log(data.answer);
            if (peer.signalingState !== "have-local-offer") {
                console.warn("Unexpected answer received. Current state:", peer.signalingState);
                return;
            }
            console.log("remote description set succesfully");
            await peer.setRemoteDescription(new RTCSessionDescription(data.answer));
            console.log(peer.ontrack);
            
         })
         socket.on("ice-candidate", async (data) => {
            try {
                console.log("Received ICE candidate:", data.candidate);
                await peer.addIceCandidate(new RTCIceCandidate(data.candidate));
            } catch (error) {
                console.error("Error adding ICE candidate:", error);
            }
        });
         
         return ()=>{
            
            socket.off("message");
            socket.off("users");
            socket.off("object");
            socket.disconnect();
         }
    },[user]);
    useEffect(()=>{
        console.log(active_users);
    },[active_users]);
    const addLocalTracks = async () => {
        const localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    
        const localVideo = document.getElementById("local");
        localVideo.srcObject = localStream;
        localVideo.play();
    
        localStream.getTracks().forEach(track =>{ peer.addTrack(track, localStream)
            console.log("Local tracks added to peer connection.");
    });
        
    };
    const createCall = async (to) => {
        await addLocalTracks();
     
        
    // const localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    // localStream.getTracks().forEach(track => peer.addTrack(track, localStream));

    const offer = await peer.createOffer();
    await peer.setLocalDescription(offer); 

    console.log("Offer set as local description, signaling state:", peer.signalingState); 

        socket.emit('outgoing:call', { offer: offer, to: to });
}
const joinMeet=async()=>{
    const callId=window.prompt("Enter the meeting id");
    await createCall(callId);
}
    const getUserMedia=async()=>{
        try{
        const localStream=await navigator.mediaDevices.getUserMedia({video:true,audio:true});
        const localVideo=document.getElementById("local");
        localVideo.srcObject=localStream;
        localVideo.play();
        }
       
        catch(err){
            console.log(err);
        }
    }
    const logOut=()=>{
         signOut(auth);
         dispatch(logout());

         window.location.assign("/Signup");
    }
     return(
        <>
         <div>
          
            {(userData)? ( (<>
            <div>{userData.name}
                <button onClick={logOut}>log out</button>
            </div>
            <video id="remote" className="remote" autoPlay playsInline></video>
            <video id="local" className="local" autoPlay playsInline></video>
            <button onClick={()=>{
                alert("Your meeting id is"+self_id);
                getUserMedia();
                
            }}>Create a meet</button>
            <button onClick={joinMeet}>Join a meet</button>
            </> )):"fetching"}
         </div>
        </>
     )
}