
const affiliateID = "17337560220";
let generatedLink = "";
const commissionRates = { "fashion": 10, "electronics": 5, "beauty": 15, "home": 8, "default": 5 };

async function generateLink() {
  let originalLink = document.getElementById("productLink").value.trim();
  if (!originalLink.includes("shopee")) {
    alert("⚠️ Hãy nhập đúng link sản phẩm Shopee!");
    return;
  }

  let fullLink = await resolveShortLink(originalLink);
  if (originalLink.includes("?")) {
    generatedLink = fullLink + "&aff_id=" + affiliateID;
  } else {
    generatedLink = fullLink + "?aff_id=" + affiliateID;
  }

  let res = await fetch(`/api/get-price?url=${encodeURIComponent(fullLink)}`);
  let data = await res.json();
  let price = data.price || 0;

  if (price === 0) {
    alert("⚠️ Không thể lấy giá. Vui lòng kiểm tra link!");
  }

  let category = detectCategory(fullLink);
  let commissionRate = commissionRates[category] || commissionRates["default"];
  let estimatedCommission = (commissionRate * price) / 100;

  document.getElementById("result").innerHTML = `
    ✅ Link Affiliate đã tạo:<br>
    <a href="${generatedLink}" target="_blank">${generatedLink}</a>
  `;
  document.getElementById("details").innerHTML = `
    🔍 Giá thực tế: ${price.toLocaleString()} VNĐ<br>
    🏷️ Danh mục: ${category}<br>
    💰 Hoa hồng ước tính: ${estimatedCommission.toLocaleString()} VNĐ (${commissionRate}%)
  `;
  document.getElementById("copyBtn").style.display = "inline-block";
}

async function resolveShortLink(shortUrl) {
  try {
    let response = await fetch(shortUrl, { method: "HEAD", redirect: "follow" });
    return response.url;
  } catch (error) {
    return shortUrl;
  }
}

function detectCategory(link) {
  if (link.includes("fashion")) return "fashion";
  if (link.includes("electronics")) return "electronics";
  if (link.includes("beauty")) return "beauty";
  if (link.includes("home")) return "home";
  return "default";
}

function copyLink() {
  navigator.clipboard.writeText(generatedLink).then(() => {
    alert("📋 Link đã được copy!");
  });
}
