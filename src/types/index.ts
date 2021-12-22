export interface Token {
  token: string | null;
}

export interface AuthState extends Token {
  user: User | null;
  loading: boolean;
}

export interface Comment {
  id?: string;
  _id?: string;
  content: string;
}
export interface Thread {
  id?: string;
  _id?: string;
  title: string;
  content: string;
  channel: Channel;
  comments: Comment[];
}
export interface Channel {
  id?: string;
  _id?: string;
  name: string;
  threads: Thread[];
  members: User[];
}

export interface Workspace {
  id?: string;
  _id?: string;
  name: string;
  peoples: User[];
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
