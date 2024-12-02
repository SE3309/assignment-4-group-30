import type { RequestHandler } from './$types';

export const POST: RequestHandler = async (event) => {
    event.cookies.delete("auth", {path: "/"})
    return new Response();
};