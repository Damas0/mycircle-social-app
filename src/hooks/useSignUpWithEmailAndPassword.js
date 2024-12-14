import { useCreateUserWithEmailAndPassword } from "react-firebase-hooks/auth";
import { auth, firestore } from "../firebase/firebase";
import { collection, doc, getDocs, query, setDoc, where, updateDoc } from "firebase/firestore";
import useShowToast from "./useShowToast";
import useAuthStore from "../hooks/authStore";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { useEffect } from "react";

const useSignUpWithEmailAndPassword = () => {
  const [createUserWithEmailAndPassword, , loading, error] = useCreateUserWithEmailAndPassword(auth);
  const showToast = useShowToast();
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

  useEffect(() => {
    const handleBeforeUnload = async () => {
      const user = auth.currentUser;
      if (user) {
        await updateOnlineStatus(user.uid, false);
      }
    };

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        await updateOnlineStatus(user.uid, true);
        window.addEventListener("beforeunload", handleBeforeUnload);
      } else {
        window.removeEventListener("beforeunload", handleBeforeUnload);
      }
    });

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      unsubscribe();
    };
  }, []);

  const signup = async (inputs) => {
    if (!inputs.email || !inputs.password || !inputs.username || !inputs.fullName) {
      showToast("Error", "Please fill all the fields", "error");
      return;
    }

    const usersRef = collection(firestore, "users");
    const q = query(usersRef, where("username", "==", inputs.username));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      showToast("Error", "Username already exists", "error");
      return;
    }

    try {
      const newUser = await createUserWithEmailAndPassword(inputs.email, inputs.password);
      if (!newUser && error) {
        showToast("Error", error.message, "error");
        return;
      }

      if (newUser) {
        const userDoc = {
          uid: newUser.user.uid,
          email: inputs.email,
          username: inputs.username,
          fullName: inputs.fullName,
          displayName: inputs.fullName || inputs.username,
          bio: "",
          profilePicURL: "",
          followers: [],
          following: [],
          posts: [],
          createdAt: Date.now(),
          isOnline: true,
        };

        await setDoc(doc(firestore, "users", newUser.user.uid), userDoc);
        localStorage.setItem("user-info", JSON.stringify(userDoc));
        loginUser(userDoc);
        showToast("Success", "Account created successfully", "success");
      }
    } catch (error) {
      showToast("Error", error.message, "error");
    }
  };

  const logout = async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        await updateOnlineStatus(user.uid, false);
        await signOut(auth);
        localStorage.removeItem("user-info");
        showToast("Success", "Logged out successfully", "success");
      }
    } catch (error) {
      showToast("Error", error.message, "error");
    }
  };

  return { loading, error, signup, logout };
};

export default useSignUpWithEmailAndPassword;
