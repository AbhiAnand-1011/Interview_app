import { io } from "socket.io-client";
const socket = io("https://interview-app-7w2o.onrender.com",{
    secure:true,
    withCredentials:true
});
export default socket;