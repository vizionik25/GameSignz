"use client";

import { useState, useTransition } from "react";
import { postComment } from "./CommentActions";
import { MessageSquare, Send } from "lucide-react";
import { Comment } from "@/lib/assignment-service";

export default function CommentSection({ 
  assignmentId, 
  initialComments 
}: { 
  assignmentId: string, 
  initialComments: Comment[] 
}) {
  const [content, setContent] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    startTransition(async () => {
      await postComment(assignmentId, content);
      setContent("");
    });
  };

  return (
    <div className="mt-8">
      <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-gray-100 flex items-center gap-2">
        <MessageSquare size={20} />
        Discussion ({initialComments.length})
      </h3>

      {/* Comment Form */}
      <form onSubmit={handleSubmit} className="mb-8 relative">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Share your thoughts..."
          className="w-full p-4 pr-12 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none resize-none shadow-sm min-h-[100px]"
          required
        />
        <button
          type="submit"
          disabled={isPending || !content.trim()}
          className="absolute right-3 bottom-3 p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
        >
          {isPending ? (
            <span className="block w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Send size={18} />
          )}
        </button>
      </form>

      {/* Comment List */}
      <div className="space-y-4">
        {initialComments.length === 0 ? (
          <p className="text-center text-gray-500 py-8 italic">No comments yet. Be the first to give feedback!</p>
        ) : (
          initialComments.map((comment) => (
            <div key={comment.id} className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-green-400 to-blue-500" />
                <span className="font-medium text-sm text-gray-900 dark:text-gray-100">
                  @{comment.users?.username || "Unknown"}
                </span>
                <span className="text-xs text-gray-400">
                  • {new Date(comment.created_at).toLocaleDateString()}
                </span>
              </div>
              <p className="text-gray-700 dark:text-gray-300 pl-8 text-sm leading-relaxed">
                {comment.content}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
