import { initializeApp } from "firebase/app";
import { getAuth, signOut } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
const firebaseConfig = {
  apiKey: "AIzaSyBaB7sVgZ-PlOqjErv098ONeL_oBuhM7Cs",
  authDomain: "caravellabs-l1.firebaseapp.com",
  projectId: "caravellabs-l1",
  storageBucket: "caravellabs-l1.appspot.com",
  messagingSenderId: "53818746983",
  appId: "1:53818746983:web:98bfec8a2bf28b93a30cc2"
};

const app = initializeApp(firebaseConfig);
const db=getFirestore(app);
const auth=getAuth(app);
// const logout=signOut(app);

export {db,auth,app,signOut};