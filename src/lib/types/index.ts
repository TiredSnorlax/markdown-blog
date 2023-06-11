import type { FieldValue } from "firebase/firestore";
type FirestoreTimeStamp = string | FieldValue

export interface IUser {
  username: string;
  password: string;
}

export interface IBlog {
  ownerId: string;
  title: string;
  description: string;
  content: string;
  createdAt: FirestoreTimeStamp;
  id?: string;
}
