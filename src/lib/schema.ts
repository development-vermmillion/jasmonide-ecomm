export const SCHEMA = `
create table if not exists settings (key text primary key, value text);
create table if not exists admins (
  id integer primary key autoincrement, name text not null, email text not null unique,
  password_hash text not null, role text not null default 'staff', created_at text default (datetime('now'))
);
create table if not exists categories (
  id integer primary key autoincrement, name text not null, slug text not null unique,
  description text default '', image text default '', sort integer default 0
);
create table if not exists products (
  id integer primary key autoincrement,
  type text not null default 'simple',            -- simple | variable | combo | digital
  name text not null, slug text not null unique,
  short_desc text default '', spec_line text default '', description text default '',
  category_id integer references categories(id) on delete set null,
  tags text default '', images text default '[]',
  price real not null default 0, compare_at real,
  sale_price real, sale_start text, sale_end text,
  sku text default '', stock integer default 0, low_stock integer default 5, track_stock integer default 1,
  status text not null default 'published',       -- published | draft
  featured integer default 0, badge text default '', digital_url text default '',
  weight_g integer default 0, hsn text default '', seo_title text default '', seo_desc text default '',
  created_at text default (datetime('now')), updated_at text default (datetime('now'))
);
create table if not exists variants (
  id integer primary key autoincrement, product_id integer not null references products(id) on delete cascade,
  name text not null, sku text default '', price real not null default 0,
  sale_price real, stock integer default 0, image text default ''
);
create table if not exists combo_items (
  id integer primary key autoincrement, combo_id integer not null references products(id) on delete cascade,
  product_id integer not null references products(id) on delete cascade,
  variant_id integer references variants(id) on delete set null, qty integer not null default 1
);
create table if not exists coupons (
  id integer primary key autoincrement, code text not null unique, type text not null default 'percent',
  value real not null default 0, min_order real default 0, max_uses integer default 0, used integer default 0,
  expires_at text, active integer default 1, created_at text default (datetime('now'))
);
create table if not exists customers (
  id integer primary key autoincrement, name text not null, email text default '', phone text default '',
  password_hash text default '', address text default '', city text default '', state text default '', pincode text default '',
  created_at text default (datetime('now'))
);
create table if not exists orders (
  id integer primary key autoincrement, number text not null unique, customer_id integer references customers(id) on delete set null,
  name text, email text, phone text, address text, city text, state text, pincode text,
  subtotal real, discount real default 0, shipping real default 0, tax real default 0, total real,
  coupon_code text default '', payment_method text default 'cod', payment_status text default 'pending',
  status text default 'pending', tracking text default '', notes text default '', created_at text default (datetime('now')),
  delivered_at text, bulk_discount real default 0, bulk_label text default '',
  payment_ref text default '', paid_at text, shipped_at text, gateway_order_id text default '', gateway_payment_id text default ''
);
create table if not exists order_events (
  id integer primary key autoincrement, order_id integer not null references orders(id) on delete cascade,
  label text not null, note text default '', created_at text default (datetime('now'))
);
create table if not exists order_items (
  id integer primary key autoincrement, order_id integer not null references orders(id) on delete cascade,
  product_id integer, variant_id integer, name text, variant_name text default '', sku text default '',
  price real, qty integer, image text default '', type text default 'simple'
);
create table if not exists stock_log (
  id integer primary key autoincrement, product_id integer, variant_id integer, delta integer, balance integer,
  reason text, ref text default '', created_at text default (datetime('now'))
);
create table if not exists reels (
  id integer primary key autoincrement, title text default '', url text default '', thumb text default '', video_url text default '',
  product_id integer references products(id) on delete set null, show_home integer default 1,
  status text default 'active', sort integer default 0, created_at text default (datetime('now'))
);
create table if not exists reviews (
  id integer primary key autoincrement, product_id integer not null references products(id) on delete cascade,
  customer_id integer, name text not null, rating integer not null, title text default '', body text default '',
  status text default 'pending', verified integer default 0, created_at text default (datetime('now'))
);
create table if not exists returns (
  id integer primary key autoincrement, order_id integer not null references orders(id) on delete cascade,
  reason text default '', details text default '', status text default 'requested', refund_amount real default 0,
  admin_note text default '', created_at text default (datetime('now'))
);
create table if not exists subscribers (id integer primary key autoincrement, email text not null unique, created_at text default (datetime('now')));
create table if not exists enquiries (
  id integer primary key autoincrement, name text, email text default '', phone text default '', message text,
  status text default 'new', created_at text default (datetime('now'))
);
create table if not exists notify_requests (
  id integer primary key autoincrement, product_id integer, variant_id integer, email text default '', phone text default '',
  created_at text default (datetime('now'))
);
create table if not exists blog_posts (
  id integer primary key autoincrement, title text not null, slug text not null unique, excerpt text default '', content text default '',
  cover text default '', tags text default '', author text default '', status text default 'draft',
  seo_title text default '', seo_desc text default '', faq_json text default '',
  created_at text default (datetime('now')), updated_at text default (datetime('now'))
);
create table if not exists faqs (
  id integer primary key autoincrement, question text not null, answer text not null, sort integer default 0, active integer default 1
);
create table if not exists bulk_rules (
  id integer primary key autoincrement, name text default '', scope text default 'all', target_id integer,
  basis text default 'qty', min_qty integer default 0, max_qty integer default 0, min_value real default 0,
  discount_type text default 'percent', value real default 0, active integer default 1,
  starts_at text default '', ends_at text default '', created_at text default (datetime('now'))
);
create table if not exists assistant_chats (
  id integer primary key autoincrement, session text default '', question text not null, answer text default '',
  source text default '', answered integer default 1, rating integer default 0, handled integer default 0, created_at text default (datetime('now'))
);
create table if not exists assistant_taught (
  id integer primary key autoincrement, question text not null, answer text not null, active integer default 1, hits integer default 0,
  created_at text default (datetime('now'))
);
create table if not exists otp_codes (
  id integer primary key autoincrement, phone text not null, code_hash text not null, expires_at text not null,
  attempts integer default 0, created_at text default (datetime('now'))
);
create table if not exists visits (
  id integer primary key autoincrement, day text not null, source text not null, medium text default '', campaign text default '', n integer default 0,
  unique(day, source, medium, campaign)
);
create table if not exists abandoned_carts (
  id integer primary key autoincrement, session text not null unique, name text default '', email text default '', phone text default '',
  items text default '[]', total real default 0, source text default '', recovered integer default 0, contacted integer default 0,
  created_at text default (datetime('now')), updated_at text default (datetime('now'))
);
create table if not exists alerts_sent (id integer primary key autoincrement, key text not null, day text not null, unique(key, day));
create table if not exists password_resets (
  id integer primary key autoincrement, customer_id integer not null, token_hash text not null, expires_at text not null, used integer default 0, created_at text default (datetime('now'))
);
create table if not exists rate_hits (id integer primary key autoincrement, key text not null, ts integer not null);
create index if not exists idx_rate_key on rate_hits(key, ts);
create table if not exists gift_cards (
  id integer primary key autoincrement, code text not null unique, initial real not null default 0, balance real not null default 0,
  to_name text default '', to_email text default '', note text default '', active integer default 1, expires_at text, created_at text default (datetime('now'))
);
create table if not exists wallet_log (
  id integer primary key autoincrement, customer_id integer, kind text not null, amount real not null, ref text default '', note text default '', created_at text default (datetime('now'))
);
create table if not exists subscriptions (
  id integer primary key autoincrement, customer_id integer not null, product_id integer not null, variant_id integer, qty integer default 1,
  every_days integer not null default 30, next_date text not null, active integer default 1, last_reminded text, created_at text default (datetime('now'))
);
create table if not exists events (
  id integer primary key autoincrement, day text not null, ts integer not null, type text not null, session text default '', path text default '',
  product_id integer, category_id integer, label text default '', x real, y real, ph real, device text default 'desktop', val real
);
create index if not exists idx_events_day_type on events(day, type);
create index if not exists idx_events_path on events(path, type);
create index if not exists idx_events_prod on events(product_id, type);
create index if not exists idx_products_cat on products(category_id);
create index if not exists idx_orders_created on orders(created_at);
create index if not exists idx_items_order on order_items(order_id);
`;
