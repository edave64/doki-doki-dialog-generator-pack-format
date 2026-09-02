import { convert } from '../../../src/v2/convertV1';
import { Character, HeadCollections } from '../../../src/v1/model';
import { normalizeCharacter } from '../../../src/v1/parser';

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
		const converted = convert(base, {}, false);
		expect(converted).toMatchInlineSnapshot(`
		{
		  "backgrounds": [],
		  "characters": [
		    {
		      "chibi": "fisch",
		      "defaultScale": [
		        0.8,
		        0.8,
		      ],
		      "hd": false,
		      "heads": {
		        "test.pack:sideways": {
		          "previewOffset": [
		            20,
		            20,
		          ],
		          "previewSize": [
		            20,
		            20,
		          ],
		          "variants": [
		            [
		              "head1",
		            ],
		          ],
		        },
		      },
		      "id": "test.pack:fisch",
		      "label": "Fisch",
		      "size": [
		        960,
		        960,
		      ],
		      "styleGroups": [
		        {
		          "id": "test.pack:uniform",
		          "styleComponents": [
		            {
		              "id": "test.pack:eyes",
		              "label": "Eyes",
		              "variants": {
		                "green": "lh",
		                "violet": "sh",
		              },
		            },
		            {
		              "id": "test.pack:hairs",
		              "label": "Hairs",
		              "variants": {
		                "long": "lh",
		                "short": "sh",
		              },
		            },
		          ],
		          "styles": [
		            {
		              "components": {
		                "test.pack:eyes": "green",
		                "test.pack:hairs": "long",
		              },
		              "poses": [
		                {
		                  "compatibleHeads": [
		                    "test.pack:sideways",
		                  ],
		                  "id": "test.pack:straight-uniform-long-green",
		                  "positions": {
		                    "Left": [],
		                    "Right": [],
		                    "Static": [
		                      [
		                        "asd",
		                      ],
		                    ],
		                    "Variant": [],
		                  },
		                  "previewOffset": [
		                    0,
		                    0,
		                  ],
		                  "previewSize": [
		                    0,
		                    0,
		                  ],
		                  "renderCommands": [
		                    {
		                      "offset": [
		                        0,
		                        0,
		                      ],
		                      "type": "head",
		                    },
		                    {
		                      "offset": [
		                        0,
		                        0,
		                      ],
		                      "part": "Static",
		                      "type": "pose-part",
		                    },
		                    {
		                      "offset": [
		                        0,
		                        0,
		                      ],
		                      "part": "Variant",
		                      "type": "pose-part",
		                    },
		                    {
		                      "offset": [
		                        0,
		                        0,
		                      ],
		                      "part": "Left",
		                      "type": "pose-part",
		                    },
		                    {
		                      "offset": [
		                        0,
		                        0,
		                      ],
		                      "part": "Right",
		                      "type": "pose-part",
		                    },
		                  ],
		                  "scale": 0.8,
		                  "size": [
		                    960,
		                    960,
		                  ],
		                },
		              ],
		            },
		          ],
		        },
		      ],
		    },
		  ],
		  "colors": [],
		  "dependencies": [],
		  "fonts": [],
		  "packCredits": [],
		  "packId": "test.pack",
		  "poemBackgrounds": [],
		  "poemStyles": [],
		  "sprites": [],
		}
	`);
	});
	it('Existing pack conversion', () => {
		const base: Character<HeadCollections> = normalizeCharacter(
			JSON.parse(`{
			"$schema": "https://raw.githubusercontent.com/edave64/doki-doki-dialog-generator-pack-format/master/src/v1/schema.json",
			"id": "ddlc.monika",
			"packId": "monika.outfit.casual.destinypvegal.edave64",
			"packCredits": "<a href='https://www.reddit.com/comments/8t62u7' target='_blank' rel='noopener noreferrer'>Created by</a> DestinyPvEGal",
			"cc2credits": {
				"left": [
					"{a=https://www.reddit.com/comments/8t62u7}Monika casual outfit{/a}"
				],
				"right": ["DestinyPvEGal"]
			},
			"folder": "./",
			"styles": [
				{
					"name": "casual_destinypvegal",
					"label": "Default"
				}
			],
			"heads": {},
			"poses": [
				{
					"name": "normal-casual_destinypvegal",
					"style": "casual_destinypvegal",
					"compatibleHeads": ["straight"],
					"left": ["1l.png", "2l.png"],
					"right": ["1r.png", "2r.png"]
				},
				{
					"name": "leaned-casual_destinypvegal",
					"style": "casual_destinypvegal",
					"compatibleHeads": ["sideways"],
					"static": "3.png"
				}
			]
		}`),
			{
				'./': 'testpath/',
			}
		);
		const converted = convert(base, {}, false);
		expect(converted).toMatchInlineSnapshot(`
		{
		  "backgrounds": [],
		  "characters": [
		    {
		      "chibi": undefined,
		      "defaultScale": [
		        0.8,
		        0.8,
		      ],
		      "hd": false,
		      "heads": {},
		      "id": "dddg.buildin.base.monika:ddlc.monika",
		      "label": undefined,
		      "size": [
		        960,
		        960,
		      ],
		      "styleGroups": [
		        {
		          "id": "monika.outfit.casual.destinypvegal.edave64:casual_destinypvegal",
		          "styleComponents": [],
		          "styles": [
		            {
		              "components": {},
		              "poses": [
		                {
		                  "compatibleHeads": [
		                    "dddg.buildin.base.monika:straight",
		                  ],
		                  "id": "monika.outfit.casual.destinypvegal.edave64:normal-casual_destinypvegal",
		                  "positions": {
		                    "Left": [
		                      [
		                        "testpath/1l.png",
		                      ],
		                      [
		                        "testpath/2l.png",
		                      ],
		                    ],
		                    "Right": [
		                      [
		                        "testpath/1r.png",
		                      ],
		                      [
		                        "testpath/2r.png",
		                      ],
		                    ],
		                  },
		                  "previewOffset": [
		                    0,
		                    0,
		                  ],
		                  "previewSize": [
		                    960,
		                    960,
		                  ],
		                  "renderCommands": [
		                    {
		                      "offset": [
		                        0,
		                        0,
		                      ],
		                      "type": "head",
		                    },
		                    {
		                      "offset": [
		                        0,
		                        0,
		                      ],
		                      "part": "Static",
		                      "type": "pose-part",
		                    },
		                    {
		                      "offset": [
		                        0,
		                        0,
		                      ],
		                      "part": "Variant",
		                      "type": "pose-part",
		                    },
		                    {
		                      "offset": [
		                        0,
		                        0,
		                      ],
		                      "part": "Left",
		                      "type": "pose-part",
		                    },
		                    {
		                      "offset": [
		                        0,
		                        0,
		                      ],
		                      "part": "Right",
		                      "type": "pose-part",
		                    },
		                  ],
		                  "scale": 0.8,
		                  "size": [
		                    960,
		                    960,
		                  ],
		                },
		                {
		                  "compatibleHeads": [
		                    "dddg.buildin.base.monika:sideways",
		                  ],
		                  "id": "monika.outfit.casual.destinypvegal.edave64:leaned-casual_destinypvegal",
		                  "positions": {
		                    "Static": [
		                      [
		                        "testpath/3.png",
		                      ],
		                    ],
		                  },
		                  "previewOffset": [
		                    0,
		                    0,
		                  ],
		                  "previewSize": [
		                    960,
		                    960,
		                  ],
		                  "renderCommands": [
		                    {
		                      "offset": [
		                        0,
		                        0,
		                      ],
		                      "type": "head",
		                    },
		                    {
		                      "offset": [
		                        0,
		                        0,
		                      ],
		                      "part": "Static",
		                      "type": "pose-part",
		                    },
		                    {
		                      "offset": [
		                        0,
		                        0,
		                      ],
		                      "part": "Variant",
		                      "type": "pose-part",
		                    },
		                    {
		                      "offset": [
		                        0,
		                        0,
		                      ],
		                      "part": "Left",
		                      "type": "pose-part",
		                    },
		                    {
		                      "offset": [
		                        0,
		                        0,
		                      ],
		                      "part": "Right",
		                      "type": "pose-part",
		                    },
		                  ],
		                  "scale": 0.8,
		                  "size": [
		                    960,
		                    960,
		                  ],
		                },
		              ],
		            },
		          ],
		        },
		      ],
		    },
		  ],
		  "colors": [],
		  "dependencies": [],
		  "fonts": [],
		  "packCredits": [
		    "<a href='https://www.reddit.com/comments/8t62u7' target='_blank' rel='noopener noreferrer'>Created by</a> DestinyPvEGal",
		  ],
		  "packId": "monika.outfit.casual.destinypvegal.edave64",
		  "poemBackgrounds": [],
		  "poemStyles": [],
		  "sprites": [],
		}
	`);
	});
});
