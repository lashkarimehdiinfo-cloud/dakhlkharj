create or replace function public.home_peek(p_home uuid, p_code text, p_since bigint)
returns json language sql security definer set search_path = public as $$
  select json_build_object('rev', h.rev, 'items', coalesce((select json_agg(x) from (
      select 'shop' as k, coalesce(e->>'name','') || coalesce(' ' || nullif(e->>'qty',''),'') as n, e->>'ub' as ub, e->>'ubn' as ubn, (e->>'_u')::bigint as u
        from jsonb_array_elements(coalesce(h.state->'shop','[]'::jsonb)) e
        where coalesce((e->>'_u')::bigint,0) > p_since and coalesce((e->>'done')::boolean,false) = false
      union all
      select 'todo', e->>'text', e->>'ub', e->>'ubn', (e->>'_u')::bigint
        from jsonb_array_elements(coalesce(h.state->'todo','[]'::jsonb)) e
        where coalesce((e->>'_u')::bigint,0) > p_since
      union all
      select 'tx', coalesce(nullif(e->>'note',''), e->>'cat'), e->>'ub', e->>'ubn', (e->>'_u')::bigint
        from jsonb_array_elements(coalesce(h.state->'tx','[]'::jsonb)) e
        where coalesce((e->>'_u')::bigint,0) > p_since
    ) x), '[]'::json))
  from homes h where h.id = p_home and h.code = upper(p_code);
$$;
grant execute on function public.home_peek(uuid, text, bigint) to anon, authenticated;
