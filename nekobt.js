async search(query, options = {}) {
  const apiKey = options.apiKey?.trim();

  if (!apiKey) {
    throw new Error("Missing nekoBT API key");
  }

  const baseUrl =
    options.baseUrl ||
    "https://nekobt.to/api/v1/search";

  const params = new URLSearchParams({
    q: query,
    apikey: apiKey
  });

  const url = `${baseUrl}?${params.toString()}`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  const data = await response.json();

  const items = data.results || data.data || data || [];

  return items.map(item => ({
    title: item.title || "Unknown",
    magnet: item.magnet || item.link || item.download || "",
    link: item.magnet || item.link || item.download || "",
    seeders: item.seeders || 0,
    leechers: item.leechers || 0,
    peers: item.peers || 0,
    size: item.size || "Unknown",
    bytes: Number(item.size || 0),
    date: item.date || "",
    source: "nekoBT"
  }));
}
