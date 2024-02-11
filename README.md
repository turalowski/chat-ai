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
