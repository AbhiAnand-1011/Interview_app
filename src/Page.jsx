import { useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { logout } from "./ReduxStore";
import { signOut } from "firebase/auth";
import { auth } from "./firebase";
export default function Page(){
    const user=useSelector((state)=>state.user.data);
    const dispatch=useDispatch();
    const [userData,setUserData]=useState(null)
    useEffect(()=>{
        if(!user){
            window.location.assign("/Signup");
        }
         setUserData(user);
         console.log(user);
         fetch('http://localhost:8080/check',{
            method:"GET",
            credentials:"include"
         });

    },[user]);
    const logOut=()=>{
         signOut(auth);
         dispatch(logout());

         window.location.assign("/Signup");
    }
     return(
        <>
         <div>
          
            {(userData)? (<div>{userData.name}
                <button onClick={logOut}>log out</button>
            </div>):"fetching"}
         </div>
        </>
     )
}