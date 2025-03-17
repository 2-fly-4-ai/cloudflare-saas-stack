"use client";

import { useState } from "react";
import { api } from "@/trpc/react";
import { Button } from "@/components/ui/button";

export function TrpcTest() {
  const [text, setText] = useState<string>("");
  const hello = api.post.hello.useQuery({ text: text || "world" });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-4 items-center">
        <p className="text-2xl">
          {hello.data ? hello.data.greeting : "Loading tRPC query..."}
        </p>
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded dark:bg-gray-800 dark:border-gray-700"
          placeholder="Enter a name"
        />
      </div>
      <div>
        <Button onClick={() => hello.refetch()} disabled={hello.isLoading}>
          {hello.isLoading ? "Loading..." : "Refetch"}
        </Button>
      </div>
    </div>
  );
}
