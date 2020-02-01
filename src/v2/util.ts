import {
	Background,
	Character,
	ContentPack,
	Font,
	PoemStyle,
	Sprite,
	HeadCollections,
	HeadCollection,
	Pose,
	StyleComponent,
	StyleClasses,
} from './model';

const maxReplacementTrips = 10;

export function normalizePath(
	str: string,
	replacements: ReadonlyMap<string, string>,
	fileTypes: ReadonlySet<string>,
	lq: boolean
): string {
	let oldStr: string = '';
	let i = 0;

	const replacementMap: ReadonlyMap<RegExp, string> = new Map(
		Array.from(replacements.entries()).map(r => {
			return [new RegExp(`{${r[0]}}`, 'g'), r[1]];
		})
	);

	while (oldStr !== str) {
		oldStr = str;

		if (++i > maxReplacementTrips)
			throw new Error('Maximum replacement recursion exceeded!');

		for (const replacement of replacementMap.entries()) {
			str = str.replace(replacement[0], replacement[1]);
		}

		str = str.replace(/{format(:.*?:.*?)+}/gi, (text: string): string => {
			text = text.slice(8, -1);
			const extensions = text.split(':');
			for (let i = 0; i < extensions.length; i += 2) {
				if (fileTypes.has(extensions[i])) {
					return extensions[i + 1];
				}
			}
			return '';
		});

		str = str.replace(/{lq:(.*?):(.*?)}/gi, (text: string): string => {
			return text.slice(4, -1).split(':')[lq ? 0 : 1];
		});
	}
	return str;
}

export function assetWalker<A, B>(
	standartContentPack: ContentPack<A>,
	callback: (old: A, type: 'image' | 'font') => B
): ContentPack<B> {
	return {
		packId: standartContentPack.packId,
		packCredits: standartContentPack.packCredits,
		characters: standartContentPack.characters.map(x =>
			walkCharacter(x, callback)
		),
		backgrounds: standartContentPack.backgrounds.map(x =>
			walkBackground(x, callback)
		),
		fonts: standartContentPack.fonts.map(x => walkFont(x, callback)),
		poemStyles: standartContentPack.poemStyles.map(x =>
			walkPoemStyle(x, callback)
		),
		sprites: standartContentPack.sprites.map(x => walkSprite(x, callback)),
	};
}

function walkCharacter<A, B>(
	character: Character<A>,
	callback: (old: A, type: 'image') => B
): Character<B> {
	return {
		id: character.id,
		label: character.label,
		size: character.size,
		styles: character.styles,
		chibi: character.chibi ? callback(character.chibi, 'image') : undefined,
		heads: walkHeads(character.heads, callback),
		poses: character.poses.map(pose => walkPose(pose, callback)),
		styleComponents: character.styleComponents.map(styleComponent =>
			walkStyleComponents(styleComponent, callback)
		),
	};
}

function walkStyleComponents<A, B>(
	component: StyleComponent<A>,
	callback: (old: A, type: 'image') => B
): StyleComponent<B> {
	return {
		...component,
		variants: walkStyleClasses(component.variants, callback),
	};
}

function walkStyleClasses<A, B>(
	style: StyleClasses<A>,
	callback: (old: A, type: 'image') => B
): StyleClasses<B> {
	const ret: StyleClasses<B> = {};
	for (const styleKey in style) {
		if (!style.hasOwnProperty(styleKey)) continue;
		ret[styleKey] = callback(style[styleKey], 'image');
	}
	return ret;
}

function walkPose<A, B>(
	pose: Pose<A>,
	callback: (old: A, type: 'image') => B
): Pose<B> {
	return {
		...pose,
		static: pose.static.map(x => callback(x, 'image')),
		variant: pose.variant.map(variant =>
			variant.map(x => callback(x, 'image'))
		),
		left: pose.left.map(variant => variant.map(x => callback(x, 'image'))),
		right: pose.right.map(variant => variant.map(x => callback(x, 'image'))),
	};
}

function walkHeads<A, B>(
	heads: HeadCollections<A>,
	callback: (old: A, type: 'image') => B
): HeadCollections<B> {
	const newHeads: HeadCollections<B> = {};
	for (const headKeys in heads) {
		if (!heads.hasOwnProperty(headKeys)) continue;
		newHeads[headKeys] = walkHeadCollection(heads[headKeys], callback);
	}
	return newHeads;
}

function walkHeadCollection<A, B>(
	heads: HeadCollection<A>,
	callback: (old: A, type: 'image') => B
): HeadCollection<B> {
	return {
		offset: heads.offset,
		size: heads.size,
		variants: heads.variants.map(variant =>
			variant.map(x => callback(x, 'image'))
		),
	};
}

function walkBackground<A, B>(
	background: Background<A>,
	callback: (old: A, type: 'image') => B
): Background<B> {
	return {
		id: background.id,
		label: background.label,
		variants: background.variants.map(variant =>
			variant.map(x => callback(x, 'image'))
		),
	};
}

function walkFont<A, B>(
	font: Font<A>,
	callback: (old: A, type: 'font') => B
): Font<B> {
	return {
		id: font.id,
		label: font.label,
		files: font.files.map(x => callback(x, 'font')),
	};
}

function walkPoemStyle<A, B>(
	poemStyle: PoemStyle<A>,
	callback: (old: A, type: 'image') => B
): PoemStyle<B> {
	return {
		label: poemStyle.label,
		size: poemStyle.size,
		defaultFont: poemStyle.defaultFont,
		variants: poemStyle.variants.map(variant =>
			variant.map(x => callback(x, 'image'))
		),
	};
}

function walkSprite<A, B>(
	sprite: Sprite<A>,
	callback: (old: A, type: 'image') => B
): Sprite<B> {
	return {
		label: sprite.label,
		variants: sprite.variants.map(variant =>
			variant.map(x => callback(x, 'image'))
		),
	};
}
