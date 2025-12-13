import axios from "axios";

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Only POST allowed" });
    }

    const { url } = req.body || {};

    if (!url || !url.includes("shopee.vn/product")) {
      return res.status(400).json({
        error: "Link phải dạng shopee.vn/product/SHOPID/ITEMID"
      });
    }

    const response = await axios.post(
      "https://api.noxapi.com/v1/shopee/item_detail_by_url",
      {
        item_url: url   // ⚠️ RẤT QUAN TRỌNG
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.NOX_API_KEY}`,
          "Content-Type": "application/json"
        },
        timeout: 20000
      }
    );

    const item = response.data?.data;

    if (!item) {
      return res.json({ error: "NOX không trả dữ liệu" });
    }

    const price = item.price_info?.price ?? 0;

    return res.json({
      title: item.title,
      price,
      commission: Math.floor(price * 0.05),
      image: item.images?.[0] || null,
      shop: item.shop_name
    });

  } catch (err) {
    console.error("🔥 SERVER ERROR:", err);

    return res.status(500).json({
      error: "Server error",
      message: err.message
    });
  }
}
