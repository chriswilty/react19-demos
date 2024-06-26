import { useCallback, useEffect, useMemo, useState } from 'react';
import { useErrorBoundary } from 'react-error-boundary';

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
	items: Array<Item>;
};

const ArticleList = ({ items }: ArticleListProps) => {
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
	// The React 18 way, a bit icky...
	const [isLoading, setLoading] = useState(0);
	const [items, setItems] = useState<Array<Item>>([]);
	const { showBoundary } = useErrorBoundary();

	useEffect(() => {
		const abortController = new AbortController();
		setLoading((prev) => prev + 1);

		void service
			.fetchItems(abortController.signal)
			.then((items) => setItems(items))
			.catch((err: unknown) => showBoundary(err))
			.finally(() => setLoading((prev) => prev - 1));

		return () => {
			abortController.abort();
		};
	}, [showBoundary]);

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
			{isLoading > 0 ? loader : <ArticleList items={items} />}
		</div>
	);
};

export default ArticleBrowser;
