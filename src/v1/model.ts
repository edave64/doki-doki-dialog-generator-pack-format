export interface NsfwAbleImg {
	img: string;
	nsfw: boolean;
}

export interface Heads {
	nsfw: boolean;
	all: NsfwAbleImg[];
	size: [number, number];
	offset: [number, number];
}

export interface HeadCollections {
	[id: string]: Heads;
}

interface Pose<H> {
	compatibleHeads: Array<keyof H>;
	headInForeground: boolean;
	nsfw: boolean;
	name: string;
	headAnchor: [number, number];
	size: [number, number];
	offset: [number, number];
	style: string;
}

interface StaticPose<H> extends Pose<H> {
	static: string;
}

interface VariantPose<H> extends Pose<H> {
	variant: NsfwAbleImg[];
}

interface TwoSidedPose<H> extends Pose<H> {
	left: NsfwAbleImg[];
	right: NsfwAbleImg[];
}

export type PoseMeta<H extends HeadCollections> =
	| StaticPose<H>
	| VariantPose<H>
	| TwoSidedPose<H>;

export interface Style {
	name: string;
	label: string;
	nsfw: boolean;
}
export interface StyleClasses {
	[name: string]: string;
}

export interface Character<H extends HeadCollections> {
	id: string;
	name: string;
	nsfw: boolean;
	eyes: StyleClasses;
	hairs: StyleClasses;
	chibi: string | undefined;
	styles: Style[];
	heads: H;
	poses: Array<PoseMeta<H>>;
}
