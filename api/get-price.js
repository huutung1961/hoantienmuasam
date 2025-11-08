// /api/get-price.js
import fetch from "node-fetch";

export default async function handler(req, res) {
  const { itemid, shopid } = req.query;
  if (!itemid || !shopid) {
    return res.status(400).json({ error: "Thiếu itemid hoặc shopid" });
  }

  try {
    const shopeeUrl = `https://shopee.vn/api/v4/item/get?itemid=${itemid}&shopid=${shopid}`;
    
    // Dùng proxy trung gian (ScraperAPI)
    const proxyUrl = `https://api.scraperapi.com/?api_key=YOUR_API_KEY&url=${encodeURIComponent(shopeeUrl)}`;

    const response = await fetch(proxyUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
        "Accept": "application/json",
        "Referer": "https://shopee.vn/"
      }
    });

    const json = await response.json();

    if (!json.data) {
      return res.status(404).json({ error: "Không tìm thấy sản phẩm" });
    }

    const item = json.data;
    const product = {
      name: item.name,
      price: item.price / 100000,
      price_before_discount: item.price_before_discount / 100000,
      stock: item.stock,
      sold: item.historical_sold,
      liked: item.liked_count,
      image: `https://down-vn.img.susercontent.com/file/${item.image}`,
      shopid: item.shopid,
      itemid: item.itemid,
    };

    res.status(200).json(product);
  } catch (err) {
    console.error("Lỗi lấy dữ liệu Shopee:", err);
    res.status(500).json({ error: "Không thể lấy dữ liệu từ Shopee" });
  }
}
