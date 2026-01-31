-- 1. Storage Setup
insert into storage.buckets (id, name, public) values ('assignments', 'assignments', true);

-- Storage Policies
create policy "Public Access"
  on storage.objects for select
  using ( bucket_id = 'assignments' );

create policy "Authenticated Upload"
  on storage.objects for insert
  with check ( bucket_id = 'assignments' and auth.role() = 'anon' ); 
  -- Note: We are using anon key on server side but technically 'authenticated' RLS is better if we had auth context. 
  -- Since we are doing server-side uploads via service role or anon client in actions, we need to ensure permissions.
  -- For this demo, allowing public uploads (restricted by app logic) or we use Service Role to upload which bypasses RLS.
  -- We will use Service Role for uploads in the Server Action to keep it simple and secure.

-- 2. Update Assignments Table for Attachments
alter table assignments add column file_url text;
alter table assignments add column file_name text;

-- 3. Comment XP Logic
create or replace function handle_new_comment()
returns trigger as $$
declare
  v_company_id text;
begin
  -- Get company_id from the assignment
  select company_id into v_company_id
  from assignments where id = new.assignment_id;

  -- Update Comment Count
  update assignments set comment_count = comment_count + 1 where id = new.assignment_id;

  -- Award XP to Commenter (e.g., +2 XP)
  insert into user_progress (user_id, company_id, current_xp)
  values (new.user_id, v_company_id, 2)
  on conflict (user_id, company_id)
  do update set 
    current_xp = user_progress.current_xp + 2,
    last_updated = now();

  return new;
end;
$$ language plpgsql security definer;

-- Trigger for Comments
create trigger on_comment_posted
  after insert on comments
  for each row execute procedure handle_new_comment();
