import { normalizeCharacter } from '../../../src/v1/parser';

describe('Test converter base functionality', () => {
	it('Minimal character', () => {
		const character = normalizeCharacter(
			{
				id: 'toast',
			},
			{
				'/': 'cats',
			}
		);
		expect(character).toMatchInlineSnapshot(`
		Object {
		  "chibi": undefined,
		  "eyes": Object {},
		  "hairs": Object {},
		  "heads": Object {},
		  "id": "toast",
		  "name": undefined,
		  "nsfw": false,
		  "packCredits": undefined,
		  "packId": undefined,
		  "poses": Array [],
		  "styles": Array [],
		}
	`);
	});

	it('Internal id chibi', () => {
		const character = normalizeCharacter(
			{
				id: 'toast',
				internalId: 'monika',
			},
			{
				'/': 'cats/',
			}
		);
		expect(character.chibi).toBe('cats/assets/chibis/monika');
	});

	it('Internal id chibi path fallback', () => {
		const character = normalizeCharacter(
			{
				id: 'toast',
				internalId: 'monika',
			},
			{}
		);
		expect(character.chibi).toBe('assets/chibis/monika');
	});

	it('Internal id chibi override', () => {
		const character = normalizeCharacter(
			{
				id: 'toast',
				internalId: 'monika',
				chibi: 'override.png',
			},
			{
				'/': 'cats/',
			}
		);
		expect(character.chibi).toBe('cats/override.png');
	});

	it('Path resolution', () => {
		const character = normalizeCharacter(
			{
				id: 'toast',
				chibi: '/chibiTestLocation',
				folder: '@characterRelative/',
				eyes: {
					reativeEyes: 'eyes',
					absoluteEyes: '/eyes',
					webEyes: 'http://eyes',
				},
				hairs: {
					reativeHairs: 'hairs',
					absoluteHairs: '/hairs',
					webEyes: 'http://hairs',
				},
				heads: {
					a: ['a', '/b', 'http://c'],
					b: {
						folder: 'relativeFolder/',
						all: ['a', '/b', 'http://c'],
					},
					c: {
						folder: '/absoluteFolder/',
						all: ['a', '/b', 'http://c'],
					},
				},
				poses: [
					{
						compatibleHeads: [],
						name: 'a',
						style: 'default',
						left: ['a', '/b', 'http://c'],
						right: ['a', '/b', 'http://c'],
					},
					{
						compatibleHeads: [],
						name: 'b',
						folder: 'relativePoseFolder/',
						style: 'default',
						left: ['a', '/b', 'http://c'],
						right: ['a', '/b', 'http://c'],
					},
					{
						compatibleHeads: [],
						name: 'c',
						folder: '/absolutePoseFolder/',
						style: 'default',
						left: ['a', '/b', 'http://c'],
						right: ['a', '/b', 'http://c'],
					},
					{
						compatibleHeads: [],
						name: 'd',
						style: 'default',
						variant: ['a', '/b', 'http://c'],
					},
					{
						compatibleHeads: [],
						name: 'e',
						folder: 'relativePoseFolder/',
						style: 'default',
						variant: ['a', '/b', 'http://c'],
					},
					{
						compatibleHeads: [],
						name: 'f',
						folder: '/absolutePoseFolder/',
						style: 'default',
						variant: ['a', '/b', 'http://c'],
					},
					{
						compatibleHeads: [],
						name: 'g',
						style: 'default',
						static: 'a',
					},
					{
						compatibleHeads: [],
						name: 'h',
						folder: 'relativePoseFolder/',
						style: 'default',
						static: 'b',
					},
					{
						compatibleHeads: [],
						name: 'i',
						folder: 'relativePoseFolder/',
						style: 'default',
						static: '/c',
					},
					{
						compatibleHeads: [],
						name: 'j',
						folder: '/absolutePoseFolder/',
						style: 'default',
						static: 'd',
					},
					{
						compatibleHeads: [],
						name: 'k',
						folder: '/absolutePoseFolder/',
						style: 'default',
						static: '/e',
					},
					{
						compatibleHeads: [],
						name: 'l',
						folder: 'http://c/',
						style: 'default',
						static: 'e',
					},
					{
						compatibleHeads: [],
						name: 'm',
						folder: 'http://c/',
						style: 'default',
						static: 'http://e/',
					},
				],
			},
			{
				'/': '@root/',
			}
		);
		expect(character.chibi).toBe('@root/chibiTestLocation');

		expect(character.eyes.absoluteEyes).toBe('@root/eyes');
		expect(character.eyes.reativeEyes).toBe('@characterRelative/eyes');

		expect(character.hairs.absoluteHairs).toBe('@root/hairs');
		expect(character.hairs.reativeHairs).toBe('@characterRelative/hairs');

		expect(character.heads.a.all[0].img).toBe('@characterRelative/a');
		expect(character.heads.a.all[1].img).toBe('@root/b');
		expect(character.heads.a.all[2].img).toBe('http://c');
		expect(character.heads.b.all[0].img).toBe(
			'@characterRelative/relativeFolder/a'
		);
		expect(character.heads.b.all[1].img).toBe('@root/b');
		expect(character.heads.a.all[2].img).toBe('http://c');
		expect(character.heads.c.all[0].img).toBe('@root/absoluteFolder/a');
		expect(character.heads.c.all[1].img).toBe('@root/b');
		expect(character.heads.a.all[2].img).toBe('http://c');

		expect(character).toMatchObject({
			poses: [
				{
					left: [
						{ img: '@characterRelative/a' },
						{ img: '@root/b' },
						{ img: 'http://c' },
					],
					right: [
						{ img: '@characterRelative/a' },
						{ img: '@root/b' },
						{ img: 'http://c' },
					],
				},
				{
					left: [
						{ img: '@characterRelative/relativePoseFolder/a' },
						{ img: '@root/b' },
						{ img: 'http://c' },
					],
					right: [
						{ img: '@characterRelative/relativePoseFolder/a' },
						{ img: '@root/b' },
						{ img: 'http://c' },
					],
				},
				{
					left: [
						{ img: '@root/absolutePoseFolder/a' },
						{ img: '@root/b' },
						{ img: 'http://c' },
					],
					right: [
						{ img: '@root/absolutePoseFolder/a' },
						{ img: '@root/b' },
						{ img: 'http://c' },
					],
				},
				{
					variant: [
						{ img: '@characterRelative/a' },
						{ img: '@root/b' },
						{ img: 'http://c' },
					],
				},
				{
					variant: [
						{ img: '@characterRelative/relativePoseFolder/a' },
						{ img: '@root/b' },
						{ img: 'http://c' },
					],
				},
				{
					variant: [
						{ img: '@root/absolutePoseFolder/a' },
						{ img: '@root/b' },
						{ img: 'http://c' },
					],
				},
				{ static: '@characterRelative/a' },
				{ static: '@characterRelative/relativePoseFolder/b' },
				{ static: '@root/c' },
				{ static: '@root/absolutePoseFolder/d' },
				{ static: '@root/e' },
				{ static: 'http://c/e' },
				{ static: 'http://e/' },
			],
		});
	});

	it('NSFW-able normalization', () => {
		const character = normalizeCharacter(
			{
				id: 'toast',
				heads: {
					a: [
						'a',
						{
							img: 'b',
							nsfw: false,
						},
						{
							img: 'b',
							nsfw: true,
						},
					],
					b: {
						all: [
							'a',
							{
								img: 'b',
								nsfw: false,
							},
							{
								img: 'b',
								nsfw: true,
							},
						],
					},
				},
				poses: [
					{
						compatibleHeads: [],
						name: 'a',
						style: 'default',
						left: [
							'a',
							{
								img: 'b',
								nsfw: false,
							},
							{
								img: 'b',
								nsfw: true,
							},
						],
						right: [
							'a',
							{
								img: 'b',
								nsfw: false,
							},
							{
								img: 'b',
								nsfw: true,
							},
						],
					},
					{
						compatibleHeads: [],
						name: 'b',
						style: 'default',
						variant: [
							'a',
							{
								img: 'b',
								nsfw: false,
							},
							{
								img: 'b',
								nsfw: true,
							},
						],
					},
				],
			},
			{
				'/': 'cats',
			}
		);
		const list = [false, false, true];
		expect(character.heads.a.all.map(x => x.nsfw)).toStrictEqual(list);
		expect(character.heads.b.all.map(x => x.nsfw)).toStrictEqual(list);
		const pose0 = character.poses[0];
		if (!('left' in pose0)) throw new Error('Pose 0 is broken');
		expect(pose0.left.map(x => x.nsfw)).toStrictEqual(list);
		expect(pose0.right.map(x => x.nsfw)).toStrictEqual(list);
		const pose1 = character.poses[1];
		if (!('variant' in pose1)) throw new Error('Pose 1 is broken');
		expect(pose1.variant.map(x => x.nsfw)).toStrictEqual(list);
	});

	it('Style normalization', () => {
		const character = normalizeCharacter(
			{
				id: 'toast',
				styles: [
					{
						label: 'a',
						name: 'a',
					},
					{
						label: 'b',
						name: 'b',
						nsfw: false,
					},
					{
						label: 'c',
						name: 'c',
						nsfw: true,
					},
				],
			},
			{
				'/': 'cats',
			}
		);

		expect(character.styles.map(x => x.nsfw)).toEqual([false, false, true]);
	});

	it('Reject empty poses', () => {
		expect(() => {
			normalizeCharacter(
				{
					id: 'toast',
					poses: [
						{
							name: 'asd',
							compatibleHeads: [],
							style: '',
						},
					],
				} as any,
				{
					'/': 'cats',
				}
			);
		}).toThrowError();
	});

	it('Pose normalization', () => {
		const character = normalizeCharacter(
			{
				id: 'toast',
				poses: [
					{
						compatibleHeads: [],
						name: 'variant',
						style: 'default',
						left: [],
						right: [],
					},
					{
						compatibleHeads: [],
						name: 'variant',
						style: 'default',
						variant: [],
						nsfw: false,
					},
					{
						compatibleHeads: [],
						name: 'variant',
						style: 'default',
						static: 'asd',
						nsfw: true,
					},
				],
			},
			{
				'/': 'cats',
			}
		);

		for (const pose of character.poses) {
			expect(pose.headAnchor).toEqual([0, 0]);
			expect(pose.size).toEqual([960, 960]);
			expect(pose.offset).toEqual([0, 0]);
			expect(pose.headInForeground).toBe(false);
		}

		expect(character.poses.map(x => x.nsfw)).toEqual([false, false, true]);
	});

	it('Head normalization', () => {
		const character = normalizeCharacter(
			{
				id: 'toast',
				heads: {
					a: [],
					b: {
						all: [],
					},
					c: {
						all: [],
						nsfw: false,
					},
					d: {
						all: [],
						nsfw: true,
					},
				},
			},
			{
				'/': 'cats',
			}
		);

		const keys = Object.keys(character.heads);
		expect(keys).toHaveLength(4);
		for (const headKey of keys) {
			const head = character.heads[headKey];
			expect(head.size).toEqual([380, 380]);
			expect(head.offset).toEqual([290, 70]);
		}

		expect(keys.map(x => character.heads[x].nsfw)).toEqual([
			false,
			false,
			false,
			true,
		]);
	});
});
