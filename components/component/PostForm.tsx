"use client";

import { useRef } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { addPostAction } from "@/lib/actions";
import SubmitButton from "./SubmitButton";
import { useFormState } from "react-dom";
import { useUser } from "@clerk/nextjs";

export default function PostForm() {
  const initialState = {
    error: undefined,
    success: false,
  };

  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction] = useFormState(addPostAction, initialState);

  const { user, isLoaded } = useUser();

  if (state.success && formRef.current) {
    formRef.current.reset();
  }

  return (
    <div>
      <div className="flex items-center gap-4">
        <Avatar className="w-10 h-10">
          {isLoaded ? (
            <>
              <AvatarImage src={user?.imageUrl || "/placeholder-user.jpeg"} />
              <AvatarFallback>
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
          className="flex items-center flex-1"
        >
          <Input
            type="text"
            placeholder="What's on your mind?"
            className="flex-1 rounded-full bg-muted px-4 py-2"
            name="post"
          />

          <SubmitButton />
        </form>
      </div>

      {state.error && (
        <p className="text-destructive mt-1 ml-14">{state.error}</p>
      )}
    </div>
  );
}
