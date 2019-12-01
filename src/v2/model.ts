export interface ContentPack {
	packId?: string;
	packCredits?: string;
	characters: Character[];
	fonts: Font[];
	backgrounds: Background[];
	sprites: Sprite[];
	poemStyles: PoemStyle[];
}

export interface Font {
	label: string;
	id: string;
	files: string[];
}

export interface Background {
	label: string;
	variants: SpriteColllection[];
}

export interface Sprite {
	label: string;
	variants: SpriteColllection[];
}

export interface PoemStyle {
	label: string;
	size: Coordinates;
	defaultFont: string;
	variants: SpriteColllection[];
}

export interface Character {
	id: string;
	label: string;
	styleComponents: StyleComponent[];
	chibi: string;
	styles: Style[];
	heads: HeadCollections;
	poses: Pose[];
	size: Coordinates;
}

export interface HeadCollection {
	variants: SpriteColllection[];
	size: Coordinates;
	offset: Coordinates;
}

export interface HeadCollections {
	[id: string]: HeadCollection;
}

export interface Pose {
	name: string;
	renderOrder: string;
	compatibleHeads: string[];
	style: string;
	headAnchor: Coordinates;
	size: Coordinates;
	offset: Coordinates;
	static: SpriteColllection;
	variant: SpriteColllection[];
	left: SpriteColllection[];
	right: SpriteColllection[];
}

type SpriteColllection = string[];

type Coordinates = [number, number];

export interface Style {
	name: string;
	label: string;
	components: { [s: string]: string };
}

export interface StyleComponent {
	label: string;
	name: string;
	variants: StyleClasses;
}

export interface StyleClasses {
	[name: string]: string;
}
