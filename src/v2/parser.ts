import {
	JSONBackground,
	JSONCharacter,
	JSONContentPack,
	JSONFont,
	JSONHeadCollections,
	JSONPoemStyle,
	JSONPose,
	JSONSprite,
	JSONStyleClasses,
	JSONStyleComponent,
	JSONStyle,
	JSONColor,
	JSONPoemBackground,
	JSONStyleGroup,
	JSONPoseCommand,
} from './jsonFormat';
import {
	Background,
	Character,
	ContentPack,
	Font,
	HeadCollection,
	HeadCollections,
	PoemStyle,
	Pose,
	Sprite,
	StyleClasses,
	StyleComponent,
	Style,
	Color,
	PoemBackground,
	StyleGroup,
	PoseRenderCommand,
} from './model';
import { mapObject } from './util';

export interface Paths {
	[prefix: string]: string;
}

export interface IContext {
	paths: Paths;
	packId: string;
}

export function normalizeContentPack(
	contentPack: JSONContentPack,
	paths: Paths
): ContentPack {
	const ctx: IContext = {
		paths,
		packId: contentPack.packId,
	};
	const packFolder = joinNormalize('', contentPack.folder || '/', ctx);
	return {
		packId: contentPack.packId,
		packCredits: contentPack.packCredits,
		dependencies: contentPack.dependencies || [],
		characters: mapNormalize(
			normalizeCharacter,
			contentPack.characters,
			packFolder,
			ctx
		),
		backgrounds: mapNormalize(
			normalizeBackground,
			contentPack.backgrounds,
			packFolder,
			ctx
		),
		fonts: mapNormalize(normalizeFont, contentPack.fonts, packFolder, ctx),
		poemStyles: mapNormalize(
			normalizePoemStyles,
			contentPack.poemStyles,
			packFolder,
			ctx
		),
		poemBackgrounds: mapNormalize(
			normalizePoemBackground,
			contentPack.poemBackgrounds,
			packFolder,
			ctx
		),
		sprites: mapNormalize(
			normalizeSprite,
			contentPack.sprites,
			packFolder,
			ctx
		),
		colors: mapNormalize(normalizeColor, contentPack.colors, packFolder, ctx),
	};
}

function mapNormalize<A, B>(
	callback: (obj: A, folder: string, ctx: IContext) => B,
	collection: A[] | undefined,
	folder: string,
	ctx: IContext
): B[] {
	if (!collection) return [];
	return collection.map(element => callback(element, folder, ctx));
}

export function normalizeSprite(
	sprite: JSONSprite,
	baseFolder: string,
	ctx: IContext
): Sprite<string> {
	const spriteFolder = joinNormalize(baseFolder, sprite.folder, ctx);
	return {
		id: expandId(ctx.packId, sprite.id),
		label: sprite.label || sprite.variants[0][0],
		variants: sprite.variants.map(variant =>
			normalizFileCollection(variant, spriteFolder, ctx)
		),
	};
}

export function normalizePoemStyles(poem: JSONPoemStyle): PoemStyle {
	return {
		label: poem.label,
		defaultFont: poem.defaultFont || 'Aller',
		fontSize: poem.fontSize !== undefined ? poem.fontSize : 30,
		letterSpacing: poem.letterSpacing !== undefined ? poem.letterSpacing : 1,
		lineSpacing: poem.lineSpacing !== undefined ? poem.lineSpacing : 1.2,
	};
}

export function normalizePoemBackground(
	poem: JSONPoemBackground,
	baseFolder: string,
	ctx: IContext
): PoemBackground<string> {
	const fontsFolder = joinNormalize(baseFolder, poem.folder, ctx);
	return {
		label: poem.label,
		images: normalizFileCollection(poem.images, fontsFolder, ctx),
		fontColor: poem.fontColor || 'black',
	};
}

export function normalizeFont(
	font: JSONFont,
	baseFolder: string,
	ctx: IContext
): Font<string> {
	const fontsFolder = joinNormalize(baseFolder, font.folder, ctx);
	return {
		id: expandId(
			ctx.packId,
			font.id ? font.id : font.label ? font.label : font.files[0]
		),
		label: font.label ? font.label : font.id ? font.id : font.files[0],
		files: normalizFileCollection(font.files, fontsFolder, ctx),
	};
}

export function normalizeBackground(
	background: JSONBackground,
	baseFolder: string,
	ctx: IContext
): Background<string> {
	const backgroundFolder = joinNormalize(baseFolder, background.folder, ctx);
	return {
		id: expandId(ctx.packId, background.id),
		label: background.label ? background.label : background.variants[0][0],
		variants: background.variants.map(collection =>
			normalizFileCollection(collection, backgroundFolder, ctx)
		),
	};
}

export function normalizeColor(color: JSONColor): Color {
	return {
		label: color.label || color.color,
		color: color.color,
	};
}

function normalizFileCollection(
	collection: string[],
	baseFolder: string,
	ctx: IContext
) {
	return collection.map(sprite => joinNormalize(baseFolder, sprite, ctx));
}

function normalizeCharacter(
	character: JSONCharacter,
	baseFolder: string,
	ctx: IContext
): Character<string> {
	const charFolder = joinNormalize(baseFolder, character.folder, ctx);
	const defaultStyle = {
		components: {},
		styleGroup: 'default',
		label: 'Default',
		name: 'default',
	};
	return {
		id: expandId(ctx.packId, character.id),
		label: character.label,
		chibi: character.chibi
			? joinNormalize(charFolder, character.chibi, ctx)
			: undefined,
		heads: normalizeHeads(character.heads, charFolder, ctx),
		styleGroups: mapNormalize(
			normalizeStyleGroup,
			character.styleGroups,
			charFolder,
			ctx
		),
	};
}

function normalizeStyleGroup(
	json: JSONStyleGroup,
	baseFolder: string,
	ctx: IContext
): StyleGroup<string> {
	const groupFolder = joinNormalize(baseFolder, json.folder, ctx);
	return {
		id: expandId(ctx.packId, json.id),
		styleComponents: mapNormalize(
			normalizeStyleComponent,
			json.styleComponents,
			groupFolder,
			ctx
		),
		styles: json.styles.map(x => normalizeStyle(x, groupFolder, ctx)),
	};
}

function normalizeStyle(
	json: JSONStyle,
	baseFolder: string,
	ctx: IContext
): Style<string> {
	const styleFolder = joinNormalize(baseFolder, json.folder, ctx);
	const components: Style<string>['components'] = {};
	if (json.components) {
		for (const componentId in json.components) {
			if (!json.components.hasOwnProperty(componentId)) continue;
			components[expandId(ctx.packId, componentId)] =
				json.components[componentId];
		}
	}
	return {
		components,
		poses: json.poses.map(pose => normalizePose(pose, styleFolder, ctx)),
	};
}

function normalizeStyleComponent(
	styleComponent: JSONStyleComponent,
	baseFolder: string,
	ctx: IContext
): StyleComponent<string> {
	return {
		id: expandId(ctx.packId, styleComponent.id),
		label: styleComponent.label,
		variants: normalizeParts(styleComponent.variants, baseFolder, ctx),
	};
}

function normalizeParts(
	styleClasses: JSONStyleClasses,
	baseFolder: string,
	ctx: IContext
): StyleClasses<string> {
	if (!styleClasses) return {};
	const ret: StyleClasses<string> = {};
	for (const styleKey in styleClasses) {
		/* istanbul ignore next */
		if (!styleClasses.hasOwnProperty(styleKey)) continue;
		ret[styleKey] = joinNormalize(baseFolder, styleClasses[styleKey], ctx);
	}
	return ret;
}

function normalizeHeads(
	heads: JSONHeadCollections | undefined,
	baseFolder: string,
	ctx: IContext
): HeadCollections<string> {
	const ret: HeadCollections<string> = {};
	if (!heads) return ret;

	for (const headGroupKey in heads) {
		/* istanbul ignore next */
		if (!heads.hasOwnProperty(headGroupKey)) continue;
		const headGroup = heads[headGroupKey];
		let newHeadGroup: HeadCollection<string>;
		if (headGroup instanceof Array) {
			newHeadGroup = {
				variants: normalizeVariants(headGroup, baseFolder, ctx),
				previewOffset: [290, 70],
				previewSize: [380, 380],
			};
		} else {
			const subFolder = joinNormalize(baseFolder, headGroup.folder, ctx);
			newHeadGroup = {
				variants: normalizeVariants(headGroup.variants, subFolder, ctx),
				previewOffset: headGroup.previewOffset || [290, 70],
				previewSize: headGroup.previewSize || [380, 380],
			};
		}
		ret[expandId(ctx.packId, headGroupKey)] = newHeadGroup;
	}

	return ret;
}

function normalizePose(
	pose: JSONPose,
	baseFolder: string,
	ctx: IContext
): Pose<string> {
	const poseFolder = joinNormalize(baseFolder, pose.folder, ctx);
	return {
		compatibleHeads:
			pose.compatibleHeads?.map(head => expandId(ctx.packId, head)) || [],
		id: expandId(ctx.packId, pose.id),
		previewOffset: pose.previewOffset || [0, 0],
		previewSize: pose.previewSize || [960, 960],
		size: pose.size || [960, 960],
		scale: pose.scale || 0.8,
		positions: mapObject(pose.positions || {}, posePart =>
			normalizeVariants(posePart, poseFolder, ctx)
		),
		renderCommands: pose.renderCommands?.map(command =>
			normalizePoseCommand(command, baseFolder, ctx)
		) || [
			{ type: 'head', offset: [0, 0] },
			{ type: 'pose-part', part: 'Left', offset: [0, 0] },
			{ type: 'pose-part', part: 'Right', offset: [0, 0] },
			{ type: 'pose-part', part: 'Variant', offset: [0, 0] },
		],
	};
}

function normalizePoseCommand(
	poseCommand: JSONPoseCommand,
	folder: string,
	ctx: IContext
): PoseRenderCommand<string> {
	if (poseCommand.type === 'image') {
		const commandFolder = joinNormalize(folder, poseCommand.folder, ctx);
		return {
			type: 'image',
			offset: poseCommand.offset || [0, 0],
			images: normalizeCollection(poseCommand.images, commandFolder, ctx),
		};
	} else {
		return {
			...poseCommand,
			offset: poseCommand.offset || [0, 0],
		};
	}
}

function normalizeVariants(
	variants: string[][],
	folder: string,
	ctx: IContext
): string[][] {
	return variants.map((collection): string[] =>
		normalizeCollection(collection, folder, ctx)
	);
}

function normalizeCollection(
	collection: string[],
	folder: string,
	ctx: IContext
): string[] {
	return collection.map((img): string => joinNormalize(folder, img, ctx));
}

function isWebUrl(path: string): boolean {
	return (
		path.startsWith('blob:') ||
		path.startsWith('http://') ||
		path.startsWith('https://') ||
		path.startsWith('://')
	);
}

function joinNormalize(
	base: string,
	sub: string | undefined,
	ctx: IContext
): string {
	if (!sub) return base;

	for (const path in ctx.paths) {
		if (sub.startsWith(path)) {
			return ctx.paths[path] + sub.slice(path.length);
		}
	}
	if (isWebUrl(sub)) return sub;
	return base + sub;
}

export function expandId(packId: string, objectId: string) {
	if (objectId.indexOf(':') !== -1) return objectId;
	return `${packId}:${objectId}`;
}
