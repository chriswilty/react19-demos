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

import { service, Item } from './service';
import Spinner from './Spinner';
import './ArticleBrowser.css';

const useBoolean = (
	initialState: boolean
): [boolean, () => void, () => void] => {
	const [state, setState] = useState<boolean>(initialState);
	return [state, () => setState(true), () => setState(false)];
};

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

type ArticleFormProps = {
	onSuccess: (item: Item) => void;
	onCancel: () => void;
};

const ArticleForm = ({ onSuccess, onCancel }: ArticleFormProps) => {
	const [titleId, titleName] = [useId(), 'title'];
	const [imageUrlId, imageUrlName] = [useId(), 'imageUrl'];
	const [imageAltId, imageAltName] = [useId(), 'imageAlt'];
	const [descriptionId, descriptionName] = [useId(), 'description'];

	/*
	  I do not like this :(
	  Form is cleared automatically even if submit failed, and
	  error message is only cleared AFTER successful submit.
	  So, useTransition is a far nicer solution.
	*/
	const [error, formAction, submitting] = useActionState(
		async (prevError: string | null, formData: FormData) => {
			if (submitting) return prevError;
			const result = await service.submitItem({
				title: formData.get(titleName) as string,
				imageUrl: formData.get(imageUrlName) as string,
				imageAlt: formData.get(imageAltName) as string,
				description: (formData.get(descriptionName) as string)
					.trim()
					.split('\n\n'),
			});
			if ('error' in result) {
				return result.error;
			}
			onSuccess(result.item);
			return null;
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
			<p
				role="alert"
				className={`grid-row-end error ${error && !submitting ? '' : 'hidden'}`}
			>
				{error}
			</p>
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
					<li key={item.title}>
						<ArticleView {...item} />
					</li>
				))}
			</ul>
		)
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
		setItems((prevItems) => [savedItem, ...prevItems]);
		hideForm();
	};

	const loader = (
		<div className="card flex-column flex-center flex-grow-1">
			<Spinner />
		</div>
	);

	return (
		<div className="article-browser flex-column gap-2">
			<header className="card flex-row flex-between">
				<h1>My Favourite Things</h1>
				<button onClick={showForm}>Add Something</button>
			</header>
			<main className="card flex-column flex-grow-1">
				{isLoading ? (
					loader
				) : (
					<ArticleList items={items} inert={formIsVisible} />
				)}
				{formIsVisible && (
					<ArticleForm onSuccess={handleAdd} onCancel={hideForm} />
				)}
			</main>
		</div>
	);
};

export default ArticleBrowser;
