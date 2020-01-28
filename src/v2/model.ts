export interface ContentPack<T = string> {
	packId?: string;
	packCredits?: string;
	characters: Array<Character<T>>;
	fonts: Array<Font<T>>;
	backgrounds: Array<Background<T>>;
	sprites: Array<Sprite<T>>;
	poemStyles: Array<PoemStyle<T>>;
}

export interface Font<T> {
	label: string;
	id: string;
	files: T[];
}

export interface Background<T> {
	label: string;
	variants: Array<SpriteColllection<T>>;
}

export interface Sprite<T> {
	label: string;
	variants: Array<SpriteColllection<T>>;
}

export interface PoemStyle<T> {
	label: string;
	size: Coordinates;
	defaultFont: string;
	variants: Array<SpriteColllection<T>>;
}

export interface Character<T> {
	id: string;
	label?: string;
	styleComponents: Array<StyleComponent<T>>;
	chibi?: T;
	styles: Style[];
	heads: HeadCollections<T>;
	poses: Array<Pose<T>>;
	size: Coordinates;
}

export interface HeadCollection<T> {
	variants: Array<SpriteColllection<T>>;
	size: Coordinates;
	offset: Coordinates;
}

export interface HeadCollections<T> {
	[id: string]: HeadCollection<T>;
}

export interface Pose<T> {
	name: string;
	renderOrder: string;
	compatibleHeads: string[];
	style: string;
	headAnchor: Coordinates;
	size: Coordinates;
	offset: Coordinates;
	static: SpriteColllection<T>;
	variant: Array<SpriteColllection<T>>;
	left: Array<SpriteColllection<T>>;
	right: Array<SpriteColllection<T>>;
}

type SpriteColllection<T> = T[];

type Coordinates = [number, number];

export interface Style {
	name: string;
	label: string;
	styleGroup: string;
	components: { [s: string]: string };
}

export interface StyleComponent<T> {
	label: string;
	name: string;
	variants: StyleClasses<T>;
}

export interface StyleClasses<T> {
	[name: string]: T;
}
