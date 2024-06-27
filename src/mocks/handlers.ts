import { delay, http, HttpResponse, passthrough } from 'msw';

import { baseUrl, Item } from '../service';
import { items } from './item-data';

const getItemsFromStore = () => {
	const currentItemsJSON = localStorage.getItem('items');
	if (currentItemsJSON) {
		return JSON.parse(currentItemsJSON) as Array<Item>;
	} else {
		localStorage.setItem('items', JSON.stringify(items));
		return items;
	}
};
const appendItemToStore = (item: Item) => {
	const newItems = [...getItemsFromStore(), item];
	localStorage.setItem('items', JSON.stringify(newItems));
};

export const handlers = [
	http.get(`${baseUrl}/items`, async () => {
		await delay(1000);
		return HttpResponse.json(getItemsFromStore());
	}),
	http.post<never, Item, Item | string>(
		`${baseUrl}/items`,
		async ({ request }) => {
			await delay(1000);
			const item = await request.json();

			// Simulate error!
			if (item.title === 'Whoopsies') {
				//return HttpResponse.error();
				return HttpResponse.text('Server gone bang-bang', { status: 500 });
			}

			appendItemToStore(item);
			return HttpResponse.json(item);
		}
	),
	// Fetch images - declaring this prevents MSW warnings in console
	http.get(/\.(jpe?g|png)/, () => passthrough()),
];
