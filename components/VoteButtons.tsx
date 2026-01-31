"use client";

import { useState, useTransition } from "react";
import { ArrowBigUp, ArrowBigDown } from "lucide-react";
import { castVote } from "./VoteActions";
import { clsx } from "clsx";

export default function VoteButtons({ 
  assignmentId, 
  initialVotes,
  size = "md"
}: { 
  assignmentId: string, 
  initialVotes: number,
  size?: "md" | "lg"
}) {
  const [votes, setVotes] = useState(initialVotes);
  const [isPending, startTransition] = useTransition();

  const handleVote = (type: 1 | -1) => {
    if (isPending) return;
    
    // Optimistic update
    setVotes(prev => prev + type);

    startTransition(async () => {
      try {
        await castVote(assignmentId, type);
      } catch (e) {
        // Revert on error
        setVotes(prev => prev - type);
        console.error("Vote failed", e);
      }
    });
  };

  const iconSize = size === "lg" ? 32 : 28;

  return (
    <div className="flex flex-col items-center gap-1">
      <button 
        onClick={() => handleVote(1)}
        disabled={isPending}
        className={clsx(
          "p-1 rounded transition-colors",
          "hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-orange-500",
          "text-gray-400 disabled:opacity-50"
        )}
      >
        <ArrowBigUp size={iconSize} />
      </button>
      <span className={clsx(
        "font-bold",
        size === "lg" ? "text-2xl" : "text-lg"
      )}>
        {votes}
      </span>
      <button 
        onClick={() => handleVote(-1)}
        disabled={isPending}
        className={clsx(
          "p-1 rounded transition-colors",
          "hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-blue-500",
          "text-gray-400 disabled:opacity-50"
        )}
      >
        <ArrowBigDown size={iconSize} />
      </button>
    </div>
  );
}
