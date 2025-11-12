import fetch from "node-fetch";

export default async function handler(req, res) {
  let { itemid, shopid, url } = req.query;

  // Nếu người dùng gửi link Shopee → tự tách itemid & shopid
  if (url && (!itemid || !shopid)) {
    const match = url.match(/\/(\d+)\/(\d+)/);
    if (match) {
      shopid = match[1];
      itemid = match[2];
    } else {
      return res.status(400).json({ error: "URL Shopee không hợp lệ" });
    }
  }

  if (!itemid || !shopid) {
    return res.status(400).json({ error: "Thiếu itemid hoặc shopid" });
  }

  try {
    const NOX_API_KEY =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE3NjI5MzEyODEsInN1YiI6MTAzMH0.SoVD1tSRF74AHS4tduN49SuKp8qhxWXO5OHzHbvhS5k";

    const apiUrl = `https://api.noxapi.com/shopee/item_detail?itemid=${itemid}&shopid=${shopid}`;

    const response = await fetch(apiUrl, {
      headers: {
        Authorization: `Bearer ${NOX_API_KEY}`,
        Accept: "application/json",
      },
    });

    const json = await response.json();

    if (!json.data) {
      return res.status(404).json({
        error: "Không tìm thấy sản phẩm trên Shopee",
      });
    }

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
    console.error("Lỗi từ NoxAPI:", err);
    res.status(500).json({ error: "Không thể lấy dữ liệu từ NoxAPI" });
  }
}
