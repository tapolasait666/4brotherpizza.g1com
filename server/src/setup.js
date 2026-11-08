import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import bcrypt from 'bcryptjs';
import { query, waitForDatabase, pool } from './db.js';
import { config } from './config.js';

const here = path.dirname(fileURLToPath(import.meta.url));

const IMG = {
  crown:
    'https://images.unsplash.com/photo-1571407970349-bc81e7e96d47?auto=format&fit=crop&w=900&q=80',
  tikka:
    'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=900&q=80',
  bbq:
    'https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?auto=format&fit=crop&w=900&q=80',
  supreme:
    'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=900&q=80',
  pepperoni:
    'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?auto=format&fit=crop&w=900&q=80',
  zinger:
    'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=900&q=80',
  combo:
    'https://images.unsplash.com/photo-1571091718767-18b5b1457add?auto=format&fit=crop&w=900&q=80',
  smashed:
    'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=900&q=80',
  platter:
    'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=900&q=80',
  fries:
    'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=900&q=80',
  steak:
    'https://images.unsplash.com/photo-1600891964092-4316c288032e?auto=format&fit=crop&w=900&q=80',
  garlic:
    'https://images.unsplash.com/photo-1573140247632-f8fd74997d5c?auto=format&fit=crop&w=900&q=80',
  wings:
    'https://images.unsplash.com/photo-1608039755401-742074f0548d?auto=format&fit=crop&w=900&q=80',
  family:
    'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=900&q=80',
  drink:
    'https://images.unsplash.com/photo-1581636625402-29b2a704ef13?auto=format&fit=crop&w=900&q=80',
  lime:
    'https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&w=900&q=80',
};

const CATEGORIES = [
  {
    name: 'Crown Crust Pizzas',
    slug: 'crown-crust-pizzas',
    description: 'Hand-kneaded signature crusts with cheese-stuffed crown pockets.',
    image: IMG.crown,
    sort: 1,
  },
  {
    name: 'Burgers & Zingers',
    slug: 'burgers-zingers',
    description: 'Crispy fried chicken, smashed patties and toasted sesame buns.',
    image: IMG.zinger,
    sort: 2,
  },
  {
    name: 'Platters & Sides',
    slug: 'platters-sides',
    description: 'Sharing boxes, loaded fries, wings and garlic bread.',
    image: IMG.platter,
    sort: 3,
  },
  {
    name: 'Deals & Combos',
    slug: 'deals-combos',
    description: 'Walk-in storefront deals and family feasts.',
    image: IMG.family,
    sort: 4,
  },
  {
    name: 'Drinks',
    slug: 'drinks',
    description: 'Chilled sodas and fresh refreshers.',
    image: IMG.drink,
    sort: 5,
  },
];

const PRODUCTS = [
  {
    name: 'Famous Royal Crown Crust',
    slug: 'royal-crown-crust',
    category: 'crown-crust-pizzas',
    price: 1450,
    compare: null,
    description:
      'Golden pull-apart cheesy pockets baked around succulent smoked chicken chunks, jalapenos, mushrooms, black olives and premium mozzarella.',
    image: IMG.crown,
    featured: true,
    tags: ["Chef's Signature", 'Most Popular'],
    prep: 25,
  },
  {
    name: 'Chicken Tikka & Fajita Sicilian',
    slug: 'chicken-tikka-fajita-sicilian',
    category: 'crown-crust-pizzas',
    price: 1350,
    description:
      'Traditional spicy chargrilled tikka breast fillet with onions, fresh capsicum, chili flakes and double mozzarella layers.',
    image: IMG.tikka,
    featured: true,
    tags: ['Local Favorite', 'Medium Spice'],
    prep: 25,
  },
  {
    name: 'Creamy White Sauce & BBQ Feast',
    slug: 'creamy-white-sauce-bbq-feast',
    category: 'crown-crust-pizzas',
    price: 1400,
    description:
      'Rich Alfredo cream drizzle combined with smoky barbecue glazed tender chicken cuts, bell peppers, oregano and parmesan herbs.',
    image: IMG.bbq,
    featured: true,
    tags: ['Gourmet Choice', 'Extra Cheesy'],
    prep: 25,
  },
  {
    name: '4B Special Chicken Supreme',
    slug: '4b-special-chicken-supreme',
    category: 'crown-crust-pizzas',
    price: 1300,
    description:
      'Loaded chicken supreme with mushrooms, sweetcorn, onions and a triple cheese blend on our signature hand-stretched base.',
    image: IMG.supreme,
    tags: ['Crowd Favourite'],
    prep: 25,
  },
  {
    name: 'Beef Pepperoni Classic',
    slug: 'beef-pepperoni-classic',
    category: 'crown-crust-pizzas',
    price: 1200,
    description:
      'Halal beef pepperoni, San Marzano-style tomato sauce and bubbling mozzarella. Simple, fiery and always fresh.',
    image: IMG.pepperoni,
    tags: ['Classic'],
    prep: 22,
  },
  {
    name: 'Zinger Burger',
    slug: 'zinger-burger',
    category: 'burgers-zingers',
    price: 450,
    description:
      'Extra crunchy deep-fried chicken breast, secret spicy dressing and fresh lettuce in a toasted sesame bun.',
    image: IMG.zinger,
    tags: ['Crispy'],
    prep: 15,
  },
  {
    name: 'Zinger Combo with Fries & Drink',
    slug: 'zinger-combo',
    category: 'burgers-zingers',
    price: 999,
    compare: 1150,
    description:
      'Our signature Zinger burger with golden fries and a chilled soft drink. The complete crispy combo.',
    image: IMG.combo,
    featured: true,
    tags: ['Crispy Supreme', 'Combo'],
    prep: 18,
  },
  {
    name: 'Smashed Beef Burger',
    slug: 'smashed-beef-burger',
    category: 'burgers-zingers',
    price: 650,
    description:
      'Double-smashed halal beef patties, caramelised onions, cheddar melt and house sauce on a brioche bun.',
    image: IMG.smashed,
    tags: ['House Special'],
    prep: 18,
  },
  {
    name: '4B Special Platter',
    slug: '4b-special-platter',
    category: 'platters-sides',
    price: 1099,
    description:
      'Zinger cuts, hot wings, crispy chicken tenders, loaded spiced fries and our signature mayo-garlic dip.',
    image: IMG.platter,
    featured: true,
    tags: ['Sharing Box'],
    prep: 25,
  },
  {
    name: 'Loaded Pizza Fries & Wings',
    slug: 'loaded-pizza-fries-wings',
    category: 'platters-sides',
    price: 650,
    description:
      'Crisp fries smothered in pizza sauce, mozzarella melt, chicken chunks, jalapenos and spicy wings.',
    image: IMG.fries,
    tags: ['Side Delight'],
    prep: 15,
  },
  {
    name: 'Chicken Steak & Finger Fish',
    slug: 'chicken-steak-finger-fish',
    category: 'platters-sides',
    price: 1250,
    description:
      'Sizzling grilled chicken steak with mushroom pepper sauce, or seasonal crispy golden batter finger fish.',
    image: IMG.steak,
    tags: ['Chef Special'],
    prep: 30,
  },
  {
    name: 'Garlic Bread with Cheese',
    slug: 'garlic-bread-with-cheese',
    category: 'platters-sides',
    price: 350,
    description: 'Freshly baked garlic butter bread topped with a generous mozzarella melt.',
    image: IMG.garlic,
    tags: ['Vegetarian'],
    prep: 12,
  },
  {
    name: 'Hot Wings (8 pcs)',
    slug: 'hot-wings-8-pcs',
    category: 'platters-sides',
    price: 550,
    description: 'Eight fiery fried wings tossed in our house spice blend, served with dip.',
    image: IMG.wings,
    tags: ['Spicy'],
    prep: 15,
  },
  {
    name: 'Deal 2: 3 Zingers + Fries + 1.5L Drink',
    slug: 'deal-2-three-zingers',
    category: 'deals-combos',
    price: 1500,
    compare: 1850,
    description:
      'Three crispy Zinger burgers, one large fries and a 1.5 litre chilled drink. The storefront live special.',
    image: IMG.combo,
    featured: true,
    tags: ['Storefront Live Special', 'Family Deal'],
    prep: 25,
  },
  {
    name: 'Family Crown Feast',
    slug: 'family-crown-feast',
    category: 'deals-combos',
    price: 3800,
    compare: 4500,
    description:
      'Two large Crown Crust pizzas, 2 Zingers, a full platter of wings and fries plus a 1.5L drink. Built for the Family Hall.',
    image: IMG.family,
    tags: ['Family Hall', 'Best Value'],
    prep: 35,
  },
  {
    name: '1.5L Chilled Drink',
    slug: '1-5l-chilled-drink',
    category: 'drinks',
    price: 250,
    description: 'Ice-cold 1.5 litre soft drink to complete your feast.',
    image: IMG.drink,
    tags: ['Chilled'],
    prep: 2,
  },
  {
    name: 'Fresh Lime Soda',
    slug: 'fresh-lime-soda',
    category: 'drinks',
    price: 200,
    description: 'Freshly squeezed lime, soda and a touch of sweetness over ice.',
    image: IMG.lime,
    tags: ['Fresh'],
    prep: 5,
  },
];

export async function runSetup({ log = console.log } = {}) {
  await waitForDatabase();
  const schema = readFileSync(path.join(here, 'schema.sql'), 'utf8');
  await query(schema);
  log('[setup] schema ready');

  await query(
    `INSERT INTO restaurant_settings (id) VALUES ('default') ON CONFLICT (id) DO NOTHING`,
  );

  const adminEmail = config.adminEmail;
  const existingAdmin = await query('SELECT id FROM users WHERE lower(email) = lower($1)', [
    adminEmail,
  ]);
  if (!existingAdmin.rows[0]) {
    const hash = await bcrypt.hash(config.adminPassword, 10);
    await query(
      `INSERT INTO users (name, email, phone, password_hash, role)
       VALUES ($1,$2,$3,$4,'ADMIN')`,
      ['Restaurant Admin', adminEmail, '+92 81 2853377', hash],
    );
    log(`[setup] admin account ready (${adminEmail})`);
  }

  const demoEmail = 'customer@4brothers.pk';
  const existingCustomer = await query('SELECT id FROM users WHERE lower(email) = lower($1)', [
    demoEmail,
  ]);
  if (!existingCustomer.rows[0]) {
    const hash = await bcrypt.hash('Customer@123', 10);
    await query(
      `INSERT INTO users (name, email, phone, password_hash, role)
       VALUES ($1,$2,$3,$4,'CUSTOMER')`,
      ['Ali Khan', demoEmail, '+92 300 1234567', hash],
    );
    log('[setup] demo customer ready');
  }

  for (const category of CATEGORIES) {
    await query(
      `INSERT INTO categories (name, slug, description, image_url, sort_order)
       VALUES ($1,$2,$3,$4,$5)
       ON CONFLICT (slug) DO NOTHING`,
      [category.name, category.slug, category.description, category.image, category.sort],
    );
  }

  for (const product of PRODUCTS) {
    const categoryRes = await query('SELECT id FROM categories WHERE slug = $1', [
      product.category,
    ]);
    const categoryId = categoryRes.rows[0]?.id || null;
    await query(
      `INSERT INTO products (
         name, slug, category_id, description, price, compare_price, image_url,
         is_featured, prep_time_minutes, tags
       ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
       ON CONFLICT (slug) DO NOTHING`,
      [
        product.name,
        product.slug,
        categoryId,
        product.description,
        product.price,
        product.compare || null,
        product.image,
        Boolean(product.featured),
        product.prep,
        product.tags,
      ],
    );
  }

  await query(
    `INSERT INTO coupons (code, description, type, value, min_order, max_uses, is_active)
     VALUES ('WELCOME10', '10% off your first order over Rs 1,000', 'PERCENT', 10, 1000, 500, true)
     ON CONFLICT (code) DO NOTHING`,
  );
  await query(
    `INSERT INTO coupons (code, description, type, value, min_order, max_uses, is_active)
     VALUES ('FAMILY500', 'Rs 500 off family feasts over Rs 3,000', 'FIXED', 500, 3000, 200, true)
     ON CONFLICT (code) DO NOTHING`,
  );

  log('[setup] seed data ready');
  await pool.end();
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  runSetup().catch((err) => {
    console.error('[setup] failed', err);
    process.exit(1);
  });
}
