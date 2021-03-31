import firebase from "firebase";

const firebaseConfig = {
    apiKey: "AIzaSyARdxCDsCkzRMCocTtkMgjKJD7eKKPDMi8",
    authDomain: "paddies-6b40a.firebaseapp.com",
    projectId: "paddies-6b40a",
    storageBucket: "paddies-6b40a.appspot.com",
    messagingSenderId: "843833730068",
    appId: "1:843833730068:web:ab5077fb4f9209bdac7301"
  };

  const  app = !firebase.apps.length ? firebase.initializeApp(firebaseConfig) :
  firebase.app();

  const db = app.firestore();
  const auth = app.auth();
  const provider = new firebase.auth.GoogleAuthProvider();
  
  export {db, auth, provider};