const NOX_API_KEY = "PASTE_API_KEY_CỦA_BẠN_VÀO_ĐÂY";

async function getProduct() {
  const url = document.getElementById("productLink").value.trim();
  const result = document.getElementById("result");

  result.innerHTML = "⏳ Đang lấy dữ liệu...";

  if (!url.includes("shopee.vn/product")) {
    result.innerHTML = "❌ Link Shopee không hợp lệ";
    return;
  }

  try {
    const res = await fetch(
      "https://noxapi.com/v1/shopee/item_detail_by_url",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${NOX_API_KEY}`
        },
        body: JSON.stringify({
          item_url: url
        })
      }
    );

    const json = await res.json();
    console.log(json);

    if (!json.data) {
      result.innerHTML = "❌ Không lấy được dữ liệu";
      return;
    }

    const item = json.data;
    const price = item.price_info?.price ?? 0;
    const commission = Math.floor(price * 0.05);

    result.innerHTML = `
      <h3>${item.title}</h3>
      <img src="${item.images?.[0]}" />
      <p>Giá: ${price.toLocaleString()}đ</p>
      <p>Hoa hồng (5%): ${commission.toLocaleString()}đ</p>
      <p>Shop: ${item.shop_name}</p>
    `;

  } catch (e) {
    console.error(e);
    result.innerHTML = "🔥 Lỗi khi gọi NOX API";
  }
}
