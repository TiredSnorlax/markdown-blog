import type { FieldValue } from 'firebase/firestore';
type FirestoreTimeStamp = string | FieldValue;

export interface IUser {
	username: string;
	password: string;
}

export interface IProfile {
	files: string[];
	folders: string[];
}

export interface IBlog {
	parentId: string;
	ownerId: string;
	title: string;
	content: string;
	createdAt: FirestoreTimeStamp;
	id?: string;
}

export interface IFolder {
	parentId: string;
	path: string;
	children: string[];
	name: string;
	createdAt: FirestoreTimeStamp;
	id?: string;
	ownerId: string;
	isPublic: boolean;
}
