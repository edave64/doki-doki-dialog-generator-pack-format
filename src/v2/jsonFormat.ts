export interface JSONContentPack {
	version: '2.0';
	packId?: string;
	packCredits?: string;
	folder?: string;
	characters?: JSONCharacter[];
	fonts?: JSONFont[];
	backgrounds?: JSONBackground[];
	sprites?: JSONSprite[];
	poemStyles?: JSONPoemStyle[];
}

export interface JSONFont {
	label?: string;
	folder?: string;
	id?: string;
	files: string[];
}

export interface JSONBackground {
	label?: string;
	folder?: string;
	variants: SpriteColllection[];
}

export interface JSONSprite {
	label?: string;
	folder?: string;
	variants: SpriteColllection[];
}

export interface JSONPoemStyle {
	label?: string;
	folder?: string;
	size?: Coordinates;
	defaultFont?: string;
	variants: SpriteColllection[];
}

export interface JSONCharacter {
	id: string;
	label?: string;
	folder?: string;
	styleComponents?: JSONStyleComponent[];
	chibi?: string;
	styles?: JSONStyle[];
	heads?: JSONHeadCollections;
	poses?: JSONPose[];
	size?: Coordinates;
}

export interface JSONHeadCollection {
	folder?: string;
	variants: SpriteColllection[];
	size?: Coordinates;
	offset?: Coordinates;
}

export interface JSONHeadCollections {
	[id: string]: JSONHeadCollection | SpriteColllection[];
}

export interface JSONPose {
	name: string;
	renderOrder: string;
	compatibleHeads?: string[];
	headInForeground?: boolean;
	folder?: string;
	style: string;
	headAnchor?: Coordinates;
	size?: Coordinates;
	offset?: Coordinates;
	static?: SpriteColllection;
	variant?: SpriteColllection[];
	left?: SpriteColllection[];
	right?: SpriteColllection[];
}

type SpriteColllection = string[];

type Coordinates = [number, number];

export interface JSONStyle {
	name: string;
	label: string;
	styleGroup?: string;
	components?: { [s: string]: string };
}

export interface JSONStyleComponent {
	label: string;
	name: string;
	variants: JSONStyleClasses;
}

export interface JSONStyleClasses {
	[name: string]: string;
}
