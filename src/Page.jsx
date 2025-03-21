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

export default function Page() {
    const user = useSelector((state) => state.user.data);
    const dispatch = useDispatch();
    const [userData, setUserData] = useState(null);
    const [active_users, setActive_users] = useState([]);
    const [self_id, setId] = useState("");
    const [remotePeerId, setRemoteId] = useState("");
    const localVideoRef = useRef(null);
    const remoteVideoRef = useRef(null);

    useEffect(() => {
        if (!user) {
            window.location.assign("/Signup");
        }
        setUserData(user);

        socket.on("client_id", (id) => {
            setId(id);
        });

        socket.on("users", (data) => {
            setActive_users(data);
        });

        socket.on("incomingOffer", async (data) => {
            setRemoteId(data.from);
            await addLocalTracks();
            if (peer.signalingState !== "stable") {
                console.warn("Invalid state:", peer.signalingState);
                return;
            }

            peer.ontrack = (event) => {
                console.log("Track event received.");
                if (event.streams.length > 0) {
                    remoteVideoRef.current.srcObject = event.streams[0];
                    remoteVideoRef.current.onloadedmetadata = () => {
                        remoteVideoRef.current.play().catch(err => console.warn("Play failed:", err));
                    };
                }
            };

            await peer.setRemoteDescription(new RTCSessionDescription(data.offer));
            const answer = await peer.createAnswer();
            await peer.setLocalDescription(answer);
            socket.emit("accepted", { answer: answer, to: data.from });
        });

        socket.on("incomingAnswer", async (data) => {
            if (peer.signalingState !== "have-local-offer") {
                console.warn("Unexpected answer received. Current state:", peer.signalingState);
                return;
            }
            await peer.setRemoteDescription(new RTCSessionDescription(data.answer));
        });

        socket.on("ice-candidate", async (data) => {
            try {
                await peer.addIceCandidate(new RTCIceCandidate(data.candidate));
            } catch (error) {
                console.error("Error adding ICE candidate:", error);
            }
        });

        return () => {
            socket.off("client_id");
            socket.off("users");
            socket.off("incomingOffer");
            socket.off("incomingAnswer");
            socket.off("ice-candidate");
            socket.disconnect();
        };
    }, [user]);

    const addLocalTracks = async () => {
        const localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        localVideoRef.current.srcObject = localStream;
        localVideoRef.current.play();
        localStream.getTracks().forEach(track => peer.addTrack(track, localStream));
    };

    const createCall = async (to) => {
        await addLocalTracks();
        const offer = await peer.createOffer();
        await peer.setLocalDescription(offer);

        await new Promise((resolve) => {
            if (peer.iceGatheringState === "complete") {
                resolve();
            } else {
                peer.addEventListener("icegatheringstatechange", () => {
                    if (peer.iceGatheringState === "complete") {
                        resolve();
                    }
                });
            }
        });
        socket.emit('outgoing:call', { offer: offer, to: to });
    };

    const joinMeet = async () => {
        const callId = window.prompt("Enter the meeting id");
        await createCall(callId);
    };

    const logOut = () => {
        signOut(auth);
        dispatch(logout());
        window.location.assign("/Signup");
    };

    return (
        <>
            <div>
                {userData ? (
                    <>
                        <div>{userData.name}
                            <button onClick={logOut}>Log out</button>
                        </div>
                        <video ref={remoteVideoRef} className="remote" autoPlay playsInline></video>
                        <video ref={localVideoRef} className="local" autoPlay playsInline></video>
                        <button onClick={() => {
                            alert("Your meeting id is " + self_id);
                            addLocalTracks();
                        }}>Create a meet</button>
                        <button onClick={joinMeet}>Join a meet</button>
                    </>
                ) : "Fetching..."}
            </div>
        </>
    );
}
