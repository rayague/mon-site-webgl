create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique,
  full_name text,
  bio text,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc', now())
);

create table if not exists public.annonces (
  id bigint generated always as identity primary key,
  owner_id uuid references auth.users(id) on delete cascade,
  titre text not null,
  categorie text not null,
  lieu text,
  date_event text,
  statut text,
  extrait text,
  recit text,
  gravite integer check (gravite between 1 and 3),
  image text,
  featured boolean default false,
  urgent boolean default false,
  nouveau boolean default true,
  date_pub date default current_date,
  created_at timestamp with time zone default timezone('utc', now())
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id)
  values (new.id)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.annonces enable row level security;

grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on public.profiles to authenticated;
grant select on public.profiles to anon;
grant select, insert, update, delete on public.annonces to authenticated;
grant select on public.annonces to anon;
grant usage, select on sequence public.annonces_id_seq to authenticated;

drop policy if exists "Profils publics en lecture" on public.profiles;
create policy "Profils publics en lecture"
on public.profiles for select
using (true);

drop policy if exists "Modification du profil par son propriétaire" on public.profiles;
create policy "Modification du profil par son propriétaire"
on public.profiles for update
using (auth.uid() = id)
with check (auth.uid() = id);

drop policy if exists "Création du profil par son propriétaire" on public.profiles;
create policy "Création du profil par son propriétaire"
on public.profiles for insert
to authenticated
with check (auth.uid() = id);

drop policy if exists "Annonces publiques en lecture" on public.annonces;
create policy "Annonces publiques en lecture"
on public.annonces for select
using (true);

drop policy if exists "Publication par utilisateur connecté" on public.annonces;
create policy "Publication par utilisateur connecté"
on public.annonces for insert
to authenticated
with check (auth.uid() = owner_id);

drop policy if exists "Modification par le propriétaire" on public.annonces;
create policy "Modification par le propriétaire"
on public.annonces for update
using (auth.uid() = owner_id)
with check (auth.uid() = owner_id);

drop policy if exists "Suppression par le propriétaire" on public.annonces;
create policy "Suppression par le propriétaire"
on public.annonces for delete
using (auth.uid() = owner_id);
