-- Aqua Flow System security baseline for Supabase.
-- Apply only after reviewing the farm_id backfill for existing records.

create extension if not exists pgcrypto;

create table if not exists public.farms (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.farm_members (
  farm_id uuid not null references public.farms(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('admin', 'user')),
  created_at timestamptz not null default now(),
  primary key (farm_id, user_id)
);

create index if not exists idx_farm_members_user on public.farm_members (user_id, farm_id);

-- Tenant ownership is explicit on every application table. Backfill before enabling writes.
alter table public.farm_users add column if not exists farm_id uuid references public.farms(id);
alter table public.ponds add column if not exists farm_id uuid references public.farms(id);
alter table public.fish_cycles add column if not exists farm_id uuid references public.farms(id);
alter table public.cycle_pond_allocations add column if not exists farm_id uuid references public.farms(id);
alter table public.inventory_items add column if not exists farm_id uuid references public.farms(id);
alter table public.purchase_orders add column if not exists farm_id uuid references public.farms(id);
alter table public.purchase_order_lines add column if not exists farm_id uuid references public.farms(id);
alter table public.farm_expenses add column if not exists farm_id uuid references public.farms(id);
alter table public.feed_logs add column if not exists farm_id uuid references public.farms(id);
alter table public.harvest_sales add column if not exists farm_id uuid references public.farms(id);
alter table public.audit_events add column if not exists farm_id uuid references public.farms(id);

create index if not exists idx_ponds_farm on public.ponds (farm_id, updated_at desc);
create index if not exists idx_cycles_farm on public.fish_cycles (farm_id, updated_at desc);
create index if not exists idx_inventory_farm on public.inventory_items (farm_id, updated_at desc);
create index if not exists idx_purchases_farm on public.purchase_orders (farm_id, ordered_at desc);
create index if not exists idx_expenses_farm on public.farm_expenses (farm_id, expense_date desc);
create index if not exists idx_feed_farm on public.feed_logs (farm_id, fed_at desc);
create index if not exists idx_sales_farm on public.harvest_sales (farm_id, sold_at desc);
create index if not exists idx_audit_farm on public.audit_events (farm_id, created_at desc);

alter table public.farms enable row level security;
alter table public.farm_members enable row level security;

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'farm_users', 'ponds', 'fish_cycles', 'cycle_pond_allocations',
    'inventory_items', 'purchase_orders', 'purchase_order_lines',
    'farm_expenses', 'feed_logs', 'harvest_sales', 'audit_events'
  ] loop
    execute format('grant select, insert on public.%I to authenticated', table_name);
    execute format('alter table public.%I enable row level security', table_name);
  end loop;
end $$;

create policy "members can view their farms" on public.farms
  for select to authenticated
  using (exists (select 1 from public.farm_members m where m.farm_id = farms.id and m.user_id = (select auth.uid())));

create policy "members can view their membership" on public.farm_members
  for select to authenticated
  using (user_id = (select auth.uid()));

-- These policies intentionally require both authentication and tenant membership.
-- Admin-only writes should go through the server API, not direct browser table writes.
do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'farm_users', 'ponds', 'fish_cycles', 'cycle_pond_allocations',
    'inventory_items', 'purchase_orders', 'purchase_order_lines',
    'farm_expenses', 'feed_logs', 'harvest_sales', 'audit_events'
  ] loop
    execute format('drop policy if exists %I on public.%I', 'tenant members can select ' || table_name, table_name);
    execute format('drop policy if exists %I on public.%I', 'tenant members can insert ' || table_name, table_name);
    execute format(
      'create policy %I on public.%I for select to authenticated using (exists (select 1 from public.farm_members m where m.farm_id = %I.farm_id and m.user_id = (select auth.uid())))',
      'tenant members can select ' || table_name, table_name, table_name
    );
    execute format(
      'create policy %I on public.%I for insert to authenticated with check (exists (select 1 from public.farm_members m where m.farm_id = %I.farm_id and m.user_id = (select auth.uid())))',
      'tenant members can insert ' || table_name, table_name, table_name
    );
  end loop;
end $$;

revoke all on public.farm_members from anon;
revoke all on public.farms from anon;
grant select on public.farms, public.farm_members to authenticated;
