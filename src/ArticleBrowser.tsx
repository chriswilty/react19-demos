import {
	Suspense,
	use,
	useCallback,
	useEffect,
	useMemo,
	useState,
} from 'react';

import { service, Item } from './service';
import Spinner from './Spinner';
import './ArticleBrowser.css';

type ArticleViewProps = Item;

const ArticleView = ({
	title,
	description,
	imageUrl,
	imageAlt,
}: ArticleViewProps) => {
	const [isExpanded, setExpanded] = useState(false);
	const toggle = useCallback(
		() => setExpanded((current) => !current),
		[setExpanded]
	);

	const shortDescription = useMemo(() => {
		const fullDescription = description.join(' ');
		if (fullDescription.length <= 100) return fullDescription;
		return `${fullDescription.slice(0, fullDescription.indexOf(' ', 95))} ...`;
	}, [description]);

	const toggleButton = (
		<button className="inline" onClick={toggle}>
			{isExpanded ? 'Collapse' : 'Read more'}
		</button>
	);

	return (
		<article className={`flex-column gap-1 ${isExpanded ? 'expanded' : ''}`}>
			<header>
				<h2>{title}</h2>
			</header>
			<section>
				<img src={imageUrl} title={imageAlt} alt={imageAlt} />
				{isExpanded ? (
					description.map((paragraph, idx) => <p key={idx}>{paragraph}</p>)
				) : (
					<p>{shortDescription}</p>
				)}
				{toggleButton}
			</section>
		</article>
	);
};

type ArticleListProps = {
	itemsPromise: Promise<Array<Item>>;
};

const ArticleList = ({ itemsPromise }: ArticleListProps) => {
	// This component will suspend until promise resolves
	const items = use(itemsPromise);

	return (
		<main className="card flex-column flex-grow-1">
			{items.length > 0 && (
				<ul className="flex-column gap-2">
					{items.map((item) => (
						<li key={item.title}>
							<ArticleView {...item} />
						</li>
					))}
				</ul>
			)}
		</main>
	);
};

const ArticleBrowser = () => {
	// React 19 with use(): We can now pass a promise of data to ArticleList, which will
	// suspend until the promise is resolved.
	// TODO Handle data insert after update: Unpack promise, add new item, set as new promise?
	const [itemsPromise, setItemsPromise] = useState<Promise<Array<Item>>>(
		Promise.resolve([])
	);

	useEffect(() => {
		const abortController = new AbortController();
		setItemsPromise(service.fetchItems(abortController.signal));
		return () => abortController.abort();
	}, []);

	const loader = (
		<div className="card flex-column flex-center flex-grow-1">
			<Spinner />
		</div>
	);

	return (
		<div className="article-browser flex-column gap-2">
			<header className="card">
				<h1>My Favourite Things</h1>
			</header>
			<Suspense fallback={loader}>
				<ArticleList itemsPromise={itemsPromise} />
			</Suspense>
		</div>
	);
};

export default ArticleBrowser;
