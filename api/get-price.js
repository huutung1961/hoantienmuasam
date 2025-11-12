import fetch from "node-fetch";

export default async function handler(req, res) {
  const { url } = req.query;
  const NOX_API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE3NjI5MzEyODEsInN1YiI6MTAzMH0.SoVD1tSRF74AHS4tduN49SuKp8qhxWXO5OHzHbvhS5k"; // thay bằng token thật

  if (!url) return res.status(400).send("Thiếu url Shopee");

  try {
    // Gọi API POST /item_detail_by_url
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

    if (!data || !data.data) {
      return res.status(404).send("Không tìm thấy sản phẩm hoặc dữ liệu không hợp lệ");
    }

    const item = data.data;

    // Render HTML trực tiếp (giống PHP)
    let html = `<h1>${item.title}</h1>`;
    html += `<p>Giá: ${item.price_info?.price ?? "N/A"}</p>`;
    html += `<p>Giá gốc: ${item.price_info?.price_before_discount ?? "N/A"}</p>`;
    html += `<p>Tồn kho: ${item.stock ?? "N/A"}</p>`;
    html += `<p>Đã bán: ${item.sold ?? "N/A"}</p>`;
    html += `<p>Like: ${item.liked_count ?? "N/A"}</p>`;

    if (item.images && item.images.length > 0) {
      html += "<h3>Hình ảnh:</h3>";
      item.images.forEach(img => {
        html += `<img src="${img}" style="max-width:150px; margin:5px; border:1px solid #ccc; border-radius:5px;">`;
      });
    }

    if (item.video_url) {
      html += `<h3>Video:</h3>`;
      html += `<video width="320" controls><source src="${item.video_url}" type="video/mp4">Trình duyệt không hỗ trợ video.</video>`;
    }

    res.setHeader("Content-Type", "text/html");
    res.status(200).send(html);

  } catch (err) {
    console.error("Lỗi kết nối hoặc xử lý:", err);
    res.status(500).send("Không thể kết nối hoặc xử lý dữ liệu từ NoxAPI");
  }
}
