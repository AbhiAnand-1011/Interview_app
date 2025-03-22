import { useSelector } from "react-redux";
import { useCallback, useEffect, useRef, useState} from "react";
import { useDispatch } from "react-redux";
import { logout } from "./ReduxStore";
import { signOut } from "firebase/auth";
import { auth } from "./firebase";
import peer from "./service/peer";
import './Page.css';
import { io } from "socket.io-client";
import { useSocket } from "./socket/SocketProvider";
import ReactPlayer from "react-player";

export default function Page(){

const user=useSelector((state)=>state.user.data);
const dispatch=useDispatch();
const [userData,setUserData]=useState(null)
const [active_users,setActive_users]=useState([]);
const [self_id,setId]=useState("");
const [remotePeerId,setRemoteId]=useState("");
const [localStream,setLocalStream]=useState(null);
const [remoteStream,setRemoteStream]=useState(null);
const socket=useSocket();
const handleOffer=useCallback(async ({from,offer})=>{
    console.log("offer recieved",offer);
    setRemoteId(from);
  const stream=await navigator.mediaDevices.getUserMedia({
    audio:true,
    video:true
  });
  const answer=await peer.getAnswer(offer);
  socket.emit("accepted",{to:from,answer});
  for(const track of localStream.getTracks()){
    peer.peer.addTrack(track,localStream);
    console.log("sent tracks");
   }
},[localStream]);
const handleAnswer=useCallback(async ({answer})=>{
    
   await peer.setRemoteDescription(answer);
   console.log("recieved answer",answer);
   for(const track of localStream.getTracks()){
    peer.peer.addTrack(track,localStream);
    console.log("sent tracks");
   }
},[localStream])
const handleId=useCallback((id)=>{
    setId(id);
},[])
const handleNego=useCallback(async()=>{
    
    const offer=await peer.getOffer();
    console.log("negotiation",offer);
    socket.emit("negotiation",{to:remotePeerId,offer});
},[remotePeerId])
const handleIncomingNego=useCallback(async(data)=>{
    
   const answer=await peer.getAnswer(data.offer);
   console.log("answer created for negotiation",answer);
   socket.emit("nego-done",{to:data.from,answer});
},[])
const handleFinalNego=useCallback(async (data)=>{
    console.log("answer recieved for negotiation",data.answer);
    await peer.setRemoteDescription(data.answer);
},[])
useEffect(()=>{
    peer.peer.addEventListener("negotiationneeded",handleNego);
    return ()=>{
        peer.peer.removeEventListener("negotiationneeded",handleNego);
    }
},[])
useEffect(()=>{
  peer.peer.addEventListener("track",async event=>{
    const stream=event.streams[0];
    console.log("recived track",stream);
    
    setRemoteStream(stream);
  })
},[])
    useEffect(()=>{
        if(!user){
            window.location.assign("/Signup");
        }
        
         setUserData(user);
         socket.on("client_id",handleId);
         socket.on("users",(data)=>{
           setActive_users(data);
         })
         socket.on("incomingOffer",handleOffer);
         socket.on("incomingAnswer",handleAnswer);
         socket.on("negotiation",handleIncomingNego);
         socket.on("nego-final",handleFinalNego)
    return ()=>{
        socket.off("incomingOffer",handleOffer)
        socket.off("client_id",handleId);
        socket.off("incomingAnswer",handleAnswer);
        socket.off("negotiation",handleIncomingNego);
        socket.off("nego-final",handleFinalNego);
    }
},[socket,handleOffer,handleId,handleAnswer,handleIncomingNego,handleFinalNego]);

   const createCall=useCallback(async()=>{
    alert("Your meeting code is "+self_id);
    const stream=await navigator.mediaDevices.getUserMedia({audio:true,video:true});
    setLocalStream(stream);
   },[self_id])
const getUserMedia=useCallback(async()=>{
    const id=window.prompt("enter meeting code");
    if(id){
    setRemoteId(id);
    const stream=await navigator.mediaDevices.getUserMedia({audio:true,video:true});
    const offer=await peer.getOffer();
    socket.emit("outgoing:call",{to:id,offer});
    setLocalStream(stream);
    }
},[])
    const logOut=()=>{
         signOut(auth);
         dispatch(logout());

         window.location.assign("/Signup");
    }
    const sendStream=useCallback(()=>{
        for(const track of localStream.getTracks()){
            peer.peer.addTrack(track,localStream);
           }
    },[localStream]);
     return(
        <>
         <div>
          
            {(userData)? ( (<>
            <div>{userData.name}
                <button onClick={logOut}>log out</button>
                
            </div>
            {localStream && <button onClick={sendStream}>send Stream</button>}
            {  remoteStream && <ReactPlayer playing muted height="250px" width="250px" url={remoteStream}></ReactPlayer>}
         {  localStream && <ReactPlayer playing muted height="250px" width="250px" url={localStream}></ReactPlayer>}
            <button onClick={createCall}>Create a meet</button>
            <button onClick={getUserMedia}>Join a meet</button>
            </> )):"fetching"}
         </div>
        </>
     )
    }