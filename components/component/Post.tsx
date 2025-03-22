import React from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ClockIcon } from "./Icons";
import PostInteraction from "./PostInteraction";
import Link from "next/link";
import ReplyItem from "./ReplyItem";
import DeletePostButton from "./DeletePostButton";
import { auth } from "@clerk/nextjs/server";

// 投稿の型を定義
interface PostType {
  id: string;
  content: string;
  createdAt: string | Date;
  author: {
    id: string;
    name: string;
    username: string;
    image: string;
  };
  likes: { userId: string }[];
  replies: any[];
  _count: {
    replies: number;
  };
}

const Post = ({ post }: { post: PostType }) => {
  const { userId } = auth();
  const isAuthor = post.author.id === userId;

  // 日付をフォーマット
  const formatDate = (dateString: string | Date) => {
    const date =
      typeof dateString === "string" ? new Date(dateString) : dateString;
    return date.toLocaleString("ja-JP", {
      year: "numeric",
      month: "numeric",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div
      key={post.id}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <Link href={`/profile/${post.author.username}`}>
            <div className="overflow-hidden rounded-full">
              <Avatar className="w-10 h-10">
                <AvatarImage src={post.author.image} alt={post.author.name} />
                <AvatarFallback>AC</AvatarFallback>
              </Avatar>
            </div>
          </Link>
          <div>
            <h3 className="text-lg font-bold">{post.author.name}</h3>
            <p className="text-muted-foreground">@{post.author.username}</p>
          </div>
        </div>
        <DeletePostButton postId={post.id} isAuthor={isAuthor} />
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
          <span>{formatDate(post.createdAt)}</span>
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
