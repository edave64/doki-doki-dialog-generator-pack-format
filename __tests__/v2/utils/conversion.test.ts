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
		Object {
		  "backgrounds": Array [],
		  "characters": Array [
		    Object {
		      "chibi": "fisch",
		      "heads": Object {
		        "test.pack:sideways": Object {
		          "previewOffset": Array [
		            20,
		            20,
		          ],
		          "previewSize": Array [
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
		      "id": "test.pack:fisch",
		      "label": "Fisch",
		      "styleGroups": Array [
		        Object {
		          "id": "test.pack:uniform",
		          "styleComponents": Array [
		            Object {
		              "id": "test.pack:eyes",
		              "label": "Eyes",
		              "variants": Object {
		                "green": "lh",
		                "violet": "sh",
		              },
		            },
		            Object {
		              "id": "test.pack:hairs",
		              "label": "Hairs",
		              "variants": Object {
		                "long": "lh",
		                "short": "sh",
		              },
		            },
		          ],
		          "styles": Array [
		            Object {
		              "components": Object {
		                "test.pack:eyes": "green",
		                "test.pack:hairs": "long",
		              },
		              "poses": Array [
		                Object {
		                  "compatibleHeads": Array [
		                    "test.pack:sideways",
		                  ],
		                  "id": "test.pack:straight-uniform-long-green",
		                  "positions": Object {
		                    "Left": Array [],
		                    "Right": Array [],
		                    "Static": Array [
		                      Array [
		                        "asd",
		                      ],
		                    ],
		                    "Variant": Array [],
		                  },
		                  "previewOffset": Array [
		                    0,
		                    0,
		                  ],
		                  "previewSize": Array [
		                    0,
		                    0,
		                  ],
		                  "renderCommands": Array [
		                    Object {
		                      "offset": Array [
		                        0,
		                        0,
		                      ],
		                      "type": "head",
		                    },
		                    Object {
		                      "offset": Array [
		                        0,
		                        0,
		                      ],
		                      "part": "Static",
		                      "type": "pose-part",
		                    },
		                    Object {
		                      "offset": Array [
		                        0,
		                        0,
		                      ],
		                      "part": "Variant",
		                      "type": "pose-part",
		                    },
		                    Object {
		                      "offset": Array [
		                        0,
		                        0,
		                      ],
		                      "part": "Left",
		                      "type": "pose-part",
		                    },
		                    Object {
		                      "offset": Array [
		                        0,
		                        0,
		                      ],
		                      "part": "Right",
		                      "type": "pose-part",
		                    },
		                  ],
		                  "scale": 0.8,
		                  "size": Array [
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
		  "colors": Array [],
		  "dependencies": Array [],
		  "fonts": Array [],
		  "packCredits": Array [],
		  "packId": "test.pack",
		  "poemBackgrounds": Array [],
		  "poemStyles": Array [],
		  "sprites": Array [],
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
		Object {
		  "backgrounds": Array [],
		  "characters": Array [
		    Object {
		      "chibi": undefined,
		      "heads": Object {},
		      "id": "dddg.buildin.base.monika:ddlc.monika",
		      "label": undefined,
		      "styleGroups": Array [
		        Object {
		          "id": "monika.outfit.casual.destinypvegal.edave64:casual_destinypvegal",
		          "styleComponents": Array [],
		          "styles": Array [
		            Object {
		              "components": Object {},
		              "poses": Array [
		                Object {
		                  "compatibleHeads": Array [
		                    "dddg.buildin.base.monika:straight",
		                  ],
		                  "id": "monika.outfit.casual.destinypvegal.edave64:normal-casual_destinypvegal",
		                  "positions": Object {
		                    "Left": Array [
		                      Array [
		                        "testpath/1l.png",
		                      ],
		                      Array [
		                        "testpath/2l.png",
		                      ],
		                    ],
		                    "Right": Array [
		                      Array [
		                        "testpath/1r.png",
		                      ],
		                      Array [
		                        "testpath/2r.png",
		                      ],
		                    ],
		                    "Static": Array [],
		                    "Variant": Array [],
		                  },
		                  "previewOffset": Array [
		                    0,
		                    0,
		                  ],
		                  "previewSize": Array [
		                    960,
		                    960,
		                  ],
		                  "renderCommands": Array [
		                    Object {
		                      "offset": Array [
		                        0,
		                        0,
		                      ],
		                      "type": "head",
		                    },
		                    Object {
		                      "offset": Array [
		                        0,
		                        0,
		                      ],
		                      "part": "Static",
		                      "type": "pose-part",
		                    },
		                    Object {
		                      "offset": Array [
		                        0,
		                        0,
		                      ],
		                      "part": "Variant",
		                      "type": "pose-part",
		                    },
		                    Object {
		                      "offset": Array [
		                        0,
		                        0,
		                      ],
		                      "part": "Left",
		                      "type": "pose-part",
		                    },
		                    Object {
		                      "offset": Array [
		                        0,
		                        0,
		                      ],
		                      "part": "Right",
		                      "type": "pose-part",
		                    },
		                  ],
		                  "scale": 0.8,
		                  "size": Array [
		                    960,
		                    960,
		                  ],
		                },
		                Object {
		                  "compatibleHeads": Array [
		                    "dddg.buildin.base.monika:sideways",
		                  ],
		                  "id": "monika.outfit.casual.destinypvegal.edave64:leaned-casual_destinypvegal",
		                  "positions": Object {
		                    "Left": Array [],
		                    "Right": Array [],
		                    "Static": Array [
		                      Array [
		                        "testpath/3.png",
		                      ],
		                    ],
		                    "Variant": Array [],
		                  },
		                  "previewOffset": Array [
		                    0,
		                    0,
		                  ],
		                  "previewSize": Array [
		                    960,
		                    960,
		                  ],
		                  "renderCommands": Array [
		                    Object {
		                      "offset": Array [
		                        0,
		                        0,
		                      ],
		                      "type": "head",
		                    },
		                    Object {
		                      "offset": Array [
		                        0,
		                        0,
		                      ],
		                      "part": "Static",
		                      "type": "pose-part",
		                    },
		                    Object {
		                      "offset": Array [
		                        0,
		                        0,
		                      ],
		                      "part": "Variant",
		                      "type": "pose-part",
		                    },
		                    Object {
		                      "offset": Array [
		                        0,
		                        0,
		                      ],
		                      "part": "Left",
		                      "type": "pose-part",
		                    },
		                    Object {
		                      "offset": Array [
		                        0,
		                        0,
		                      ],
		                      "part": "Right",
		                      "type": "pose-part",
		                    },
		                  ],
		                  "scale": 0.8,
		                  "size": Array [
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
		  "colors": Array [],
		  "dependencies": Array [],
		  "fonts": Array [],
		  "packCredits": Array [
		    "<a href='https://www.reddit.com/comments/8t62u7' target='_blank' rel='noopener noreferrer'>Created by</a> DestinyPvEGal",
		  ],
		  "packId": "monika.outfit.casual.destinypvegal.edave64",
		  "poemBackgrounds": Array [],
		  "poemStyles": Array [],
		  "sprites": Array [],
		}
	`);
	});
});
