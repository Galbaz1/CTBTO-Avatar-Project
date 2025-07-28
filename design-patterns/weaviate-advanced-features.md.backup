# Weaviate Advanced Features: Multi-Modal and Generative Search

This document summarizes advanced Weaviate features that are critical for building a highly intelligent RAG system for the SnT2025 conference.

## 1. Multi-Modal Search

Weaviate's multi-modal capabilities allow us to search across different types of data (text, images, etc.) in a single query. This is a game-changer for our agent's reasoning abilities.

### Key Concepts:

-   **Vectorizers like CLIP**: Models like CLIP (`multi2vec-clip`) can create embeddings for both text and images in the same vector space. This means we can search for an image using a text description, or find text based on an image query.
-   **`nearImage` and `nearText`**: These are the core GraphQL operators for multi-modal search. We can provide an image (as a base64 string) to `nearImage` to find similar images or related text.

### Example: Finding a Presentation from a Slide Image

```python
# User takes a picture of a slide with a graph on it
# We can use that image to find the session it belongs to

response = (
    client.query
    .get("SnT25_Abstract", ["title", "content"])
    .with_near_image({"image": "base64_encoded_slide_image.jpg"})
    .with_limit(1)
    .do()
)
```

## 2. Generative Search

Weaviate can integrate directly with generative models (like Cohere, OpenAI) to not just retrieve data, but to generate new content based on that data.

### Key Concepts:

-   **`with_generate()`**: This is the key method in a Weaviate query that triggers the generative model.
-   **Single Prompt vs. Grouped Task**:
    -   `single_prompt`: Applies a prompt to each individual search result. (e.g., "Summarize this abstract: {content}")
    -   `grouped_task`: Applies one prompt to the entire set of search results. (e.g., "Based on these sessions, what is Dr. Smith's main area of research?")

### Example: Generating a Speaker's Bio on the Fly

```python
generate_prompt = "Based on the following session abstracts, write a short professional bio for the speaker: {content}"

response = (
    client.query
    .get("SnT25_Abstract", ["content"])
    .with_near_text({"concepts": ["Dr. Jane Smith"]})
    .with_generate(single_prompt=generate_prompt)
    .with_limit(3)
    .do()
)
```

## 3. Hybrid Search and Parallel Lookups

Weaviate's hybrid search combines traditional keyword (BM25) search with vector search. This is crucial for queries that involve specific names or terms.

-   **`alpha` parameter**: Controls the balance between keyword and vector search.
-   **Parallel Lookups**: We can simulate parallel lookups by sending multiple, independent queries to Weaviate concurrently using Python's `asyncio` or a similar library. This will be essential for complex questions that require information from multiple collections at once.

## 4. Named Vectors

We can store multiple, distinct vectors for a single data object. This is incredibly powerful for providing different "views" of the data.

### Example: A `Session` Object with Multiple Vectors

A single `SnT25_Session` object could have:
-   A `title_vector` based on its title and abstract.
-   A `speaker_vector` based on the aggregated bios of its speakers.
-   A `venue_vector` based on the location's description.

This allows us to ask more nuanced questions, like "Find sessions in the main hall that are similar to Dr. Smith's work."

By leveraging these advanced features, we can build a RAG system that goes far beyond simple keyword search and provides truly intelligent, context-aware responses. 