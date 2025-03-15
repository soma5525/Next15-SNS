import { Webhook } from "svix";
import { headers } from "next/headers";
import { WebhookEvent } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  const SIGNING_SECRET = process.env.SIGNING_SECRET;

  if (!SIGNING_SECRET) {
    throw new Error(
      "Error: Please add SIGNING_SECRET from Clerk Dashboard to .env or .env"
    );
  }

  // Create new Svix instance with secret
  const wh = new Webhook(SIGNING_SECRET);

  // Get headers
  const headerPayload = headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Error: Missing Svix headers", {
      status: 400,
    });
  }

  // Get body
  const payload = await req.text();
  // 修正: JSON.stringifyは不要
  const body = payload;

  let evt: WebhookEvent;

  // Verify payload with headers
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error("Error: Could not verify webhook:", err);
    return new Response("Error: Verification error", {
      status: 400,
    });
  }

  // Do something with payload
  // For this guide, log payload to console
  const { id } = evt.data;
  const eventType = evt.type;

  if (eventType === "user.created") {
    try {
      const emailAddress = evt.data.email_addresses?.[0]?.email_address;
      const username = evt.data.username || `user${evt.data.id.slice(0, 8)}`;
      const imageUrl = evt.data.image_url || null;

      await prisma.user.create({
        data: {
          id: evt.data.id,
          clerkId: evt.data.id,
          username: username,
          name: evt.data.first_name
            ? `${evt.data.first_name} ${evt.data.last_name || ""}`
            : username,
          image: imageUrl,
        },
      });

      return new Response("ユーザーの作成に成功しました。", { status: 200 });
    } catch (err) {
      console.error("Error creating user:", err);
      return new Response("ユーザーの作成に失敗しました。", {
        status: 500,
      });
    }
  }

  if (eventType === "user.updated") {
    try {
      const updateData: any = {};

      if (evt.data.username) {
        updateData.username = evt.data.username;
      }

      if (evt.data.first_name || evt.data.last_name) {
        updateData.name = evt.data.first_name
          ? `${evt.data.first_name} ${evt.data.last_name || ""}`
          : evt.data.username;
      }

      if (evt.data.image_url) {
        updateData.image = evt.data.image_url;
      }

      await prisma.user.update({
        where: {
          clerkId: evt.data.id,
        },
        data: updateData,
      });

      return new Response("ユーザーの更新に成功しました。", { status: 200 });
    } catch (err) {
      console.error("Error updating user:", err);
      return new Response("ユーザーの更新に失敗しました。", {
        status: 500,
      });
    }
  }

  return new Response("Webhook received", { status: 200 });
}
