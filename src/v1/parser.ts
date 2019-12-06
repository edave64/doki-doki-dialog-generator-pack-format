import {
	JSONCharacter,
	JSONHeadCollections,
	JSONPoseMeta,
	JSONStyle,
	JSONStyleClasses,
} from './jsonFormat';
import {
	Character,
	HeadCollections,
	Heads,
	NsfwAbleImg,
	PoseMeta,
	Style,
	StyleClasses,
} from './model';

export interface Paths {
	[prefix: string]: string;
}

export function normalizeCharacter(
	character: JSONCharacter<JSONHeadCollections>,
	paths: Paths
): Character<HeadCollections> {
	const charFolder = joinNormalize('', character.folder || '/', paths);
	let chibi: string | undefined = undefined;
	if (character.chibi)
		chibi = joinNormalize(charFolder, character.chibi, paths);
	if (chibi === undefined && character.internalId) {
		chibi = `assets/chibis/${character.internalId}`;
	}

	return {
		id: character.id,
		packId: character.packId,
		packCredits: character.packCredits,
		name: character.name,
		nsfw: !!character.nsfw,
		chibi,
		eyes: normalizeParts(character.eyes, charFolder, paths),
		hairs: normalizeParts(character.hairs, charFolder, paths),
		styles: normalizeStyles(character.styles),
		heads: normalizeHeads(character.heads, charFolder, paths),
		poses: normalizePoses(character.poses, charFolder, paths),
	} as Character<HeadCollections>;
}

function normalizeParts(
	styleClasses: JSONStyleClasses | undefined,
	baseFolder: string,
	paths: Paths
): StyleClasses {
	if (!styleClasses) return {};
	const ret: StyleClasses = {};
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
): HeadCollections {
	const ret: HeadCollections = {};
	if (!heads) return ret;

	for (const headGroupKey in heads) {
		/* istanbul ignore next */
		if (!heads.hasOwnProperty(headGroupKey)) continue;
		const headGroup = heads[headGroupKey];
		let newHeadGroup: Heads;
		if (headGroup instanceof Array) {
			newHeadGroup = {
				all: normalizeNsfwAbleCollection(headGroup, baseFolder, paths),
				nsfw: false,
				offset: [290, 70],
				size: [380, 380],
			};
		} else {
			const subFolder = joinNormalize(baseFolder, headGroup.folder, paths);
			newHeadGroup = {
				all: normalizeNsfwAbleCollection(headGroup.all, subFolder, paths),
				nsfw: !!headGroup.nsfw,
				offset: headGroup.offset || [290, 70],
				size: headGroup.size || [380, 380],
			};
		}
		ret[headGroupKey] = newHeadGroup;
	}

	return ret;
}

function normalizePoses(
	poses: Array<JSONPoseMeta<JSONHeadCollections>>,
	baseFolder: string,
	paths: Paths
): Array<PoseMeta<HeadCollections>> {
	if (!poses) return [];

	return poses.map(pose => {
		const poseFolder = joinNormalize(baseFolder, pose.folder, paths);
		const ret = {
			compatibleHeads: pose.compatibleHeads,
			headAnchor: pose.headAnchor || [0, 0],
			headInForeground: !!pose.headInForeground,
			name: pose.name,
			nsfw: !!pose.nsfw,
			style: pose.style,
			offset: [0, 0],
			size: [960, 960],
		} as PoseMeta<HeadCollections>;

		if ('static' in pose) {
			console.log('s');
			(ret as any).static = joinNormalize(poseFolder, pose.static, paths);
		} else if ('variant' in pose) {
			console.log('v');
			(ret as any).variant = normalizeNsfwAbleCollection(
				pose.variant,
				poseFolder,
				paths
			);
		} else if ('left' in pose) {
			console.log('lr');
			(ret as any).left = normalizeNsfwAbleCollection(
				pose.left,
				poseFolder,
				paths
			);
			(ret as any).right = normalizeNsfwAbleCollection(
				pose.right,
				poseFolder,
				paths
			);
		} else {
			throw new Error('Invalid pose');
		}

		return ret;
	});
}

function normalizeNsfwAbleCollection(
	collection: Array<string | NsfwAbleImg>,
	poseFolder: string,
	paths: Paths
): NsfwAbleImg[] {
	return collection.map(
		(variant): NsfwAbleImg => {
			if (typeof variant === 'string') {
				return {
					img: joinNormalize(poseFolder, variant, paths),
					nsfw: false,
				};
			} else {
				return {
					img: joinNormalize(poseFolder, variant.img, paths),
					nsfw: variant.nsfw || false,
				};
			}
		}
	);
}

function normalizeStyles(styles?: JSONStyle[]): Style[] {
	if (!styles) return [];
	return styles.map(style => ({
		name: style.name,
		label: style.label,
		nsfw: style.nsfw || false,
	}));
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
