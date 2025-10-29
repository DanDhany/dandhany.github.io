export async function fetchProjectsFromCMS() {
  const url = process.env.CMS_API_URL;
  const token = process.env.CMS_API_TOKEN;
  if (!url || !token) return null;
  try {
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return Array.isArray(data) ? data : data?.projects ?? null;
  } catch {
    return null;
  }
}