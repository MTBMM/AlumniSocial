import { createUserWithEmailAndPassword, getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { getFirebaseApp } from "../../configs/Firebase";
import { getUserData } from "./userActions";
import { saveDataToStorage } from "./SignUpFirebase";
import { authenticate } from "./store/authSlice";
let timer
const SignInFirebase =(username, password) => {

  return async dispatch => {
    console.log(password);
    const app = getFirebaseApp();
    const auth = getAuth(app);
    try {
      const email = `${username}123@gmail.com`;
      console.log(email);

      const result = await signInWithEmailAndPassword(auth, email, password);

      const { uid, stsTokenManager } = result.user;
      const { accessToken, expirationTime } = stsTokenManager;

      const expiryDate = new Date(expirationTime);
      const timeNow = new Date();
      const millisecondsUntilExpiry = expiryDate - timeNow;

      const userData = await getUserData(uid);
      dispatch(authenticate({ token: accessToken, userData }));
      saveDataToStorage(accessToken, uid, expiryDate);

      timer = setTimeout(() => {
          dispatch(userLogout());
      }, millisecondsUntilExpiry);
      console.log(result)
    } catch (error) {
      console.log(error);
    }
  }
};

export default SignInFirebase;
