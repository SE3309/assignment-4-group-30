import type { RequestHandler } from './$types';
import { db } from '$lib/server/Database/Database.d.ts'; // Assume db helper


// Handle voting
export const POST: RequestHandler = async ({ request, params }) => {
    const pollId = params.id;
    const body = await request.json();
    const userId = "current-user-id"; // Replace with authenticated user ID

    if (body.vote !== 'A' && body.vote !== 'B') {
        return new Response('Invalid vote choice', { status: 400 });
    }

    await db.query(`
        INSERT INTO Submission (PollID, UserID, VoteChoiceA)
        VALUES (?, ?, ?)`, 
        [pollId, userId, body.vote === 'A']
    );

    return new Response('Vote submitted successfully');
};

// Handle comments
export const POST_COMMENT: RequestHandler = async ({ request, params }) => {
    const pollId = params.id;
    const body = await request.json();
    const userId = "current-user-id"; // Replace with authenticated user ID

    if (!body.content) {
        return new Response('Comment cannot be empty', { status: 400 });
    }

    await db.query(`
        INSERT INTO Comment (PollID, UserID, Content, PollClosedAtPost, CommentTimeSubmitted)
        VALUES (?, ?, ?, false, NOW())`,
        [pollId, userId, body.content]
    );

    return new Response('Comment submitted successfully');
};

// Handle replies
export const POST_REPLY: RequestHandler = async ({ request, params }) => {
    const { id, commentId } = params;
    const body = await request.json();
    const userId = "current-user-id"; // Replace with authenticated user ID

    if (!body.content) {
        return new Response('Reply cannot be empty', { status: 400 });
    }

    await db.query(`
        INSERT INTO Reply (ReplyTo, UserID, Content, PollClosedAtPost, CommentTimeSubmitted)
        VALUES (?, ?, ?, false, NOW())`,
        [commentId, userId, body.content]
    );

    return new Response('Reply submitted successfully');
};
