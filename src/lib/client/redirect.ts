export function createRedirectEvent(url: string) {
	return () => {
		location.href = url;
	};
}
