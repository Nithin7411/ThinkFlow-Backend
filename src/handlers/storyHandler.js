const { nanoid } = require("nanoid");

/* ========= DRAFT ========= */

const updateStory = async (req, res) => {
  try {
    const { storyId, title, content } = req.body;
    const userId = req.session.userId;

    const result = await req.app.locals.db.saveDraft({
      storyId,
      title,
      content,
      userId,
    });

    res.json(result);
  } catch (e) {
    res.status(500).json({ error: "Failed to save draft" });
  }
};

const getDraft = async (req, res) => {
  try {
    const draft = await req.app.locals.db.getDraftById(
      req.params.draftId,
      req.session.userId
    );
    res.json({ draft });
  } catch {
    res.status(404).json({ error: "Draft not found" });
  }
};

const deleteDraft = async (req, res) => {
  try {
    await req.app.locals.db.deleteDraft(
      req.body.draftId,
      req.session.userId
    );
    res.json({ status: "deleted" });
  } catch {
    res.status(404).json({ error: "Draft not found" });
  }
};

/* ========= STORY ========= */

const getStory = async (req, res) => {
  try {
    const { storyId } = req.params;
    const userId = req.session.userId;
    const db = req.app.locals.db.db;

    const storyRef = db.collection("stories").doc(storyId);
    const snap = await storyRef.get();

    if (!snap.exists || !snap.data().isPublished) {
      return res.status(404).json({ error: "Story not found" });
    }

    const data = snap.data();

    const tags = Array.isArray(data.tags)
      ? data.tags
      : typeof data.tags === "string"
      ? data.tags.split(",").filter(Boolean)
      : [];

    // 👁️ views (once per user)
    if (userId) {
      const viewRef = storyRef.collection("views").doc(userId);
      const viewSnap = await viewRef.get();
      if (!viewSnap.exists) {
        await viewRef.set({ viewedAt: new Date() });
        await storyRef.update({ views: (data.views || 0) + 1 });
        data.views = (data.views || 0) + 1;
      }
    }

    // 👏 clap state
    let isClapped = false;
    if (userId) {
      const clapSnap = await storyRef.collection("claps").doc(userId).get();
      isClapped = clapSnap.exists;
    }

    // ✅ OLD RESPONSE + NEW FIELDS ADDED
    res.json({
      story: {
        id: snap.id,
        title: data.title,
        content: data.content,

        // 🆕 ADDED (without breaking anything)
        authorId: data.authorId,
        author: data.author || null,

        tags,
        publishedAt: data.publishedAt,
        views: data.views || 0,
        responsesCount: data.responsesCount || 0,
        clapsCount: data.clapsCount || 0,
        isClapped,
      },
    });
  } catch (e) {
    console.error("GET STORY ERROR:", e);
    res.status(500).json({ error: "Failed to load story" });
  }
};


/* ========= PUBLISH ========= */

const publish = async (req, res) => {
  try {
    const result = await req.app.locals.db.publishStory(
      req.params.storyId,
      req.session.userId,
      req.body.tags
    );
    res.json(result);
  } catch {
    res.status(400).json({ error: "Publish failed" });
  }
};

/* ========= RESPONSES ========= */

const getStoryResponses = async (req, res) => {
  try {
    const db = req.app.locals.db.db;
    const snap = await db
      .collection("stories")
      .doc(req.params.storyId)
      .collection("responses")
      .orderBy("createdAt", "desc")
      .get();

    res.json({
      responses: snap.docs.map(d => ({ id: d.id, ...d.data() })),
    });
  } catch {
    res.status(500).json({ error: "Failed to load responses" });
  }
};

const addResponse = async (req, res) => {
  try {
    const { response } = req.body;
    const userId = req.session.userId;
    const db = req.app.locals.db.db;

    if (!response.trim()) {
      return res.status(400).json({ error: "Response required" });
    }

    const storyRef = db.collection("stories").doc(req.params.storyId);
    const snap = await storyRef.get();

    if (!snap.exists || !snap.data().isPublished) {
      return res.status(404).json({ error: "Story not found" });
    }

    const batch = db.batch();

    batch.set(storyRef.collection("responses").doc(), {
      userId,
      response,
      createdAt: new Date(),
    });

    batch.update(storyRef, {
      responsesCount: (snap.data().responsesCount || 0) + 1,
    });

    await batch.commit();

    res.json({ status: "Response added" });
  } catch {
    res.status(500).json({ error: "Failed to add response" });
  }
};

/* ========= CLAP ========= */

const clap = async (req, res) => {
  try {
    const userId = req.session.userId;
    const db = req.app.locals.db.db;

    const storyRef = db.collection("stories").doc(req.params.storyId);
    const clapRef = storyRef.collection("claps").doc(userId);

    const [storySnap, clapSnap] = await Promise.all([
      storyRef.get(),
      clapRef.get(),
    ]);

    if (!storySnap.exists || !storySnap.data().isPublished) {
      return res.status(404).json({ error: "Story not found" });
    }

    if (clapSnap.exists) {
      return res.json({
        clapsCount: storySnap.data().clapsCount,
        isClapped: true,
      });
    }

    const batch = db.batch();
    batch.set(clapRef, { clappedAt: new Date() });
    batch.update(storyRef, {
      clapsCount: (storySnap.data().clapsCount || 0) + 1,
    });

    await batch.commit();

    res.json({
      clapsCount: (storySnap.data().clapsCount || 0) + 1,
      isClapped: true,
    });
  } catch {
    res.status(500).json({ error: "Failed to clap" });
  }
};

module.exports = {
  updateStory,
  getDraft,
  deleteDraft,
  getStory,
  publish,
  getStoryResponses,
  addResponse,
  clap,
};
