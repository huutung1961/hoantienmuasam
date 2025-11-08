// /api/get-price.js
import crypto from "crypto";
import fetch from "node-fetch";

export default async function handler(req, res) {
  const { itemid, shopid } = req.query;

  if (!itemid || !shopid) {
    return res.status(400).json({ error: "Thiếu itemid hoặc shopid" });
  }

  const partner_id = 123456; // 👉 Thay bằng Partner ID thật của bạn
  const partner_key = "abcd1234efgh5678"; // 👉 Thay bằng Partner Key của bạn
  const timestamp = Math.floor(Date.now() / 1000);

  const path = "/api/v2/item/get_item_base_info";
  const sign = crypto
    .createHmac("sha256", partner_key)
    .update(partner_id + path + timestamp)
    .digest("hex");

  const url = `https://partner.shopeemobile.com${path}?partner_id=${partner_id}&timestamp=${timestamp}&sign=${sign}`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        item_id_list: [parseInt(itemid)],
        shop_id: parseInt(shopid)
      })
    });

    const data = await response.json();

    if (data && data.response && data.response.item_list) {
      const info = data.response.item_list[0];
      res.status(200).json({
        name: info.name,
        price: info.price / 100000, // đổi về VNĐ
        stock: info.stock,
        image: info.image
      });
    } else {
      res.status(404).json({ error: "Không tìm thấy sản phẩm" });
    }
  } catch (err) {
    console.error("Lỗi lấy dữ liệu Shopee:", err);
    res.status(500).json({ error: "Không thể lấy dữ liệu từ Shopee" });
  }
}
