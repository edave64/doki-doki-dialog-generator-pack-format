import { normalizePath } from '../../../src/v2/util';
import { convert } from '../../../src/v2/convertV1';
import { Character, HeadCollections } from '../../../src/v1/model';

describe('V2: V1 Conversion', () => {
	it('Simple conversion', () => {
		const base: Character<HeadCollections> = {
			chibi: 'fisch',
			eyes: {
				green: 'lh',
				violet: 'sh',
			},
			hairs: {
				long: 'lh',
				short: 'sh',
			},
			heads: {
				sideways: {
					all: [
						{
							img: 'head1',
							nsfw: false,
						},
					],
					offset: [20, 20],
					size: [20, 20],
					nsfw: false,
				},
			},
			id: 'fisch',
			name: 'Fisch',
			nsfw: false,
			poses: [
				{
					compatibleHeads: ['sideways'],
					headAnchor: [0, 0],
					headInForeground: false,
					left: [],
					right: [],
					name: 'straight-uniform-long-green',
					nsfw: false,
					offset: [0, 0],
					size: [0, 0],
					static: 'asd',
					style: 'uniform-long-green',
					variant: [],
				},
			],
			styles: [{ label: 'Uniform', name: 'uniform-long-green', nsfw: false }],
			packId: 'test.pack',
			packCredits: '',
		};
		const converted = convert(base, false);
		expect(converted).toMatchInlineSnapshot(`
		Object {
		  "backgrounds": Array [],
		  "characters": Array [
		    Object {
		      "chibi": "fisch",
		      "heads": Object {
		        "sideways": Object {
		          "offset": Array [
		            20,
		            20,
		          ],
		          "size": Array [
		            20,
		            20,
		          ],
		          "variants": Array [
		            Array [
		              "head1",
		            ],
		          ],
		        },
		      },
		      "id": "fisch",
		      "label": "fisch",
		      "poses": Array [
		        Object {
		          "compatibleHeads": Array [
		            "sideways",
		          ],
		          "headAnchor": Array [
		            0,
		            0,
		          ],
		          "left": Array [],
		          "name": "straight-uniform-long-green",
		          "offset": Array [
		            0,
		            0,
		          ],
		          "renderOrder": "HSVLR",
		          "right": Array [],
		          "size": Array [
		            0,
		            0,
		          ],
		          "static": Array [
		            "asd",
		          ],
		          "style": "uniform-long-green",
		          "variant": Array [],
		        },
		      ],
		      "size": Array [
		        960,
		        960,
		      ],
		      "styleComponents": Array [
		        Object {
		          "label": "Eyes",
		          "name": "eyes",
		          "variants": Object {
		            "green": "lh",
		            "violet": "sh",
		          },
		        },
		        Object {
		          "label": "Hairs",
		          "name": "hairs",
		          "variants": Object {
		            "long": "lh",
		            "short": "sh",
		          },
		        },
		      ],
		      "styles": Array [
		        Object {
		          "components": Object {
		            "eyes": "green",
		            "hairs": "long",
		          },
		          "label": "Uniform",
		          "name": "uniform-long-green",
		          "styleGroup": "uniform",
		        },
		      ],
		    },
		  ],
		  "fonts": Array [],
		  "packCredits": "",
		  "packId": "test.pack",
		  "poemStyles": Array [],
		  "sprites": Array [],
		}
	`);
	});
});
