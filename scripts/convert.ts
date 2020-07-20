import { normalizeCharacter } from '../src/v1/parser';
import { convert } from '../src/v2/convertV1';
import { assetWalker } from '../src/v2/util';

process.stdin.resume();
process.stdin.setEncoding('utf8');

let input = '';

process.stdin.on('data', function(chunk) {
	input += chunk;
});

process.stdin.on('end', function() {
	convertJSON();
});

function convertJSON() {
	const v1pack = normalizeCharacter(JSON.parse(input), { '/': '/' });
	if (!v1pack.packId) v1pack.packId = 'fisch';
	const v2pack = convert(v1pack, {}, true);
	let chibi = true;

	const extensions = assetWalker(v2pack, (old, type) => {
		if (type === 'font') throw new Error(`Fonts weren't supported in V1. WTH?`);
		old = old + '{ext}';
		if (chibi) {
			chibi = false;
			return old;
		} else {
			return `/${old}`;
		}
	});
}
