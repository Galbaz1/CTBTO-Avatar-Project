# ⚠️ DEPRECATED: Weaviate Advanced Features (V3 Syntax)

**This document is DEPRECATED and contains outdated Weaviate Python Client v3 syntax.**

## 🔴 DO NOT USE THIS DOCUMENT FOR NEW DEVELOPMENT

**Use instead:** `design-patterns/WEAVIATE/weaviate-v4-patterns.md`

**Reason:** This document contains v3 syntax that is incompatible with our current Weaviate Python Client v4 setup.

## What's Wrong With This Document

- Uses deprecated `client.query.get()` syntax
- Uses deprecated `.with_near_text()`, `.with_limit()`, `.do()` chaining
- Code examples will not work with v4 client
- Schema references are outdated

## Migration Path

If you need the concepts from this document:

1. **For advanced query patterns:** See `design-patterns/WEAVIATE/weaviate-v4-patterns.md`
2. **For multi-modal search:** Check v4 `near_image()` examples in the patterns doc
3. **For generative search:** Use v4 `collection.generate.near_text()` syntax
4. **For implementation guidance:** Review `design-patterns/WEAVIATE/learnings.md`

## V4 Quick Migration Reference

| V3 (This Document) | V4 (Use Instead) |
|-------------------|------------------|
| `client.query.get("SnT25_Abstract", ["title"])` | `collection.query.fetch_objects(return_properties=["title"])` |
| `.with_near_text({"concepts": ["query"]})` | `query.near_text(query="query")` |
| `.with_limit(1)` | `limit=1` |
| `.do()` | Not needed |

---

**This file has been renamed to `.deprecated` to prevent accidental usage.**
**Refer to `design-patterns/WEAVIATE/documentation-audit.md` for full migration details.**
