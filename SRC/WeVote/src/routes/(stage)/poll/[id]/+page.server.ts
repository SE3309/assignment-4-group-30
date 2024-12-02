import { fail, type Actions } from '@sveltejs/kit';
import { isFail } from '$lib/server/SafeSession';
import type { PageServerLoad } from './$types';
import Database from '$lib/server/database/current'; // Import Database module

export const load: PageServerLoad = async ({ params, locals }) => {
    const pollId = params.id;
    const session = locals.session;
    if (!session.isAuthenticated()){
        return {};
    }
    const userId = session.currentUser?.id; 
    if (!userId) {
        throw new Error("User is not authenticated.");
    }

    const pollData = await Database.getPollInfoForUser(userId, parseInt(pollId));
    const comments = await Database.getCommentsForPoll(parseInt(pollId));

    // Check if the user has already voted
    const userHasVoted = pollData.submission?.votedA !== undefined;
    if (!pollData) {
        throw new Error('Poll not found');
    }
    return {
        poll: pollData,
        comments: comments || [],
        userHasVoted, // Include the flag in the data
    };
};



export const actions: Actions = {
    vote: async (event) => {
        const session = event.locals.session;
        if (!session.isAuthenticated()) {
            return fail(403, { error: 'You must be signed in to vote.' });
        }

        const formData = await event.request.formData();
        const voteChoice = formData.get('voteChoice') === 'true';
        const predictionChoice = (voteChoice ? (formData.has('predictionChoice')) : (!formData.has('predictionChoice')));

        const result = await session.submitVote(event.params.id, voteChoice, predictionChoice);
        if (isFail(result)) {
            return fail(400, { error: 'Failed to submit your vote. Please try again.' });
        }

        return { success: true };
    },
    comment: async (event) => {
        const session = event.locals.session;
        if (!session.isAuthenticated()) {
            return fail(403, { error: 'You must be signed in to comment.' });
        }

        const formData = await event.request.formData();
        const content = formData.get('content')?.toString();

        if (!content) {
            return fail(400, { error: 'Comment cannot be empty.' });
        }
        const result = await session.addComment(event.params.id, content);
        if (isFail(result)) {
            return fail(400, { error: 'Failed to add your comment. Please try again.' });
        }

        return { success: true };
    },
    reply: async (event) => {
        const session = event.locals.session;
        if (!session.isAuthenticated()) {
            return fail(403, { error: 'You must be signed in to reply.' });
        }

        const formData = await event.request.formData();
        const content = formData.get('content')?.toString();
        const commentId = parseInt(formData.get('commentId')?.toString() || '0', 10);


        if (!content || !commentId) {
            return fail(400, { error: 'Reply cannot be empty.' });
        }
        const result = await session.addReply(commentId, content);
        if (isFail(result)) {
            return fail(400, { error: 'Failed to add your reply. Please try again.' });
        }

        return { success: true };
    },
};
