if (isLemmy) {

	setInterval(() => {
		const posts = document.querySelectorAll('.d-sm-block article.post-container');

		posts.forEach(post => {
			if (post.classList.contains('les-modified')) return;

			addExpandButton(post);
			fixPostLinks(post);

			post.classList.add('les-modified');
		});
	}, 1000);
}

function addExpandButton(post) {
	const options = post.querySelector('.d-flex.text-muted');

	const imageButton = post.querySelector('button.thumbnail');
	const textButton = post.querySelector('.post-title button');
	const externalButton = post.querySelector('a.text-body[rel], a.thumbnail[rel]');

	if ((!imageButton && !textButton) || externalButton) return;

	options.firstElementChild.classList.remove('ps-0');

	const expandButton = document.createElement('button');
	expandButton.classList.add('les-expand');
	expandButton.classList.toggle('image', imageButton);
	expandButton.classList.toggle('text', textButton && !imageButton);

	expandButton.addEventListener('click', () => {
		expandButton.classList.toggle('expanded');
		const isExpanded = expandButton.classList.contains('expanded');

		let lesContent = post.querySelector('.les-content');

		if (!lesContent) {
			lesContent = document.createElement('div');
			lesContent.classList.add('les-content', 'hidden');
			options.parentElement.appendChild(lesContent);
		}

		const contentLoaded = lesContent.classList.contains('loaded');

		if (!contentLoaded) {
			if (imageButton) {
				imageButton.click();

				const imageAnchor = post.closest('.post-listing').querySelector(':scope > .offset-sm-3 a');
				lesContent.appendChild(imageAnchor);

				makeZoomable(imageAnchor.querySelector('img'));
			}

			if (textButton) {
				textButton.click();

				const metaData = post.closest('.post-listing').querySelector(':scope > .post-metadata-card');
				if (metaData) lesContent.appendChild(metaData);

				const article = post.closest('.post-listing').querySelector(':scope > article');
				if (article) lesContent.appendChild(article);
			}

			lesContent.classList.add('loaded');
		}

		lesContent.classList.toggle('hidden', !isExpanded);
	});

	options.prepend(expandButton);
}

function fixPostLinks(post) {
	const title = post.querySelector('.post-title a');

	const externalButton = post.querySelector('a.thumbnail');
	if (externalButton) {
		title.href = externalButton.href;
	}

	title.setAttribute('target', '_blank');

	// Remove original click listeners so that we can use target=_blank
	title.parentNode.replaceChild(title.cloneNode(true), title);

	const commentLink = post.querySelector('.d-flex.text-muted a');
	commentLink.href = commentLink.href.replace('scrollToComments=true', '');
}

function makeZoomable(img) {
	let initialWidth, initialHeight, initialDiagonal, left, top, isZooming;

	function getDiagonal(x, y) {
		const w = Math.max(1, x - left);
		const h = Math.max(1, y - top);
		return Math.round(Math.hypot(w, h));
	}

	function moveListener(event) {
		isZooming = true;

		const newWidth = getDiagonal(event.clientX, event.clientY) / initialDiagonal * initialWidth;
		img.style.width = newWidth + "px";

		// Remove height limit when the user reaches it
		if (img.clientHeight >= 600) img.classList.remove('img-expanded');
	}

	img.addEventListener('click', event => {
		if (isZooming) event.preventDefault()
	});

	img.addEventListener('mousedown', event => {
		if (event.button !== 0) return;

		event.preventDefault();

		({ left, top, width: initialWidth, height: initialHeight } = img.getBoundingClientRect());
		initialDiagonal = getDiagonal(event.clientX, event.clientY);

		img.addEventListener('mousemove', moveListener);

		img.addEventListener('mouseup', (event) => {
			event.stopPropagation();
			img.removeEventListener('mousemove', moveListener);
			setTimeout(() => isZooming = false, 100);
		})
	});
}

