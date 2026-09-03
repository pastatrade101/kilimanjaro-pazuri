declare global {
	namespace App {
		interface Locals {
			admin: { username: string } | null;
		}
	}

	interface Window {
		jQuery: any;
		$: any;
		KPTheme?: {
			initShell: () => void;
			initPage: () => void;
			closeOverlays: () => void;
		};
	}
}

declare module '*.sql?raw' {
	const content: string;
	export default content;
}

export {};
