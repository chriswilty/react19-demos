import {
	useCallback,
	useEffect,
	useMemo,
	useState,
	useTransition,
} from 'react';
import { ErrorBoundary } from 'react-error-boundary';

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
		<article className={isExpanded ? 'expanded' : undefined}>
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
	items: Array<Item>;
};

const ArticleList = ({ items }: ArticleListProps) => (
	<main className="card">
		<ul>
			{items.map((item) => (
				<li key={item.title}>
					<ArticleView {...item} />
				</li>
			))}
		</ul>
	</main>
);

const ArticleBrowser = () => {
	// React 19 data loading with useTransition()
	const [isLoading, startTransition] = useTransition();
	const [items, setItems] = useState<Array<Item>>([]);

	useEffect(() => {
		const abortController = new AbortController();
		startTransition(async () => {
			const data = await service.fetchItems(abortController.signal);
			setItems(data);
		});
		return () => abortController.abort();
	}, []);

	const loader = (
		<div className="card loader flex-column flex-center">
			<Spinner />
		</div>
	);

	const errorMessage = (
		<div className="card error flex-column flex-center">
			<h2>Something went wrong!</h2>
			<p className="icon">😢</p>
			<p>Please refresh page to try again</p>
		</div>
	);

	return (
		<div className="article-browser">
			<header className="card">
				<h1>My Favourite Things</h1>
			</header>
			<ErrorBoundary fallback={errorMessage}>
				{isLoading ? loader : <ArticleList items={items} />}
			</ErrorBoundary>
		</div>
	);
};

export default ArticleBrowser;
