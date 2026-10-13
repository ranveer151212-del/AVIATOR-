import React,{useEffect,useMemo,useState} from "react";
import {SafeAreaView,ScrollView,View,Text,TextInput,TouchableOpacity,ActivityIndicator} from "react-native";
import {StatusBar} from "expo-status-bar";
import {onAuthStateChanged} from "firebase/auth";
import {addDoc,collection,getDocs,query,orderBy,limit,serverTimestamp} from "firebase/firestore";
import {auth,db} from "./src/firebase";
import {login,register,logout,getRole} from "./src/auth";
import {fetchHistory} from "./src/api";
import {summarizeHistory} from "./src/analysis";
import {logAppOpened,logDashboardViewed} from "./src/analytics";

const bg="#10131a",panel="#1b2230",white="#f5f7fb",muted="#a8b0c0",green="#70e0b2",red="#ff7777";
function Btn({title,onPress,secondary=false}){return <TouchableOpacity onPress={onPress} style={{padding:13,borderRadius:10,marginTop:8,backgroundColor:secondary?panel:green,alignItems:"center"}}><Text style={{color:secondary?white:bg,fontWeight:"800"}}>{title}</Text></TouchableOpacity>}
function Input({label,value,onChangeText,placeholder,secure=false,keyboardType="default"}){return <View style={{marginTop:10}}><Text style={{color:muted,marginBottom:5}}>{label}</Text><TextInput value={value} onChangeText={onChangeText} placeholder={placeholder} placeholderTextColor="#737d90" secureTextEntry={secure} keyboardType={keyboardType} autoCapitalize="none" style={{backgroundColor:panel,color:white,padding:12,borderRadius:9}}/></View>}
function Card({title,children}){return <View style={{backgroundColor:panel,padding:15,borderRadius:13,marginBottom:12}}><Text style={{color:white,fontSize:16,fontWeight:"800",marginBottom:10}}>{title}</Text>{children}</View>}
export default function App(){
 const [user,setUser]=useState(null),[role,setRole]=useState("user"),[loading,setLoading]=useState(true);
 const [mode,setMode]=useState("login"),[email,setEmail]=useState(""),[password,setPassword]=useState(""),[error,setError]=useState("");
 const [history,setHistory]=useState([]),[manual,setManual]=useState(""),[notice,setNotice]=useState(""),[busy,setBusy]=useState(false),[admin,setAdmin]=useState(false),[users,setUsers]=useState([]);
 useEffect(()=>{logAppOpened();return onAuthStateChanged(auth,async u=>{setUser(u);setAdmin(false);if(u){try{setRole(await getRole(u.uid))}catch{setRole("user")}}else setRole("user");setLoading(false)})},[]);
 useEffect(()=>{if(user)logDashboardViewed()},[user?.uid]);
 async function load(){try{const s=await getDocs(query(collection(db,"history"),orderBy("createdAt","desc"),limit(200)));setHistory(s.docs.map(d=>Number(d.data().multiplier)).reverse())}catch(e){setError(e.message)}}
 useEffect(()=>{if(user)load()},[user]);
 const stats=useMemo(()=>summarizeHistory(history),[history]);
 async function authSubmit(){setError("");try{if(mode==="login")await login(email,password);else await register(email,password)}catch(e){setError(e.message)}}
 async function addValue(){const n=Number(manual);if(!Number.isFinite(n)||n<1){setError("Multiplier 1 ya usse zyada hona chahiye.");return}setBusy(true);try{await addDoc(collection(db,"history"),{multiplier:n,source:"manual",createdBy:user.uid,createdAt:serverTimestamp()});setManual("");setNotice("Historical value saved.");await load()}catch(e){setError(e.message)}finally{setBusy(false)}}
 async function importApi(){setBusy(true);setError("");try{const values=await fetchHistory();for(const n of values.slice(-200))await addDoc(collection(db,"history"),{multiplier:n,source:"configured-api",createdBy:user.uid,createdAt:serverTimestamp()});setNotice(`${Math.min(200,values.length)} values imported.`);await load()}catch(e){setError(e.message)}finally{setBusy(false)}}
 async function adminLoad(){setAdmin(true);try{const s=await getDocs(query(collection(db,"users"),limit(100)));setUsers(s.docs.map(d=>({...d.data(),uid:d.id})))}catch(e){setError(e.message)}}
 const fmt=n=>n==null?"—":`${n.toFixed(2)}x`;
 const page={flex:1,backgroundColor:bg,padding:18};
 if(loading)return <SafeAreaView style={[page,{justifyContent:"center",alignItems:"center"}]}><ActivityIndicator color={green}/></SafeAreaView>;
 if(!user)return <SafeAreaView style={page}><StatusBar style="light"/><ScrollView><Text style={{color:white,fontSize:26,fontWeight:"900"}}>Aviator History Lab</Text><Text style={{color:muted,marginTop:6}}>Historical data dashboard — no next-round guarantee.</Text><Card title={mode==="login"?"Sign in":"Create account"}><Input label="Email" value={email} onChangeText={setEmail} placeholder="you@example.com" keyboardType="email-address"/><Input label="Password" value={password} onChangeText={setPassword} placeholder="At least 6 characters" secure/><Btn title={mode==="login"?"Sign in":"Register"} onPress={authSubmit}/><Btn secondary title={mode==="login"?"Create account":"Back to sign in"} onPress={()=>setMode(mode==="login"?"register":"login")}/>{!!error&&<Text style={{color:red,marginTop:8}}>{error}</Text>}</Card></ScrollView></SafeAreaView>;
 return <SafeAreaView style={page}><StatusBar style="light"/><ScrollView>
 <Text style={{color:white,fontSize:25,fontWeight:"900"}}>{admin?"Admin panel":"History dashboard"}</Text><Text style={{color:muted,marginVertical:8}}>{user.email} · role: {role}</Text>
 {!admin?<><View style={{flexDirection:"row",gap:8}}><Card title="Rounds"><Text style={{color:white,fontSize:22}}>{stats.count}</Text></Card><Card title="Latest"><Text style={{color:white,fontSize:22}}>{fmt(stats.latest)}</Text></Card></View><View style={{flexDirection:"row",gap:8}}><Card title="Mean"><Text style={{color:white,fontSize:20}}>{fmt(stats.mean)}</Text></Card><Card title="Median"><Text style={{color:white,fontSize:20}}>{fmt(stats.median)}</Text></Card></View><Card title="Historical frequencies"><Text style={{color:muted}}>Below 2x: {stats.below2==null?"—":stats.below2.toFixed(1)+"%"}</Text><Text style={{color:muted,marginTop:5}}>2x or above: {stats.atLeast2==null?"—":stats.atLeast2.toFixed(1)+"%"}</Text><Text style={{color:muted,marginTop:8}}>These are historical summaries only, not a prediction.</Text></Card><Card title="Add historical data"><Input label="Recorded multiplier" value={manual} onChangeText={setManual} placeholder="e.g. 1.42" keyboardType="decimal-pad"/><Btn title={busy?"Please wait":"Save value"} onPress={addValue}/><Btn secondary title="Import from configured API" onPress={importApi}/><Btn secondary title="Refresh history" onPress={load}/>{!!notice&&<Text style={{color:green,marginTop:8}}>{notice}</Text>}{!!error&&<Text style={{color:red,marginTop:8}}>{error}</Text>}</Card><Card title="Recent values"><View style={{flexDirection:"row",flexWrap:"wrap"}}>{history.slice(-30).reverse().map((n,i)=><Text key={`${i}-${n}`} style={{color:white,backgroundColor:"#30394b",padding:7,borderRadius:6,margin:3}}>{n.toFixed(2)}x</Text>)}</View></Card>{role==="admin"&&<Btn title="Open admin panel" onPress={adminLoad}/>}<Btn secondary title="Sign out" onPress={logout}/></>:<><Card title={`Registered users (${users.length})`}>{users.map(u=><Text key={u.uid} style={{color:muted,marginBottom:7}}>{u.email||u.uid} · {u.role||"user"}</Text>)}</Card><Text style={{color:muted}}>Read-only admin overview. Promote admins only from Firebase Console or a trusted server.</Text><Btn title="Back" onPress={()=>setAdmin(false)}/></>}
 </ScrollView></SafeAreaView>;
}
