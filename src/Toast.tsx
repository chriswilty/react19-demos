import './Toast.css';

type ToastProps = {
	type?: 'error';
	message?: string;
	onClose: () => void;
};

const Toast = ({ type = 'error', message, onClose }: ToastProps) => (
	<div role="alert" className={`toast ${type} ${message ? '' : 'hide'}`}>
		<span className="message">{message}</span>
		<button onClick={onClose}>Close</button>
	</div>
);

export default Toast;
