export interface Comment {
  _id: string;
  content: string;
}
export interface Thread {
  _id: string;
  title: string;
  content: string;
  channel: Channel;
  comments: Comment[];
}
export interface Channel {
  _id: string;
  name: string;
  threads: Thread[];
  members: User[];
}

export interface Workspace {
  _id: string;
  name: string;
  peoples: User[];
}

export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  workspaces?: Workspace[];
  channels?: Channel[];
}
