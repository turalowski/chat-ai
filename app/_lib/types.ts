type Message = {
  type: 'apiMessage' | 'userMessage';
  message: string;
  sourceDocs: {
    pageContent: string,
    metadata: {
      pageNumber: number
    }
  }[]
};

export type MessageState = {
  messages: Message[];
  pending?: string;
  history: [string, string][];
  pendingSourceDocs?: Document[];
};

export type Document = {
  id: number;
  name: string;
  path: string;
  created_at: string;
};
