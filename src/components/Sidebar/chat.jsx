import { useState, useEffect, useRef } from "react";
import {
  Box,
  Flex,
  Input,
  Button,
  Tooltip,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Avatar,
  Text,
  Badge,
} from "@chakra-ui/react";
import { NotificationsLogo } from "../../assets/constants";
import { collection, addDoc, onSnapshot, query, orderBy, Timestamp, doc, getDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { firestore } from "../../firebase/firebase";

const Chat = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messageContent, setMessageContent] = useState("");
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const messagesEndRef = useRef(null);
  const auth = getAuth();

  useEffect(() => {
    const q = query(collection(firestore, "generalChat"), orderBy("timestamp", "asc"));
    const unsubscribeMessages = onSnapshot(q, (snapshot) => {
      const messagesArray = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMessages(messagesArray);
    });

    const unsubscribeUsers = onSnapshot(collection(firestore, "users"), (snapshot) => {
      const usersArray = snapshot.docs.map((doc) => doc.data());
      setUsers(usersArray);
    });

    return () => {
      unsubscribeMessages();
      unsubscribeUsers();
    };
  }, []);

  const handleSendMessage = async () => {
    const user = auth.currentUser;

    if (messageContent.trim() !== "" && user) {
      try {
        const userRef = doc(firestore, "users", user.uid);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
          console.error("Utilisateur introuvable dans Firestore");
          return;
        }

        const userData = userSnap.data();

        await addDoc(collection(firestore, "generalChat"), {
          content: messageContent,
          timestamp: Timestamp.now(),
          userId: user.uid,
          userName: userData.username || userData.fullName || "Utilisateur",
          userPhoto: userData.profilePicURL || null,
        });

        setMessageContent("");
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      } catch (error) {
        console.error("Erreur lors de l'envoi du message :", error);
      }
    }
  };

  return (
    <>
      <Tooltip
        hasArrow
        label={"Chat"}
        placement="right"
        ml={1}
        openDelay={500}
        display={{ base: "block", md: "none" }}
      >
        <Flex
          alignItems={"center"}
          gap={4}
          _hover={{ bg: "whiteAlpha.400" }}
          borderRadius={6}
          p={2}
          w={{ base: 10, md: "full" }}
          justifyContent={{ base: "center", md: "flex-start" }}
          onClick={() => setIsChatOpen(true)}
          cursor="pointer"
        >
          <NotificationsLogo />
          <Box display={{ base: "none", md: "block" }}>Chat</Box>
        </Flex>
      </Tooltip>

      <Modal isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Chat Général</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Flex direction="column" p={4} h="500px">
              <Box mb={4}>
                <Text fontWeight="bold" mb={2}>
                  Utilisateurs :
                </Text>
                <Flex wrap="wrap" gap={4}>
                  {users.map((user, index) => (
                    <Flex key={index} alignItems="center" gap={2}>
                      <Avatar size="sm" src={user.profilePicURL || ""} />
                      <Text>
                        {user.username || user.fullName || "Utilisateur"}
                      </Text>
                      {user.isOnline ? (
                        <Badge colorScheme="green">En ligne</Badge>
                      ) : (
                        <Badge colorScheme="red">Hors ligne</Badge>
                      )}
                    </Flex>
                  ))}
                </Flex>
              </Box>

              <Box flex="1" overflowY="auto" mb={4}>
                {messages.map((msg) => (
                  <Box
                    key={msg.id}
                    bg={msg.userId === auth.currentUser?.uid ? "blue.100" : "black.100"}
                    p={2}
                    mb={2}
                    borderRadius="md"
                  >
                    <Flex alignItems="center" gap={2}>
                      <Avatar size="xs" src={msg.userPhoto || ""} />
                      <strong>{msg.userName} :</strong>
                    </Flex>
                    <Text mt={1}>{msg.content}</Text>
                  </Box>
                ))}
                <div ref={messagesEndRef} />
              </Box>

              <Flex>
                <Input
                  placeholder="Tapez votre message..."
                  value={messageContent}
                  onChange={(e) => setMessageContent(e.target.value)}
                />
                <Button ml={2} onClick={handleSendMessage}>
                  Envoyer
                </Button>
              </Flex>
            </Flex>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

export default Chat;
