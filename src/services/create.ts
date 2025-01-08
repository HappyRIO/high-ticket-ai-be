import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export default async function createAssistant() {
    const response = await openai.beta.assistants.create({
        name: "My Test Assistant",
        instructions: "You are John Doe. you are 35 years old. And you live in Spain. Your telegram ID is @higodev.",
        model: "gpt-4",
    });
    console.log(response, "---------", response.id)
    return response.id; // Return the Assistant ID for future use
}

export async function listAssistants() {
    try {
        const assistants = await openai.beta.assistants.list();
        assistants.data.forEach(assistant => {
            console.log(`Assistant Name: ${assistant.name}, Assistant ID: ${assistant.id}`);
        });
    } catch (error) {
        console.error("Error retrieving assistants:", error);
    }
}

export const createThreadRun = async ({threadId, assistantId}:{threadId: string, assistantId: string}) => {
    const thread = await openai.beta.threads.create();
    const thread1 = await openai.beta.threads.retrieve(threadId)
    console.log("Creating thread run...", thread.id);
    return await openai.beta.threads.runs.create(thread.id, {
      assistant_id: assistantId,
    });
  };

export const genResponse = async () => {
    const thread = await openai.beta.threads.create();
    console.log("Creare thread...", thread.id);
    // await sendMessage(thread.id, "Who are you?");
    await openai.beta.threads.messages.create(
        thread.id,
        {
        role: "user",
        content: "I need to solve the equation `3x + 11 = 14`. Can you help me?"
        }
    );
    // const runResponse = await runAssistant(threadId, req.body.assistantId);
    const run = await openai.beta.threads.runs.create(thread.id, {
        assistant_id: "asst_32BtOVDROgOBCfS4LR5vZ0SJ",
    });

    console.log("Response...", run)
    return run;
}