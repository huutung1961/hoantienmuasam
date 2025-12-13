import axios from "axios";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST allowed" });
  }

  const { url } = req.body || {};

  if (!url || !url.includes("shopee.vn/product")) {
    return res.status(400).json({
      error: "Link phải dạng shopee.vn/product/SHOPID/ITEMID"
    });
  }

  try {
    const response = await axios.post(
      // ✅ DOMAIN ĐÚNG CERT
      "https://noxapi.com/v1/shopee/item_detail_by_url",
      {
        // ✅ FIELD ĐÚNG THEO DOC
        item_url: url
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.NOX_API_KEY}`,
          "Content-Type": "application/json",
          Accept: "application/json",

          // ✅ BẮT BUỘC – FIX CSRF
          "User-Agent": "Mozilla/5.0",
          Origin: "https://noxapi.com",
          Referer: "https://noxapi.com/"
        },
        timeout: 20000
      }
    );

    const item = response.data?.data;

    if (!item) {
      return res.status(502).json({
        error: "NOX không trả data",
        raw: response.data
      });
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
    console.error("🔥 NOX ERROR:", err.response?.data || err.message);
    return res.status(500).json({
      error: "NOX API lỗi",
      detail: err.response?.data || err.message
    });
  }
}
