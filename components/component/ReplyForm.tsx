"use client";

import { addReplyAction } from "@/lib/actions";
import React, { useRef } from "react";
import { useFormState } from "react-dom";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import SubmitButton from "./SubmitButton";
import { useUser } from "@clerk/nextjs";
import { Input } from "../ui/input";

interface ReplyFormProps {
  postId: string;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function ReplyForm({ postId, onClose }: ReplyFormProps) {
  const initialState = {
    error: undefined,
    success: false,
  };

  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction] = useFormState(addReplyAction, initialState);

  const { user, isLoaded } = useUser();

  if (state.success && formRef.current) {
    formRef.current.reset();
  }

  return (
    <div className="mt-4 bg-gray-50 dark:bg-gray-900 rounded-lg p-3 ">
      <div className="flex gap-3">
        <Avatar className="w-9 h-9 shrink-0 mt-1">
          {isLoaded ? (
            <>
              <AvatarImage src={user?.imageUrl || "/placeholder-user.jpg"} />
              <AvatarFallback className="bg-primary/10 text-primary">
                {user?.firstName?.[0] ||
                  user?.username?.[0] ||
                  user?.emailAddresses[0]?.emailAddress?.[0]?.toUpperCase() ||
                  "U"}
              </AvatarFallback>
            </>
          ) : (
            <AvatarFallback>...</AvatarFallback>
          )}
        </Avatar>
        <form
          ref={formRef}
          action={formAction}
          className="flex items-center justify-between"
        >
          <div className="flex-1">
            <Input
              type="text"
              placeholder="Enter your reply"
              className="rounded-full bg-muted px-4 py-2"
              name="reply"
            />
            <input type="hidden" name="postId" value={postId} />
          </div>
          <div className="flex gap-2">
            <SubmitButton />
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
            >
              キャンセル
            </button>
          </div>
        </form>
      </div>
      {state.error && (
        <p className="text-destructive mt-1 ml-12 text-sm">{state.error}</p>
      )}
    </div>
  );
}
