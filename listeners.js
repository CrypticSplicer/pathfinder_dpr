document.addEventListener('blur', (event) => {
	if (event.target.tagName == "INPUT") {
		AverageDPR();
	}
}, true);
document.addEventListener('keypress', (event) => {
	let key = event.which || event.keyCode;
	if (key === 13) {
		AverageDPR();
	}
}, true);