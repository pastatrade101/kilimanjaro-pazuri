/*
 * Kilimanjaro Pazuri — theme runtime.
 *
 * The Zoomvilla template ships one jQuery IIFE that runs once per page load.
 * SvelteKit never reloads, so the same behaviours are split into two entry
 * points:
 *
 *   KPTheme.initShell() — once per mount of the site chrome (cursor, scroll ring)
 *   KPTheme.initPage()  — after every navigation (reveals, headings, lightbox)
 *
 * Nothing here rewrites markup that Svelte owns. The template's GSAP SplitText
 * pass did exactly that — it replaced heading innerHTML with per-character
 * spans, so Svelte's next update wrote into nodes GSAP had already discarded
 * and headings rendered one navigation stale. Headings are revealed whole.
 */
(function ($) {
	'use strict';

	// Set before first paint so the reveal CSS only hides content when the
	// script that reveals it is actually running.
	document.documentElement.classList.add('kp-js');

	var shellReady = false;
	var revealObserver = null;
	var revealFallback = null;

	/* ---------------------------------------------------------------- shell */

	function initShell() {
		if (shellReady) return;
		shellReady = true;

		customCursor();
		scrollRing();
		dynamicYear();
	}

	function customCursor() {
		var cursor = document.querySelector('.custom-cursor__cursor');
		var inner = document.querySelector('.custom-cursor__cursor-two');
		if (!cursor || !inner) return;

		// A pointer-driven flourish only; it must never appear on touch.
		if (!window.matchMedia || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
			return;
		}

		document.documentElement.classList.add('kp-cursor');

		document.addEventListener('mousemove', function (e) {
			cursor.style.transform =
				'translate3d(calc(' + e.clientX + 'px - 50%), calc(' + e.clientY + 'px - 50%), 0)';
			inner.style.left = e.clientX + 'px';
			inner.style.top = e.clientY + 'px';
		});

		document.addEventListener('mousedown', function () {
			cursor.classList.add('click');
			inner.classList.add('custom-cursor__innerhover');
		});

		document.addEventListener('mouseup', function () {
			cursor.classList.remove('click');
			inner.classList.remove('custom-cursor__innerhover');
		});

		// Delegated, so links rendered by later navigations are covered too.
		document.addEventListener('mouseover', function (e) {
			if (e.target.closest('a, button')) cursor.classList.add('custom-cursor__hover');
		});
		document.addEventListener('mouseout', function (e) {
			if (e.target.closest('a, button')) cursor.classList.remove('custom-cursor__hover');
		});
	}

	function scrollRing() {
		var wrap = document.getElementById('scroll-top');
		var value = document.getElementById('scroll-top-value');
		if (!wrap) return;

		var ticking = false;

		function paint() {
			ticking = false;
			var pos = window.scrollY || document.documentElement.scrollTop;
			var height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
			var percent = height > 0 ? Math.round((pos * 100) / height) : 0;

			wrap.style.background =
				'conic-gradient(var(--kp-gold) ' + percent + '%, rgba(255,255,255,0.9) ' + percent + '%)';

			wrap.classList.toggle('active', pos > 400);

			if (value) {
				if (percent < 96) value.textContent = percent + '%';
				else value.innerHTML = '<i class="fas fa-arrow-up"></i>';
			}
		}

		window.addEventListener(
			'scroll',
			function () {
				if (ticking) return;
				ticking = true;
				requestAnimationFrame(paint);
			},
			{ passive: true }
		);

		paint();

		wrap.addEventListener('click', function () {
			window.scrollTo({ top: 0, behavior: 'smooth' });
		});
	}

	function dynamicYear() {
		var nodes = document.querySelectorAll('.dynamic-year');
		for (var i = 0; i < nodes.length; i++) nodes[i].textContent = new Date().getFullYear();
	}

	/* ----------------------------------------------------------------- page */

	function initPage() {
		// One failing step must not stop the rest.
		[reveals, lightbox].forEach(function (step) {
			try {
				step();
			} catch (e) {
				if (window.console) console.warn('[kp-theme]', e);
			}
		});
	}

	function revealNow(el) {
		var delay = el.getAttribute('data-wow-delay');
		var duration = el.getAttribute('data-wow-duration');
		if (delay) el.style.animationDelay = delay;
		if (duration) el.style.animationDuration = duration;
		el.setAttribute('data-kp-revealed', '1');
		el.classList.add('animated');
	}

	/**
	 * Reveals anything carrying .wow or .kp-reveal as it enters the viewport.
	 * Headings use .kp-reveal, so they animate as whole words without any
	 * character surgery on Svelte's DOM.
	 */
	function reveals() {
		var selector = '.wow:not([data-kp-revealed]), .kp-reveal:not([data-kp-revealed])';

		// Release the previous page's nodes before observing this page's.
		if (revealObserver) revealObserver.disconnect();
		clearTimeout(revealFallback);

		var boxes = document.querySelectorAll(selector);
		if (!boxes.length) return;

		var reduced =
			window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

		if (reduced || !('IntersectionObserver' in window)) {
			for (var r = 0; r < boxes.length; r++) revealNow(boxes[r]);
			return;
		}

		if (!revealObserver) {
			revealObserver = new IntersectionObserver(
				function (entries) {
					for (var i = 0; i < entries.length; i++) {
						if (!entries[i].isIntersecting) continue;
						revealNow(entries[i].target);
						revealObserver.unobserve(entries[i].target);
					}
				},
				{ rootMargin: '0px 0px -6% 0px', threshold: 0.04 }
			);
		}

		for (var b = 0; b < boxes.length; b++) revealObserver.observe(boxes[b]);

		// Safety net: nothing may stay invisible because an observer never
		// fired. Only what is already at or above the fold is forced, so the
		// scroll reveal below it stays intact.
		revealFallback = setTimeout(function () {
			var pending = document.querySelectorAll(selector);
			for (var i = 0; i < pending.length; i++) {
				if (pending[i].getBoundingClientRect().top < window.innerHeight) {
					revealNow(pending[i]);
					if (revealObserver) revealObserver.unobserve(pending[i]);
				}
			}
		}, 3000);
	}

	function lightbox() {
		if (!$ || !$.fn || !$.fn.magnificPopup) return;

		var groups = {};
		$('.img-popup').each(function () {
			if ($(this).data('kp-mfp')) return;
			$(this).data('kp-mfp', true);
			var id = parseInt($(this).attr('data-group'), 10) || 0;
			if (!groups[id]) groups[id] = [];
			groups[id].push(this);
		});

		$.each(groups, function () {
			$(this).magnificPopup({
				type: 'image',
				closeOnContentClick: true,
				closeBtnInside: false,
				gallery: { enabled: true }
			});
		});
	}

	/** The lightbox mounts onto <body>, outside Svelte's tree, so a navigation
	 *  while it is open would leave it covering the next page. */
	function closeOverlays() {
		if ($ && $.magnificPopup && $.magnificPopup.instance && $.magnificPopup.instance.isOpen) {
			$.magnificPopup.close();
		}
	}

	window.KPTheme = { initShell: initShell, initPage: initPage, closeOverlays: closeOverlays };
})(window.jQuery);
