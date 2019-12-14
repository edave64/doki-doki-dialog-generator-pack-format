import {
	Background,
	Character,
	ContentPack,
	Font,
	PoemStyle,
	Sprite,
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

export async function assetWalker<A, B>(
	standartContentPack: ContentPack<A>,
	callback: (old: A, type: 'image' | 'font') => B
): Promise<ContentPack<B>> {
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
		chibi: callback(character.chibi, 'image'),
		heads: null!,
		poses: null!,
		styleComponents: null!,
	};
}

function walkBackground<A, B>(
	background: Background<A>,
	callback: (old: A, type: 'image') => B
): Background<B> {
	return {
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
