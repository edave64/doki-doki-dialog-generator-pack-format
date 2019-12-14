import { normalizePath } from '../../../src/v2/util';

describe('V2: Path normalization', () => {
	it('unchanged paths', () => {
		expect(
			normalizePath('/test', new Map(), new Set(['png', 'webp']), true)
		).toBe('/test');
		expect(
			normalizePath('/test/nested', new Map(), new Set(['png', 'webp']), true)
		).toBe('/test/nested');
		expect(
			normalizePath(
				'/test/{unknownPattern}',
				new Map(),
				new Set(['png', 'webp']),
				true
			)
		).toBe('/test/{unknownPattern}');
	});

	it('lq/hq', () => {
		expect(
			normalizePath(
				'/test{lq:.lq:.hq}',
				new Map(),
				new Set(['png', 'webp']),
				true
			)
		).toBe('/test.lq');
		expect(
			normalizePath(
				'/test{lq:.lq:.hq}',
				new Map(),
				new Set(['png', 'webp']),
				false
			)
		).toBe('/test.hq');
	});

	it('format', () => {
		expect(
			normalizePath(
				'/supported{format:webp:.webp:png:.png}',
				new Map(),
				new Set(['png', 'webp']),
				true
			)
		).toBe('/supported.webp');
		expect(
			normalizePath(
				'/supported{format:png:.png:webp:.webp}',
				new Map(),
				new Set(['png', 'webp']),
				true
			)
		).toBe('/supported.png');
		expect(
			normalizePath(
				'/supported{format:webp:.webp:png:.png}',
				new Map(),
				new Set(['png']),
				true
			)
		).toBe('/supported.png');
	});

	it('format and lq/hq', () => {
		expect(
			normalizePath(
				'/supported{lq:.lq:}.{format:webp:webp:png:png}',
				new Map(),
				new Set(['png', 'webp']),
				true
			)
		).toBe('/supported.lq.webp');
		expect(
			normalizePath(
				'/supported{lq:.lq:}.{format:png:png:webp:webp}',
				new Map(),
				new Set(['png', 'webp']),
				false
			)
		).toBe('/supported.png');
	});

	it('replacements', () => {
		expect(
			normalizePath(
				'/{rep}-static',
				new Map([
					['rep', 'right'],
					['noRep', 'wrong'],
				]),
				new Set(['png', 'webp']),
				true
			)
		).toBe('/right-static');
	});

	it('stacked replacement', () => {
		expect(
			normalizePath(
				'/{a}-static',
				new Map([
					['a', 'r{s}t'],
					['s', 'igh'],
				]),
				new Set(['png', 'webp']),
				true
			)
		).toBe('/right-static');
	});

	it('format/replacement stacking', () => {
		expect(
			normalizePath(
				'/static{ext}',
				new Map([
					['ext', '{format:webp:{w}:png:{p}}'],
					['w', '.webp'],
					['p', '.png'],
				]),
				new Set(['png']),
				true
			)
		).toBe('/static.png');
	});

	it('format stacking limit', () => {
		expect(() =>
			normalizePath('/{ext}', new Map([['ext', '{ext}{ext}']]), new Set(), true)
		).toThrowError();
	});
});
