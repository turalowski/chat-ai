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

## Environment Variables

The application relies on several environment variables for its configuration. These variables are essential for connecting to external services like Pinecone and OpenAI. Below is a description of each environment variable used within the application:

- `PINECONE_API_KEY`: This is your Pinecone API key, which allows the application to authenticate with Pinecone services. You can obtain this key from your Pinecone dashboard.

- `PINECONE_NAME_SPACE`: This variable specifies the namespace within Pinecone where your data will be stored and accessed. Namespaces are used to segregate data within Pinecone, acting like a database name.

- `PINECONE_ENVIRONMENT`: This variable sets the environment for Pinecone's service. It can be used to differentiate between development, staging, and production environments within Pinecone.

- `OPENAI_API_KEY`: This is your OpenAI API key, required for accessing OpenAI's API services, including the use of GPT models or embeddings. You can get this key from the OpenAI API dashboard.

### Setting up Environment Variables

To set up these environment variables, create a `.env.local` file in the root of your project and include the following lines, replacing the placeholders with your actual keys and values:

```env
PINECONE_API_KEY="your_pinecone_api_key_here"
PINECONE_NAME_SPACE="your_pinecone_namespace_here"
PINECONE_ENVIRONMENT="your_pinecone_environment_here"
OPENAI_API_KEY="your_openai_api_key_here"
```
