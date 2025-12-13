
import axios from "axios";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST allowed" });
  }

  const { url } = req.body;

  if (!url || !url.includes("shopee.vn/product")) {
    return res.status(400).json({
      error: "Link phải dạng shopee.vn/product/SHOPID/ITEMID"
    });
  }

  try {
    const response = await axios.post(
      "https://api.noxapi.com/v1/shopee/item_detail_by_url",
      { url },
      {
        headers: {
          Authorization: `Bearer YOUR_NOX_API_KEY`,
          "Content-Type": "application/json"
        },
        timeout: 20000
      }
    );

    const item = response.data?.data;
    if (!item) {
      return res.json({ error: "Không có dữ liệu từ NOX" });
    }

    const price = item.price_info?.price ?? 0;
    const commission = Math.floor(price * 0.05);

    res.json({
      title: item.title,
      price,
      commission,
      image: item.images?.[0] || null,
      shop: item.shop_name
    });

  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ error: "NOX API lỗi" });
  }
}
