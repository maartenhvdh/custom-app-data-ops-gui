import { syncDiff } from "@kontent-ai/data-ops";
import type { VercelRequest, VercelResponse } from "@vercel/node";
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

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).send("Method Not Allowed");
  }

  const contentType = req.headers["content-type"] ?? "";
  if (!contentType.includes("application/json")) {
    return res.status(400).send("Content-Type must be application/json");
  }

  const parseResult = schema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).send(fromError(parseResult.error).message);
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

    return res.status(200).json({ html });
  } catch (err) {
    return res.status(500).send(JSON.stringify(err, Object.getOwnPropertyNames(err)));
  }
}
