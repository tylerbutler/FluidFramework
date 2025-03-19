/**
 * Utility type that renames all underscore properties to remove the underscore. Used to derive types from another type
 * that's using {@link ExcludeUnderscoreProperties}.
 */
export type ReplaceUnderscoreProperties<T> = {
	[K in keyof T as K extends `_${infer U}` ? U : never]: T[K];
};

/**
 * Utility type that excludes keys whose name begins with an underscore.
 */
export type ExcludeUnderscoreProperties<T> = {
	[K in keyof T as K extends `_${string}` ? never : K]: T[K];
};

/**
 * Utility type that enforces that all public properties start with an underscore.
 */
export type RequireUnderscoreProperties<T> = {
	[K in keyof T as K extends `_${string}` ? K : never]: T[K];
};
