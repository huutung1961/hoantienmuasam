import axios from "axios";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST allowed" });
  }

  const { url } = req.body;

  if (!url || !/shopee\.vn\/product\/\d+\/\d+/.test(url)) {
    return res.status(400).json({
      error: "Link phải dạng shopee.vn/product/SHOP_ID/ITEM_ID"
    });
  }

  try {
    console.log("CALL NOX:", url);

    const response = await axios.post(
      "https://api.noxapi.com/v1/shopee/item_detail_by_url",
      {
        item_url: url
      },
      {
        headers: {
          Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE3NjI5MzEyODEsInN1YiI6MTAzMH0.SoVD1tSRF74AHS4tduN49SuKp8qhxWXO5OHzHbvhS5k`,
          "Content-Type": "application/json",
          Accept: "application/json"
        },
        timeout: 20000
      }
    );

    console.log("NOX RESPONSE:", response.data);

    const item = response.data?.data;
    if (!item) {
      return res.json({ error: "NOX không trả dữ liệu sản phẩm" });
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
    console.error("NOX ERROR:", err.response?.data || err.message);
    res.status(500).json({ error: "NOX API lỗi" });
  }
}
