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

function extractTorznabAttr(item, attrName) {
  const attrs = item.getElementsByTagName("torznab:attr");

  for (const attr of attrs) {
    if (attr.getAttribute("name") === attrName) {
      return attr.getAttribute("value");
    }
  }

  return null;
}

async function fetchXML(url) {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  const text = await response.text();

  return new DOMParser().parseFromString(text, "text/xml");
}

export default {
  id: "myexample",

  name: "nekoBT",

  version: "1.0.0",

  async search(query, options = {}) {
    const apiKey = options.apiKey?.trim();

    if (!apiKey) {
      throw new Error("Missing nekoBT API key");
    }

    const baseUrl =
      options.baseUrl ||
      "https://nekobt.to/api/torznab/api";

    const category =
      TORZNAB_CATEGORIES[
        options.category || "anime"
      ];

    const params = new URLSearchParams({
      t: "search",
      q: query,
      apikey: apiKey
    });

    if (category) {
      params.set("cat", category);
    }

    const url = `${baseUrl}?${params.toString()}`;

    const xml = await fetchXML(url);

    const items = xml.getElementsByTagName("item");

    const results = [];

    for (const item of items) {
      const title =
        item.getElementsByTagName("title")[0]
          ?.textContent || "Unknown";

      const guid =
        item.getElementsByTagName("guid")[0]
          ?.textContent || "";

      const link =
        item.getElementsByTagName("link")[0]
          ?.textContent || "";

      const size =
        item.getElementsByTagName("size")[0]
          ?.textContent || "0";

      const pubDate =
        item.getElementsByTagName("pubDate")[0]
          ?.textContent || "";

      const seeders = Number(
        extractTorznabAttr(item, "seeders") || 0
      );

      const peers = Number(
        extractTorznabAttr(item, "peers") || 0
      );

      const leechers =
        peers > seeders
          ? peers - seeders
          : Number(
              extractTorznabAttr(item, "leechers") || 0
            );

      const magnet =
        extractTorznabAttr(item, "magneturl") ||
        link ||
        guid;

      results.push({
        title,

        magnet,

        link: magnet,

        seeders,

        leechers,

        peers,

        size: parseSize(size),

        bytes: Number(size),

        date: pubDate,

        source: "nekoBT"
      });
    }

    return results;
  }
};
