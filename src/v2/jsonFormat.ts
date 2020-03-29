export interface JSONContentPack {
	version: '2.0';
	packId: string;
	packCredits?: Array<[string, string] | string>;
	dependencies?: [];
	folder?: string;
	characters?: JSONCharacter[];
	fonts?: JSONFont[];
	backgrounds?: JSONBackground[];
	sprites?: JSONSprite[];
	poemStyles?: JSONPoemStyle[];
	poemBackgrounds?: JSONPoemBackground[];
	colors?: JSONColor[];
}

export interface JSONFont {
	id: string;
	label?: string;
	folder?: string;
	files: string[];
}

export interface JSONBackground {
	id: string;
	label?: string;
	folder?: string;
	variants: SpriteColllection[];
}

export interface JSONSprite {
	id: string;
	label?: string;
	folder?: string;
	variants: SpriteColllection[];
}

export interface JSONPoemStyle {
	label: string;
	defaultFont?: string;
	fontSize?: number;
	lineSpacing?: number;
	letterSpacing?: number;
}

export interface JSONPoemBackground {
	label: string;
	folder?: string;
	images: SpriteColllection;
	fontColor?: string;
}

export interface JSONCharacter {
	id: string;
	label?: string;
	folder?: string;
	chibi?: string;
	heads?: JSONHeadCollections;
	styleGroups?: JSONStyleGroup[];
}

export interface JSONHeadCollection {
	folder?: string;
	variants: SpriteColllection[];
	previewSize?: Coordinates;
	previewOffset?: Coordinates;
}

export interface JSONHeadCollections {
	[id: string]: JSONHeadCollection | SpriteColllection[];
}

export interface JSONStyleGroup {
	id: string;
	folder?: string;
	styleComponents?: JSONStyleComponent[];
	styles: JSONStyle[];
}

export interface JSONStyle {
	components?: { [s: string]: string };
	folder?: string;
	poses: JSONPose[];
}

export interface JSONPose {
	id: string;
	renderCommands?: JSONPoseCommand[];
	compatibleHeads?: string[];
	folder?: string;
	size?: Coordinates;
	scale?: number;
	previewSize?: Coordinates;
	previewOffset?: Coordinates;
	positions?: {
		[position: string]: SpriteColllection[];
	};
}

export type JSONPoseCommand =
	| IStaticImageCommand
	| IPosePartCommand
	| IHeadCommand;

export interface IPoseCommand {
	offset?: Coordinates;
}

export interface IStaticImageCommand extends IPoseCommand {
	type: 'image';
	folder?: string;
	images: SpriteColllection;
}

export interface IPosePartCommand extends IPoseCommand {
	type: 'pose-part';
	part: string;
}

export interface IHeadCommand extends IPoseCommand {
	type: 'head';
}

type SpriteColllection = string[];

type Coordinates = [number, number];

export interface JSONStyleComponent {
	id: string;
	label: string;
	variants: JSONStyleClasses;
}

export interface JSONStyleClasses {
	[name: string]: string;
}

export interface JSONColor {
	label?: string;
	color: string;
}
