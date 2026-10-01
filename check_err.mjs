async function check() {
  const r = await fetch("http://[::1]:3000/");
  console.log("Status:", r.status);
  const text = await r.text();
  console.log("Length:", text.length);
  // Search for Error in HTML
  const idx = text.indexOf("Error");
  if (idx !== -1) {
    console.log("Around Error:", text.slice(Math.max(0, idx - 50), idx + 250));
  } else {
    console.log("No 'Error' string found. Snippet:", text.slice(0, 300));
  }
}
check();
