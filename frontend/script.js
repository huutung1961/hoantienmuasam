const affiliateID = "17337560220";
let generatedLink = "";
const commissionRates = {
  "fashion": 10,
  "electronics": 5,
  "beauty": 15,
  "home": 8,
  "default": 5
};

async function generateLink() {
  let originalLink = document.getElementById("productLink").value.trim();
  if (!originalLink) {
    alert("⚠️ Vui lòng dán link sản phẩm Shopee!");
    return;
  }

  // Nếu là link rút gọn (shp.ee), giải mã
  if (originalLink.includes("shp.ee")) {
    originalLink = await resolveShortLink(originalLink);
    console.log("Link sau khi giải mã:", originalLink);
  }

  // Kiểm tra lại sau khi giải mã
  if (!originalLink.includes("shopee.vn")) {
    document.getElementById("result").innerText = "⚠️ Hãy nhập đúng link sản phẩm Shopee!";
    return;
  }

  // Tạo link Affiliate
  if (originalLink.includes("?")) {
    generatedLink = originalLink + `&aff_id=${affiliateID}`;
  } else {
    generatedLink = originalLink + `?aff_id=${affiliateID}`;
  }

  // Gọi API lấy giá
  try {
    const response = await fetch(`/api/get-price?url=${encodeURIComponent(originalLink)}`);
    const data = await response.json();

    const price = data.price || 0;
    const category = detectCategory(originalLink);
    const rate = commissionRates[category] || commissionRates["default"];
    const commission = Math.round((price * rate) / 100);

    // Hiển thị kết quả
    document.getElementById("result").innerHTML = `
      ✅ Link Affiliate đã tạo:<br>
      <a href="${generatedLink}" target="_blank">${generatedLink}</a>
    `;
    document.getElementById("details").innerHTML = `
      🔍 Giá thực tế: ${price.toLocaleString()} VNĐ<br>
      🏷️ Danh mục: ${category}<br>
      💰 Hoa hồng ước tính: ${commission.toLocaleString()} VNĐ (${rate}%)
    `;
    document.getElementById("copyBtn").style.display = "inline-block";

  } catch (err) {
    console.error("Lỗi khi lấy thông tin sản phẩm:", err);
    document.getElementById("result").innerText = "❌ Không thể lấy thông tin sản phẩm. Hãy thử lại!";
  }
}

// Giải mã link rút gọn như shp.ee
async function resolveShortLink(shortUrl) {
  try {
    const response = await fetch(shortUrl, { method: "HEAD", redirect: "follow" });
    return response.url;
  } catch (err) {
    console.error("Lỗi giải mã link rút gọn:", err);
    return shortUrl; // fallback
  }
}

// Phân loại danh mục sản phẩm
function detectCategory(link) {
  const l = link.toLowerCase();
  if (l.includes("thoi-trang") || l.includes("fashion")) return "fashion";
  if (l.includes("dien-tu") || l.includes("electronics")) return "electronics";
  if (l.includes("lam-dep") || l.includes("beauty")) return "beauty";
  if (l.includes("nha-cua") || l.includes("home")) return "home";
  return "default";
}

// Copy link affiliate
function copyLink() {
  navigator.clipboard.writeText(generatedLink).then(() => {
    alert("📋 Link đã được copy!");
  });
}
