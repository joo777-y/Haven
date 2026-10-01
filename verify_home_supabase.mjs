async function verifyHome() {
  const res = await fetch("http://[::1]:3000/");
  const html = await res.text();

  console.log("Homepage HTTP Status:", res.status);
  console.log("Contains Zayed Private Garden Villa:", html.includes("Zayed Private Garden Villa"));
  console.log("Contains Mediterranean Sea View Villa:", html.includes("Mediterranean Sea View Villa"));
  console.log("Contains Alpha Luxury Villa:", html.includes("Alpha Luxury Villa"));
  console.log("Contains Supabase Storage URL:", html.includes("supabase.co/storage/v1/object/public/property-images"));

  // Check matching images
  const supabaseMatches = [...html.matchAll(/https:\/\/afxgijkdaaidklzhwell\.supabase\.co\/storage\/v1\/object\/public\/property-images\/[^\s"']+/g)];
  console.log("Found Supabase property images in HTML:", supabaseMatches.length);
  supabaseMatches.slice(0, 5).forEach((m, i) => console.log(`  Img #${i + 1}: ${m[0]}`));
}

verifyHome().catch(console.error);
