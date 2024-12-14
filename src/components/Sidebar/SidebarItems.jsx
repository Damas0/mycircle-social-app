import CreatePost from "./CreatePost";
import Home from "./Home";
import ProfileLink from "./ProfileLink";
import Search from "./Search";
import Chat from "./chat";

const SidebarItems = () => {
	return (
		<>
			<Home />
			<Search />
			<CreatePost />
			<Chat />
			<ProfileLink />
		</>
	);
};

export default SidebarItems;
