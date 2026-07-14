insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('product-images', 'product-images', true, 5242880, array['image/jpeg', 'image/png', 'image/webp']),
  ('product-models', 'product-models', true, 20971520, array['model/gltf-binary', 'model/gltf+json', 'application/octet-stream']),
  ('avatars', 'avatars', false, 2097152, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "product_images_public_read"
on storage.objects for select to public
using (bucket_id = 'product-images');

create policy "product_images_admin_insert"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'product-images'
  and name like 'products/%'
  and public.is_admin()
  and coalesce(metadata ->> 'mimetype', '') in ('image/jpeg', 'image/png', 'image/webp')
);

create policy "product_images_admin_update"
on storage.objects for update to authenticated
using (bucket_id = 'product-images' and public.is_admin())
with check (
  bucket_id = 'product-images'
  and name like 'products/%'
  and public.is_admin()
  and coalesce(metadata ->> 'mimetype', '') in ('image/jpeg', 'image/png', 'image/webp')
);

create policy "product_images_admin_delete"
on storage.objects for delete to authenticated
using (bucket_id = 'product-images' and public.is_admin());

create policy "product_models_public_read"
on storage.objects for select to public
using (bucket_id = 'product-models');

create policy "product_models_admin_insert"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'product-models'
  and name like 'models/%'
  and public.is_admin()
  and coalesce(metadata ->> 'mimetype', '') in ('model/gltf-binary', 'model/gltf+json', 'application/octet-stream')
);

create policy "product_models_admin_update"
on storage.objects for update to authenticated
using (bucket_id = 'product-models' and public.is_admin())
with check (
  bucket_id = 'product-models'
  and name like 'models/%'
  and public.is_admin()
  and coalesce(metadata ->> 'mimetype', '') in ('model/gltf-binary', 'model/gltf+json', 'application/octet-stream')
);

create policy "product_models_admin_delete"
on storage.objects for delete to authenticated
using (bucket_id = 'product-models' and public.is_admin());

create policy "avatars_read_own"
on storage.objects for select to authenticated
using (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "avatars_insert_own"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = auth.uid()::text
  and coalesce(metadata ->> 'mimetype', '') in ('image/jpeg', 'image/png', 'image/webp')
);

create policy "avatars_update_own"
on storage.objects for update to authenticated
using (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = auth.uid()::text
)
with check (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = auth.uid()::text
  and coalesce(metadata ->> 'mimetype', '') in ('image/jpeg', 'image/png', 'image/webp')
);

create policy "avatars_delete_own"
on storage.objects for delete to authenticated
using (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = auth.uid()::text
);
