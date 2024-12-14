import {
	Avatar,
	Button,
	Center,
	Flex,
	FormControl,
	FormLabel,
	Heading,
	Input,
	Modal,
	ModalBody,
	ModalCloseButton,
	ModalContent,
	ModalHeader,
	ModalOverlay,
	Stack,
    Spinner,
} from "@chakra-ui/react";
import { useRef, useState } from "react";
import useAuthStore from "../../hooks/authStore";
import usePreviewImg from "../../hooks/usePreviewImg";
import useEditProfile from "../../hooks/useEditProfile";
import useShowToast from "../../hooks/useShowToast";
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: "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",
  dangerouslyAllowBrowser: true,
});

const EditProfile = ({ isOpen, onClose }) => {
	const [inputs, setInputs] = useState({
		fullName: "",
		username: "",
		bio: "",
	});
	const authUser = useAuthStore((state) => state.user);
	const fileRef = useRef(null);
	const { handleImageChange, selectedFile, setSelectedFile } = usePreviewImg();
	const { isUpdating, editProfile } = useEditProfile();
	const showToast = useShowToast();

	const [isGenerating, setIsGenerating] = useState(false);

	const generateBio = async () => {
		try {
		setIsGenerating(true);
		const userInput = inputs.bio || ""; 
		const prompt = `
	  En te basant sur les informations suivantes saisies par l'utilisateur: "${userInput}", 
	  rédige une biographie à la première personne, courte (1-2 phrases), 
	  qui reflète mon engagement professionnel, 
	  et mon équilibre entre vie pro et perso. Le texte doit être chaleureux, 
	  professionnel, sans mentionner de nom propre, 
	  et montrer que je parle de moi-même (utiliser "je").`;
 
 const response = await openai.chat.completions.create({
			model: "gpt-4",
			messages: [
			{ role: "system", content: "Tu es un assistant qui transforme des informations en une biographie à la première personne, professionnelle et chaleureuse." },
			{ role: "user", content: prompt },
			],
		});
 
		const generatedBio = response.choices[0].message.content.trim();
		setInputs((prev) => ({ ...prev, bio: generatedBio }));
		} catch (error) {
		console.error("Erreur lors de la génération de la bio :", error);
		showToast("Erreur", "Impossible de générer la biographie.", "error");
		} finally {
		setIsGenerating(false);
		}
	};
	
	const handleEditProfile = async () => {
		try {
			await editProfile(inputs, selectedFile);
			setSelectedFile(null);
			onClose();
		} catch (error) {
			showToast("Error", error.message, "error");
		}
	};

	return (
		<>
			<Modal isOpen={isOpen} onClose={onClose}>
				<ModalOverlay />
				<ModalContent bg={"black"} boxShadow={"xl"} border={"1px solid gray"} mx={3}>
					<ModalHeader />
					<ModalCloseButton />
					<ModalBody>
						<Flex bg={"black"}>
							<Stack spacing={4} w={"full"} maxW={"md"} bg={"black"} p={6} my={0}>
								<Heading lineHeight={1.1} fontSize={{ base: "2xl", sm: "3xl" }}>
									Edit Profile
								</Heading>
								<FormControl>
									<Stack direction={["column", "row"]} spacing={6}>
										<Center>
											<Avatar
												size='xl'
												src={selectedFile || authUser.profilePicURL}
												border={"2px solid white "}
											/>
										</Center>
										<Center w='full'>
											<Button w='full' onClick={() => fileRef.current.click()}>
												Edit Profile Picture
											</Button>
										</Center>
										<Input type='file' hidden ref={fileRef} onChange={handleImageChange} />
									</Stack>
								</FormControl>

								<FormControl>
									<FormLabel fontSize={"sm"}>Full Name</FormLabel>
									<Input
										placeholder={"Full Name"}
										size={"sm"}
										type={"text"}
										value={inputs.fullName || authUser.fullName}
										onChange={(e) => setInputs({ ...inputs, fullName: e.target.value })}
									/>
								</FormControl>

								<FormControl>
									<FormLabel fontSize={"sm"}>Username</FormLabel>
									<Input
										placeholder={"Username"}
										size={"sm"}
										type={"text"}
										value={inputs.username || authUser.username}
										onChange={(e) => setInputs({ ...inputs, username: e.target.value })}
									/>
								</FormControl>

								<FormControl>
									<FormLabel fontSize={"sm"} display="flex" alignItems="center">
										Bio 
										{isGenerating && <Spinner ml={2} size='sm' />}
									</FormLabel>
									<Flex gap={2}>
										<Input
											placeholder={"Entrez vos idées, mots-clés ou envies ici..."}
											size={"sm"}
											type={"text"}
											value={inputs.bio || authUser.bio}
											onChange={(e) => setInputs({ ...inputs, bio: e.target.value })}
										/>
										<Button
											size='sm'
											colorScheme='teal'
											isDisabled={isGenerating}
											onClick={generateBio}
										>
											Générer
										</Button>
									</Flex>
								</FormControl>

								<Stack spacing={6} direction={["column", "row"]}>
									<Button
										bg={"red.400"}
										color={"white"}
										w='full'
										size='sm'
										_hover={{ bg: "red.500" }}
										onClick={onClose}
									>
										Cancel
									</Button>
									<Button
										bg={"blue.400"}
										color={"white"}
										size='sm'
										w='full'
										_hover={{ bg: "blue.500" }}
										onClick={handleEditProfile}
										isLoading={isUpdating}
									>
										Submit
									</Button>
								</Stack>
							</Stack>
						</Flex>
					</ModalBody>
				</ModalContent>
			</Modal>
		</>
	);
};

export default EditProfile;
