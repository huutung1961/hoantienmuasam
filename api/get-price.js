import fetch from 'node-fetch';

export default async function handler(req, res) {
  const { url } = req.query;

  if (!url || !url.includes("shopee.vn")) {
    return res.status(400).json({ error: "Thiếu hoặc sai URL" });
  }

  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/115 Safari/537.36"
      }
    });

    const html = await response.text();
    const match = html.match(/"price":(\d+)/);
    const price = match ? parseInt(match[1]) : 0;

    res.status(200).json({ price });
  } catch (err) {
    console.error("Lỗi lấy giá:", err);
    res.status(500).json({ error: "Không thể lấy dữ liệu từ Shopee" });
  }
}
