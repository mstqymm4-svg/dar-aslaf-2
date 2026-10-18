/**
 * dataSource — unified data-access facade.
 *
 * Exposes an `entities` object matching Base44's entity interface
 * (list / filter / get / create / update / delete) and returning records
 * in the SAME snake_case shape the app already expects.
 *
 * When INDEPENDENT_API_ENABLED is true, calls are routed to the independent
 * REST API (src/lib/api/*) and results are normalized back to Base44's shape.
 * When false, it delegates to Base44 directly — so the live preview keeps
 * working unchanged until the independent backend is deployed.
 *
 * Auth (base44.auth.*) is intentionally NOT routed here — it stays on Base44
 * until the auth/login UX migration is done separately.
 */
import { base44 } from "@/api/base44Client";
import { INDEPENDENT_API_ENABLED } from "@/lib/api/config";
import { booksApi } from "@/lib/api/booksApi";
import { videosApi } from "@/lib/api/videosApi";
import { videoChannelsApi } from "@/lib/api/videoChannelsApi";
import { socialChannelsApi } from "@/lib/api/socialChannelsApi";
import { favoritesApi } from "@/lib/api/favoritesApi";
import { settingsApi } from "@/lib/api/settingsApi";
import { authorsApi } from "@/lib/api/authorsApi";
import { categoriesApi } from "@/lib/api/categoriesApi";
import { userApi } from "@/lib/api/userApi";
import * as db from "@/lib/offlineDB";

// ─── Mappers: independent-API (camelCase) → app (snake_case) ──────────────────
const userToSnake = (u) => u && {
  id: u.id,
  email: u.email,
  full_name: u.fullName || u.full_name || u.email?.split("@")[0] || "",
  role: (u.role || "user").toLowerCase(),
  avatar_url: u.avatar || u.avatar_url,
  created_date: u.createdAt || u.created_date,
  updated_date: u.updatedAt || u.updated_date,
};
const userToCamel = (p) => {
  const o = {};
  if (p.full_name !== undefined) o.fullName = p.full_name;
  if (p.role !== undefined) o.role = p.role.toUpperCase();
  if (p.avatar_url !== undefined) o.avatar = p.avatar_url;
  return o;
};

const bookToSnake = (b) => b && {
  id: b.id,
  title: b.title,
  author: b.authorName || b.author?.name || b.author || "",
  category: b.categoryName || b.category?.name || b.category || "",
  author_id: b.authorId || null,
  category_id: b.categoryId || null,
  description: b.description,
  cover_image: b.coverImage,
  pages_count: b.pagesCount,
  language: b.language,
  pdf_url: b.pdfUrl,
  is_featured: b.isFeatured,
  rating: b.rating,
  status: b.status,
  created_date: b.createdAt,
  updated_date: b.updatedAt,
  created_by_id: b.createdById || null,
};
const bookToCamel = (p) => {
  const o = {};
  if (p.title !== undefined) o.title = p.title;
  if (p.author !== undefined) o.authorName = p.author;
  if (p.category !== undefined) o.categoryName = p.category;
  if (p.description !== undefined) o.description = p.description;
  if (p.cover_image !== undefined) o.coverImage = p.cover_image;
  if (p.pages_count !== undefined) o.pagesCount = p.pages_count;
  if (p.language !== undefined) o.language = p.language;
  if (p.pdf_url !== undefined) o.pdfUrl = p.pdf_url;
  if (p.is_featured !== undefined) o.isFeatured = p.is_featured;
  if (p.rating !== undefined) o.rating = p.rating;
  if (p.status !== undefined) o.status = p.status;
  return o;
};

const videoToSnake = (v) => v && {
  id: v.id,
  title: v.title,
  description: v.description,
  youtube_url: v.youtubeUrl,
  video_url: v.videoUrl,
  video_type: v.videoType,
  channel_id: v.videoChannelId,
  channel_name: v.channelName,
  category: v.category,
  thumbnail: v.thumbnail,
  duration: v.duration,
  is_featured: v.isFeatured,
  visible: v.visible,
  sort_order: v.sortOrder,
  created_date: v.createdAt,
  updated_date: v.updatedAt,
};
const videoToCamel = (p) => {
  const o = {};
  ["title", "description", "category", "thumbnail", "duration", "visible"].forEach((k) => {
    if (p[k] !== undefined) o[k] = p[k];
  });
  if (p.youtube_url !== undefined) o.youtubeUrl = p.youtube_url;
  if (p.video_url !== undefined) o.videoUrl = p.video_url;
  if (p.video_type !== undefined) o.videoType = p.video_type;
  if (p.channel_id !== undefined) o.videoChannelId = p.channel_id;
  if (p.channel_name !== undefined) o.channelName = p.channel_name;
  if (p.is_featured !== undefined) o.isFeatured = p.is_featured;
  if (p.sort_order !== undefined) o.sortOrder = p.sort_order;
  return o;
};

const vcToSnake = (c) => c && {
  id: c.id,
  name: c.name,
  channel_logo: c.channelLogo,
  description: c.description,
  youtube_url: c.youtubeUrl,
  category: c.category,
  sort_order: c.sortOrder,
  visible: c.visible,
  created_date: c.createdAt,
  updated_date: c.updatedAt,
};
const vcToCamel = (p) => {
  const o = {};
  if (p.name !== undefined) o.name = p.name;
  if (p.channel_logo !== undefined) o.channelLogo = p.channel_logo;
  if (p.description !== undefined) o.description = p.description;
  if (p.youtube_url !== undefined) o.youtubeUrl = p.youtube_url;
  if (p.category !== undefined) o.category = p.category;
  if (p.sort_order !== undefined) o.sortOrder = p.sort_order;
  if (p.visible !== undefined) o.visible = p.visible;
  return o;
};

const scToSnake = (c) => c && {
  id: c.id,
  name: c.name,
  channel_type: c.channelType,
  url: c.url,
  icon_url: c.iconUrl,
  description: c.description,
  sort_order: c.sortOrder,
  visible: c.visible,
  created_date: c.createdAt,
  updated_date: c.updatedAt,
};
const scToCamel = (p) => {
  const o = {};
  if (p.name !== undefined) o.name = p.name;
  if (p.channel_type !== undefined) o.channelType = p.channel_type;
  if (p.url !== undefined) o.url = p.url;
  if (p.icon_url !== undefined) o.iconUrl = p.icon_url;
  if (p.description !== undefined) o.description = p.description;
  if (p.sort_order !== undefined) o.sortOrder = p.sort_order;
  if (p.visible !== undefined) o.visible = p.visible;
  return o;
};

const setToSnake = (s) => s && {
  id: s.key,
  setting_key: s.key,
  setting_value: s.value,
  setting_type: s.type,
  description: s.description,
  changed_by: s.changedBy,
  previous_value: s.previousValue,
  created_date: s.createdAt,
  updated_date: s.updatedAt,
};
const setToCamel = (p) => {
  const o = {};
  if (p.setting_key !== undefined) o.key = p.setting_key;
  if (p.setting_value !== undefined) o.value = p.setting_value;
  if (p.setting_type !== undefined) o.type = p.setting_type;
  if (p.description !== undefined) o.description = p.description;
  if (p.changed_by !== undefined) o.changedBy = p.changed_by;
  if (p.previous_value !== undefined) o.previousValue = p.previous_value;
  return o;
};

// Favorites are represented with id == bookId so delete(id) maps to the
// by-bookId delete endpoint on the independent backend.
const favToSnake = (f) => f && {
  id: f.bookId || f.id,
  book_id: f.bookId || f.id,
  user_email: f.userEmail || "",
  created_date: f.createdAt,
};

const authorToSnake = (a) => a && {
  id: a.id, name: a.name, bio: a.bio, image: a.image,
  created_date: a.createdAt, updated_date: a.updatedAt,
};
const authorToCamel = (p) => {
  const o = {};
  if (p.name !== undefined) o.name = p.name;
  if (p.bio !== undefined) o.bio = p.bio;
  if (p.image !== undefined) o.image = p.image;
  return o;
};

const catToSnake = (c) => c && {
  id: c.id, name: c.name, slug: c.slug, description: c.description,
  sort_order: c.sortOrder, created_date: c.createdAt, updated_date: c.updatedAt,
};
const catToCamel = (p) => {
  const o = {};
  if (p.name !== undefined) o.name = p.name;
  if (p.slug !== undefined) o.slug = p.slug;
  if (p.description !== undefined) o.description = p.description;
  if (p.sort_order !== undefined) o.sortOrder = p.sort_order;
  return o;
};

// ─── Independent-API adapters ──────────────────────────────────────────────────
const independent = {
  Book: {
    list: async (_sort, limit) => {
      try {
        const res = await booksApi.list({ limit: limit || 1000 });
        const list = (res.data || []).map(bookToSnake);
        if (list.length > 0) db.cacheBooks(list).catch(() => {});
        return list;
      } catch (e) {
        return db.getCachedBooks();
      }
    },
    filter: async (q) => {
      if (q && q.id) {
        try { return [bookToSnake(await booksApi.get(q.id))]; } catch {
          const cached = await db.getCachedBook(q.id);
          return cached ? [cached] : [];
        }
      }
      try {
        const query = { limit: 1000 };
        if (q) {
          if (q.is_featured) query.isFeatured = true;
          if (q.status) query.status = q.status;
          if (q.language) query.language = q.language;
          if (q.category) query.search = q.category;
        }
        const res = await booksApi.list(query);
        return (res.data || []).map(bookToSnake);
      } catch (e) {
        return db.getCachedBooks();
      }
    },
    get: async (id) => {
      try {
        return bookToSnake(await booksApi.get(id));
      } catch {
        return db.getCachedBook(id);
      }
    },
    create: async (p) => {
      try {
        const created = bookToSnake(await booksApi.create(bookToCamel(p)));
        if (created) db.cacheBooks([created]).catch(() => {});
        return created;
      } catch (e) {
        const localId = "book_" + Date.now();
        const fallback = { ...p, id: localId, created_date: new Date().toISOString() };
        await db.cacheBooks([fallback]);
        return fallback;
      }
    },
    update: async (id, p) => {
      try {
        const updated = bookToSnake(await booksApi.update(id, bookToCamel(p)));
        if (updated) db.cacheBooks([updated]).catch(() => {});
        return updated;
      } catch (e) {
        const fallback = { ...p, id, updated_date: new Date().toISOString() };
        await db.cacheBooks([fallback]);
        return fallback;
      }
    },
    delete: async (id) => {
      try { await booksApi.remove(id); } catch {}
      await db.deleteCachedBook(id).catch(() => {});
      return { ok: true };
    },
  },

  Video: {
    list: async (_sort, limit) => {
      try {
        const res = await videosApi.list({ limit: limit || 1000 });
        const list = (res.data || []).map(videoToSnake);
        if (list.length > 0) db.cacheVideos(list).catch(() => {});
        return list;
      } catch (e) {
        return db.getCachedVideos();
      }
    },
    filter: async (q) => {
      try {
        const query = { limit: 1000 };
        if (q) {
          if (q.visible !== undefined) query.visible = q.visible;
          if (q.is_featured) query.isFeatured = true;
          if (q.category) query.category = q.category;
          if (q.video_type) query.videoType = q.video_type;
        }
        const res = await videosApi.list(query);
        return (res.data || []).map(videoToSnake);
      } catch (e) {
        return db.getCachedVideos();
      }
    },
    get: async (id) => {
      try { return videoToSnake(await videosApi.get(id)); }
      catch { return (await db.getCachedVideos()).find(v => v.id === id); }
    },
    create: async (p) => {
      try {
        const created = videoToSnake(await videosApi.create(videoToCamel(p)));
        if (created) db.cacheVideos([created]).catch(() => {});
        return created;
      } catch (e) {
        const localId = "video_" + Date.now();
        const fallback = { ...p, id: localId, created_date: new Date().toISOString() };
        await db.cacheVideos([fallback]);
        return fallback;
      }
    },
    update: async (id, p) => {
      try {
        const updated = videoToSnake(await videosApi.update(id, videoToCamel(p)));
        if (updated) db.cacheVideos([updated]).catch(() => {});
        return updated;
      } catch (e) {
        const fallback = { ...p, id, updated_date: new Date().toISOString() };
        await db.cacheVideos([fallback]);
        return fallback;
      }
    },
    delete: async (id) => {
      try { await videosApi.remove(id); } catch {}
      await db.deleteCachedVideo(id).catch(() => {});
      return { ok: true };
    },
  },

  VideoChannel: {
    list: async (_sort, limit) => {
      try {
        const res = await videoChannelsApi.list({ limit: limit || 1000 });
        const list = (res.data || []).map(vcToSnake);
        if (list.length > 0) db.cacheVideoChannels(list).catch(() => {});
        return list;
      } catch (e) {
        return db.getCachedVideoChannels();
      }
    },
    filter: async (q) => {
      try {
        const query = { limit: 1000 };
        if (q && q.visible !== undefined) query.visible = q.visible;
        const res = await videoChannelsApi.list(query);
        return (res.data || []).map(vcToSnake);
      } catch (e) {
        return db.getCachedVideoChannels();
      }
    },
    get: async (id) => {
      try { return vcToSnake(await videoChannelsApi.get(id)); }
      catch { return (await db.getCachedVideoChannels()).find(c => c.id === id); }
    },
    create: async (p) => {
      try {
        const created = vcToSnake(await videoChannelsApi.create(vcToCamel(p)));
        if (created) db.cacheVideoChannels([created]).catch(() => {});
        return created;
      } catch (e) {
        const localId = "channel_" + Date.now();
        const fallback = { ...p, id: localId, created_date: new Date().toISOString() };
        await db.cacheVideoChannels([fallback]);
        return fallback;
      }
    },
    update: async (id, p) => {
      try {
        const updated = vcToSnake(await videoChannelsApi.update(id, vcToCamel(p)));
        if (updated) db.cacheVideoChannels([updated]).catch(() => {});
        return updated;
      } catch (e) {
        const fallback = { ...p, id, updated_date: new Date().toISOString() };
        await db.cacheVideoChannels([fallback]);
        return fallback;
      }
    },
    delete: async (id) => {
      try { await videoChannelsApi.remove(id); } catch {}
      await db.deleteCachedVideoChannel(id).catch(() => {});
      return { ok: true };
    },
  },

  SocialChannel: {
    list: async (_sort, limit) => {
      const res = await socialChannelsApi.list({ limit: limit || 1000 });
      return (res.data || []).map(scToSnake);
    },
    filter: async (q) => {
      const query = { limit: 1000 };
      if (q && q.visible !== undefined) query.visible = q.visible;
      const res = await socialChannelsApi.list(query);
      return (res.data || []).map(scToSnake);
    },
    get: async (id) => scToSnake(await socialChannelsApi.get(id)),
    create: async (p) => scToSnake(await socialChannelsApi.create(scToCamel(p))),
    update: async (id, p) => scToSnake(await socialChannelsApi.update(id, scToCamel(p))),
    delete: (id) => socialChannelsApi.remove(id),
  },

  AppSettings: {
    list: async () => {
      const map = await settingsApi.all();
      return Object.entries(map || {}).map(([k, v]) => setToSnake({ key: k, ...v }));
    },
    filter: async (q) => {
      if (q && q.setting_key) {
        try { return [setToSnake(await settingsApi.get(q.setting_key))]; } catch { return []; }
      }
      return independent.AppSettings.list();
    },
    get: async (key) => setToSnake(await settingsApi.get(key)),
    create: async (p) => setToSnake(await settingsApi.upsert(setToCamel(p))),
    update: async (key, p) => setToSnake(await settingsApi.upsert({ ...setToCamel(p), key })),
    delete: (key) => settingsApi.remove(key),
  },

  Favorite: {
    list: async () => (await favoritesApi.list()).map(favToSnake),
    filter: async (q) => {
      const all = (await favoritesApi.list()).map(favToSnake);
      if (q && q.book_id) return all.filter((f) => f.book_id === q.book_id);
      return all;
    },
    get: async (bookId) => favToSnake((await favoritesApi.list()).find((f) => f.bookId === bookId)),
    create: async (p) => favToSnake(await favoritesApi.add(p.book_id)),
    update: async () => { /* favorites are toggled, not edited */ },
    delete: (bookId) => favoritesApi.remove(bookId),
  },

  Author: {
    list: async (_sort, limit) => {
      const res = await authorsApi.list({ limit: limit || 1000 });
      return (res.data || []).map(authorToSnake);
    },
    filter: async (q) => {
      const query = { limit: 1000 };
      if (q && q.name) query.search = q.name;
      const res = await authorsApi.list(query);
      return (res.data || []).map(authorToSnake);
    },
    get: async (id) => authorToSnake(await authorsApi.get(id)),
    create: async (p) => authorToSnake(await authorsApi.create(authorToCamel(p))),
    update: async (id, p) => authorToSnake(await authorsApi.update(id, authorToCamel(p))),
    delete: (id) => authorsApi.remove(id),
  },

  Category: {
    list: async (_sort, limit) => {
      const res = await categoriesApi.list({ limit: limit || 1000 });
      return (res.data || []).map(catToSnake);
    },
    filter: async (q) => {
      const query = { limit: 1000 };
      if (q && q.name) query.search = q.name;
      const res = await categoriesApi.list(query);
      return (res.data || []).map(catToSnake);
    },
    get: async (id) => catToSnake(await categoriesApi.get(id)),
    create: async (p) => catToSnake(await categoriesApi.create(catToCamel(p))),
    update: async (id, p) => catToSnake(await categoriesApi.update(id, catToCamel(p))),
    delete: (id) => categoriesApi.remove(id),
  },

  AccountData: {
    filter: async (q) => {
      if (!q?.account_email) return [];
      try {
        const key = `acc_data_${q.account_email}`;
        const val = await settingsApi.get(key);
        return val ? [{ id: key, account_email: q.account_email, data: val.value }] : [];
      } catch {
        const local = localStorage.getItem(`dau_cloud_data_${q.account_email}`);
        return local ? [{ id: q.account_email, account_email: q.account_email, data: local }] : [];
      }
    },
    create: async (p) => {
      try {
        const key = `acc_data_${p.account_email}`;
        await settingsApi.upsert({ key, value: p.data, type: "json" });
      } catch {
        localStorage.setItem(`dau_cloud_data_${p.account_email}`, p.data);
      }
      return p;
    },
    update: async (id, p) => {
      try {
        await settingsApi.upsert({ key: id, value: p.data, type: "json" });
      } catch {
        localStorage.setItem(`dau_cloud_data_${id}`, p.data);
      }
      return p;
    },
  },

  User: {
    list: async (_sort, limit) => {
      try {
        const res = await userApi.list({ limit: limit || 100 });
        return (res.data || []).map(userToSnake);
      } catch {
        const localEmail = localStorage.getItem("dau_account_email") || "admin@dar-al-uloom.com";
        return [{
          id: "u_local_admin",
          email: localEmail,
          full_name: localEmail.split("@")[0],
          role: "admin",
          created_date: new Date().toISOString()
        }];
      }
    },
    filter: async (q) => {
      try {
        const query = { limit: 100 };
        if (q?.email) query.search = q.email;
        const res = await userApi.list(query);
        return (res.data || []).map(userToSnake);
      } catch {
        return [];
      }
    },
    get: async () => {
      try {
        return userToSnake(await userApi.me());
      } catch {
        return null;
      }
    },
    update: async (id, p) => {
      try {
        return userToSnake(await userApi.update(id, userToCamel(p)));
      } catch {
        return { id, ...p };
      }
    },
    delete: async (id) => {
      try {
        return await userApi.remove(id);
      } catch {
        return { ok: true };
      }
    },
  },
};


// When the flag is off, delegate to Base44 unchanged (preserves live preview).
export const entities = INDEPENDENT_API_ENABLED ? independent : base44.entities;

export { INDEPENDENT_API_ENABLED };