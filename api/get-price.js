
const puppeteer = require("puppeteer-core");
const chromium = require("chrome-aws-lambda");

module.exports = async (req, res) => {
  const { url } = req.query;

  if (!url || !url.includes("shopee")) {
    return res.status(400).json({ error: "URL không hợp lệ" });
  }

  try {
    const browser = await chromium.puppeteer.launch({
      args: chromium.args,
      executablePath: await chromium.executablePath,
      headless: chromium.headless,
    });

    const page = await browser.newPage();
    await page.goto(url, { waitUntil: "networkidle2", timeout: 0 });

    const priceText = await page.evaluate(() => {
      const el = document.querySelector(".product-price") || document.querySelector(".pqTWkA");
      return el ? el.textContent.replace(/[^\d]/g, "") : "0";
    });

    await browser.close();
    res.status(200).json({ price: parseInt(priceText || "0") });
  } catch (error) {
    console.error("Lỗi:", error);
    res.status(500).json({ error: "Không thể lấy giá sản phẩm" });
  }
};
