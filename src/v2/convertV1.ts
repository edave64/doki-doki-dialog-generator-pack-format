import * as V1 from '../v1/model';
import * as V2 from './model';

export function convert(
	characterV1: V1.Character<V1.HeadCollections>,
	nsfw: boolean
): V2.ContentPack {
	if (!characterV1.packId) throw new Error('');

	return {
		packId: characterV1.packId,
		packCredits: characterV1.packCredits || '',
		backgrounds: [],
		fonts: [],
		poemStyles: [],
		sprites: [],
		characters: [convertCharacter(characterV1, nsfw)],
	};
}

function convertCharacter(
	characterV1: V1.Character<V1.HeadCollections>,
	nsfw: boolean
): V2.Character<string> {
	const styleComponents = convertStyleComponents(characterV1);

	return {
		id: characterV1.id,
		chibi: characterV1.chibi,
		heads: convertHeads(characterV1.heads, nsfw),
		poses: convertPoses(characterV1.poses, nsfw),
		styles: convertStyles(characterV1.styles, styleComponents, nsfw),
		label: characterV1.id,
		size: [960, 960],
		styleComponents,
	};
}

function convertStyles(
	stylesV1: V1.Style[],
	styleComponents: Array<V2.StyleComponent<string>>,
	nsfw: boolean
): V2.Style[] {
	return stylesV1
		.filter(style => !style.nsfw || nsfw)
		.map(
			(style): V2.Style => {
				let reducedName = style.name;
				const components: V2.Style['components'] = {};
				for (const component of styleComponents) {
					for (const varKey of Object.keys(component.variants)) {
						const exp = new RegExp('-' + varKey + '\\b');
						if (reducedName.match(exp)) {
							components[component.name] = varKey;
							reducedName = reducedName.replace(exp, '');
							break;
						}
					}
				}

				return {
					name: style.name,
					label: style.label,
					styleGroup: reducedName,
					components,
				};
			}
		);
}

function convertPoses(
	posesV1: Array<V1.PoseMeta<V1.HeadCollections>>,
	nsfw: boolean
): Array<V2.Pose<string>> {
	return posesV1.map(
		(poseV1): V2.Pose<string> => {
			return {
				compatibleHeads: poseV1.compatibleHeads.map(x => x.toString()),
				headAnchor: poseV1.headAnchor,
				name: poseV1.name,
				renderOrder: poseV1.headInForeground ? 'SVLRH' : 'HSVLR',
				offset: poseV1.offset,
				size: poseV1.size,
				style: poseV1.style,
				static: 'static' in poseV1 ? [poseV1.static] : [],
				left: 'left' in poseV1 ? convertNsfwAbles(poseV1.left, nsfw) : [],
				right: 'right' in poseV1 ? convertNsfwAbles(poseV1.right, nsfw) : [],
				variant:
					'variant' in poseV1 ? convertNsfwAbles(poseV1.variant, nsfw) : [],
			};
		}
	);
}

function convertNsfwAbles(
	nsfwAbles: V1.NsfwAbleImg[],
	nsfw: boolean
): string[][] {
	return nsfwAbles.filter(img => !img.nsfw || nsfw).map(img => [img.img]);
}

function convertHeads(
	headCollectionsV1: V1.HeadCollections,
	nsfw: boolean
): V2.HeadCollections<string> {
	const headCollectionsV2: { [s: string]: V2.HeadCollection<string> } = {};

	for (const key of Object.keys(headCollectionsV1)) {
		const headCollectionV1 = headCollectionsV1[key];
		if (headCollectionV1.nsfw && !nsfw) return;
		headCollectionsV2[key] = {
			offset: headCollectionV1.offset,
			size: headCollectionV1.size,
			variants: headCollectionV1.all
				.filter(image => !image.nsfw || nsfw)
				.map(img => [img.img]),
		};
	}

	return headCollectionsV2;
}

function convertStyleComponents(
	characterV1: V1.Character<V1.HeadCollections>
): Array<V2.StyleComponent<string>> {
	const ret: Array<V2.StyleComponent<string>> = [];

	if (Object.keys(characterV1.eyes).length > 0) {
		ret.push({
			label: 'Eyes',
			name: 'eyes',
			variants: characterV1.eyes,
		});
	}

	if (Object.keys(characterV1.hairs).length > 0) {
		ret.push({
			label: 'Hairs',
			name: 'hairs',
			variants: characterV1.hairs,
		});
	}

	return ret;
}
