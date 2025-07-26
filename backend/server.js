
const express = require("express");
const puppeteer = require("puppeteer");
const cors = require("cors");

const app = express();
const PORT = 3000;

app.use(cors());

app.get("/api/get-price", async (req, res) => {
  const url = req.query.url;
  if (!url || !url.includes("shopee")) {
    return res.status(400).json({ error: "Invalid URL" });
  }

  try {
    const browser = await puppeteer.launch({
      headless: "new",
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: "networkidle2", timeout: 0 });

    const priceText = await page.evaluate(() => {
      const priceEl = document.querySelector(".pmmxKx, .p0p5xg, .pqTWkA, .product-price");
      return priceEl ? priceEl.textContent.replace(/[^\d]/g, "") : "0";
    });

    await browser.close();
    res.json({ price: parseInt(priceText || "0") });
  } catch (error) {
    console.error("Lỗi Puppeteer:", error);
    res.status(500).json({ error: "Scraping failed" });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server đang chạy tại http://localhost:${PORT}`);
});
