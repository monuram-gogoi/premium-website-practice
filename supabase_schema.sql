-- ============================================================================
-- SUPABASE SQL SCHEMA & ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================
-- Run this schema script in your Supabase SQL Editor to provision the database.

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. PROFILES TABLE (linked to auth.users)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  role text not null check (role in ('admin', 'customer')) default 'customer',
  full_name text,
  phone text,
  address text,
  city text,
  state text,
  zip text,
  country text default 'India',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. PRODUCTS TABLE
create table public.products (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  description text,
  price numeric(12, 2) not null check (price >= 0),
  compare_at_price numeric(12, 2) check (compare_at_price >= 0),
  image_url text,
  stock integer not null default 0 check (stock >= 0),
  category text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. COUPONS TABLE
create table public.coupons (
  id uuid default uuid_generate_v4() primary key,
  code text not null unique,
  discount_type text not null check (discount_type in ('percentage', 'fixed')),
  discount_value numeric(12, 2) not null check (discount_value > 0),
  min_purchase numeric(12, 2) default 0.00 check (min_purchase >= 0),
  expiry_date date not null,
  usage_limit integer not null default 100 check (usage_limit > 0),
  usage_count integer not null default 0 check (usage_count >= 0)
);

-- 4. SHIPPING RULES TABLE
create table public.shipping_rules (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  rate numeric(12, 2) not null check (rate >= 0),
  free_delivery_threshold numeric(12, 2) default 0.00 check (free_delivery_threshold >= 0)
);

-- 5. TAXES TABLE
create table public.taxes (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  rate numeric(5, 2) not null check (rate >= 0) -- e.g. 18.00 for 18% GST
);

-- 6. ORDERS TABLE
create table public.orders (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete set null,
  status text not null check (status in ('pending', 'paid', 'shipped', 'delivered', 'cancelled')) default 'pending',
  total_amount numeric(12, 2) not null check (total_amount >= 0),
  subtotal numeric(12, 2) not null check (subtotal >= 0),
  tax_amount numeric(12, 2) not null check (tax_amount >= 0),
  shipping_amount numeric(12, 2) not null check (shipping_amount >= 0),
  discount_amount numeric(12, 2) not null check (discount_amount >= 0) default 0.00,
  coupon_code text,
  shipping_address jsonb not null,
  payment_method text not null check (payment_method in ('razorpay', 'cod')),
  payment_id text,
  razorpay_order_id text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 7. ORDER ITEMS TABLE
create table public.order_items (
  id uuid default uuid_generate_v4() primary key,
  order_id uuid references public.orders(id) on delete cascade not null,
  product_id uuid references public.products(id) on delete set null,
  product_name text not null,
  quantity integer not null check (quantity > 0),
  price numeric(12, 2) not null check (price >= 0),
  image_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 8. TRANSACTIONS TABLE
create table public.transactions (
  id uuid default uuid_generate_v4() primary key,
  order_id uuid references public.orders(id) on delete cascade not null,
  payment_id text not null,
  signature text,
  amount numeric(12, 2) not null check (amount >= 0),
  status text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);


-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable Row Level Security (RLS) on all tables
alter table public.profiles enable row level security;
alter table public.products enable row level security;
alter table public.coupons enable row level security;
alter table public.shipping_rules enable row level security;
alter table public.taxes enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.transactions enable row level security;

-- Helper function to check if the current user is an Admin
create or replace function public.is_admin()
returns boolean security definer as $$
begin
  return exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
end;
$$ language plpgsql;


-- 1. Profiles Policies
create policy "Users can view own profile" on public.profiles
  for select using (auth.uid() = id or public.is_admin());

create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id or public.is_admin());

create policy "Admins can manage all profiles" on public.profiles
  for all using (public.is_admin());


-- 2. Products Policies
create policy "Anyone can view products" on public.products
  for select using (true);

create policy "Admins can manage products" on public.products
  for all using (public.is_admin());


-- 3. Coupons Policies
create policy "Anyone can view coupons" on public.coupons
  for select using (true); -- Customers need to validate coupon codes

create policy "Admins can manage coupons" on public.coupons
  for all using (public.is_admin());


-- 4. Shipping Rules Policies
create policy "Anyone can view shipping rules" on public.shipping_rules
  for select using (true);

create policy "Admins can manage shipping rules" on public.shipping_rules
  for all using (public.is_admin());


-- 5. Taxes Policies
create policy "Anyone can view taxes" on public.taxes
  for select using (true);

create policy "Admins can manage taxes" on public.taxes
  for all using (public.is_admin());


-- 6. Orders Policies
create policy "Users can view own orders" on public.orders
  for select using (auth.uid() = user_id or public.is_admin());

create policy "Users can insert own orders" on public.orders
  for insert with check (auth.uid() = user_id or public.is_admin());

create policy "Admins can manage all orders" on public.orders
  for all using (public.is_admin());


-- 7. Order Items Policies
create policy "Users can view own order items" on public.order_items
  for select using (
    exists (
      select 1 from public.orders
      where orders.id = order_items.order_id
      and (orders.user_id = auth.uid() or public.is_admin())
    )
  );

create policy "Users can insert own order items" on public.order_items
  for insert with check (
    exists (
      select 1 from public.orders
      where orders.id = order_items.order_id
      and (orders.user_id = auth.uid() or public.is_admin())
    )
  );

create policy "Admins can manage all order items" on public.order_items
  for all using (public.is_admin());


-- 8. Transactions Policies
create policy "Users can view own transactions" on public.transactions
  for select using (
    exists (
      select 1 from public.orders
      where orders.id = transactions.order_id
      and (orders.user_id = auth.uid() or public.is_admin())
    )
  );

create policy "Admins can manage all transactions" on public.transactions
  for all using (public.is_admin());


-- ============================================================================
-- AUTO-PROFILE CREATION ON SIGN-UP TRIGGER
-- ============================================================================

-- Create a trigger that automatically adds a row in public.profiles when a new user signs up
create or replace function public.handle_new_user()
returns trigger security definer as $$
declare
  is_first_user boolean;
  default_role text;
begin
  -- If this is the first user in the database, make them an Admin, otherwise customer
  select not exists (select 1 from public.profiles) into is_first_user;
  if is_first_user then
    default_role := 'admin';
  else
    default_role := 'customer';
  end if;

  insert into public.profiles (id, email, role, full_name)
  values (
    new.id,
    new.email,
    default_role,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$ language plpgsql;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
