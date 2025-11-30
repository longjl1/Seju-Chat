# Seju — Intelligent RAG Chat System

- ![image]({https://github.com/longjl1/Seju-Chat/blob/main/app/src/demo.png})

**Search, Embed, Join, Unify**

An intelligent document Q&A system built on LangChain + Gemini + MongoDB Atlas + Next.js

Seju Chat is a smart conversational system based on **Next.js App Router + LangChain + Gemini + MongoDB Atlas Vector Search**.

## Core Features

- AI Chat with streaming responses
- Document upload support: PDF / TXT / DOCX / CSV / JSON / JSONL
- Automatic document chunking and embedding (Gemini text-embedding-004)
- MongoDB Atlas vector retrieval
- RAG (Retrieval Augmented Generation)
- Gemini Agent with LangChain Tool (rag_query)
- Document management (upload, delete, rebuild vector store)

## Use Cases

- Enterprise internal knowledge base assistant
- Intelligent customer service system
- AI document Q&A product
- RAG / LLM application prototype

---

## About This Project

### Frontend
- ![image]({https://img.shields.io/badge/next%20js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white})
- ![image]({https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB})

### Backend
- ![image]({https://img.shields.io/badge/langchain-1C3C3C?style=for-the-badge&logo=langchain&logoColor=white})
- ![image]({https://img.shields.io/badge/Google%20Gemini-8E75B2?style=for-the-badge&logo=googlegemini&logoColor=white})
- ![image]({https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white})

### We Support
- Streaming chat (ReadableStream)
- Document parsing (PDF/TXT/DOCX/CSV/JSON)
- RecursiveCharacterTextSplitter
- Automatic vectorization and database storage
- Agent-driven RAG tool invocation
- Document management interface

---

## Project Structure
```
seju/
├── app/
│   ├── api/
│   │   ├── chat/route.ts                    # Chat API (streaming)
│   │   ├── docs/upload/route.ts             # Document upload
│   │   ├── docs/delete/route.ts             # Document deletion
│   │   ├── rag/search/route.ts              # Document retrieval
│   │   └── rag/index/route.ts               # Rebuild vector store
│   ├── page.tsx                              # Main chat interface
│   └── docs/page.tsx                         # Document management page
│
├── lib/
│   ├── llm/agent.ts                          # Gemini Agent
│   ├── llm/agentStream.ts                    # Streaming wrapper
│   ├── rag/embeddings.ts                     # Embedding model
│   ├── rag/files.ts                          # File loader (PDF/TXT/DOCX)
│   ├── rag/retrieve.ts                       # Retrieval logic
│   ├── rag/vectorStore.ts                    # Vector store configuration
│   ├── tools/ragQueryTool.ts                 # Agent RAG tool
│   └── db/mongo.ts                           # MongoDB connection manager
│
├── public/                                    # Static assets
├── docs/                                      # Uploaded documents storage
├── package.json
├── tsconfig.json
├── next.config.js
├── .env.example
└── README.md
```

---

## Environment Variables

Create a `.env.local` file in the project root directory:
```env
GOOGLE_API_KEY=your_google_api_key_here
MONGODB_ATLAS_URI=your_mongodb_connection_string
MONGODB_ATLAS_DB_NAME=seju_db
MONGODB_ATLAS_COLLECTION_NAME=vectors
MONGODB_ATLAS_DOCS_COLLECTION_NAME=docs
MONGODB_VECTOR_INDEX_NAME=rag_vector_index
```

Keep `.env.example` as a template reference.

---

## Installation and Setup

### 1. Clone the Repository
```bash
git clone https://github.com/yourname/seju.git
cd seju
```

### 2. Install Dependencies
```bash
npm install
# or
yarn install
```

### 3. Configure Environment Variables
```bash
cp .env.example .env.local
```

Edit `.env.local` and fill in your API keys and database configuration.

### 4. Start Development Server
```bash
npm run dev
```

Access the application at:
```
http://localhost:3000
```

---

## Feature Details

### 1. AI Chat (Streaming)

The `/api/chat` endpoint uses Gemini Agent to provide streaming responses.

**Key capabilities:**
- Real-time streaming output
- Context-aware responses
- Automatic RAG tool invocation when needed

### 2. Document Upload

Supports multiple document uploads with automatic processing:

- Save files to `/docs` directory
- Parse content based on file type
- Split documents into chunks (chunkSize=800)
- Generate embeddings using Gemini text-embedding-004
- Store vectors in MongoDB Atlas collection

**API Endpoint:**
```
POST /api/docs/upload
```

**Supported formats:** PDF, TXT, DOCX, CSV, JSON, JSONL

### 3. Document Deletion

Deletes specified documents and cleans up all associated data:

- Remove file from disk
- Delete record from docs collection
- Remove corresponding vectors from vectors collection

**API Endpoint:**
```
POST /api/docs/delete
```

**Request body:**
```json
{
  "filename": "document.pdf"
}
```

### 4. RAG Document Retrieval

Retrieves the most relevant document chunks based on semantic similarity.

**API Endpoint:**
```
POST /api/rag/search
```

**Request example:**
```json
{
  "query": "What is a black hole?",
  "k": 5
}
```

**Response:**

Returns top-k most similar document chunks with metadata.

### 5. Gemini Agent Tool: rag_query

The Agent automatically invokes the RAG tool when encountering document-related queries:
```typescript
rag_query(question: string)
```

**Workflow:**
1. User asks a question
2. Agent determines if document retrieval is needed
3. Invokes `rag_query` tool with the question
4. Retrieves relevant document chunks
5. Generates answer based on retrieved context

### 6. Vector Store Rebuild

Rebuild the entire vector store from uploaded documents:

**API Endpoint:**
```
POST /api/rag/index
```

This is useful when:
- Changing embedding models
- Updating chunk size parameters
- Recovering from data corruption

---

## MongoDB Atlas Setup

### 1. Create Vector Search Index

In MongoDB Atlas, create a vector search index with the following configuration:
```json
{
  "fields": [
    {
      "type": "vector",
      "path": "embedding",
      "numDimensions": 768,
      "similarity": "cosine"
    },
    {
      "type": "filter",
      "path": "metadata"
    }
  ]
}
```

### 2. Index Name

Make sure the index name matches your environment variable:
```
MONGODB_VECTOR_INDEX_NAME=rag_vector_index
```

---

## API Reference

### Chat API
```
POST /api/chat
Content-Type: application/json

{
  "messages": [
    {"role": "user", "content": "What is quantum computing?"}
  ]
}
```

**Response:** Server-Sent Events (SSE) stream

### Upload Documents
```
POST /api/docs/upload
Content-Type: multipart/form-data

files: File[]
```

**Response:**
```json
{
  "success": true,
  "message": "3 documents uploaded successfully",
  "files": ["doc1.pdf", "doc2.txt", "doc3.docx"]
}
```

### Delete Document
```
POST /api/docs/delete
Content-Type: application/json

{
  "filename": "document.pdf"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Document deleted successfully"
}
```

### Search Documents
```
POST /api/rag/search
Content-Type: application/json

{
  "query": "machine learning algorithms",
  "k": 5
}
```

**Response:**
```json
{
  "results": [
    {
      "content": "Machine learning is a subset of artificial intelligence...",
      "metadata": {
        "source": "ml_guide.pdf",
        "page": 3
      },
      "score": 0.92
    }
  ]
}
```

---

## Development Guide

### Adding Custom Document Loaders

Create a new loader in `lib/rag/files.ts`:
```typescript
export async function loadCustomFormat(filePath: string) {
  // Your custom parsing logic
  return documents;
}
```

### Customizing Chunk Size

Modify the splitter configuration in `lib/rag/files.ts`:
```typescript
const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: 800,      // Adjust as needed
  chunkOverlap: 200,   // Overlap between chunks
});
```

### Adding New Agent Tools

Create a new tool in `lib/tools/`:
```typescript
import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";

export const myCustomTool = new DynamicStructuredTool({
  name: "my_custom_tool",
  description: "Description of what this tool does",
  schema: z.object({
    param: z.string().describe("Parameter description"),
  }),
  func: async ({ param }) => {
    // Tool implementation
    return result;
  },
});
```

Register the tool in `lib/llm/agent.ts`:
```typescript
const tools = [ragQueryTool, myCustomTool];
```

---

## Performance Optimization

### Vector Search Optimization

- Use appropriate `numDimensions` for your embedding model
- Choose the right similarity metric (cosine, euclidean, dotProduct)
- Index frequently queried metadata fields

### Embedding Caching

Consider implementing embedding caching for frequently queried documents:
```typescript
// Example caching strategy
const embeddingCache = new Map();

async function getCachedEmbedding(text: string) {
  if (embeddingCache.has(text)) {
    return embeddingCache.get(text);
  }
  const embedding = await generateEmbedding(text);
  embeddingCache.set(text, embedding);
  return embedding;
}
```

### Chunk Size Tuning

Optimal chunk size depends on your use case:

- **Smaller chunks (400-600):** More precise retrieval, better for factual queries
- **Larger chunks (1000-1500):** Better context, suitable for narrative content

---

## Troubleshooting

### Common Issues

**Issue: Vector search returns no results**

- Verify vector index is created in MongoDB Atlas
- Check embedding dimensions match (768 for text-embedding-004)
- Ensure documents are properly indexed

**Issue: Streaming responses are slow**

- Check Gemini API rate limits
- Optimize document retrieval (reduce k value)
- Consider caching frequently accessed documents

**Issue: Document upload fails**

- Verify file size limits
- Check file format support
- Ensure `/docs` directory has write permissions

### Debug Mode

Enable debug logging by adding to `.env.local`:
```env
DEBUG=true
LOG_LEVEL=verbose
```


## Roadmap

- [ ] Support for more document formats (PPTX, XLSX)
- [ ] Multi-language support
- [ ] Advanced document metadata filtering
- [ ] User authentication and access control
- [ ] Conversation history management
- [ ] Export chat history
- [ ] Integration with other LLM providers
- [ ] Performance monitoring dashboard

---

## Contributing

Contributions are welcome! 

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## Acknowledgments

- [LangChain](https://langchain.com/) for the agent framework
- [Google Gemini](https://deepmind.google/technologies/gemini/) for LLM and embeddings
- [MongoDB Atlas](https://www.mongodb.com/atlas) for vector search capabilities
- [Next.js](https://nextjs.org/) for the application framework

---

## Contact

For questions or feedback, please:

- Open an issue on GitHub
- Contact: >.<#3
- Project Link: [https://github.com/longjl1/seju](https://github.com/longjl1/seju)

---

**Built with care by the Seju team**
