import {
	useActionState,
	useCallback,
	useEffect,
	useId,
	useMemo,
	useRef,
	useState,
	useTransition,
} from 'react';
import { ErrorBoundary } from 'react-error-boundary';

import { service, Item } from './service';
import Spinner from './Spinner';
import './ArticleBrowser.css';

type ArticleViewProps = Item;

const useBoolean = (
	initialState: boolean
): [boolean, () => void, () => void] => {
	const [state, setState] = useState<boolean>(initialState);
	return [state, () => setState(true), () => setState(false)];
};

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

type ArticleFormProps = {
	onSuccess: (item: Item) => void;
	onCancel: () => void;
};

const ArticleForm = ({ onSuccess, onCancel }: ArticleFormProps) => {
	const [titleId, titleName] = [useId(), 'title'];
	const [imageUrlId, imageUrlName] = [useId(), 'imageUrl'];
	const [imageAltId, imageAltName] = [useId(), 'imageAlt'];
	const [descriptionId, descriptionName] = [useId(), 'description'];

	const [, formAction, submitting] = useActionState(
		async (_state: unknown, formData: FormData) => {
			const savedItem = await service.submitItem({
				title: formData.get(titleName) as string,
				imageUrl: formData.get(imageUrlName) as string,
				imageAlt: formData.get(imageAltName) as string,
				description: (formData.get(descriptionName) as string)
					.trim()
					.split('\n\n'),
			});
			onSuccess(savedItem);
		},
		null
	);

	return (
		<form className="card absolute-fill grid-2-col gap-2" action={formAction}>
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
				<button
					aria-disabled={submitting}
					className="flex-row flex-center gap-1 flex-grow-3"
					type="submit"
				>
					Save Thing
					{submitting && <Spinner size="button" />}
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
			listRef.current?.lastElementChild?.scrollIntoView({
				behavior: 'smooth',
				block: 'nearest',
			});
		}
	}, [items]);

	useEffect(() => {
		isLoadedRef.current = true;
		return () => {
			isLoadedRef.current = false;
		};
	}, []);

	return (
		<ul ref={listRef} inert={inert}>
			{items.map((item) => (
				<li key={item.title}>
					<ArticleView {...item} />
				</li>
			))}
		</ul>
	);
};

const ArticleBrowser = () => {
	// React 19 data loading with useTransition()
	const [isLoading, startLoadTransition] = useTransition();
	const [items, setItems] = useState<Array<Item>>([]);

	useEffect(() => {
		const abortController = new AbortController();
		startLoadTransition(async () => {
			const data = await service.fetchItems(abortController.signal);
			setItems(data);
		});
		return () => abortController.abort();
	}, []);

	// React 19 update handling via useActionState() - see ArticleForm
	const [formIsVisible, showForm, hideForm] = useBoolean(false);

	const handleAdd = (savedItem: Item) => {
		setItems((prevItems) => [...prevItems, savedItem]);
		hideForm();
	};

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
		<>
			<div className="article-browser">
				<header className="card flex-row flex-between">
					<h1>My Favourite Things</h1>
					<button onClick={showForm}>Add Something</button>
				</header>
				<ErrorBoundary fallback={errorMessage}>
					<main className="card">
						{isLoading ? (
							loader
						) : (
							<ArticleList items={items} inert={formIsVisible} />
						)}
						{formIsVisible && (
							<ArticleForm onSuccess={handleAdd} onCancel={hideForm} />
						)}
					</main>
				</ErrorBoundary>
			</div>
		</>
	);
};

export default ArticleBrowser;
