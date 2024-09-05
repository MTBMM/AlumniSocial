import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

export const getFirebaseApp = () => {
  // TODO: Add SDKs for Firebase products that you want to use
  // https://firebase.google.com/docs/web/setup#available-libraries

  // Your web app's Firebase configuration
  // For Firebase JS SDK v7.20.0 and later, measurementId is optional
  const firebaseConfig = {
    apiKey: "AIzaSyDVIvn52AB29zoG4vDvPKtIMClYOppx5tY",
    authDomain: "alumniapp-6859b.firebaseapp.com",
    projectId: "alumniapp-6859b",
    storageBucket: "alumniapp-6859b.appspot.com",
    messagingSenderId: "381758086027",
    appId: "1:381758086027:web:1e28558eafc385210bed8e",
    measurementId: "G-ZYME72YGEX",
  };

  return initializeApp(firebaseConfig);
};

// const firebaseConfig = {
//   apiKey: "AIzaSyDVIvn52AB29zoG4vDvPKtIMClYOppx5tY",
//   authDomain: "alumniapp-6859b.firebaseapp.com",
//   projectId: "alumniapp-6859b",
//   storageBucket: "alumniapp-6859b.appspot.com",
//   messagingSenderId: "381758086027",
//   appId: "1:381758086027:web:1e28558eafc385210bed8e",
//   measurementId: "G-ZYME72YGEX",
// };

// // Initialize Firebase


// const app = initializeApp(firebaseConfig);
// const auth = getAuth(app);
// const firestore = getFirestore(app);

// export { auth, firestore };
