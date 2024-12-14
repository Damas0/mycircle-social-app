import { Flex, Image, Text } from "@chakra-ui/react";
import { useSignInWithFacebook } from "react-firebase-hooks/auth";
import { auth, firestore } from "../../firebase/firebase";
import useShowToast from "../../hooks/useShowToast";
import useAuthStore from "../../hooks/authStore";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";

const FacebookAuth = ({ prefix }) => {
  const [signInWithFacebook, , , error] = useSignInWithFacebook(auth);
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

  const handleFacebookAuth = async () => {
    try {
      const newUser = await signInWithFacebook();
      if (!newUser && error) {
        showToast("Error", error.message, "error");
        return;
      }

      const userRef = doc(firestore, "users", newUser.user.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const userDoc = userSnap.data();
        await updateOnlineStatus(newUser.user.uid, true);
        localStorage.setItem("user-info", JSON.stringify(userDoc));
        loginUser(userDoc);
      } else {
        const userDoc = {
          uid: newUser.user.uid,
          email: newUser.user.email,
          username: newUser.user.email.split("@")[0],
          fullName: newUser.user.displayName,
          bio: "",
          profilePicURL: newUser.user.photoURL,
          followers: [],
          following: [],
          posts: [],
          createdAt: Date.now(),
          isOnline: true,
        };
        await setDoc(doc(firestore, "users", newUser.user.uid), userDoc);
        localStorage.setItem("user-info", JSON.stringify(userDoc));
        loginUser(userDoc);
      }
    } catch (error) {
      showToast("Error", error.message, "error");
    }
  };

  return (
    <Flex alignItems={"center"} justifyContent={"center"} cursor={"pointer"} onClick={handleFacebookAuth}>
      <Image src="/facebook.png" w={5} alt="Facebook logo" />
      <Text mx="2" color={"blue.500"}>
        {prefix} with Facebook
      </Text>
    </Flex>
  );
};

export default FacebookAuth;
