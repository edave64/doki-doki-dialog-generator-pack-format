import * as V1 from '../v1/model';
import * as V2 from './model';
import { expandId } from './parser';

export function convert(
	characterV1: V1.Character<V1.HeadCollections>,
	nsfw: boolean
): V2.ContentPack {
	if (!characterV1.packId) throw new Error('');

	return {
		packId: characterV1.packId,
		packCredits: characterV1.packCredits ? [characterV1.packCredits] : [],
		dependencies: autoDependency(characterV1.id),
		backgrounds: [],
		fonts: [],
		poemStyles: [],
		poemBackgrounds: [],
		sprites: [],
		characters: [convertCharacter(characterV1, nsfw)],
		colors: [],
	};
}

function autoDependency(v1CharId: string): string[] {
	return [];
}

function convertCharacter(
	characterV1: V1.Character<V1.HeadCollections>,
	nsfw: boolean
): V2.Character<string> {
	const ctx: ITranslationContext = {
		characterId: characterV1.id,
		packId: characterV1.packId!,
	};

	return {
		id: expandOrTranslateId('character', characterV1.id, ctx),
		chibi: characterV1.chibi,
		label: characterV1.name,
		heads: convertHeads(characterV1.heads, ctx, nsfw),
		styleGroups: extractStyleGroups(characterV1, ctx, nsfw),
	};
}

function extractStyleGroups(
	characterV1: V1.Character<V1.HeadCollections>,
	ctx: ITranslationContext,
	nsfw: boolean
): Array<V2.StyleGroup<string>> {
	const baseStyleIds: string[] = [];
	const baseStyles = new Map<string, V2.StyleGroup<string>>();
	const styleComponents = convertStyleComponents(characterV1, ctx);
	const styleNames = characterV1.poses
		.map(pose => pose.style)
		.filter((value, index, ary) => {
			return ary.indexOf(value) === index;
		});
	const styleDefinitions = new Map(
		characterV1.styles.map(style => [style.name, style])
	);

	for (const styleName of styleNames) {
		const style = styleDefinitions.get(styleName);
		if (style && style.nsfw && !nsfw) continue;

		let reducedName = styleName;
		const components: V2.Style<string>['components'] = {};
		for (const component of styleComponents) {
			for (const varKey of Object.keys(component.variants)) {
				const exp = new RegExp('-' + varKey + '\\b');
				if (reducedName.match(exp)) {
					components[component.id] = varKey;
					reducedName = reducedName.replace(exp, '');
					break;
				}
			}
		}

		reducedName = expandOrTranslateId('styleGroups', reducedName, ctx);

		let styleGroup: V2.StyleGroup<string> | undefined = baseStyles.get(
			reducedName
		);
		if (!styleGroup) {
			styleGroup = {
				id: reducedName,
				styleComponents: styleComponents,
				styles: [],
			};
			baseStyles.set(reducedName, styleGroup);
			baseStyleIds.push(reducedName);
		}

		styleGroup.styles.push({
			components,
			poses: convertPoses(
				characterV1.poses.filter(pose => pose.style === styleName),
				ctx,
				nsfw
			),
		});
	}
	return baseStyleIds.map(id => baseStyles.get(id)!);
}

function getRenderCommands(
	headInForeground: boolean,
	headAnchor: [number, number]
): Array<V2.PoseRenderCommand<string>> {
	if (headInForeground) {
		return [
			{ type: 'pose-part', offset: [0, 0], part: 'Static' },
			{ type: 'pose-part', offset: [0, 0], part: 'Variant' },
			{ type: 'pose-part', offset: [0, 0], part: 'Left' },
			{ type: 'pose-part', offset: [0, 0], part: 'Right' },
			{ type: 'head', offset: headAnchor },
		];
	} else {
		return [
			{ type: 'head', offset: headAnchor },
			{ type: 'pose-part', offset: [0, 0], part: 'Static' },
			{ type: 'pose-part', offset: [0, 0], part: 'Variant' },
			{ type: 'pose-part', offset: [0, 0], part: 'Left' },
			{ type: 'pose-part', offset: [0, 0], part: 'Right' },
		];
	}
}

function convertPoses(
	posesV1: Array<V1.PoseMeta<V1.HeadCollections>>,
	ctx: ITranslationContext,
	nsfw: boolean
): Array<V2.Pose<string>> {
	return posesV1.map(
		(poseV1): V2.Pose<string> => {
			return {
				compatibleHeads: poseV1.compatibleHeads.map(x =>
					expandOrTranslateId('heads', x.toString(), ctx)
				),
				id: expandOrTranslateId('poses', poseV1.name, ctx),
				renderCommands: getRenderCommands(
					poseV1.headInForeground,
					poseV1.headAnchor
				),
				previewOffset: poseV1.offset,
				previewSize: poseV1.size,
				size: [960, 960],
				scale: 0.8,
				positions: {
					Static: 'static' in poseV1 ? [[poseV1.static]] : [],
					Left: 'left' in poseV1 ? convertNsfwAbles(poseV1.left, nsfw) : [],
					Right: 'right' in poseV1 ? convertNsfwAbles(poseV1.right, nsfw) : [],
					Variant:
						'variant' in poseV1 ? convertNsfwAbles(poseV1.variant, nsfw) : [],
				},
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
	ctx: ITranslationContext,
	nsfw: boolean
): V2.HeadCollections<string> {
	const headCollectionsV2: { [s: string]: V2.HeadCollection<string> } = {};

	for (const key of Object.keys(headCollectionsV1)) {
		const headCollectionV1 = headCollectionsV1[key];
		if (headCollectionV1.nsfw && !nsfw) continue;
		headCollectionsV2[expandOrTranslateId('heads', key, ctx)] = {
			previewOffset: headCollectionV1.offset,
			previewSize: headCollectionV1.size,
			variants: headCollectionV1.all
				.filter(image => !image.nsfw || nsfw)
				.map(img => [img.img]),
		};
	}

	return headCollectionsV2;
}

function convertStyleComponents(
	characterV1: V1.Character<V1.HeadCollections>,
	ctx: ITranslationContext
): Array<V2.StyleComponent<string>> {
	const ret: Array<V2.StyleComponent<string>> = [];
	const retVariants: string[] = [];

	if (Object.keys(characterV1.eyes).length > 0) {
		Object.keys(characterV1.eyes).forEach(eyeKey => retVariants.push(eyeKey));
		ret.push({
			label: 'Eyes',
			id: expandOrTranslateId('eyes', 'eyes', ctx),
			variants: characterV1.eyes,
		});
	}

	if (Object.keys(characterV1.hairs).length > 0) {
		Object.keys(characterV1.hairs).forEach(hairKey =>
			retVariants.push(hairKey)
		);
		ret.push({
			label: 'Hairs',
			id: expandOrTranslateId('hairs', 'hairs', ctx),
			variants: characterV1.hairs,
		});
	}

	return ret;
}

interface ITranslationContext {
	characterId: string;
	packId: string;
}

interface ITranslationTable {
	character: string;
	heads: Map<string, string>;
	poses: Map<string, string>;
	styleGroups: Map<string, string>;
	hairs: string;
	eyes: string;
}

function associate(targetPack: string, ids: string[]): Map<string, string> {
	return new Map(ids.map(id => [id, `${targetPack}:${id}`]));
}

function assocChar(
	targetPack: string,
	character: string,
	input: {
		heads: string[];
		poses: string[];
		styleGroups: string[];
		extraHeadAssoc?: Array<[string, string]>;
		extraPoseAssoc?: Array<[string, string]>;
		extraStyleGroupAssoc?: Array<[string, string]>;
	}
): ITranslationTable {
	if (!input.extraHeadAssoc) input.extraHeadAssoc = [];
	else {
		input.extraHeadAssoc = input.extraHeadAssoc.map(extra => [
			extra[0],
			`${targetPack}:${extra[1]}`,
		]);
	}
	if (!input.extraPoseAssoc) input.extraPoseAssoc = [];
	else {
		input.extraPoseAssoc = input.extraPoseAssoc.map(extra => [
			extra[0],
			`${targetPack}:${extra[1]}`,
		]);
	}
	if (!input.extraStyleGroupAssoc) input.extraStyleGroupAssoc = [];
	else {
		input.extraStyleGroupAssoc = input.extraStyleGroupAssoc.map(extra => [
			extra[0],
			`${targetPack}:${extra[1]}`,
		]);
	}
	return {
		character: `${targetPack}:${character}`,
		eyes: `${targetPack}:eyes`,
		hairs: `${targetPack}:hair`,
		heads: new Map([
			...associate(targetPack, input.heads),
			...input.extraHeadAssoc!,
		]),
		poses: new Map([
			...associate(targetPack, input.poses),
			...input.extraPoseAssoc!,
		]),
		styleGroups: new Map([
			...associate(targetPack, input.styleGroups),
			...input.extraStyleGroupAssoc!,
		]),
	};
}

const translationTables: { [charId: string]: ITranslationTable } = {
	'ddlc.monika': assocChar('dddg.buildin.base.monika', 'ddlc.monika', {
		heads: ['straight', 'sideways'],
		poses: ['normal', 'leaned', 'old', 'glitch'],
		styleGroups: ['uniform', 'old', 'glitch'],
	}),
	'ddlc.natsuki': assocChar('dddg.buildin.base.natsuki', 'ddlc.natsuki', {
		heads: ['straight', 'straight_nsfw', 'sideways', 'turnedAway'],
		poses: ['normal', 'crossed_arms', 'vomit', 'glitch'],
		styleGroups: ['uniform', 'casual', 'old'],
		extraPoseAssoc: [
			/* That typo was actually made in the definition file */
			['normal_causal', 'normal'],
			['crossed_arms_casual', 'crossed_arms'],
		],
		extraHeadAssoc: [['straight_nsfw', 'straight']],
	}),
	'ddlc.sayori': assocChar('dddg.buildin.sayori', 'ddlc.sayori', {
		heads: ['straight', 'sideways'],
		poses: ['normal', 'sideways', 'old', 'glitch', 'dead'],
		styleGroups: ['uniform', 'casual', 'old', 'glitch', 'hanging'],
		extraPoseAssoc: [['normal_casual', 'normal']],
	}),
	'ddlc.yuri': assocChar('dddg.buildin.yuri', 'ddlc.yuri', {
		heads: ['straight', 'sideways'],
		poses: ['normal', 'sideways', 'stabbing', 'glitching', 'dragon'],
		styleGroups: ['uniform', 'casual', 'glitch'],
		extraPoseAssoc: [
			/* That typo was actually made in the definition file */
			['normal_causal', 'normal'],
			['hairplay_casual', 'hairplay'],
		],
	}),
	'ddlc.fan.mc1': assocChar('dddg.buildin.mc_classic', 'ddlc.fan.mc1', {
		heads: ['straight'],
		poses: ['normal'],
		styleGroups: [],
		extraStyleGroupAssoc: [['uniform-yellow', 'uniform']],
	}),
	'ddlc.fan.mc2': assocChar('dddg.buildin.mc', 'ddlc.fan.mc2', {
		heads: ['straight', 'straight_red'],
		poses: ['normal', 'crossed_arms', 'casual', 'glitching', 'dragon'],
		styleGroups: ['uniform', 'casual'],
		extraPoseAssoc: [
			['crossed_arms_casual', 'crossed_arms'],
			['crossed_arms_red', 'crossed_arms'],
			['normal_red', 'normal'],
			['casual_red', 'casual'],
			['casual_crossed_arms_red', 'crossed_arms'],
		],
	}),
	'ddlc.fan.mc_chad': assocChar('dddg.buildin.mc_chad', 'ddlc.fan.mc_chad', {
		heads: ['straight', 'straight_closed', 'straight_red'],
		poses: ['normal', 'youknowihadto'],
		styleGroups: ['uniform', 'casual'],
		extraPoseAssoc: [
			['normal_casual', 'normal'],
			['youknowihadto_casual', 'youknowihadto'],
			['normal_red', 'normal'],
			['youknowihadto_red', 'youknowihadto'],
			['normal_casual_red', 'normal'],
			['youknowihadto_casual_red', 'youknowihadto'],
		],
	}),
	'ddlc.fan.femc': assocChar('dddg.buildin.femc', 'ddlc.fan.femc', {
		heads: [
			'straight',
			'straight_closed',
			'straight_hetero',
			'straight_hetero_lh',
		],
		poses: ['normal', 'crossed_arms'],
		styleGroups: ['uniform', 'casual', 'uniform_strict'],
		extraPoseAssoc: [
			['casual_normal', 'normal'],
			['casual_crossed_arms', 'crossed_arms'],
			['uniform_normal', 'normal'],
			['uniform_crossed_arms', 'crossed_arms'],
			['normal_long_hair', 'normal'],
			['crossed_arms_long_hair', 'crossed_arms'],
			['casual_normal_long_hair', 'normal'],
			['casual_crossed_arms_long_hair', 'crossed_arms'],
			['uniform_normal_long_hair', 'normal'],
			['uniform_crossed_arms_long_hair', 'crossed_arms'],
			['normal_hetero', 'normal'],
			['crossed_arms_hetero', 'crossed_arms'],
			['casual_normal_hetero', 'normal'],
			['casual_crossed_arms_hetero', 'crossed_arms'],
			['uniform_normal_hetero', 'normal'],
			['uniform_crossed_arms_hetero', 'crossed_arms'],
			['normal_long_hair_hetero', 'normal'],
			['crossed_arms_long_hair_hetero', 'crossed_arms'],
			['casual_normal_long_hair_hetero', 'normal'],
			['casual_crossed_arms_long_hair_hetero', 'crossed_arms'],
			['uniform_normal_long_hair_hetero', 'normal'],
			['uniform_crossed_arms_long_hair_hetero', 'crossed_arms'],
		],
	}),
	'ddlc.fan.amy1': assocChar('dddg.buildin.amy1', 'ddlc.fan.amy1', {
		heads: ['straight'],
		poses: ['normal', 'crossed_arms'],
		styleGroups: ['uniform'],
	}),
	'ddlc.fan.amy2': assocChar('dddg.buildin.amy2', 'ddlc.fan.amy2', {
		heads: ['straight', 'straight_closed', 'straight_red'],
		poses: [
			'normal',
			'folded_hands_up',
			'folded_hands_down',
			'hands_on_glasses',
		],
		styleGroups: ['uniform', 'casual'],
		extraPoseAssoc: [
			['normal-casual', 'normal'],
			['folded_hands_up-casual', 'folded_hands_up'],
			['folded_hands_down-casual', 'folded_hands_down'],
			['hands_on_glasses-casual', 'hands_on_glasses'],
		],
	}),
};

export function expandOrTranslateId(
	type: 'heads' | 'poses' | 'styleGroups' | 'hairs' | 'eyes' | 'character',
	objectId: string,
	ctx: ITranslationContext
): string {
	const translation = translationTables[ctx.characterId];
	if (translation) {
		if (type === 'character' || type === 'hairs' || type === 'eyes')
			return translation[type] as string;
		const lookup = (translation[type] as Map<string, string>).get(objectId);
		if (lookup) return lookup;
	}
	return expandId(ctx.packId, objectId);
}
