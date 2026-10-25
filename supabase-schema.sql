-- Run in Supabase Dashboard -> SQL Editor. Replace vibhavijai03@gmail.com first.
create extension if not exists pgcrypto;
create table if not exists public.products (
 id uuid primary key default gen_random_uuid(),
 title text not null check(char_length(title) between 1 and 100),
 price numeric(10,2) not null check(price>=0),
 gender text not null default 'Women' check(gender in ('Men','Women','Unisex')),
 category text not null, product_code text, sizes text, colors text, description text,
 image_url text not null, image_path text, available boolean not null default true,
 featured boolean not null default false, created_at timestamptz not null default now()
);
alter table public.products enable row level security;
drop policy if exists "Public can view available products" on public.products;
create policy "Public can view available products" on public.products for select to anon,authenticated using(available=true);
drop policy if exists "Admin can view all products" on public.products;
create policy "Admin can view all products" on public.products for select to authenticated using((auth.jwt()->>'email')='vibhavijai03@gmail.com');
drop policy if exists "Admin can add products" on public.products;
create policy "Admin can add products" on public.products for insert to authenticated with check((auth.jwt()->>'email')='vibhavijai03@gmail.com');
drop policy if exists "Admin can edit products" on public.products;
create policy "Admin can edit products" on public.products for update to authenticated using((auth.jwt()->>'email')='vibhavijai03@gmail.com') with check((auth.jwt()->>'email')='vibhavijai03@gmail.com');
drop policy if exists "Admin can delete products" on public.products;
create policy "Admin can delete products" on public.products for delete to authenticated using((auth.jwt()->>'email')='vibhavijai03@gmail.com');
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('product-images','product-images',true,5242880,array['image/jpeg','image/png','image/webp'])
on conflict(id) do update set public=true,file_size_limit=5242880,allowed_mime_types=array['image/jpeg','image/png','image/webp'];
drop policy if exists "Public can view catalogue images" on storage.objects;
create policy "Public can view catalogue images" on storage.objects for select to anon,authenticated using(bucket_id='product-images');
drop policy if exists "Admin can upload catalogue images" on storage.objects;
create policy "Admin can upload catalogue images" on storage.objects for insert to authenticated with check(bucket_id='product-images' and (auth.jwt()->>'email')='vibhavijai03@gmail.com');
drop policy if exists "Admin can update catalogue images" on storage.objects;
create policy "Admin can update catalogue images" on storage.objects for update to authenticated using(bucket_id='product-images' and (auth.jwt()->>'email')='vibhavijai03@gmail.com') with check(bucket_id='product-images' and (auth.jwt()->>'email')='vibhavijai03@gmail.com');
drop policy if exists "Admin can delete catalogue images" on storage.objects;
create policy "Admin can delete catalogue images" on storage.objects for delete to authenticated using(bucket_id='product-images' and (auth.jwt()->>'email')='vibhavijai03@gmail.com');
