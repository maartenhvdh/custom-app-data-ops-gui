import { syncDiff } from "@kontent-ai/data-ops";
import type { Handler } from "@netlify/functions";
import { z } from "zod";
import { fromError } from "zod-validation-error/v4";

const entityNames = [
  "contentTypes",
  "contentTypeSnippets",
  "taxonomies",
  "collections",
  "assetFolders",
  "spaces",
  "languages",
  "webSpotlight",
  "workflows",
] as const;

const schema = z.object({
  sourceEnvironmentId: z.string().min(1),
  sourceApiKey: z.string().min(1),
  targetEnvironmentId: z.string().min(1),
  targetApiKey: z.string().min(1),
  entities: z.array(z.enum(entityNames)).optional(),
});

export const handler: Handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  const contentType = event.headers["content-type"] ?? event.headers["Content-Type"] ?? "";
  if (!contentType.includes("application/json")) {
    return { statusCode: 400, body: "Content-Type must be application/json" };
  }

  const parseResult = schema.safeParse(JSON.parse(event.body ?? "{}"));
  if (!parseResult.success) {
    return { statusCode: 400, body: fromError(parseResult.error).message };
  }

  const { sourceEnvironmentId, sourceApiKey, targetEnvironmentId, targetApiKey, entities } =
    parseResult.data;

  try {
    const html = await syncDiff({
      sourceEnvironmentId,
      sourceApiKey,
      targetEnvironmentId,
      targetApiKey,
      entities,
    });

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ html }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify(err, Object.getOwnPropertyNames(err)),
    };
  }
};
