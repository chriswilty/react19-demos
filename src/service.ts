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

type SubmitResult = { item: Item } | { error: string };

const submitItem = async (item: Item): Promise<SubmitResult> => {
	const response = await fetch(`${baseUrl}/items`, {
		method: 'POST',
		headers: { 'content-type': 'application/json' },
		body: JSON.stringify(item),
	});

	if (!response.ok) {
		return {
			error: `Submit failed: ${response.statusText}`,
		};
	}

	return {
		item: (await response.json()) as Item,
	};
};

export const service = {
	fetchItems,
	submitItem,
};
