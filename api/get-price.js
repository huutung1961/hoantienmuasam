import fetch from "node-fetch";

export default async function handler(req, res) {
  // Lấy các tham số từ request
  let { itemid, shopid, url } = req.query;

  // *** THAY THẾ CHUỖI NÀY BẰNG API TOKEN THẬT CỦA BẠN ***
  // LƯU Ý: Đặt Key công khai (public) có rủi ro bị lạm dụng.
  const NOX_API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE3NjI5MzEyODEsInN1YiI6MTAzMH0.SoVD1tSRF74AHS4tduN49SuKp8qhxWXO5OHzHbvhS5k"; 
  // Ví dụ: const NOX_API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYjQiOiIzMjEzNjEODE5NnY1Y3M2MTk2MDk0.SdVd1i6RF74aH5Afduu4495uK8qthWjXOSOkHZHbvI";

  // Kiểm tra và xử lý nếu người dùng gửi link Shopee
  if (url && (!itemid || !shopid)) {
    try {
      // Tách shopid và itemid từ link Shopee
      const match = url.match(/\/(\d+)\/(\d+)/);
      if (match) {
        // Shopee thường có định dạng /shopid/itemid
        shopid = match[1];
        itemid = match[2];
      } else {
        return res.status(400).json({ error: "URL Shopee không hợp lệ" });
      }
    } catch (e) {
      return res.status(400).json({ error: "Không thể phân tích URL Shopee" });
    }
  }

  // Kiểm tra tham số cần thiết
  if (!itemid || !shopid) {
    return res.status(400).json({ error: "Thiếu itemid hoặc shopid" });
  }
  
  // Kiểm tra API Key
  if (NOX_API_KEY === "YOUR_API_TOKEN_HERE" || !NOX_API_KEY) {
     return res.status(500).json({ error: "Lỗi: API Key chưa được thay thế." });
  }

  try {
    // Endpoint của NoxAPI (thêm /v1 nếu cần thiết, nên kiểm tra docs)
    // Giả định dùng /v1 theo chuẩn API thông thường
    const apiUrl = `https://api.noxapi.com/v1/shopee/item_detail?item_id=${itemid}&shop_id=${shopid}`;

    const response = await fetch(apiUrl, {
      headers: {
        // Dùng API Key (Token) làm Bearer Token trong Header
        Authorization: `Bearer ${NOX_API_KEY}`,
        Accept: "application/json",
      },
    });

    const json = await response.json();

    // Xử lý lỗi từ API (ví dụ: lỗi 401, hết hạn mức, hoặc không tìm thấy sản phẩm)
    if (json.code !== 0 && response.status !== 200) {
        const errorMessage = json.msg || "Lỗi không xác định từ NoxAPI. Kiểm tra API Key/Hạn mức.";
        return res.status(response.status).json({ error: errorMessage });
    }
    
    // Nếu response là 200 OK nhưng không có data (có thể do lỗi cấu trúc response)
    if (!json.data) {
        return res.status(404).json({
          error: "Không tìm thấy sản phẩm hoặc dữ liệu trả về không hợp lệ.",
        });
    }

    const item = json.data;

    res.status(200).json({
      name: item.name,
      // Giá trị tiền tệ được chia 100000 (giả định theo code cũ của bạn)
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
    console.error("Lỗi kết nối hoặc xử lý:", err);
    res.status(500).json({ error: "Không thể kết nối hoặc xử lý dữ liệu từ NoxAPI" });
  }
}
