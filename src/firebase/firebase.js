import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
	apiKey: "AIzaSyC7QdmJ32Mq9IN4r-Cxw3TjUqjpG4yimqI",
	authDomain: "mi-session-e81a1.firebaseapp.com",
	projectId: "mi-session-e81a1",
	storageBucket: "mi-session-e81a1.appspot.com",
	messagingSenderId: "27158267844",
	appId: "1:27158267844:web:4ca2ba2c4885f3efe1c691",
	measurementId: "G-QS0HK08PBM"
  };

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const firestore = getFirestore(app);
const storage = getStorage(app);

export { app, auth, firestore, storage };
