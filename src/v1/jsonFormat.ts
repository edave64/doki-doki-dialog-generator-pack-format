import { NsfwAbleImg } from './model';

export interface JSONHeadCollection {
	folder?: string;
	nsfw?: boolean;
	all: Array<string | NsfwAbleImg>;
	size?: [number, number];
	offset?: [number, number];
}

export interface JSONHeadCollections {
	[id: string]: JSONHeadCollection | Array<string | NsfwAbleImg>;
}

interface JSONPose<H> {
	compatibleHeads?: Array<keyof H>;
	headInForeground?: boolean;
	folder?: string;
	nsfw?: boolean;
	name: string;
	style: string;
	headAnchor?: [number, number];
	size?: [number, number];
	offset?: [number, number];
}

interface JSONStaticPose<H> extends JSONPose<H> {
	static: string;
}

interface JSONVariantPose<H> extends JSONPose<H> {
	variant: Array<string | NsfwAbleImg>;
}

interface JSONTwoSidedPose<H> extends JSONPose<H> {
	left: Array<string | NsfwAbleImg>;
	right: Array<string | NsfwAbleImg>;
}

export type JSONPoseMeta<H extends JSONHeadCollections> =
	| JSONStaticPose<H>
	| JSONVariantPose<H>
	| JSONTwoSidedPose<H>;

export interface JSONStyle {
	name: string;
	label: string;
	nsfw?: boolean;
}

export interface JSONStyleClasses {
	[name: string]: string;
}

export interface JSONCharacter<H extends JSONHeadCollections> {
	id: string;
	packId?: string;
	packName?: string;
	comicClubUrl?: string;
	disclaimer?: string;
	packCredits?: string;
	authors?: string[];
	source?: string;
	internalId?: string;
	name?: string;
	folder?: string;
	nsfw?: boolean;
	eyes?: JSONStyleClasses;
	hairs?: JSONStyleClasses;
	chibi?: string;
	styles?: JSONStyle[];
	heads?: H;
	poses?: Array<JSONPoseMeta<H>>;
}
