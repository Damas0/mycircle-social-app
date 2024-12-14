import { useSignOut } from "react-firebase-hooks/auth";
import { auth, firestore } from "../firebase/firebase";
import { doc, updateDoc } from "firebase/firestore";
import useShowToast from "./useShowToast";
import useAuthStore from "../hooks/authStore";

const useLogout = () => {
  const [signOut, isLoggingOut, error] = useSignOut(auth);
  const showToast = useShowToast();
  const logoutUser = useAuthStore((state) => state.logout);

  const handleLogout = async () => {
    const user = auth.currentUser;
    try {
      if (user) {
        const userRef = doc(firestore, "users", user.uid);
        await updateDoc(userRef, { isOnline: false });
      }

      await signOut();

      localStorage.removeItem("user-info");
      logoutUser();
    } catch (error) {
      showToast("Error", error.message, "error");
    }
  };

  return { handleLogout, isLoggingOut, error };
};

export default useLogout;
