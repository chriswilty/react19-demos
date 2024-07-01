import {
	startTransition,
	useCallback,
	useEffect,
	useId,
	useMemo,
	useOptimistic,
	useRef,
	useState,
	useTransition,
} from 'react';

import { service, Item } from './service';
import Spinner from './Spinner';
import Toast from './Toast';
import './ArticleBrowser.css';

type ArticleViewProps = Item;

const ArticleView = ({
	title,
	description,
	imageUrl,
	imageAlt,
	saving,
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
			<header className="flex-row gap-1">
				<h2>{title}</h2>
				{saving && <Spinner size="h2" />}
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

type ArticleFormProps = {
	onSubmit: (item: Item) => void;
	onCancel: () => void;
};

const ArticleForm = ({ onSubmit, onCancel }: ArticleFormProps) => {
	const [titleId, titleName] = [useId(), 'title'];
	const [imageUrlId, imageUrlName] = [useId(), 'imageUrl'];
	const [imageAltId, imageAltName] = [useId(), 'imageAlt'];
	const [descriptionId, descriptionName] = [useId(), 'description'];

	const submitItem = (formData: FormData) => {
		onSubmit({
			title: formData.get(titleName) as string,
			imageUrl: formData.get(imageUrlName) as string,
			imageAlt: formData.get(imageAltName) as string,
			description: (formData.get(descriptionName) as string)
				.trim()
				.split('\n\n'),
		});
	};

	return (
		<form className="absolute-fill grid-2-col gap-2 card" action={submitItem}>
			<label htmlFor={titleId}>Title</label>
			<input id={titleId} name={titleName} required />
			<label htmlFor={imageUrlId}>Image URL</label>
			<input
				id={imageUrlId}
				name={imageUrlName}
				required
				pattern="^https?://.+\.(jpe?g|png)$"
			/>
			<label htmlFor={imageAltId}>Image Alt Text</label>
			<input id={imageAltId} name={imageAltName} required />
			<label htmlFor={descriptionId}>Description</label>
			<textarea id={descriptionId} name={descriptionName} required />
			<div className="grid-row-end grid-row-align-start flex-row flex-center gap-1">
				<button type="submit" className="flex-row flex-center flex-grow-3">
					Save Thing
				</button>
				<button type="button" className="flex-grow-1" onClick={onCancel}>
					Cancel
				</button>
			</div>
		</form>
	);
};

type ArticleListProps = {
	items: Array<Item>;
	inert?: boolean;
};

const ArticleList = ({ items, inert }: ArticleListProps) => {
	const listRef = useRef<HTMLUListElement>(null);
	const isLoadedRef = useRef(false);

	useEffect(() => {
		if (isLoadedRef.current) {
			listRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
		}
	}, [items]);

	useEffect(() => {
		isLoadedRef.current = true;
		return () => {
			isLoadedRef.current = false;
		};
	}, []);

	return (
		items.length > 0 && (
			<ul ref={listRef} className="flex-column gap-2" inert={inert}>
				{items.map((item) => (
					<li key={item.title} className={item.saving ? 'saving' : undefined}>
						<ArticleView {...item} />
					</li>
				))}
			</ul>
		)
	);
};

type ArticleState = {
	items: Array<Item>;
	formIsVisible: boolean;
};

const ArticleBrowser = () => {
	// React 19 data loading with useTransition()
	const [isLoading, startLoadTransition] = useTransition();
	const [articleState, setArticleState] = useState<ArticleState>({
		items: [],
		formIsVisible: false,
	});

	useEffect(() => {
		const abortController = new AbortController();
		startLoadTransition(async () => {
			const items = await service.fetchItems(abortController.signal);
			setArticleState((prevState) => ({ ...prevState, items }));
		});
		return () => abortController.abort();
	}, []);

	// React 19 update handling via startTransition() and useOptimistic()
	const [error, setError] = useState<string>();
	const clearError = useCallback(() => setError(undefined), []);
	const [optimisticArticleState, addOptimisticItem] = useOptimistic(
		articleState,
		(prevState, newItem: Item) => ({
			items: [
				newItem,
				// Workaround for https://github.com/facebook/react/issues/28574
				...prevState.items.filter((item) => item.title !== newItem.title),
			],
			formIsVisible: false,
		})
	);

	const showForm = () =>
		setArticleState((prevState) => ({
			...prevState,
			formIsVisible: true,
		}));

	const hideForm = () =>
		setArticleState((prevState) => ({
			...prevState,
			formIsVisible: false,
		}));

	// This entire function is an Action, so all state updates other than
	// optimistic are marked as transitions. We must set form visibility in our
	// optimistic update, else it won't hide until the service call completes.
	const handleSubmit = (newItem: Item) =>
		startTransition(async () => {
			addOptimisticItem({ ...newItem, saving: true });
			const result = await service.submitItem(newItem);
			if ('error' in result) handleFailure(result.error);
			else handleSuccess(result.item);
		});

	const handleSuccess = (savedItem: Item) =>
		setArticleState((prevState) => ({
			items: [savedItem, ...prevState.items],
			formIsVisible: false,
		}));

	const handleFailure = (error: string) => {
		hideForm();
		setError(error);
	};

	return (
		<div className="article-browser flex-column gap-2">
			<header className="card flex-row flex-between">
				<h1>My Favourite Things</h1>
				<button onClick={showForm}>Add Something</button>
				<Toast message={error} onClose={clearError} />
			</header>
			<main className="card flex-column flex-grow-1">
				{isLoading ? (
					<div className="card flex-column flex-center flex-grow-1">
						<Spinner />
					</div>
				) : (
					<ArticleList
						items={optimisticArticleState.items}
						inert={optimisticArticleState.formIsVisible}
					/>
				)}
				{optimisticArticleState.formIsVisible && (
					<ArticleForm onSubmit={handleSubmit} onCancel={hideForm} />
				)}
			</main>
		</div>
	);
};

export default ArticleBrowser;
