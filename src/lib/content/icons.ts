/**
 * The icons the template ships. A field whose name ends in `icon` is chosen
 * from these rather than typed, so a mistyped class cannot leave a blank space
 * on the page.
 */
export const ICONS: string[] = [
	'icon-angle-small-right',
	'icon-arrow-bottom',
	'icon-arrow-top',
	'icon-arrow-up',
	'icon-bath',
	'icon-bedroom',
	'icon-buildings',
	'icon-celemder',
	'icon-check-1',
	'icon-check-close-1',
	'icon-check-star',
	'icon-checked',
	'icon-comment-check',
	'icon-comments',
	'icon-cross',
	'icon-dumbbell',
	'icon-flooring',
	'icon-garage',
	'icon-heart',
	'icon-heart1',
	'icon-house',
	'icon-insurance',
	'icon-kitchen',
	'icon-labyrinth',
	'icon-laptop-menu',
	'icon-notification',
	'icon-phone-call',
	'icon-pin',
	'icon-placeholder',
	'icon-play-1',
	'icon-quite',
	'icon-quotes',
	'icon-real-estate',
	'icon-rental',
	'icon-restaurant',
	'icon-ribbon-black-shape',
	'icon-search',
	'icon-sheet',
	'icon-sopping',
	'icon-star',
	'icon-star-400',
	'icon-support',
	'icon-swimming',
	'icon-tag',
	'icon-tag1',
	'icon-trophy',
	'icon-user',
	'icon-wifi-router',
	'icon-zoom-1',
	'icon-zoom-in'
];

export function iconLabel(name: string): string {
	return name.replace(/^icon-/, '').replace(/-/g, ' ');
}
