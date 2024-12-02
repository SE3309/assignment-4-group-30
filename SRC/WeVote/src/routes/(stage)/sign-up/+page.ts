import type { PageLoad } from './$types';
import TestDisplay from '$lib/components/header-displays/TestDisplay.svelte';

export const load = (async () => {
    return {
        viewportDisplay: TestDisplay
    };
}) satisfies PageLoad;