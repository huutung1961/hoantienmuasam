import axios from "axios";
// ✅ Thêm 2 dòng này để xử lý Cookie tự động
import { wrapper } from 'axios-cookie-jar-support';
import { CookieJar } from 'tough-cookie';

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Only POST allowed" });

  const { url } = req.body || {};
  if (!url || !url.includes("shopee.vn/product")) {
    return res.status(400).json({ error: "Link không hợp lệ" });
  }

  // ✅ Tạo một "trình duyệt ảo" có khả năng nhớ Cookie
  const jar = new CookieJar();
  const client = wrapper(axios.create({ jar }));

  try {
    // BƯỚC 1 (QUAN TRỌNG): Gọi GET nhẹ vào trang chủ để lấy "Vé" (Cookie/CSRF) trước
    // Nếu bạn biết chắc API này không cần login mà chỉ cần session, bước này sẽ fix lỗi CSRF
    await client.get("https://noxapi.com/", {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
      }
    });

    // BƯỚC 2: Gọi API thật (Cookie từ bước 1 sẽ tự động được gửi kèm)
    const response = await client.post(
      "https://noxapi.com/v1/shopee/item_detail_by_url",
      { item_url: url },
      {
        headers: {
          Authorization: `Bearer ${process.env.NOX_API_KEY}`,
          "Content-Type": "application/json",
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          "Origin": "https://noxapi.com", // Giữ lại nếu server check chặt nguồn
          "Referer": "https://noxapi.com/"
        },
        timeout: 20000
      }
    );

    const item = response.data?.data;
    if (!item) throw new Error("No data returned");

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
    
    // Nếu lỗi 403/401, thường là do API KEY sai hoặc hết hạn
    if (err.response?.status === 403 || err.response?.status === 401) {
       return res.status(500).json({ error: "API Key lỗi hoặc bị chặn", detail: err.message });
    }

    return res.status(500).json({
      error: "NOX API lỗi",
      detail: err.response?.data || err.message
    });
  }
}
