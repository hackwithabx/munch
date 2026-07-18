import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const COUNT = Number(process.env.DUMMY_CARD_COUNT || 50);

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY for seeding.");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const firstNames = [
  "Aarav", "Diya", "Kabir", "Ira", "Rohan", "Meera", "Arjun", "Siya", "Vivaan", "Anaya",
  "Ishan", "Tara", "Karan", "Naina", "Dev", "Saanvi", "Yash", "Ritika", "Aditya", "Pooja",
];

const lastNames = [
  "Sharma", "Patel", "Singh", "Gupta", "Nair", "Iyer", "Joshi", "Verma", "Khan", "Das",
];

const cities = [
  "Pune", "Mumbai", "Delhi", "Bengaluru", "Hyderabad", "Jaipur", "Lucknow", "Ahmedabad", "Chennai", "Kolkata",
];

const professions = [
  ["electrician", "home repairs"],
  ["yoga instructor", "wellness"],
  ["graphic designer", "branding"],
  ["web developer", "react"],
  ["math tutor", "board exam prep"],
  ["photographer", "weddings"],
  ["makeup artist", "bridal"],
  ["fitness coach", "weight loss"],
  ["content writer", "copywriting"],
  ["music teacher", "guitar lessons"],
];

function pick(arr, idx) {
  return arr[idx % arr.length];
}

function slugify(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
}

async function listExistingUsers() {
  const usersByEmail = new Map();
  let page = 1;
  while (true) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 200 });
    if (error) throw error;
    const users = data?.users || [];
    users.forEach((u) => {
      if (u.email) usersByEmail.set(u.email, u.id);
    });
    if (users.length < 200) break;
    page += 1;
  }
  return usersByEmail;
}

async function ensureDummyUser(i, existingMap) {
  const first = pick(firstNames, i);
  const last = pick(lastNames, i * 3);
  const fullName = `${first} ${last}`;
  const email = `demo.user${String(i).padStart(3, "0")}@munch.demo`;

  const existingId = existingMap.get(email);
  if (existingId) {
    return { id: existingId, email, fullName };
  }

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password: "DemoUser#2026",
    email_confirm: true,
    user_metadata: {
      full_name: fullName,
    },
  });

  if (error) {
    if (/already registered|already exists/i.test(error.message)) {
      const refreshMap = await listExistingUsers();
      const fallbackId = refreshMap.get(email);
      if (fallbackId) return { id: fallbackId, email, fullName };
    }
    throw error;
  }

  if (!data.user) {
    throw new Error(`Could not create user for ${email}`);
  }

  return { id: data.user.id, email, fullName };
}

async function seed() {
  const existingUsers = await listExistingUsers();

  const pageViewRows = [];
  const searchQueryRows = [];

  for (let i = 1; i <= COUNT; i += 1) {
    const { id, fullName } = await ensureDummyUser(i, existingUsers);

    const city = pick(cities, i * 5);
    const tags = pick(professions, i);
    const username = `demo_${slugify(fullName)}_${i}`.slice(0, 28);
    const bio = `${fullName} is a trusted ${tags[0]} based in ${city}, helping clients with ${tags[1]} and quick support.`.slice(0, 280);

    const { error: profileError } = await supabase
      .from("profiles")
      .update({
        username,
        display_name: fullName,
        bio,
        tags,
        city,
        avatar_url: `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(fullName)}`,
        contact_email: `contact+${i}@munch.demo`,
        phone_number: `+91 90000${String(10000 + i).slice(-5)}`,
        show_email_public: i % 2 === 0,
        show_phone_public: i % 3 === 0,
        is_public: true,
      })
      .eq("id", id);

    if (profileError) {
      throw profileError;
    }

    await supabase.from("social_links").delete().eq("profile_id", id);

    const links = [
      { profile_id: id, platform: "website", url: `https://example.com/${username}`, display_order: 0 },
      { profile_id: id, platform: "instagram", url: `https://instagram.com/${username}`, display_order: 1 },
    ];

    const { error: linksError } = await supabase.from("social_links").insert(links);
    if (linksError) throw linksError;

    const viewCount = 6 + (i % 25);
    for (let v = 0; v < viewCount; v += 1) {
      const ts = new Date(Date.now() - Math.floor(Math.random() * 14) * 24 * 60 * 60 * 1000);
      pageViewRows.push({ profile_id: id, viewed_at: ts.toISOString(), referrer: "https://munch.app" });
    }

    const term = tags[0].split(" ")[0].toLowerCase();
    const qTimes = 3 + (i % 8);
    for (let q = 0; q < qTimes; q += 1) {
      const ts = new Date(Date.now() - Math.floor(Math.random() * 7) * 24 * 60 * 60 * 1000);
      searchQueryRows.push({
        query_text: term,
        normalized_query: term,
        source: "seed",
        searched_at: ts.toISOString(),
      });
    }
  }

  if (pageViewRows.length) {
    const { error } = await supabase.from("page_views").insert(pageViewRows);
    if (error) throw error;
  }

  if (searchQueryRows.length) {
    const { error } = await supabase.from("search_queries").insert(searchQueryRows);
    if (error) {
      console.warn("search_queries insert failed (did you run migration 0002?):", error.message);
    }
  }

  console.log(`Seeded ${COUNT} dummy cards successfully.`);
}

seed().catch((err) => {
  console.error("Seeding failed:", err.message || err);
  process.exit(1);
});
