import { Video, LogIn} from "lucide-react";
import NAV_bar from "./components/header";
import { useSelector } from "react-redux";
import JoinInterviewModal from "./components/JoinInterviewModal";
import { useCallback, useEffect, useState , useRef} from "react";
import NewCallModal from "./components/NewCallModal";
import { useDispatch } from "react-redux";
import { logout } from "./ReduxStore";
import { signOut } from "firebase/auth";
import { auth } from "./firebase";
import Loading from "./components/Loading";
import peer from "./service/peer";

import { useSocket } from "./socket/SocketProvider";
import ReactPlayer from "react-player";
const MODAL_TYPES = {
    NEW_CALL: "newCall",
    JOIN_INTERVIEW: "joinInterview",
  };
  
const Dashboard = ()=>{
   const [showModal,setShowModal]=useState(false);
   const [modalType, setModalType] = useState(null);
   const user=useSelector((state)=>state.user.data);
const dispatch=useDispatch();
const [userData,setUserData]=useState(null)
const [active_users,setActive_users]=useState([]);
const [self_id,setId]=useState("");
const [remotePeerId,setRemoteId]=useState(null);
const [localStream,setLocalStream]=useState(null);
const [remoteStream,setRemoteStream]=useState(null);
const remotePeerRef=useRef(null);
remotePeerRef.current=remotePeerId;
const socket=useSocket();

   const IdsetCallback=useCallback((id)=>{
         
          setRemoteId(id);
   },[])
 const handleOffer=useCallback(async ({from,offer})=>{
     console.log("offer recieved from "+from,offer);
     setRemoteId(from);
     
   const stream=await navigator.mediaDevices.getUserMedia({
     audio:true,
     video:true
   });
   const answer=await peer.getAnswer(offer);
   
   socket.emit("accepted",{to:from,answer});
   console.log("answer sent",answer);
 
 },[localStream,socket]);
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
     socket.emit("negotiation",{to:remotePeerRef.current,offer});
     console.log("negotiation offer sent to",remotePeerRef.current);
 },[remotePeerRef,socket])
 const handleIncomingNego=useCallback(async(data)=>{
     
    const answer=await peer.getAnswer(data.offer);
    
    console.log("answer created for negotiation",answer);
    socket.emit("nego-done",{to:data.from,answer});
 },[socket])
 const handleFinalNego=useCallback(async (data)=>{
     console.log("answer recieved for negotiation",data.answer);
     await peer.setRemoteDescription(data.answer);
 },[])
 useEffect(()=>{setUserData(user)},[user]);
 useEffect(()=>{console.log("remote peer id is",remotePeerId)},[remotePeerId])
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
 const getUserMedia=useCallback(async(id)=>{;
    
     if(id){
     const stream=await navigator.mediaDevices.getUserMedia({audio:true,video:true});
     const offer=await peer.getOffer();
     socket.emit("outgoing:call",{to:id,offer});
     setLocalStream(stream);
     }
 },[socket])
     const logOut=useCallback(()=>{
          signOut(auth);
          dispatch(logout());
 
          window.location.assign("/Signup");
     },[]);
     const sendStream=useCallback(()=>{
         for(const track of localStream.getTracks()){
             peer.peer.addTrack(track,localStream);
            }
     },[localStream]);
    return (
        <>
        {userData? (
     <div className="flex flex-col min-h-screen bg-black">
        <NAV_bar LogOut={logOut}/>
        <div className="text-center mt-10 space-y-8">
        
        <h1 className="text-6xl font-bold text-cyan-500">WELCOME BACK</h1>
        <p className="text-gray-500 text-lg text-gray-100">MANAGE YOUR INTERVIEWS AND REVIEW CANDIDATES EFFECTIVELY</p>
     {!localStream &&   <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-2 w-full max-w-3xl mx-auto justify-center mt-20">
         { actionCards.map((card, index) => (
          <div key={index} className={`p-6 rounded-lg text-center shadow-lg flex flex-col items-center space-y-5 transition-transform transform hover:scale-105 ${
            index === 0
              ? "bg-gradient-to-br from-green-900 to-gray-900"
              : "bg-gradient-to-br from-purple-900 to-gray-900"
          }`}
          onClick={()=>{
            if (index === 0) {
                setModalType(MODAL_TYPES.NEW_CALL);
                setShowModal(true);
              } else if (index === 1) {
                setModalType(MODAL_TYPES.JOIN_INTERVIEW);
                setShowModal(true);
              }
          }}
          >
            <card.icon className="w-12 h-12 text-green-400" />
            <div className="text-xl font-bold text-white">{card.title}</div>
            <p className="text-gray-400 text-sm">{card.description}</p>
          </div>
        ))}
         </div>}
         <div>{localStream && <button className="px-6 py-1 bg-green-800 rounded-lg text-white hover:bg-green-900" onClick={sendStream}>send Stream</button>}</div>
         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-2 w-full max-w-3xl mx-auto justify-center mt-20">
        <div>{  remoteStream && <ReactPlayer playing height="250px" width="250px" url={remoteStream}></ReactPlayer>}</div>
       <div> {  localStream && <ReactPlayer playing muted height="250px" width="250px" url={localStream}></ReactPlayer>}</div> 
        </div>
      
       </div> 
       {showModal && modalType === MODAL_TYPES.JOIN_INTERVIEW && (
        <JoinInterviewModal sendOffer={getUserMedia} callBack={IdsetCallback} onClose={() => setShowModal(false)} />
      )}
      {showModal && modalType === MODAL_TYPES.NEW_CALL && (
        <NewCallModal makeCall={createCall} onClose={() => setShowModal(false)} />
      )}
    </div>
        ):(<><Loading/></>)}
    </>
    );
};

const actionCards = [
    { title: "New Call", description: "Start an instant call", icon: Video },
    { title: "Join Interview", description: "Enter via invitation code", icon: LogIn },
  ];
export default Dashboard;