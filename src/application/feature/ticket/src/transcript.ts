import type { Collection, Message } from "discord.js";

const MAX_MESSAGES = 2000;

type Line = Pick<Message, "createdAt" | "content"> & {
  author: Pick<Message["author"], "username">;
  attachments: Pick<Collection<string, { url: string }>, "map">;
  embeds: { fields: { name: string; value: string }[] }[];
};

type FetchableChannel = {
  messages: {
    fetch(options: { limit: number; before?: string }): Promise<Collection<string, Message>>;
  };
};

export function formatTranscript(messages: Line[]): string {
  return messages
    .map(({ createdAt, author, content, attachments, embeds }) =>
      [
        `[${createdAt.toISOString()}] ${author.username}: ${content}`,
        ...embeds.flatMap(({ fields }) => fields.map(({ name, value }) => `  ${name}: ${value}`)),
        ...attachments.map(({ url }) => `  添付: ${url}`),
      ].join("\n"),
    )
    .join("\n");
}

// Oldest first.
export async function fetchMessages(channel: FetchableChannel): Promise<Message[]> {
  const messages: Message[] = [];
  let before: string | undefined;

  // ponytail: stops at MAX_MESSAGES, older messages are dropped from the transcript.
  while (messages.length < MAX_MESSAGES) {
    const batch = await channel.messages.fetch({ limit: 100, before });
    if (batch.size === 0) {
      break;
    }
    messages.push(...batch.values());
    before = batch.lastKey();
  }

  return messages.reverse();
}
