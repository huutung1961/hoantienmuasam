let currentLink = "";

async function analyzeProduct() {
  const link = document.getElementById("productLink").value.trim();

  if (!link.includes("shopee.vn/product")) {
    alert("Link phải dạng shopee.vn/product/...");
    return;
  }

  currentLink = link;
  document.getElementById("result").innerHTML = "⏳ Đang phân tích...";

  const res = await fetch("/api/get-product", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url: link })
  });

  const data = await res.json();

  if (data.error) {
    document.getElementById("result").innerHTML = "❌ " + data.error;
    return;
  }

  document.getElementById("result").innerHTML = `
    <h3>${data.title}</h3>
    <p>Giá: ${data.price.toLocaleString()}đ</p>
    <p>Hoa hồng ước tính: ${data.commission.toLocaleString()}đ</p>
    ${data.image ? `<img src="${data.image}" width="100%">` : ""}
  `;

  document.getElementById("affiliateBtn").style.display = "block";
}

function createAffiliate() {
  window.open(
    "https://affiliate.shopee.vn/offer/product?url=" +
      encodeURIComponent(currentLink),
    "_blank"
  );
}
