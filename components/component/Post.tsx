import React from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ClockIcon, HeartIcon } from "./Icons";
import PostInteraction from "./PostInteraction";
import Link from "next/link";
import { Button } from "../ui/button";
import ReplyItem from "./ReplyItem";
import { Delete } from "lucide-react";
import DeleteButton from "./DeleteButton";
import { auth } from "@clerk/nextjs/server";

const Post = ({ post }: any) => {
  const { userId } = auth();
  const isAuthor = post.author.id === userId;

  return (
    <div
      key={post.id}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <Link href={`/profile/${post.author.username}`}>
            <Avatar className="w-10 h-10">
              <AvatarImage src={post.author.image} />
              <AvatarFallback>AC</AvatarFallback>
            </Avatar>
          </Link>
          <div>
            <h3 className="text-lg font-bold">{post.author.name}</h3>
            <p className="text-muted-foreground">@{post.author.username}</p>
          </div>
        </div>

        <DeleteButton postId={post.id} isAuthor={isAuthor} />
      </div>

      {/* 投稿内容 */}
      <div className="space-y-2 mb-4">
        <p>{post.content}</p>
      </div>

      {/* 投稿フッター（いいね、コメント、時間） */}
      <div className="flex items-center justify-between mt-4">
        <div className="flex items-center gap-2">
          <PostInteraction
            postId={post.id}
            initialLikes={post.likes.map((like: any) => like.userId)}
            commentNumber={post._count.replies}
          />
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <ClockIcon className="h-5 w-5" />
          <span>{post.createdAt.toLocaleString()}</span>
        </div>
      </div>

      {post.replies && post.replies.length > 0 && (
        <div className="mt-4 border-t pt-4">
          <h4 className="font-medium text-sm text-muted-foreground mb-3">
            返信 {post.replies.length}件
          </h4>
          <div className="space-y-4">
            {post.replies.map((reply: any) => (
              <ReplyItem key={reply.id} reply={reply} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Post;
