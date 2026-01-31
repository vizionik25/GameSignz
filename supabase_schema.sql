-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Companies (Whop Installations)
create table companies (
  id text primary key, -- whop company_id
  tier text default 'free',
  created_at timestamptz default now()
);

-- 2. Level Configuration
create table level_configs (
  id uuid primary key default uuid_generate_v4(),
  company_id text references companies(id) on delete cascade not null,
  level_number int not null,
  xp_required int not null,
  reward_name text,
  created_at timestamptz default now(),
  unique(company_id, level_number)
);

-- 3. Users (Synced from Whop)
create table users (
  id text primary key, -- whop user_id
  username text,
  avatar_url text,
  created_at timestamptz default now()
);

-- 4. User Progress (XP & Levels per company)
create table user_progress (
  id uuid primary key default uuid_generate_v4(),
  user_id text references users(id) on delete cascade not null,
  company_id text references companies(id) on delete cascade not null,
  current_xp int default 0,
  current_level int default 1,
  last_updated timestamptz default now(),
  unique(user_id, company_id)
);

-- 5. Assignments
create table assignments (
  id uuid primary key default uuid_generate_v4(),
  company_id text references companies(id) on delete cascade not null,
  user_id text references users(id) on delete cascade not null,
  title text not null,
  description text,
  status text default 'published', -- published, archived
  vote_count int default 0,
  comment_count int default 0,
  tags text[],
  created_at timestamptz default now()
);

-- 6. Votes
create table votes (
  id uuid primary key default uuid_generate_v4(),
  assignment_id uuid references assignments(id) on delete cascade not null,
  user_id text references users(id) on delete cascade not null,
  vote_type int not null, -- 1 for up, -1 for down
  created_at timestamptz default now(),
  unique(assignment_id, user_id)
);

-- 7. Comments
create table comments (
  id uuid primary key default uuid_generate_v4(),
  assignment_id uuid references assignments(id) on delete cascade not null,
  user_id text references users(id) on delete cascade not null,
  content text not null,
  created_at timestamptz default now()
);

-- RLS Policies (Basic Setup - refine based on needs)
alter table companies enable row level security;
alter table level_configs enable row level security;
alter table users enable row level security;
alter table user_progress enable row level security;
alter table assignments enable row level security;
alter table votes enable row level security;
alter table comments enable row level security;

-- Allow read access to everyone for now (simplify development)
create policy "Allow public read companies" on companies for select using (true);
create policy "Allow public read level_configs" on level_configs for select using (true);
create policy "Allow public read assignments" on assignments for select using (true);
create policy "Allow public read comments" on comments for select using (true);
create policy "Allow public read user_progress" on user_progress for select using (true);

-- Functions for Gamification

-- Function to handle voting and update assignment score + author XP
create or replace function handle_vote(
  p_assignment_id uuid,
  p_user_id text,
  p_vote_type int
) returns void as $$
declare
  v_author_id text;
  v_company_id text;
  v_existing_vote int;
  v_xp_change int;
begin
  -- Get assignment details
  select user_id, company_id into v_author_id, v_company_id
  from assignments where id = p_assignment_id;

  -- Check for existing vote
  select vote_type into v_existing_vote
  from votes where assignment_id = p_assignment_id and user_id = p_user_id;

  if v_existing_vote is null then
    -- New Vote
    insert into votes (assignment_id, user_id, vote_type)
    values (p_assignment_id, p_user_id, p_vote_type);
    
    update assignments set vote_count = vote_count + p_vote_type where id = p_assignment_id;
    
    -- XP Logic: Upvote = +5, Downvote = -2
    v_xp_change := case when p_vote_type = 1 then 5 else -2 end;
    
  elsif v_existing_vote != p_vote_type then
    -- Change Vote (e.g., Up to Down)
    update votes set vote_type = p_vote_type 
    where assignment_id = p_assignment_id and user_id = p_user_id;
    
    update assignments set vote_count = vote_count + (p_vote_type * 2) where id = p_assignment_id;
    
    -- XP Logic: Up to Down (-5 - 2 = -7), Down to Up (+2 + 5 = +7)
    v_xp_change := case when p_vote_type = 1 then 7 else -7 end;
  else
    -- Same vote (toggle off? currently ignoring)
    return;
  end if;

  -- Update Author XP
  insert into user_progress (user_id, company_id, current_xp)
  values (v_author_id, v_company_id, greatest(0, v_xp_change))
  on conflict (user_id, company_id)
  do update set current_xp = greatest(0, user_progress.current_xp + v_xp_change), last_updated = now();

end;
$$ language plpgsql security definer;
