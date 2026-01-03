const search = async (req, res) => {
  try {
    const keyword = (req.query.keyword || "").trim().toLowerCase();
    if (!keyword) {
      return res.json({ contentBased: [] });
    }

    const db = req.app.locals.db.db; // ✅ USE FIRESTORE DIRECTLY

    const snap = await db
      .collection("stories")
      .where("isPublished", "==", true)
      .limit(50)
      .get();

    const results = [];

    snap.docs.forEach(doc => {
      const d = doc.data();

      const title = (d.title || "").toLowerCase();
      const tags = Array.isArray(d.tags) ? d.tags.join(" ").toLowerCase() : "";
      const contentText = Array.isArray(d.content)
        ? d.content.map(c => c?.data?.text || "").join(" ").toLowerCase()
        : "";

      if (
        title.includes(keyword) ||
        tags.includes(keyword) ||
        contentText.includes(keyword)
      ) {
        results.push({
          id: doc.id,
          title: d.title,
          authorId: d.authorId,
          author: d.author || null,
          views: d.views || 0,
          clapsCount: d.clapsCount || 0,
          responsesCount: d.responsesCount || 0,
          publishedAt: d.publishedAt,
        });
      }
    });

    res.json({ contentBased: results });
  } catch (e) {
    console.error("SEARCH ERROR:", e);
    res.status(500).json({ error: "Search failed" });
  }
};

module.exports = { search };
