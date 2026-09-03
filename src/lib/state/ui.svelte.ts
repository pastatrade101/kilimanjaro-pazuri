/** Shared chrome state. The drawer is opened from the header and closed from
 *  the drawer itself, from a link, or by navigating. */
export const ui = $state({
	drawerOpen: false
});

export function openDrawer() {
	ui.drawerOpen = true;
}

export function closeDrawer() {
	ui.drawerOpen = false;
}
