import { ErrorBoundary } from 'react-error-boundary';

import ArticleBrowser from './ArticleBrowser';
import './App.css';

const errorMessage = (
	<div className="card flex-column flex-center flex-grow-1">
		<h2>Something went wrong!</h2>
		<p style={{ margin: 0, fontSize: '5rem' }}>😢</p>
		<p>Please refresh page to try again</p>
	</div>
);

const App = () => (
	<ErrorBoundary fallback={errorMessage}>
		<ArticleBrowser />
	</ErrorBoundary>
);

export default App;
