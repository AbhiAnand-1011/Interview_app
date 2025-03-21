import { io } from "socket.io-client";
import { useMemo } from "react";
const socket = useMemo(()=>{io("https://interview-app-7w2o.onrender.com",{
    secure:true,
    withCredentials:true
});},[]);
export default socket;