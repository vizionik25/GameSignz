-- Function to calculate and update the level based on XP
create or replace function update_user_level()
returns trigger as $$
declare
  v_new_level int;
begin
  -- Find the highest level where xp_required is less than or equal to current_xp
  select level_number into v_new_level
  from level_configs
  where company_id = new.company_id and xp_required <= new.current_xp
  order by level_number desc
  limit 1;

  -- Default to level 1 if no config found (shouldn't happen if level 1 is 0 XP)
  if v_new_level is null then
    v_new_level := 1;
  end if;

  -- Update the level in the record
  new.current_level := v_new_level;
  
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to run before update on user_progress
create trigger on_xp_change
  before insert or update of current_xp on user_progress
  for each row execute procedure update_user_level();
