import axios from "axios";
import https from "https";

export default async function handler(req, res) {
  const { url } = req.query;
  if (!url) return res.status(400).json({ error: "URL không hợp lệ" });

  const NOX_API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE3NjI5MzEyODEsInN1YiI6MTAzMH0.SoVD1tSRF74AHS4tduN49SuKp8qhxWXO5OHzHbvhS5";

  try {
    const response = await axios.post(
      "https://api.noxapi.com/v1/shopee/item_detail_by_url",
      { url },
      {
        headers: {
          Authorization: `Bearer ${NOX_API_KEY}`,
          "Content-Type": "application/json",
          Accept: "application/json",
          "User-Agent": "Mozilla/5.0",
        },
        httpsAgent: new https.Agent({ keepAlive: false }),
        timeout: 20000,
      }
    );

    console.log("Full response:", response.data);

    const item = response.data.data;
    if (!item) {
      return res.status(200).json({ message: "❌ Không có dữ liệu sản phẩm" });
    }

    const price = item.price_info?.price ?? 0;
    const commission = Math.floor(price * 0.05);

    res.status(200).json({
      message: "✅ Lấy thông tin thành công",
      name: item.title ?? "N/A",
      price: `${price} VNĐ`,
      commission: `${commission} VNĐ (5%)`,
      images: item.images ?? [],
      video: item.video_url ?? null,
    });
  } catch (err) {
    console.error("❌ Lỗi axios:", err.response?.status, err.response?.data);
    res.status(500).json({ message: "❌ Lỗi khi lấy dữ liệu sản phẩm" });
  }
}
