[![CI](https://github.com/turalowski/chat-ai/actions/workflows/ci.yml/badge.svg)](https://github.com/turalowski/chat-ai/actions/workflows/ci.yml)

## Setup

See [SETUP.md](SETUP.md) to run the project with Supabase in Docker or on a hosted project.

## Access control

Row level security in `supabase/migrations` decides who can access which rows and files, because the anon key is public. Pinecone has no equivalent, so `/api/chat` only searches document paths that the database lets the user see.

## Project Dependencies and Node Version

### Node Version

This project is developed and tested with Node.js version **20.10.0**. It is important to use this version or later for compatibility reasons. Ensure that your development environment is set up with this version to avoid potential issues related to version discrepancies.

### Useful information

Maximum file size to upload is 50MB. This limitation is related to Free tier of Supabase.

### Used Packages

Below is a list of the npm packages that are integral to the project's functionality. These packages are specified with their names and the versions are not strictly pinned, allowing for minor updates. It is recommended to install them using the version ranges provided to ensure compatibility while also benefiting from non-breaking improvements and fixes.

- **@langchain/openai**: This package is a wrapper for integrating OpenAI's API, facilitating the use of AI models such as GPT in the project. Version range: `^0.0.14`.
- **@langchain/pinecone**: A library for integrating Pinecone's vector database into the application, useful for similarity search and machine learning applications. Version range: `^0.0.3`.
- **@pinecone-database/pinecone**: The official Pinecone database client for Node.js, enabling the project to interact with Pinecone services. Version range: `^2.0.1`.
- **langchain**: A toolkit for building applications with language models, offering utilities for common tasks. Version range: `^0.1.17`.
- **pdf-parse**: A library for parsing PDF files, extracting text for processing or indexing. Version range: `^1.1.1`.
