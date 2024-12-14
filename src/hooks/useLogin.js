import { useSignInWithEmailAndPassword } from "react-firebase-hooks/auth";
import useShowToast from "./useShowToast";
import { auth, firestore } from "../firebase/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import useAuthStore from "../hooks/authStore";

const useLogin = () => {
  const showToast = useShowToast();
  const [signInWithEmailAndPassword, , loading, error] = useSignInWithEmailAndPassword(auth);
  const loginUser = useAuthStore((state) => state.login);

  const updateOnlineStatus = async (uid, isOnline) => {
    if (!uid) return;
    const userRef = doc(firestore, "users", uid);
    try {
      await updateDoc(userRef, { isOnline });
    } catch (error) {
      console.error("Erreur lors de la mise à jour du statut en ligne :", error);
    }
  };

  const login = async (inputs) => {
    if (!inputs.email || !inputs.password) {
      return showToast("Error", "Please fill all the fields", "error");
    }
    try {
      const userCred = await signInWithEmailAndPassword(inputs.email, inputs.password);

      if (userCred) {
        const docRef = doc(firestore, "users", userCred.user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const userData = docSnap.data();

          if (!userData.isOnline) {
            await updateOnlineStatus(userCred.user.uid, true);
          }

          localStorage.setItem("user-info", JSON.stringify(userData));
          loginUser(userData);
        } else {
          showToast("Error", "User data not found", "error");
        }
      }
    } catch (error) {
      showToast("Error", error.message, "error");
    }
  };

  return { loading, error, login };
};

export default useLogin;
