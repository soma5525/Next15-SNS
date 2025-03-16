"use client";

import React, { FormEvent, useOptimistic, useState } from "react";
import { Button } from "@/components/ui/button";
import { HeartIcon, MessageCircleIcon, Share2Icon, ClockIcon } from "./Icons";
import { useAuth } from "@clerk/nextjs";
import { likeAction } from "@/lib/actions";
import ReplyForm from "./ReplyForm";

interface LikeState {
  likeCount: number;
  isLiked: boolean;
}

type PostInteractionProps = {
  postId: string;
  initialLikes: string[];
  commentNumber: number;
};

const PostInteraction = ({
  postId,
  initialLikes,
  commentNumber,
}: PostInteractionProps) => {
  const { userId } = useAuth();

  const initialState = {
    likeCount: initialLikes.length,
    isLiked: userId ? initialLikes.includes(userId) : false,
  };

  const [optimisticLike, addOptimisticLike] = useOptimistic<LikeState, void>(
    initialState,
    (currentState) => ({
      // updateFn
      likeCount: currentState.isLiked
        ? currentState.likeCount - 1
        : currentState.likeCount + 1,
      isLiked: !currentState.isLiked,
    })
  );
  const handleLikeSubmit = async () => {
    try {
      addOptimisticLike();
      await likeAction(postId);
    } catch (error) {
      console.log(error);
    }
  };

  const [showReplyForm, setShowReplyForm] = useState(false);

  return (
    <div className="flex flex-col">
      <div className="flex items-center ">
        <form action={handleLikeSubmit}>
          <Button variant="ghost" size="icon">
            <HeartIcon
              className={`h-5 w-5 ${
                optimisticLike.isLiked
                  ? "text-destructive"
                  : "text-muted-foreground"
              }`}
            />
          </Button>
        </form>
        <span
          className={`-ml-1 ${
            optimisticLike.isLiked ? "text-destructive" : ""
          } `}
        >
          {optimisticLike.likeCount}
        </span>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setShowReplyForm((prev) => !prev)}
        >
          <MessageCircleIcon className="h-5 w-5 text-muted-foreground" />
        </Button>
        <span>{commentNumber}</span>
        <Button variant="ghost" size="icon">
          <Share2Icon className="h-5 w-5 text-muted-foreground" />
        </Button>
      </div>
      {showReplyForm && (
        <div className="mt-4">
          <ReplyForm postId={postId} onClose={() => setShowReplyForm(false)} />
        </div>
      )}
    </div>
  );
};

export default PostInteraction;
