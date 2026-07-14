import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const possibleRepositoryRoots = [
  process.cwd(),
  resolve(process.cwd(), '..'),
  resolve(process.cwd(), '../..'),
];

async function readMigration(file: string) {
  for (const root of possibleRepositoryRoots) {
    try {
      return await readFile(resolve(root, 'supabase/migrations', file), 'utf8');
    } catch {
      // Try the next possible pnpm/Vitest working directory.
    }
  }
  throw new Error(`Unable to locate migration ${file}.`);
}

describe('Supabase migration contract', () => {
  it('defines every required commerce table and enables RLS', async () => {
    const schema = await readMigration('20260714130000_create_commerce_schema.sql');
    const security = await readMigration('20260714131000_add_security_automation_and_rls.sql');

    [
      'profiles',
      'categories',
      'products',
      'product_images',
      'product_variants',
      'favorites',
      'cart_items',
      'orders',
      'order_items',
    ].forEach((table) => {
      expect(schema).toMatch(new RegExp(`create table public\\.${table}`));
      expect(security).toContain(`alter table public.${table} enable row level security;`);
    });
  });

  it('keeps price and stock validation in the database', async () => {
    const schema = await readMigration('20260714130000_create_commerce_schema.sql');

    expect(schema).toContain('check (price >= 0)');
    expect(schema).toContain('check (stock >= 0)');
    expect(schema).toContain('cart_items_unique_logical_line');
    expect(schema).toContain("check (role in ('customer', 'admin'))");
    expect(schema).toContain(
      "check (status in ('pending', 'processing', 'shipped', 'delivered', 'cancelled'))",
    );
  });

  it('uses authenticated server-side values for order creation', async () => {
    const security = await readMigration('20260714131000_add_security_automation_and_rls.sql');

    expect(security).toContain('v_user_id uuid := auth.uid();');
    expect(security).toContain('security definer');
    expect(security).toContain('select * into v_product from public.products');
    expect(security).toContain("raise exception 'Insufficient stock");
    expect(security).toContain('validate_cart_item_variant');
    expect(security).toContain('enforce_order_immutable_fields');
    expect(security).not.toContain('p_user_id');
    expect(security).not.toContain('p_total');
    expect(security).not.toContain('p_unit_price');
  });

  it('contains storage policies for admin product assets and user-owned avatars', async () => {
    const storage = await readMigration('20260714132000_add_storage_policies.sql');

    expect(storage).toContain("'product-images'");
    expect(storage).toContain("'product-models'");
    expect(storage).toContain("'avatars'");
    expect(storage).toContain('public.is_admin()');
    expect(storage).toContain('(storage.foldername(name))[1] = auth.uid()::text');
  });
});
