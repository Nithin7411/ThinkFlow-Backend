const mapStory = (doc) => {
  const data = doc.data ? doc.data() : doc;

  return {
    id: doc.id || data.id,
    title: data.title,
    content: typeof data.content === "string"
      ? JSON.parse(data.content)
      : data.content,
    last_modified: data.lastModified || null,
    published_at: data.publishedAt || null,
  };
};

module.exports = mapStory;
