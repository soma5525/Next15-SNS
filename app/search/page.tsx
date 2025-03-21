"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { searchAction } from "@/lib/actions";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@clerk/nextjs";

export default function SearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";
  const [searchResults, setSearchResults] = useState<any>({
    users: [],
    posts: [],
  });
  const [isLoading, setIsLoading] = useState(false);
  const { userId } = useAuth();

  useEffect(() => {
    async function fetchSearchResults() {
      if (query) {
        setIsLoading(true);
        try {
          const results = await searchAction(query);
          setSearchResults(results);
        } catch (error) {
          console.error("検索結果の取得に失敗しました:", error);
        } finally {
          setIsLoading(false);
        }
      }
    }

    fetchSearchResults();
  }, [query]);

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">「{query}」の検索結果</h1>

      {isLoading ? (
        <div className="flex justify-center my-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
        </div>
      ) : (
        <>
          {/* ユーザー検索結果 */}
          {searchResults.users && searchResults.users.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">ユーザー</h2>
              <div className="space-y-4">
                {searchResults.users.map((user: any) => (
                  <Link
                    href={`/profile/${user.username}`}
                    key={user.id}
                    className="flex items-center p-3 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="relative h-12 w-12 rounded-full overflow-hidden mr-3">
                      <Image
                        src={user.image || "/default-avatar.png"}
                        alt={user.name || user.username}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <p className="font-medium">{user.name}</p>
                      <p className="text-gray-500">@{user.username}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* 投稿検索結果 */}
          {searchResults.posts && searchResults.posts.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-4">投稿</h2>
              <div className="space-y-4">
                {searchResults.posts.map((post: any) => (
                  <div
                    key={post.id}
                    className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center mb-2">
                      <Link
                        href={`/profile/${post.author.username}`}
                        className="flex items-center"
                      >
                        <div className="relative h-10 w-10 rounded-full overflow-hidden mr-3">
                          <Image
                            src={post.author.image || "/default-avatar.png"}
                            alt={post.author.name || post.author.username}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div>
                          <p className="font-medium">{post.author.name}</p>
                          <p className="text-gray-500 text-sm">
                            @{post.author.username}
                          </p>
                        </div>
                      </Link>
                    </div>
                    <p className="mb-2">{post.content}</p>
                    <div className="flex items-center text-gray-500 text-sm">
                      <span className="mr-4">
                        {new Date(post.createdAt).toLocaleDateString("ja-JP")}
                      </span>
                      <span className="mr-4">{post._count.replies} 返信</span>
                      <span>{post.likes.length} いいね</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 検索結果がない場合 */}
          {(!searchResults.users || searchResults.users.length === 0) &&
            (!searchResults.posts || searchResults.posts.length === 0) && (
              <div className="text-center py-8">
                <p className="text-lg text-gray-500">
                  「{query}」に一致する結果が見つかりませんでした。
                </p>
              </div>
            )}
        </>
      )}
    </div>
  );
}
