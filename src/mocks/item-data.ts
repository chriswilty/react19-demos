import { Item } from '../service.ts';
import pickleUrl from '../assets/images/pickle-floof.jpg';

export const items: Array<Item> = [
	{
		title: 'This is a Cat',
		description: [
			'Cats are wonderfully lazy mammals that we can all admire and aspire to be.' +
				' They are simultaneously aloof and loving, starving hungry and picky, lazy and hyperactive.' +
				" Unlike children or dogs, you can drop cats and they won't be injured.",
			'Cats often like to be with their humans, particularly when it is most inconvenient, such' +
				' as during work calls or in the middle of the night. If they are unable to reach their' +
				' humans they will miau loudly and continually until they gain access. If they are unable' +
				" to get their chosen human's attention, they will either walk around rubbing themselves" +
				' against this human until the human falls over, or they will sit on top of whatever was' +
				' distracting the human (keyboard, book, wine glass) until the situation changes.',
			'Cats are the perfect companion for anyone looking for fluffy love.... but not all the time.',
		],
		imageUrl: pickleUrl,
		imageAlt: 'Pickle is a floof',
	},
	{
		title: 'Whisky, Whiskey, Uisge Beatha',
		description: [
			'As I sat in my favourite old chair, listening to the rain lashing the window, the warmth ' +
				"of the fire soothing my tired, old man's bones, I reflected on the many wonders that " +
				'life had thrown my way. I let my mind drift over my most precious moments, with wee Fiona ' +
				'snoozing in my lap and a peaty Ardbeg gently warming my soul.',
			'I have been to the top of the world, and stood on dry ground beneath the sea. I have ' +
				'dived into glacial lakes, and surfed the sands of deserts. I have been overcome by the ' +
				'unconditional love of my children, yet hated by heroes. Anger can find me on the ' +
				'calmest of days, while true serenity I find only in the wildest of storms.',
			'What treasures I have held in these hands! I tell my secrets to the amber, smoky liquid ' +
				'I now cradle, a spirit trapped in a dark casket for years while I roamed the lands, ' +
				'untethered from my destiny.',
		],
		imageUrl:
			'https://oldtennesseedistillingco.com/wp-content/uploads/2018/12/Whiskey-or-Whisky.jpeg',
		imageAlt: 'A wee dram',
	},
	{
		title: 'Snow-Capped Mountains',
		description: [
			'To stand on the very top of a snowy mountain with nothing but space in every direction is ' +
				'to feel, to know, the insignificance of a human lifespan.',
			'These towering giants hold an unearthly stillness, an imposing silence that commands ' +
				'reverence. The jagged ridges are softened, cloaked in powdery snow, creating a harmony of ' +
				'contrasts. As the wind surges eagerly over the slopes, it lifts swirls of snowflakes into ' +
				'a glittering dance, a momentary blizzard casting ephemeral shadows on the white expanses.',
			'At dawn, the first light bathes the peaks in a soft, rose gold glow, while dusk sees them ' +
				'tinted in hues of violet and indigo, the first stars of night lending the display their ' +
				'own ethereal sparkle. Frozen waterfalls bisect the mountainsides, their crystalline ' +
				'formations like alien sculptures.',
			'I left my heart on Buachaille Etive Mòr.',
		],
		imageUrl:
			'https://www.findingtheuniverse.com/wp-content/uploads/2021/04/Glencoe-Scotland-in-Winter_by_Laurence-Norah.jpg',
		imageAlt: 'Glencoe from Rannoch Moor',
	},
];
