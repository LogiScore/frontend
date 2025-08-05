type DynamicRoutes = {
	
};

type Layouts = {
	"/": undefined;
	"/8x7k9m2p": undefined;
	"/about": undefined;
	"/callback": undefined;
	"/contact": undefined;
	"/help": undefined;
	"/how-it-works": undefined;
	"/pricing": undefined;
	"/search": undefined
};

export type RouteId = "/" | "/8x7k9m2p" | "/about" | "/callback" | "/contact" | "/help" | "/how-it-works" | "/pricing" | "/search";

export type RouteParams<T extends RouteId> = T extends keyof DynamicRoutes ? DynamicRoutes[T] : Record<string, never>;

export type LayoutParams<T extends RouteId> = Layouts[T] | Record<string, never>;

export type Pathname = "/" | "/8x7k9m2p" | "/about" | "/callback" | "/contact" | "/help" | "/how-it-works" | "/pricing" | "/search";

export type ResolvedPathname = `${"" | `/${string}`}${Pathname}`;

export type Asset = "/favicon.svg" | "/logo.png";