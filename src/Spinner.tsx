import './Spinner.css';

type SpinnerProps = {
	size?: 'button' | 'standard' | 'large';
};

const Spinner = ({ size = 'standard' }: SpinnerProps) => (
	<div className={`spinner ${size}`}></div>
);

export default Spinner;
