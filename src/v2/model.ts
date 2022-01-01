export interface ContentPack<T = string> {
	packId?: string;
	packCredits?: Array<[string, string] | string>;
	dependencies: string[];
	characters: Array<Character<T>>;
	fonts: Array<Font<T>>;
	backgrounds: Array<Background<T>>;
	sprites: Array<Sprite<T>>;
	poemStyles: PoemStyle[];
	poemBackgrounds: Array<PoemBackground<T>>;
	colors: Color[];
}

export interface Font<T> {
	label: string;
	id: string;
	files: T[];
}

export interface Background<T> {
	id: string;
	label?: string;
	variants: Array<SpriteColllection<T>>;
	scaling: 'none' | 'strech' | 'cover';
	sdVersion?: string;
}

export interface Sprite<T> {
	id: string;
	label: string;
	variants: Array<SpriteColllection<T>>;
	defaultScale: Coordinates;
	sdVersion?: string;
	hd: boolean | null;
}

export interface PoemStyle {
	label: string;
	defaultFont: string;
	fontSize: number;
	lineSpacing: number;
	letterSpacing: number;
}

export interface PoemBackground<T> {
	id: string;
	label: string;
	images: SpriteColllection<T>;
	fontColor: string;
	sdVersion?: string;
}

export interface Character<T> {
	id: string;
	label?: string;
	chibi?: T;
	heads: HeadCollections<T>;
	size: Coordinates;
	defaultScale: Coordinates;
	styleGroups: Array<StyleGroup<T>>;
	hd: boolean;
	sdVersion?: string;
}

export interface HeadCollection<T> {
	variants: Array<SpriteColllection<T>>;
	previewSize: Coordinates;
	previewOffset: Coordinates;
}

export interface HeadCollections<T> {
	[id: string]: HeadCollection<T>;
}

export interface StyleGroup<T> {
	id: string;
	styleComponents: Array<StyleComponent<T>>;
	styles: Array<Style<T>>;
}

export interface Style<T> {
	components: { [s: string]: string };
	poses: Array<Pose<T>>;
}

export interface Pose<T> {
	id: string;
	renderCommands: Array<PoseRenderCommand<T>>;
	compatibleHeads: string[];
	previewSize: Coordinates;
	previewOffset: Coordinates;
	size: Coordinates;
	scale: number;
	positions: {
		[position: string]: Array<SpriteColllection<T>>;
	};
}

export type PoseRenderCommand<T> =
	| IStaticImageCommand<T>
	| IPosePartCommand
	| IHeadCommand;

export interface IPoseCommand {
	offset: Coordinates;
	composite?:
		| 'source-in'
		| 'source-out'
		| 'source-atop'
		| 'destination-over'
		| 'destination-in'
		| 'destination-out'
		| 'destination-atop'
		| 'lighter'
		| 'copy'
		| 'xor'
		| 'multiply'
		| 'screen'
		| 'overlay'
		| 'darken'
		| 'lighten'
		| 'color-dodge'
		| 'color-burn'
		| 'hard-light'
		| 'soft-light'
		| 'difference'
		| 'exclusion'
		| 'hue'
		| 'saturation'
		| 'color'
		| 'luminosity';
}

export interface IStaticImageCommand<T> extends IPoseCommand {
	type: 'image';
	images: SpriteColllection<T>;
}

export interface IPosePartCommand extends IPoseCommand {
	type: 'pose-part';
	part: string;
}

export interface IHeadCommand extends IPoseCommand {
	type: 'head';
}

type SpriteColllection<T> = T[];

type Coordinates = [number, number];

export interface StyleComponent<T> {
	label: string;
	id: string;
	variants: StyleClasses<T>;
}

export interface StyleClasses<T> {
	[name: string]: T;
}

export interface Color {
	label: string;
	color: string;
}
