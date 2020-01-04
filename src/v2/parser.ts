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
} from './model';

export interface Paths {
	[prefix: string]: string;
}

export function normalizeContentPack(
	contentPack: JSONContentPack,
	paths: Paths
): ContentPack {
	const packFolder = joinNormalize('', contentPack.folder || '/', paths);
	return {
		packId: contentPack.packId,
		packCredits: contentPack.packCredits,
		characters: mapNormalize(
			normalizeCharacter,
			contentPack.characters,
			packFolder,
			paths
		),
		backgrounds: mapNormalize(
			normalizeBackground,
			contentPack.backgrounds,
			packFolder,
			paths
		),
		fonts: mapNormalize(normalizeFont, contentPack.fonts, packFolder, paths),
		poemStyles: mapNormalize(
			normalizePoemStyles,
			contentPack.poemStyles,
			packFolder,
			paths
		),
		sprites: mapNormalize(
			normalizeSprite,
			contentPack.sprites,
			packFolder,
			paths
		),
	};
}

function mapNormalize<A, B>(
	callback: (obj: A, folder: string, paths: Paths) => B,
	collection: A[] | undefined,
	folder: string,
	paths: Paths
): B[] {
	if (!collection) return [];
	return collection.map(element => callback(element, folder, paths));
}

export function normalizeSprite(
	sprite: JSONSprite,
	baseFolder: string,
	paths: Paths
): Sprite<string> {
	const spriteFolder = joinNormalize(baseFolder, sprite.folder, paths);
	return {
		label: sprite.label || sprite.variants[0][0],
		variants: sprite.variants.map(variant =>
			normalizFileCollection(variant, spriteFolder, paths)
		),
	};
}

export function normalizePoemStyles(
	poem: JSONPoemStyle,
	baseFolder: string,
	paths: Paths
): PoemStyle<string> {
	const poemFolder = joinNormalize(baseFolder, poem.folder, paths);
	return {
		defaultFont: poem.defaultFont || 'Aller',
		label: poem.label || poem.variants[0][0],
		size: poem.size || [800, 720],
		variants: poem.variants.map(variant =>
			normalizFileCollection(variant, poemFolder, paths)
		),
	};
}

export function normalizeFont(
	font: JSONFont,
	baseFolder: string,
	paths: Paths
): Font<string> {
	const fontsFolder = joinNormalize(baseFolder, font.folder, paths);
	return {
		id: font.id ? font.id : font.label ? font.label : font.files[0],
		label: font.label ? font.label : font.id ? font.id : font.files[0],
		files: normalizFileCollection(font.files, fontsFolder, paths),
	};
}

export function normalizeBackground(
	background: JSONBackground,
	baseFolder: string,
	paths: Paths
): Background<string> {
	const backgroundFolder = joinNormalize(baseFolder, background.folder, paths);
	return {
		label: background.label ? background.label : background.variants[0][0],
		variants: background.variants.map(collection =>
			normalizFileCollection(collection, backgroundFolder, paths)
		),
	};
}

function normalizFileCollection(
	collection: string[],
	baseFolder: string,
	paths: Paths
) {
	return collection.map(sprite => joinNormalize(baseFolder, sprite, paths));
}

function normalizeCharacter(
	character: JSONCharacter,
	baseFolder: string,
	paths: Paths
): Character<string> {
	const charFolder = joinNormalize(baseFolder, character.folder, paths);
	const defaultStyle = {
		components: {},
		styleGroup: 'default',
		label: 'Default',
		name: 'default',
	};
	return {
		id: character.id,
		label: character.label,
		chibi: character.chibi
			? joinNormalize(charFolder, character.chibi, paths)
			: undefined,
		styleComponents: mapNormalize(
			normalizeStyleComponent,
			character.styleComponents,
			charFolder,
			paths
		),
		styles: character.styles
			? normalizeStyles(character.styles)
			: [defaultStyle],
		heads: normalizeHeads(character.heads, charFolder, paths),
		poses: normalizePoses(character.poses, charFolder, paths),
		size: character.size || [960, 960],
	};
}

function normalizeStyles(json: JSONStyle[]): Style[] {
	return json.map(
		(jsonStyle): Style => ({
			...jsonStyle,
			components: jsonStyle.components || {},
			styleGroup: jsonStyle.styleGroup || jsonStyle.name,
		})
	);
}

function normalizeStyleComponent(
	styleComponent: JSONStyleComponent,
	baseFolder: string,
	paths: Paths
): StyleComponent<string> {
	return {
		name: styleComponent.name,
		label: styleComponent.label,
		variants: normalizeParts(styleComponent.variants, baseFolder, paths),
	};
}

function normalizeParts(
	styleClasses: JSONStyleClasses,
	baseFolder: string,
	paths: Paths
): StyleClasses<string> {
	if (!styleClasses) return {};
	const ret: StyleClasses<string> = {};
	for (const styleKey in styleClasses) {
		/* istanbul ignore next */
		if (!styleClasses.hasOwnProperty(styleKey)) continue;
		ret[styleKey] = joinNormalize(baseFolder, styleClasses[styleKey], paths);
	}
	return ret;
}

function normalizeHeads(
	heads: JSONHeadCollections | undefined,
	baseFolder: string,
	paths: Paths
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
				variants: normalizeVariants(headGroup, baseFolder, paths),
				offset: [290, 70],
				size: [380, 380],
			};
		} else {
			const subFolder = joinNormalize(baseFolder, headGroup.folder, paths);
			newHeadGroup = {
				variants: normalizeVariants(headGroup.variants, subFolder, paths),
				offset: headGroup.offset || [290, 70],
				size: headGroup.size || [380, 380],
			};
		}
		ret[headGroupKey] = newHeadGroup;
	}

	return ret;
}

function normalizePoses(
	poses: JSONPose[],
	baseFolder: string,
	paths: Paths
): Array<Pose<string>> {
	if (!poses) return [];

	return poses.map(pose => {
		const poseFolder = joinNormalize(baseFolder, pose.folder, paths);
		const ret = {
			compatibleHeads: pose.compatibleHeads,
			headAnchor: pose.headAnchor || [0, 0],
			headInForeground: !!pose.headInForeground,
			name: pose.name,
			style: pose.style,
			offset: [0, 0],
			size: [960, 960],
			renderOrder: 'hlrvs',
			static: pose.static
				? normalizeCollection(pose.static, poseFolder, paths)
				: [],
			left: pose.left ? normalizeVariants(pose.left, poseFolder, paths) : [],
			right: pose.right ? normalizeVariants(pose.right, poseFolder, paths) : [],
			variant: pose.variant
				? normalizeVariants(pose.variant, poseFolder, paths)
				: [],
		} as Pose<string>;

		return ret;
	});
}

function normalizeVariants(
	variants: string[][],
	folder: string,
	paths: Paths
): string[][] {
	return variants.map((collection): string[] =>
		normalizeCollection(collection, folder, paths)
	);
}

function normalizeCollection(
	collection: string[],
	folder: string,
	paths: Paths
): string[] {
	return collection.map((img): string => joinNormalize(folder, img, paths));
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
	paths: Paths
): string {
	if (!sub) return base;

	for (const path in paths) {
		if (sub.startsWith(path)) {
			return paths[path] + sub.slice(path.length);
		}
	}
	if (isWebUrl(sub)) return sub;
	return base + sub;
}
