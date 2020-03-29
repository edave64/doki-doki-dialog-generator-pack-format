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
	PoemBackground,
	StyleGroup,
	Style,
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
		dependencies: standartContentPack.dependencies,
		characters: standartContentPack.characters.map(x =>
			walkCharacter(x, callback)
		),
		backgrounds: standartContentPack.backgrounds.map(x =>
			walkBackground(x, callback)
		),
		fonts: standartContentPack.fonts.map(x => walkFont(x, callback)),
		poemStyles: { ...standartContentPack.poemStyles },
		poemBackgrounds: standartContentPack.poemBackgrounds.map(x =>
			walkPoemBackgrounds(x, callback)
		),
		sprites: standartContentPack.sprites.map(x => walkSprite(x, callback)),
		colors: standartContentPack.colors,
	};
}

function walkCharacter<A, B>(
	character: Character<A>,
	callback: (old: A, type: 'image') => B
): Character<B> {
	return {
		id: character.id,
		label: character.label,
		chibi: character.chibi ? callback(character.chibi, 'image') : undefined,
		heads: walkHeads(character.heads, callback),
		styleGroups: character.styleGroups.map(x => walkStyleGroup(x, callback)),
	};
}

function walkStyleGroup<A, B>(
	styleGroup: StyleGroup<A>,
	callback: (old: A, type: 'image') => B
): StyleGroup<B> {
	return {
		id: styleGroup.id,
		styleComponents: styleGroup.styleComponents.map(x =>
			walkStyleComponents(x, callback)
		),
		styles: styleGroup.styles.map(style => walkStyle(style, callback)),
	};
}

function walkStyle<A, B>(
	style: Style<A>,
	callback: (old: A, type: 'image') => B
): Style<B> {
	return {
		components: style.components,
		poses: style.poses.map(pose => walkPose(pose, callback)),
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
	const newParts: { [name: string]: B[][] } = {};

	for (const partKey of Object.keys(pose.positions)) {
		const partValue = pose.positions[partKey];
		newParts[partKey] = partValue.map(partPosition =>
			partPosition.map(x => callback(x, 'image'))
		);
	}

	return {
		compatibleHeads: pose.compatibleHeads,
		id: pose.id,
		previewOffset: pose.previewOffset,
		previewSize: pose.previewSize,
		renderCommands: pose.renderCommands.map(x => {
			if (x.type === 'image') {
				return {
					type: 'image',
					offset: x.offset,
					images: x.images.map(y => callback(y, 'image')),
				};
			} else {
				return x;
			}
		}),
		size: pose.size,
		scale: pose.scale,
		positions: newParts,
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
		previewOffset: heads.previewOffset,
		previewSize: heads.previewSize,
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

function walkPoemBackgrounds<A, B>(
	poemStyle: PoemBackground<A>,
	callback: (old: A, type: 'image') => B
): PoemBackground<B> {
	return {
		fontColor: poemStyle.fontColor,
		label: poemStyle.label,
		images: poemStyle.images.map(x => callback(x, 'image')),
	};
}

function walkSprite<A, B>(
	sprite: Sprite<A>,
	callback: (old: A, type: 'image') => B
): Sprite<B> {
	return {
		id: sprite.id,
		label: sprite.label,
		variants: sprite.variants.map(variant =>
			variant.map(x => callback(x, 'image'))
		),
	};
}

export function mapObject<A, B>(
	obj: { [id: string]: A },
	callback: (val: A, key: string) => B
): { [id: string]: B } {
	const ret = {};
	for (const key in obj) {
		if (!obj.hasOwnProperty(key)) continue;
		ret[key] = callback(obj[key], key);
	}
	return ret;
}
