import {createUserWithEmailAndPassword,signInWithEmailAndPassword,signOut} from "firebase/auth";
import {doc,getDoc,setDoc,serverTimestamp} from "firebase/firestore";
import {auth,db} from "./firebase";
export async function register(email,password){
  const c=await createUserWithEmailAndPassword(auth,email.trim(),password);
  await setDoc(doc(db,"users",c.user.uid),{email:c.user.email,role:"user",createdAt:serverTimestamp()});
  return c.user;
}
export async function login(email,password){return (await signInWithEmailAndPassword(auth,email.trim(),password)).user;}
export async function logout(){return signOut(auth);}
export async function getRole(uid){const s=await getDoc(doc(db,"users",uid));return s.exists()?s.data().role||"user":"user";}
