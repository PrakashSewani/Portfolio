/// <reference types="vite/client" />

/** Full commit SHA of this build, or '' when unknown. Defined in vite.config.ts. */
declare const __BUILD_SHA__: string;
/** True when the SHA came from the deploy (so it exists on GitHub and can be linked). */
declare const __BUILD_SHA_PUBLIC__: boolean;
/** ISO timestamp of a production build, or '' in dev. */
declare const __BUILD_DATE__: string;
