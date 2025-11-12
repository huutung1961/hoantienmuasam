import fetch from "node-fetch";

export default async function handler(req, res) {
  let { url } = req.query;

  if (!url) {
    return res.status(400).json({
      error: "URL Shopee không được cung cấp",
    });
  }

  // Thay bằng API Key thật của bạn
  const NOX_API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE3NjI5MzEyODEsInN1YiI6MTAzMH0.SoVD1tSRF74AHS4tduN49SuKp8qhxWXO5OHzHbvhS5k";

  try {
    const response = await fetch("http://api.noxapi.com/v1/shopee/item_detail_by_url", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${NOX_API_KEY}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ url }),
    });

    const data = await response.json();

    // Nếu không có dữ liệu trả về, fallback
    if (!data || !data.data) {
      return res.status(200).json({
        message: "❌ Không thể lấy thông tin sản phẩm. Hãy thử lại!",
        price: "0 VNĐ",
        category: "default",
        commission: "0 VNĐ (5%)",
      });
    }

    const item = data.data;

    // Hoa hồng ước tính 5% (ví dụ)
    const price = item.price_info?.price || 0;
    const commission = Math.floor(price * 0.05);

    res.status(200).json({
      message: "✅ Lấy thông tin sản phẩm thành công",
      name: item.title || "N/A",
      price: `${price} VNĐ`,
      price_before_discount: item.price_info?.price_before_discount || 0,
      stock: item.stock ?? "N/A",
      sold: item.sold ?? "N/A",
      liked: item.liked_count ?? "N/A",
      category: item.cat_name || "default",
      commission: `${commission} VNĐ (5%)`,
      images: item.images || [],
      video: item.video_url || null,
      shopid: item.shopid,
      itemid: item.itemid,
    });
  } catch (err) {
    console.error("Lỗi kết nối NoxAPI:", err);
    res.status(500).json({
      message: "❌ Không thể lấy thông tin sản phẩm. Hãy thử lại!",
      price: "0 VNĐ",
      category: "default",
      commission: "0 VNĐ (5%)",
    });
  }
}
