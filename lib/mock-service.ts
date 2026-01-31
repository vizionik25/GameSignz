export interface Assignment {
  id: string;
  title: string;
  description: string;
  author: string;
  authorAvatar?: string;
  xp: number; // XP earned by the author from this post (votes)
  votes: number;
  commentCount: number;
  tags: string[];
  createdAt: string;
}

export interface LevelConfig {
  level: number;
  xpRequired: number;
  rewardName: string;
}

// Mock Data
const MOCK_ASSIGNMENTS: Assignment[] = [
  {
    id: "1",
    title: "Build a To-Do App in React",
    description: "Here is my submission for the React challenge. I used Redux for state management.",
    author: "frontend_wizard",
    xp: 45,
    votes: 9,
    commentCount: 4,
    tags: ["React", "Beginner"],
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: "2",
    title: "Python Data Analysis Script",
    description: "Analyzed the Titanic dataset using Pandas. Notebook attached.",
    author: "data_guru",
    xp: 120,
    votes: 24,
    commentCount: 12,
    tags: ["Python", "Data Science"],
    createdAt: new Date(Date.now() - 172800000).toISOString(),
  },
];

export const MOCK_LEVELS: LevelConfig[] = [
  { level: 1, xpRequired: 0, rewardName: "Novice Badge" },
  { level: 2, xpRequired: 100, rewardName: "Contributor Role" },
  { level: 3, xpRequired: 500, rewardName: "Expert Access" },
  { level: 4, xpRequired: 1000, rewardName: "Merch Discount" },
];

export async function getAssignments(): Promise<Assignment[]> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 500));
  return MOCK_ASSIGNMENTS;
}

export async function getLevelConfig(): Promise<LevelConfig[]> {
  return MOCK_LEVELS;
}
