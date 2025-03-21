import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import Link from "next/link";
import React from "react";
import DeleteReplyButton from "./DeleteReplyButton";
import { auth } from "@clerk/nextjs/server";

interface User {
  id: string;
  username: string;
  name?: string;
  image?: string;
}

interface Reply {
  id: string;
  content: string;
  user: User;
  createdAt: Date;
}

const ReplyItem: React.FC<{ reply: Reply }> = ({ reply }) => {
  const { userId } = auth();
  const isAuthor = userId === reply.user.id;
  return (
    <div className="flex gap-3">
      <Link href={`/profile/${reply.user.username}`} className="shrink-0 mt-1">
        <Avatar className="w-8 h-8">
          <AvatarImage src={reply.user.image} />
          <AvatarFallback>
            {reply.user.name?.[0] || reply.user.username?.[0]}
          </AvatarFallback>
        </Avatar>
      </Link>
      <div className="flex flex-between min-w-0">
        <div>
          <div className="flex items-center flex-wrap gap-1 mb-0.5">
            <Link
              href={`/profile/${reply.user.username}`}
              className="font-medium text-sm hover:underline"
            >
              {reply.user.name || reply.user.username}
            </Link>
            <span className="text-xs text-muted-foreground">
              @{reply.user.username}
            </span>
            <span className="text-xs text-muted-foreground">・</span>
            <span className="text-xs text-muted-foreground">
              {reply.createdAt.toLocaleString()}
            </span>
          </div>
          <p className="text-sm break-words">{reply.content}</p>
        </div>
        <DeleteReplyButton replyId={reply.id} isAuthor={isAuthor} />
      </div>
    </div>
  );
};

export default ReplyItem;
