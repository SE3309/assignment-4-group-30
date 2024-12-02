import type { PageLoad } from './$types';
import TestDisplay from '$lib/components/header-displays/TestDisplay.svelte';
import LogInDisplay from '$lib/components/header-displays/LogInDisplay.svelte';

export const load = (async () => {
    return {
        viewportDisplay: LogInDisplay
    };
}) satisfies PageLoad;