-- Update the tag minimum from 5 to 2

create or replace function public.enforce_min_tags_for_non_draft()
returns trigger language plpgsql as $$
declare
  tcount int;
begin
  if (new.status in ('published','unpublished','archived')) then
    select count(*) into tcount
    from public.article_tags at
    where at.article_id = new.id;

    if tcount < 2 then
      raise exception 'Need at least 2 tags to set status to % (have %).', new.status, tcount;
    end if;
  end if;

  return new;
end;
$$;

-- The trigger itself doesn't need to be recreated, just the function
-- But if you want to recreate it anyway:

drop trigger if exists trg_enforce_min_tags on public.articles;

create trigger trg_enforce_min_tags
after insert or update of status on public.articles
for each row
execute function public.enforce_min_tags_for_non_draft();
