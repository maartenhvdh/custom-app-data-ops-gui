import { syncRun } from "@kontent-ai/data-ops";
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
  entities: z.array(z.enum(entityNames)),
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
    await syncRun({
      sourceEnvironmentId,
      sourceApiKey,
      targetEnvironmentId,
      targetApiKey,
      entities: Object.fromEntries(
        entities.map((key) => [key, key === "webSpotlight" ? true : () => true]),
      ),
    });

    return { statusCode: 200, body: "" };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify(err, Object.getOwnPropertyNames(err)),
    };
  }
};
