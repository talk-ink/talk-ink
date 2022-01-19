export interface Token {
  token: string | null;
}

export interface AuthState extends Token {
  user: User | null;
  loading: boolean;
}

export interface ISubComment {
  id?: string;
  _id?: string;
  content: string;
  createdAt: string;
  createdBy: User;
  tagedUsers?: string[];
  updatedAt?: string | null;
  parent: string[];
}

export interface IComment {
  id?: string;
  _id?: string;
  content: string;
  createdAt: string;
  createdBy: User;
  threads: string[];
  updatedAt?: string | null;
  tagedUsers?: string[];
  subComments?: ISubComment[];
}
export interface Thread {
  id?: string;
  _id?: string;
  name: string;
  content: string;
  channel?: string[];
  comments?: IComment[];
  createdAt?: Date;
  updatedAt?: Date;
  draft?: boolean;
  createdBy?: Member;
  workspace?: string;
  interactedUsers?: string[];
  channelId?: string;
  tagedUsers?: string[];
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
  createdBy?: User;
  invitedEmails?: string[];
  hideEmail?: string[];
}

export interface Avatar {
  fileName: string;
  url: string;
}

export interface User {
  id?: string;
  _id?: string;
  firstName: string;
  lastName?: string;
  email: string;
  workspaces?: string[];
  channels?: Channel[];
  avatar?: string | any;
  about?: string;
  contact?: string;
  doneThreads?: string[];
  readedThreads?: string[];
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

export interface SettingsModalRouteState {
  route: string;
  current: string;
}

export interface WorkspaceResponse
  extends Omit<Workspace, "invitedEmails" | "peoples"> {
  invitedEmails: string;
  peoples: string[];
}
export interface Attachment {
  _id?: string;
  id?: string;
  name?: string;
  ext?: string;
  file: string;
}

export interface Member extends Omit<User, "avatar"> {
  avatar?: Avatar[];
}

export interface TUserProfile extends Omit<User, "avatar"> {
  avatar?: Avatar[];
}

export type PageStatus =
  | "channel-restricted"
  | "channel-notFound"
  | null
  | undefined;
