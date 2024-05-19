type Message = {
  type: 'apiMessage' | 'userMessage';
  message: string;
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
  vector_ids: string[];
};
