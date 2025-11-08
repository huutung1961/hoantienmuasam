import fetch from "node-fetch";

export default async function handler(req, res) {
  const { itemid, shopid } = req.query;
  if (!itemid || !shopid) return res.status(400).json({ error: "Thiếu itemid hoặc shopid" });

  try {
    const apiKey = "YOUR_SCRAPINGBEE_API_KEY";
    const targetUrl = `https://shopee.vn/api/v4/item/get?itemid=${itemid}&shopid=${shopid}`;
    const scraperUrl = `https://app.scrapingbee.com/api/v1/?api_key=${apiKey}&url=${encodeURIComponent(targetUrl)}&country_code=vn&render_js=false`;

    const response = await fetch(scraperUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/115 Safari/537.36",
        Accept: "application/json",
      },
    });

    const json = await response.json();
    if (!json.data) return res.status(404).json({ error: "Không tìm thấy sản phẩm" });

    const item = json.data;
    res.status(200).json({
      name: item.name,
      price: item.price / 100000,
      price_before_discount: item.price_before_discount / 100000,
      stock: item.stock,
      sold: item.historical_sold,
      liked: item.liked_count,
      image: `https://down-vn.img.susercontent.com/file/${item.image}`,
      shopid: item.shopid,
      itemid: item.itemid,
    });
  } catch (err) {
    console.error("Lỗi lấy dữ liệu Shopee:", err);
    res.status(500).json({ error: "Không thể lấy dữ liệu từ Shopee" });
  }
}
