import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function createAssistant() {
  const response = await openai.beta.assistants.create({
    name: "My Test Assistant",
    instructions:
      "You are John Doe. you are 35 years old. And you live in Spain. Your telegram ID is @higodev.",
    model: "gpt-4-turbo-preview",
  });
  console.log(response, "---------", response.id);
  return response.id; // Return the Assistant ID for future use
}

export async function listAssistants() {
  try {
    const assistants = await openai.beta.assistants.list();
    assistants.data.forEach((assistant) => {
      console.log(
        `Assistant Name: ${assistant.name}, Assistant ID: ${assistant.id}`
      );
    });
  } catch (error) {
    console.error("Error retrieving assistants:", error);
  }
}

export const createThreadRun = async () => {
  const thread = await openai.beta.threads.create();
  console.log("Creating thread run...", thread.id);
  return await openai.beta.threads.runs.create(thread.id, {
    assistant_id: "asst_32BtOVDROgOBCfS4LR5vZ0SJ",
  });
};

export const genResponse = async () => {
  const thread = await openai.beta.threads.create();
  console.log("Creare thread...", thread.id);
  // await sendMessage(thread.id, "Who are you?");
  await openai.beta.threads.messages.create(thread.id, {
    role: "user",
    content: "I need to solve the equation `3x + 11 = 14`. Can you help me?",
  });
  // const runResponse = await runAssistant(threadId, req.body.assistantId);
  const run = await openai.beta.threads.runs.create(thread.id, {
    assistant_id: "asst_32BtOVDROgOBCfS4LR5vZ0SJ",
  });

  console.log("Response...", run);
  return run;
};

export const generateAnswer = async () => {
  const thread = await openai.beta.threads.create();
  const threadId = thread.id;
  const message = await openai.beta.threads.messages.create(threadId, {
    role: "user",
    content: "Who are you?",
  });
  const run = await openai.beta.threads.runs.create(threadId, {
    assistant_id: "asst_32BtOVDROgOBCfS4LR5vZ0SJ",
  });
  // while (true) {
  //     const run_status = await openai.beta.threads.runs.retrieve(
  //         threadId, run.id
  //     )
  //     if (run_status.status === 'completed') {
  //         break;
  //     } else (run_status.status === '')

  // }
  // console.log('Run Response', run)

  await new Promise((resolve) => setTimeout(resolve, 5000));

  const messages = await openai.beta.threads.messages.list(threadId);
  console.log("messages list", messages.data);
  const assistantMessage = messages.data.find(
    (msg) => msg.role === "assistant"
  );
  // console.log('Openai Response', assistantMessage?.content[0].text.value)
  // if (assistantMessage?.content[0] && 'text' in assistantMessage.content[0]) {
  //     console.log('Openai Response', assistantMessage.content[0].text.value);
  // } else {
  //     console.log('The first content is not text or it does not exist.');
  // }
  console.log("RUN");
  if (assistantMessage?.content[0].type == "text") {
    console.log("Openai Response", assistantMessage?.content[0].text.value);
    return assistantMessage?.content[0].text.value;
  }
};

export const replaceInstruction = async () => {
  try {
    const assistantId = "asst_32BtOVDROgOBCfS4LR5vZ0SJ";
    const assistant = await openai.beta.assistants.retrieve(assistantId);
    console.log("Assistant", assistant.instructions);
    return assistant.instructions || null; // Return instructions or null if not found
  } catch (error) {
    // logger.error('Error retrieving assistant instructions:', error);
    throw new Error("Failed to retrieve assistant instructions");
  }
};

export const fileRetrieve = async () => {

        const file = await openai.files.retrieve("file-SUpoV63VYwckw7WaN1Fatc");
      
        console.log(file);
      
}

export const createVectorStore = async () => {
const vectorStore = await openai.beta.vectorStores.create({
    name: "High Ticket AI"
  });
  console.log(vectorStore)
  console.log(vectorStore.id)
}

export const createVectorStoreFile = async () => {
  const myVectorStoreFile = await openai.beta.vectorStores.files.create(
    "vs_GZEwvVS5DfJm16C1yWoUgxvP",
    {
      file_id: "file-WeRKhDEuFkbnuMa9hrwDfS",
    }
  );
  console.log(myVectorStoreFile);
};

export async function vectorStoreFiles() {
  const vectorStoreFiles = await openai.beta.vectorStores.files.list(
    "vs_GZEwvVS5DfJm16C1yWoUgxvP"
  );
  console.log(vectorStoreFiles.data);
}

export async function updateAssistant() {
    const vectorStoreId = "vs_GZEwvVS5DfJm16C1yWoUgxvP"
    const myUpdatedAssistant = await openai.beta.assistants.update(
      "asst_32BtOVDROgOBCfS4LR5vZ0SJ",
      {
        tools: [{ type: "file_search" }],
        model: "gpt-4-turbo-preview",
        tool_resources: { file_search: { vector_store_ids: [vectorStoreId] }}
      }
    );
  
    console.log(myUpdatedAssistant);
  }

  export async function fileList() {
    const list = await openai.files.list();
  
    for await (const file of list) {
      console.log(file);
    }
  }

export async function fileDel() {
    const file = await openai.files.del("file-SUpoV63VYwckw7WaN1Fatc");
  
    console.log(file);
  }