import { createUserWithEmailAndPassword, getAuth } from "firebase/auth"
import { getFirebaseApp } from "../../configs/Firebase";
import { child, getDatabase, ref, set } from 'firebase/database';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { authenticate } from "./store/authSlice";
let timer
const SignUpFirebase = (username, password, firstName, lastName) => {
    return async dispatch => {
        const app = getFirebaseApp()
        const auth = getAuth(app)
        try{
            const email = `${username}123@gmail.com`;
            console.log(email)
            const result = await createUserWithEmailAndPassword(auth, email, password);
            const { uid, stsTokenManager } = result.user;
            const { accessToken, expirationTime } = stsTokenManager;

            const expiryDate = new Date(expirationTime);
            const timeNow = new Date();
            const millisecondsUntilExpiry = expiryDate - timeNow;

            const userData = await createUser(firstName, lastName, email, uid);

            dispatch(authenticate({ token: accessToken, userData }));
            // saveDataToStorage(accessToken, uid, expiryDate);
            console.log(userData)
            timer = setTimeout(() => {
                dispatch(userLogout());
            }, millisecondsUntilExpiry);

        }catch(error){
            console.log(error)
        }

    }
}

const createUser = async (firstName, lastName, email, userId) => {
    const firstLast = `${firstName} ${lastName}`.toLowerCase();
    const userData = {
        firstName,
        lastName,
        firstLast,
        email,
        userId,
        signUpDate: new Date().toISOString()
    };

    const dbRef = ref(getDatabase());
    const childRef = child(dbRef, `users/${userId}`);
    await set(childRef, userData);
    return userData;
}

export const saveDataToStorage = (token, userId, expiryDate) => {
    AsyncStorage.setItem("userData", JSON.stringify({
        token,
        userId,
        expiryDate: expiryDate.toISOString()
    }));
}
export default SignUpFirebase