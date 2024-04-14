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