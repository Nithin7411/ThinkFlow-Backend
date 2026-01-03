const { db } = require("./database");
const { nanoid } = require("nanoid");

class FirestoreDatabase {
  constructor() {
    this.db = db;
  }


async upsertUser({ uid, name, email, avatar_url, provider }) {
  const ref = this.db.collection("users").doc(uid);
  const snap = await ref.get();

  if (snap.exists) {
    const updated = {
      lastLoginAt: new Date(),
      provider: provider || snap.data().provider,
    };

    await ref.update(updated);

    return { ...snap.data(), ...updated, uid };
  }

  const user = {
    uid,
    name,
    email,
    avatar_url,
    provider,
    createdAt: new Date(),
    lastLoginAt: new Date(),
  };

  await ref.set(user);
  return user;
}


  async saveDraft({ storyId, title, content, userId }) {
    if (!storyId) storyId = nanoid();

    const ref = this.db.collection("stories").doc(storyId);
    const snap = await ref.get();

    if (!snap.exists) {
      await ref.set({
        id: storyId,
        authorId: userId,
        title,
        content,
        isPublished: false,
        createdAt: new Date(),
        lastModified: new Date(),
      });
    } else {
      const story = snap.data();
      if (story.authorId !== userId || story.isPublished) {
        throw new Error("Unauthorized");
      }

      await ref.update({
        title,
        content,
        lastModified: new Date(),
      });
    }

    return { status: "Draft saved", storyId };
  }

  async getDraftById(draftId, userId) {
    const snap = await this.db.collection("stories").doc(draftId).get();
    if (!snap.exists) throw new Error("Not found");

    const story = snap.data();
    if (story.authorId !== userId || story.isPublished) {
      throw new Error("Unauthorized");
    }

    return { id: snap.id, ...story };
  }

  async deleteDraft(draftId, userId) {
    const ref = this.db.collection("stories").doc(draftId);
    const snap = await ref.get();

    if (!snap.exists) throw new Error("Not found");
    const story = snap.data();

    if (story.authorId !== userId || story.isPublished) {
      throw new Error("Unauthorized");
    }

    await ref.delete();
  }

async publishStory(storyId, userId, tags = []) {
  const storyRef = this.db.collection("stories").doc(storyId);
  const userRef = this.db.collection("users").doc(userId);

  const [storySnap, userSnap] = await Promise.all([
    storyRef.get(),
    userRef.get(),
  ]);

  if (!storySnap.exists) {
    throw new Error("Story not found");
  }

  if (!userSnap.exists) {
    throw new Error("User not found");
  }

  const story = storySnap.data();
  if (story.authorId !== userId || story.isPublished) {
    throw new Error("Unauthorized");
  }

  const user = userSnap.data();

  await storyRef.update({
    isPublished: true,
    tags: Array.isArray(tags) ? tags : [],
    publishedAt: new Date(),

    author: {
      id: userId,
      name: user.name || user.username || "Unknown",
      avatar_url: user.avatar_url || null,
    },

    views: 0,
    clapsCount: 0,
    responsesCount: 0,
  });

  return { status: "Published", storyId };
}


  async getUserDrafts(userId) {
    const snap = await this.db
      .collection("stories")
      .where("authorId", "==", userId)
      .where("isPublished", "==", false)
      .orderBy("lastModified", "desc")
      .get();

    return snap.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
  }

  async getUserPublishedStories(userId) {
    const snap = await this.db
      .collection("stories")
      .where("authorId", "==", userId)
      .where("isPublished", "==", true)
      .orderBy("publishedAt", "desc")
      .get();

    return snap.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
  }

async getUserDetails(userId) {
  const ref = this.db.collection("users").doc(userId);
  const snap = await ref.get();

  if (!snap.exists) {
    throw new Error("User not found");
  }

  return {
    id: snap.id,
    ...snap.data(),
  };
}

async followAuthor(followerId, authorId) {
  if (followerId === authorId) {
    throw new Error("Cannot follow yourself");
  }

  const ref = this.db
    .collection("followers")
    .doc(`${authorId}_${followerId}`);

  const snap = await ref.get();
  if (snap.exists) {
    throw new Error("Already following");
  }

  await ref.set({
    authorId,
    followerId,
    createdAt: new Date(),
  });
}

async unFollowAuthor(followerId, authorId) {
  const ref = this.db
    .collection("followers")
    .doc(`${authorId}_${followerId}`);

  await ref.delete();
}

async getPublicDashboard(limit = 20) {
  const snap = await this.db
    .collection("stories")
    .where("isPublished", "==", true)
    .orderBy("views", "desc")
    .limit(limit)
    .get();

  const stories = snap.docs.map(doc => {
    const d = doc.data();

    const views = d.views || 0;
    const claps = d.clapsCount || 0;
    const responses = d.responsesCount || 0;

    return {
      id: doc.id,
      title: d.title,
      authorId: d.authorId,
      author: d.author || null,

      views,
      clapsCount: claps,
      responsesCount: responses,
      publishedAt: d.publishedAt,
      score: views * 1 + claps * 3 + responses * 2,
    };
  });

  stories.sort((a, b) => b.score - a.score);
  return stories;
}



async getPersonalDashboard(userId, limit = 20) {
  const snap = await this.db
    .collection("users")
    .doc(userId)
    .collection("dashboard")
    .orderBy("rank", "asc")
    .limit(limit)
    .get();

  return snap.docs.map(doc => {
    const d = doc.data();
    return {
      id: doc.id,
      ...d,

      authorId: d.authorId || d.author?.id || null,
      author: d.author || null,
    };
  });
}



async getDashboard(userId) {
  if (!userId) {
    return {
      type: "public",
      stories: await this.getPublicDashboard(),
    };
  }

  const personal = await this.getPersonalDashboard(userId);

  if (personal.length === 0) {
    return {
      type: "personal",
      stories: await this.getPublicDashboard(),
    };
  }

  return {
    type: "personal",
    stories: personal,
  };
}



 
}

module.exports = FirestoreDatabase;
