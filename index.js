import express from "express";
import fetch from "node-fetch";

const app = express();
app.use(express.json());
const AFF_ID = "17337560220";

app.get("/api/aff-link", async (req, res) => {
  try {
    let { url } = req.query;
    if (!url) return res.status(400).json({ error: "Thiếu URL" });

    // 1️⃣ Nếu link là shope.ee → mở link để lấy link thật
    if (url.includes("shope.ee")) {
      const response = await fetch(url, { redirect: "follow" });
      url = response.url;
    }

    // 2️⃣ Thêm aff_id
    let finalLink = url.includes("?")
      ? url + "&aff_id=" + AFF_ID
      : url + "?aff_id=" + AFF_ID;

    res.json({ affiliate_link: finalLink });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Lỗi server" });
  }
});

app.listen(3000, () => console.log("✅ Server chạy cổng 3000"));
