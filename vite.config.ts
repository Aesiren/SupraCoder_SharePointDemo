import { fileURLToPath, URL } from 'node:url';
import { defineConfig, loadEnv } from 'vite';
import path from 'path';
import vue from '@vitejs/plugin-vue';
import { viteStaticCopy } from 'vite-plugin-static-copy';
// Would like to use the following import, however the stores contain too many entries so it crashes.
import vueDevTools from 'vite-plugin-vue-devtools';

// renaming the index as plugin
const renameIndexPlugin = (newFilename: string) => {
	return {
		name: 'renameIndex',
		enforce: 'post' as const,
		// @ts-expect-error The types for options and bundle are correct, but not present in the current space.
		generateBundle(options: NormalizedOutputOptions, bundle: OutputBundle) {
			const indexHtml = bundle['index.html'];
			if (!newFilename) indexHtml.fileName = 'index.html';
			else indexHtml.fileName = newFilename;
		},
	};
};

// main config export
export default defineConfig(({ mode }) => {
	process.env = { ...process.env, ...loadEnv(mode, process.cwd()) };

	// const plugins = [vue()];
	const plugins = [
		vue(),
		vueDevTools(),
		// This plugin will copy the correct favicon group to public
		viteStaticCopy({
			targets: [
				{
					src: `src/assets/favicons/${process.env.VITE_APP_ENV}/*`,
					//src: path.resolve(__dirname, './src/assets/favicons/' + process.env.VITE_APP_ENV + '/*.*'),
					dest: './',
				},
			],
		}),
	];
	if (mode !== 'development') plugins.push(renameIndexPlugin('index.aspx'));
	return {
		server: {
			host: '0.0.0.0' /* allow testing on local IP for iPad/phone/net */,
		},
		plugins: plugins,
		resolve: {
			alias: {
				'@': fileURLToPath(new URL('./src', import.meta.url)),
			},
		},
		build: {
			target: 'es2022',
			outDir:
				process.env.VITE_APP_ENV === 'qa'
					? path.join(__dirname, 'dist/qa')
					: process.env.VITE_APP_ENV === 'staging'
						? path.join(__dirname, 'dist/staging')
						: path.join(__dirname, 'dist/production'),
		},

		base: process.env.VITE_PATH,
	};
});
