"use client";

import { useState } from "react";
import { api } from "@/trpc/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";

export function PostManager() {
  const [postName, setPostName] = useState<string>("");

  // Query to get the latest post
  const latestPost = api.post.getLatest.useQuery();

  // Mutation to create a new post
  const createPost = api.post.create.useMutation({
    onSuccess: () => {
      toast({
        title: "Post created",
        description: "Your post has been created successfully",
      });
      setPostName("");
      // Refetch the latest post after creating a new one
      latestPost.refetch();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Handle form submission
  const handleCreatePost = () => {
    if (postName.trim().length === 0) {
      toast({
        title: "Error",
        description: "Post name cannot be empty",
        variant: "destructive",
      });
      return;
    }

    createPost.mutate({ name: postName });
  };

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Create a New Post</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Input
              type="text"
              value={postName}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setPostName(e.target.value)
              }
              placeholder="Enter post name"
              className="flex-1"
            />
            <Button
              onClick={handleCreatePost}
              disabled={createPost.isPending || postName.trim().length === 0}
            >
              {createPost.isPending ? "Creating..." : "Create Post"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Latest Post</CardTitle>
        </CardHeader>
        <CardContent>
          {latestPost.isLoading ? (
            <div className="text-center py-4">Loading latest post...</div>
          ) : latestPost.data ? (
            <div className="flex flex-col gap-2">
              <p className="text-xl font-medium">{latestPost.data.name}</p>
              <p className="text-sm text-muted-foreground">
                Created: {new Date(latestPost.data.createdAt).toLocaleString()}
              </p>
            </div>
          ) : (
            <div className="text-center py-4">
              No posts found. Create your first post!
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button
            variant="outline"
            onClick={() => latestPost.refetch()}
            disabled={latestPost.isLoading}
            className="ml-auto"
          >
            Refresh
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
