import {
  Avatar,
  Flex,
  Skeleton,
  SkeletonCircle,
  Text,
  IconButton,
} from "@chakra-ui/react";
import { Link } from "react-router-dom";
import { timeAgo } from "../../hooks/timeAgo";
import { FaThumbsUp } from "react-icons/fa";
import { useState } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { firestore } from "../../firebase/firebase";
import useGetUserProfileById from "../../hooks/useGetUserProfileById";

const Comment = ({ comment }) => {
  const { userProfile, isLoading } = useGetUserProfileById(comment.createdBy);
  const [isLiking, setIsLiking] = useState(false);

  if (isLoading) return <CommentSkeleton />;

  const handleLike = async () => {
    try {
      setIsLiking(true);
      const postRef = doc(firestore, "posts", comment.postId);
      const postSnap = await getDoc(postRef);

      if (!postSnap.exists()) {
        console.error("Le post n'existe pas");
        setIsLiking(false);
        return;
      }

      const postData = postSnap.data();
      const commentsArray = postData.comments || [];

      const commentIndex = commentsArray.findIndex(
        (c) =>
          c.createdAt === comment.createdAt && c.createdBy === comment.createdBy
      );

      if (commentIndex === -1) {
        console.error("Commentaire introuvable dans le tableau");
        setIsLiking(false);
        return;
      }

      const updatedComment = { ...commentsArray[commentIndex] };
      updatedComment.likeCount = (updatedComment.likeCount || 0) + 1;

      const updatedComments = [...commentsArray];
      updatedComments[commentIndex] = updatedComment;

      await updateDoc(postRef, { comments: updatedComments });

      setIsLiking(false);
    } catch (error) {
      console.error("Erreur lors du like du commentaire :", error);
      setIsLiking(false);
    }
  };

  return (
    <Flex gap={4} alignItems="center">
      <Link to={`/${userProfile.username}`}>
        <Avatar src={userProfile.profilePicURL} size={"sm"} />
      </Link>
      <Flex direction={"column"}>
        <Flex gap={2} alignItems={"center"}>
          <Link to={`/${userProfile.username}`}>
            <Text fontWeight={"bold"} fontSize={12}>
              {userProfile.username}
            </Text>
          </Link>
          <Text fontSize={14}>{comment.comment}</Text>
          <IconButton
            size="xs"
            icon={<FaThumbsUp />}
            onClick={handleLike}
            aria-label="Like comment"
            variant="ghost"
            colorScheme="blue"
            isLoading={isLiking}
          />
          {(comment.likeCount || 0) > 0 && (
            <Text fontSize={12} color={"gray.300"}>
              {comment.likeCount || 0}
            </Text>
          )}
        </Flex>
        <Text fontSize={12} color={"gray"}>
          {timeAgo(comment.createdAt)}
        </Text>
      </Flex>
    </Flex>
  );
};

export default Comment;

const CommentSkeleton = () => {
  return (
    <Flex gap={4} w={"full"} alignItems={"center"}>
      <SkeletonCircle h={10} w="10" />
      <Flex gap={1} flexDir={"column"}>
        <Skeleton height={2} width={100} />
        <Skeleton height={2} width={50} />
      </Flex>
    </Flex>
  );
};
