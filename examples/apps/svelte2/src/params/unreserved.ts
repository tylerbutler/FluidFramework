const reservedContainerRoutes = new Set(["create"]);

export function match(value) {
	return !reservedContainerRoutes.has(value);
}
