import fetch from "node-fetch";

export default async function handler(req, res) {
  const { itemid, shopid } = req.query;

  if (!itemid || !shopid) {
    return res.status(400).json({ error: "Thiếu itemid hoặc shopid" });
  }

  try {
    // Gọi qua ScraperAPI
    const apiKey = "b5b2216358a7f0a915a00a7225f9a84a";
    const targetUrl = `https://shopee.vn/api/v4/item/get?itemid=${itemid}&shopid=${shopid}`;
    const scraperUrl = `https://api.scraperapi.com/?api_key=${apiKey}&url=${encodeURIComponent(targetUrl)}`;

    const response = await fetch(scraperUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/115 Safari/537.36",
        "Accept": "application/json"
      }
    });

    const text = await response.text();
    let json;
    try {
      json = JSON.parse(text);
    } catch {
      console.log("Phản hồi không phải JSON:", text.slice(0, 200));
      return res.status(500).json({ error: "Dữ liệu trả về không hợp lệ từ Shopee" });
    }

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
      itemid: item.itemid
    };

    res.status(200).json(product);
  } catch (err) {
    console.error("Lỗi lấy dữ liệu Shopee:", err);
    res.status(500).json({ error: "Không thể lấy dữ liệu từ Shopee" });
  }
}
