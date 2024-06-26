export type Item = {
	title: string;
	description: Array<string>;
	imageUrl: string;
	imageAlt: string;
};

export const baseUrl = 'http://localhost:3000/api';

const fetchItems = async (signal: AbortSignal) => {
	try {
		const response = await fetch(`${baseUrl}/items`, { signal });
		if (!response.ok) {
			return Promise.reject(new Error(await response.text()));
		}
		return (await response.json()) as Promise<Array<Item>>;
	} catch (err: unknown) {
		if (err instanceof DOMException && err.name === 'AbortError') {
			console.log('Aborting request on unmount');
			return Promise.resolve([]);
		} else {
			return Promise.reject(
				err instanceof Error ? err : new Error('Unknown error')
			);
		}
	}
};

export const service = {
	fetchItems,
};
