import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const registryPath = path.join(root, 'registry.json');
const outputDir = path.join(root, 'static', 'r');

const registry = JSON.parse(await readFile(registryPath, 'utf8'));

await mkdir(outputDir, { recursive: true });

for (const item of registry.items ?? []) {
	const files = await Promise.all(
		(item.files ?? []).map(async (file) => {
			const sourcePath = path.join(root, file.path);
			const content = await readFile(sourcePath, 'utf8');

			return {
				path: file.path,
				content,
				type: file.type,
				target: file.target
			};
		})
	);

	const registryItem = {
		$schema: 'https://shadcn-svelte.com/schema/registry-item.json',
		name: item.name,
		type: item.type,
		title: item.title,
		description: item.description,
		dependencies: item.dependencies ?? [],
		registryDependencies: item.registryDependencies ?? [],
		files
	};

	if (item.cssVars) {
		registryItem.cssVars = item.cssVars;
	}

	await writeFile(
		path.join(outputDir, `${item.name}.json`),
		`${JSON.stringify(registryItem, null, '\t')}\n`,
		'utf8'
	);
}
