"use client";

import { deletePostAction } from "@/lib/actions";
import { useState } from "react";
import { Button } from "../ui/button";
import { TrashIcon } from "lucide-react";

interface DeletePostButtonProps {
  postId: string;
  isAuthor: boolean;
  onDeleteSuccess?: () => void;
}

const DeletePostButton = ({
  postId,
  isAuthor,
  onDeleteSuccess,
}: DeletePostButtonProps) => {
  const [isDeleting, setIsDeleting] = useState(false);

  if (!isAuthor) {
    return null;
  }

  const handleDelete = async () => {
    const confirmed = window.confirm("本当に削除しますか？");
    if (!confirmed) {
      return;
    }

    setIsDeleting(true);

    try {
      const result = await deletePostAction(postId);
      if (result.success) {
        if (onDeleteSuccess) {
          onDeleteSuccess();
        }
      } else {
        alert(result.error || "削除できませんでした");
      }
    } catch (error) {
      console.error(error);
      alert("削除できませんでした");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleDelete}
      disabled={isDeleting}
      className="text-red-500 hover:bg-red-50 hover:text-red-700"
    >
      <TrashIcon className="h-4 w-4 mr-1" />
      {isDeleting ? "削除中..." : "削除"}
    </Button>
  );
};

export default DeletePostButton;
