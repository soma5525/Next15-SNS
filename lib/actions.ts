"use server";

import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import prisma from "./prisma";
import { revalidatePath } from "next/cache";

type State = {
  error?: string | undefined;
  success: boolean;
};

export async function addPostAction(
  prevState: State,
  formData: FormData
): Promise<State> {
  try {
    const { userId } = auth();

    if (!userId) {
      return {
        error: "ユーザーが存在しません。",
        success: false,
      };
    }

    const postText = formData.get("post") as string;
    const postTextSchema = z
      .string()
      .min(1, "ポスト内容を入力してください。")
      .max(140, "140字以内で入力してください。");

    const validatedPostText = postTextSchema.parse(postText);
    await prisma.post.create({
      data: {
        content: validatedPostText,
        authorId: userId,
      },
    });

    revalidatePath("/");

    return {
      error: undefined,
      success: true,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        error: error.errors.map((e) => e.message).join(", "),
        success: false,
      };
    } else if (error instanceof Error) {
      return {
        error: error.message,
        success: false,
      };
    } else {
      return {
        error: "予期せぬエラーが発生しました。",
        success: false,
      };
    }
  }
}

export const deletePostAction = async (postId: string) => {
  const { userId } = auth();

  if (!userId) {
    throw new Error("Uユーザー認証が必要です。");
  }

  try {
    // 投稿が存在し、かつ現在のユーザーが作成者であることを確認
    const post = await prisma.post.findUnique({
      where: {
        id: postId,
      },
      select: {
        authorId: true,
      },
    });

    if (!post) {
      throw new Error("投稿が見つかりません。");
    }

    if (post.authorId !== userId) {
      throw new Error("投稿を削除する権限がありません。");
    }

    // 投稿を削除
    await prisma.post.delete({
      where: {
        id: postId,
      },
    });

    revalidatePath("/");
    return {
      error: undefined,
      success: true,
    };
  } catch (error) {
    console.error(error);
    return {
      error: error instanceof Error ? error.message : "エラーが発生しました。",
      success: false,
    };
  }
};

export const likeAction = async (postId: string) => {
  const { userId } = auth();

  if (!userId) {
    throw new Error("User is not authenticated");
  }
  try {
    const existingLike = await prisma.like.findFirst({
      where: {
        postId,
        userId,
      },
    });

    if (existingLike) {
      await prisma.like.delete({
        where: {
          id: existingLike.id,
        },
      });
      revalidatePath("/");
    } else {
      await prisma.like.create({
        data: {
          postId,
          userId,
        },
      });
      revalidatePath("/");
    }
  } catch (error) {
    console.error(error);
  }
};

export const followAction = async (userId: string) => {
  const { userId: currentUserId } = auth();

  if (!currentUserId) {
    throw new Error("User is not authenticated");
  }
  try {
    const existingFollow = await prisma.follow.findFirst({
      where: {
        followingId: userId,
        followerId: currentUserId,
      },
    });

    // unfollow
    if (existingFollow) {
      await prisma.follow.delete({
        where: {
          followerId_followingId: {
            followerId: currentUserId,
            followingId: userId,
          },
        },
      });
    } else {
      // follow
      await prisma.follow.create({
        data: {
          followerId: currentUserId,
          followingId: userId,
        },
      });
    }
    revalidatePath(`profile/${userId}`);
  } catch (error) {
    console.error(error);
  }
};

export async function addReplyAction(
  prevState: State,
  formData: FormData
): Promise<State> {
  try {
    // 認証されたユーザー情報を取得
    const { userId } = auth();
    if (!userId) {
      return {
        error: "ユーザーが存在しません。",
        success: false,
      };
    }

    // フォームデータからリプライ内容と対象の投稿IDを取得
    const replyText = formData.get("reply") as string;
    const postId = formData.get("postId") as string;

    // リプライ内容のバリデーション
    const replyTextSchema = z
      .string()
      .min(1, "リプライ内容を入力してください。")
      .max(140, "140字以内で入力してください。");

    const validatedPostText = replyTextSchema.parse(replyText);

    // postIdが存在するかチェック
    if (!postId) {
      return {
        error: "投稿が存在しません。",
        success: false,
      };
    }

    // Prisma Clientを使ってリプライをDBに保存
    await prisma.reply.create({
      data: {
        content: validatedPostText,
        postId: postId,
        userId: userId,
      },
    });

    revalidatePath("/");
    return {
      error: undefined,
      success: true,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        error: error.errors.map((e) => e.message).join(", "),
        success: false,
      };
    } else if (error instanceof Error) {
      return {
        error: error.message,
        success: false,
      };
    } else {
      return {
        error: "予期せぬエラーが発生しました。",
        success: false,
      };
    }
  }
}

export const deleteReplyAction = async (replyId: string) => {
  const { userId } = auth();

  if (!userId) {
    throw new Error("Uユーザー認証が必要です。");
  }

  try {
    // 投稿が存在し、かつ現在のユーザーが作成者であることを確認
    const reply = await prisma.reply.findUnique({
      where: {
        id: replyId,
      },
      select: {
        userId: true,
      },
    });

    if (!reply) {
      throw new Error("投稿が見つかりません。");
    }

    if (reply.userId !== userId) {
      throw new Error("リプライを削除する権限がありません。");
    }

    // リプライを削除
    await prisma.reply.delete({
      where: {
        id: replyId,
      },
    });

    revalidatePath("/");
    return {
      error: undefined,
      success: true,
    };
  } catch (error) {
    console.error(error);
    return {
      error: error instanceof Error ? error.message : "エラーが発生しました。",
      success: false,
    };
  }
};
