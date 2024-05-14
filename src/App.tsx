import { useState } from 'react';
import './App.css';

function App() {
	const [count, setCount] = useState(0);

	return (
		<>
			<div className="card">
				<h1>{count}</h1>
				<button
					onClick={() => {
						setCount((count) => count + 1);
					}}
				>
					{count % 2 === 0 ? 'Do not click me!' : 'Ooh ya bassa!'}
				</button>
			</div>
		</>
	);
}

export default App;
