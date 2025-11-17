require("dotenv").config();
const { createClient } = require("@supabase/supabase-js");

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY", {
    url: !!url,
    key: !!key,
  });
  process.exit(1);
}

const supabase = createClient(url, key);

async function listBuckets() {
  const { data, error } = await supabase.storage.listBuckets();
  if (error) {
    console.error("Supabase error:", error);
    process.exit(1);
  }
  console.log("Buckets found:");
  data.forEach((bucket) => console.log("-", bucket.name));
}

listBuckets();
