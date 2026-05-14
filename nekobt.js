const TORZNAB_CATEGORIES = {
  anime: "5070",
  movies: "2000",
  tv: "5000"
};

function parseSize(bytes) {
  if (!bytes || isNaN(bytes)) return "Unknown";

  const units = ["B", "KB", "MB", "GB", "TB"];
  let size = Number(bytes);
  let unit = 0;

  while (size >= 1024 && unit < units.length - 1) {
    size /= 1024;
    unit++;
  }

  return `${size.toFixed(2)} ${units[unit]}`;
}

export default {
  id: "nekobt",
  name: "nekoBT",
  version: "1.0.0",

  async search(query, options = {}) {
    const apiKey = options.apiKey?.trim();

    if (!apiKey) {
      throw new Error("Missing nekoBT API key");
    }

    const baseUrl =
      options.baseUrl ||
      "https://nekobt.to/api/v1/search";

    const category =
      TORZNAB_CATEGORIES[options.category || "anime"];

    const params = new URLSearchParams({
      q: query,
      apikey: apiKey
    });

    // optional category support (only if API supports it)
    if (category) {
      params.set("cat", category);
    }

    const url = `${baseUrl}?${params.toString()}`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();

    // Expecting something like: { results: [...] }
    const items = data.results || data.data || data || [];

    const results = [];

    for (const item of items) {
      results.push({
        title: item.title || "Unknown",

        magnet:
          item.magnet ||
          item.download ||
          item.link ||
          "",

        link:
          item.magnet ||
          item.download ||
          item.link ||
          "",

        seeders: item.seeders || 0,
        leechers: item.leechers || 0,
        peers: item.peers || 0,

        size: parseSize(item.size),
        bytes: Number(item.size || 0),

        date: item.date || item.pubDate || "",

        source: "nekoBT"
      });
    }

    return results;
  }
};
