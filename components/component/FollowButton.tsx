"use client";

import React, { useOptimistic } from "react";
import { Button } from "../ui/button";
import { followAction } from "@/lib/actions";
import { useRouter } from "next/navigation";

interface FollowButtonProps {
  isCurrentUser: boolean;
  isFollowing: boolean;
  userId: string;
}

const FollowButton = ({
  isCurrentUser,
  isFollowing,
  userId,
}: FollowButtonProps) => {
  const router = useRouter();

  const [optimisticFollow, addOptimisticFollow] = useOptimistic<
    { isFollowing: boolean },
    void
  >(
    {
      isFollowing,
    },
    (currentState) => ({
      isFollowing: !currentState.isFollowing,
    })
  );

  const getButtonContent = () => {
    if (isCurrentUser) {
      return "プロフィール編集";
    }
    if (optimisticFollow.isFollowing) {
      return "フォロー中";
    }
    return "フォローする";
  };

  const getButtonVariant = () => {
    if (isCurrentUser) {
      return "secondary";
    }
    if (optimisticFollow.isFollowing) {
      return "outline";
    }
    return "default";
  };

  const handleFollowAction = async () => {
    if (isCurrentUser) {
      return;
    }

    try {
      addOptimisticFollow();
      await followAction(userId);
      // フォローアクション後にページを更新
      router.refresh();
    } catch (error) {
      console.log(error);
      // エラー発生時にも更新
      router.refresh();
    }
  };

  return (
    <form action={handleFollowAction}>
      <Button variant={getButtonVariant()} className="w-full">
        {getButtonContent()}
      </Button>
    </form>
  );
};

export default FollowButton;
