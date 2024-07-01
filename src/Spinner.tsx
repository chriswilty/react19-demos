import './Spinner.css';

type SpinnerProps = {
	size?: 'h2' | 'standard';
};

const Spinner = ({ size = 'standard' }: SpinnerProps) => (
	<div className={`spinner ${size}`}></div>
);

export default Spinner;
