import { delay, http, HttpResponse, passthrough } from 'msw';

import { baseUrl } from '../service';
import { items } from './item-data';

export const handlers = [
	http.get(`${baseUrl}/items`, async () => {
		await delay(1000);
		return HttpResponse.json(items);
	}),
	// Fetch images - declaring this prevents MSW warnings in console
	http.get(/\.(jpe?g|png)/, () => passthrough()),
];
