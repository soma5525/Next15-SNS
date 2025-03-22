"use client";

// components/LeftSidebar.tsx
import Link from "next/link";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  HomeIcon,
  CompassIcon,
  BookmarkIcon,
  UserIcon,
  MessageCircleIcon,
  HeartIcon,
  SettingsIcon,
} from "./Icons";
import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";

interface UserInfo {
  name: string | null;
  username: string | null;
  image: string | null;
}

export default function LeftSidebar() {
  const { user, isLoaded } = useUser();
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);

  // ユーザー情報の初期値
  let name = "Guest User";
  let username = "";
  let userImage = "/placeholder-user.jpg";
  let initials = "GU";

  useEffect(() => {
    async function fetchUserInfo() {
      if (user?.id) {
        try {
          // ここでユーザー情報をAPIから取得
          const response = await fetch(`/api/users/${user.id}`);
          if (response.ok) {
            const data = await response.json();
            setUserInfo(data);
          }
        } catch (error) {
          console.error("Failed to fetch user info:", error);
        }
      }
    }

    if (isLoaded && user) {
      fetchUserInfo();
    }
  }, [isLoaded, user]);

  // ユーザー情報が取得できた場合は更新
  if (userInfo) {
    name = userInfo.name || user?.fullName || name;
    username = userInfo.username || "";
    userImage = userInfo.image || user?.imageUrl || userImage;
  } else if (isLoaded && user) {
    // Clerkから直接取得できる情報で更新
    name = user.fullName || name;
    userImage = user.imageUrl || userImage;
  }

  // イニシャルの生成
  if (username) {
    initials = username.substring(0, 2).toUpperCase();
  } else if (name !== "Guest User") {
    initials = name.substring(0, 2).toUpperCase();
  }

  // ユーザー名に基づいて動的にnavItemsを生成
  const navItems = [
    { icon: HomeIcon, label: "Home", href: "/" },
    { icon: CompassIcon, label: "Explore", href: "/explore" },
    { icon: BookmarkIcon, label: "Bookmarks", href: "/bookmarks" },
    {
      icon: UserIcon,
      label: "Profile",
      href: username ? `/profile/${username}` : "/profile",
    },
    { icon: MessageCircleIcon, label: "Messages", href: "/messages" },
    { icon: HeartIcon, label: "Likes", href: "/likes" },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg shadow-md p-4 h-full flex flex-col">
      <div className="flex rounded-full items-center gap-4 mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
        <Link href={username ? `/profile/${username}` : "/profile"}>
          <div className="overflow-hidden rounded-full">
            <Avatar className="w-12 h-12">
              <AvatarImage
                src={userImage}
                alt={name}
                className="w-full h-full object-cover"
              />
              <AvatarFallback className="w-full h-full flex items-center justify-center">
                {initials}
              </AvatarFallback>
            </Avatar>
          </div>
        </Link>
        <div>
          <h3 className="text-lg font-bold">{name}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {username ? `@${username}` : "Not logged in"}
          </p>
        </div>
      </div>
      <nav className="flex-grow">
        <ul className="space-y-2">
          {navItems.map(({ icon: Icon, label, href }) => (
            <li key={label}>
              <Link href={href} className="block">
                <div className="flex items-center gap-3 px-3 py-2 rounded-md text-gray-700 dark:text-gray-200 hover:bg-muted dark:hover:bg-gray-700 transition-colors">
                  <Icon className="h-5 w-5" />
                  <span>{label}</span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <div className="mt-auto pt-4 border-t border-gray-200 dark:border-gray-700">
        <Link href="/settings" className="block">
          <div className="flex items-center gap-3 px-3 py-2 rounded-md text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <SettingsIcon className="h-5 w-5" />
            <span>Settings</span>
          </div>
        </Link>
      </div>
    </div>
  );
}
