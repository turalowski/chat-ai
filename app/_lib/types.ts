type Message = {
    type: 'apiMessage' | 'userMessage';
    message: string;
  };

  export type MessageState = {
    messages: Message[],
    pending?: string,
    history: [string,string][],
    pendingSourceDocs?: Document[]
  }

  export type Document = {
    id: number;
    created_at: string;
    user_id: string;
    name: string;
    document_id: string;
  }