"use client";

import { addReplyAction } from "@/lib/actions";
import { error } from "console";
import React, { useRef, useState } from "react";
import { useFormState } from "react-dom";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import SubmitButton from "./SubmitButton";
import { auth } from "@clerk/nextjs/server";

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

  if (state.success && formRef.current) {
    formRef.current.reset();
  }

  return (
    <div className="mt-4">
      <div className="flex items-center gap-4">
        <Avatar className="w-8 h-8">
          <AvatarImage src="/placeholder-user.jpg" />
          <AvatarFallback>AC</AvatarFallback>
        </Avatar>
        <form ref={formRef} action={formAction} className="flex-1">
          <textarea
            name="reply"
            placeholder="リプライを入力してください"
            className="w-full rounded bg-muted px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
          />
          <input type="hidden" name="postId" value={postId} />
          <div className="mt-2 flex justify-end gap-2">
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
