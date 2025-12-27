
export enum ToolType {
  CHAT = 'CHAT',
  IMAGE = 'IMAGE',
  VIDEO = 'VIDEO',
  CODE = 'CODE',
  AUDIO = 'AUDIO',
  DATABASE = 'DATABASE',
  DASHBOARD = 'DASHBOARD'
}

export interface MessageSource {
  uri: string;
  title: string;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  type?: 'text' | 'image' | 'video' | 'audio';
  mediaUrl?: string;
  sources?: MessageSource[];
}

export interface Tool {
  id: ToolType;
  name: string;
  description: string;
  icon: string;
  color: string;
}

export interface DBRecord {
  _id: string;
  collection: string;
  data: any;
  createdAt: number;
}
