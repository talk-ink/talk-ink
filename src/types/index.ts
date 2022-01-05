export interface Token {
  token: string | null;
}

export interface AuthState extends Token {
  user: User | null;
  loading: boolean;
}

export interface IComment {
  id?: string;
  _id?: string;
  content: string;
  createdAt: string;
  createdBy: User;
  threads: string[];
  updatedAt?: string | null;
}
export interface Thread {
  id?: string;
  _id?: string;
  name: string;
  content: string;
  channel?: Channel;
  comments?: IComment[];
  createdAt?: Date;
  updatedAt?: Date;
  draft?: boolean;
  createdBy?: User;
}
export interface Channel {
  id?: string;
  _id?: string;
  name: string;
  threads: string[];
  members: string[];
  description?: string;
  privacy?: "private" | "public";
}

export interface CreateChannel {
  name: string;
  description?: string;
  privacy?: "private" | "public";
}

export interface Workspace {
  id?: string;
  _id?: string;
  name: string;
  project?: string;
  peoples?: User[];
  channels?: string[];
  inviteId?: string;
  logo?: string;
}

export interface User {
  id?: string;
  _id?: string;
  firstName: string;
  lastName?: string;
  email: string;
  workspaces?: Workspace[];
  channels?: Channel[];
}

export interface Login {
  email: string;
  password: string;
}

export interface Register {
  firstName: string;
  email: string;
  password: string;
}

export interface Toast {
  message: string | null;
  duration?: number;
}

export interface SendEmail {
  emails: string[];
  subject: string;
  message: string;
}
