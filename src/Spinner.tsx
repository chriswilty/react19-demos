import './Spinner.css';

type SpinnerProps = {
	size?: 'standard' | 'large';
};

const Spinner = ({ size = 'standard' }: SpinnerProps) => (
	<div className={`spinner ${size}`}></div>
);

export default Spinner;
