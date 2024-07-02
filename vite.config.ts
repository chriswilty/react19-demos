import { defineConfig } from 'vite';
//import react from '@vitejs/plugin-react-swc';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
	build: {
		sourcemap: 'hidden',
	},
	plugins: [
		react({
			babel: {
				plugins: [['babel-plugin-react-compiler']],
			},
		}),
	],
});
