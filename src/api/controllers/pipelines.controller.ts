import { Request, Response } from "express";
import * as pipelineQueries from "../../db/queries/pipelines.js";
import { CreatePipelineInput } from "../../db/queries/pipelines.js";

export const create = async (req: Request, res: Response) => {
  try {
    const data: Partial<CreatePipelineInput> = req.body;

    // validate the essential fields
    if (!data.name || !data.actionType || !data.subscriberUrls) {
      return res.status(400).json({
        error: "Missing required fields: name, actionType, or subscriberUrls",
      });
    }

    if (
      !Array.isArray(data.subscriberUrls) ||
      data.subscriberUrls.length === 0
    ) {
      return res
        .status(400)
        .json({ error: "subscriberUrls must be a non-empty array of URLs" });
    }

    const validActions = ["transform", "filter", "enrich"];
    if (!validActions.includes(data.actionType as string)) {
      return res.status(400).json({
        error: `Invalid actionType. Must be one of: ${validActions.join(", ")}`,
      });
    }

    const createInput: CreatePipelineInput = {
      name: data.name as string,
      actionType: data.actionType as "transform" | "filter" | "enrich",
      actionConfig: data.actionConfig ?? {},
      subscriberUrls: data.subscriberUrls as string[],
    };

    const newPipeline = await pipelineQueries.createPipeline(createInput);
    return res.status(201).json(newPipeline);
  } catch (err: unknown) {
    const error = err instanceof Error ? err : new Error(String(err));
    console.error("[Pipeline Create Error]", error);

    if (error?.message?.includes("duplicate key value")) {
      return res
        .status(409)
        .json({ error: "Pipeline sourcePath collision, retry request" });
    }

    return res
      .status(500)
      .json({ error: error?.message || "Internal Server Error" });
  }
};


export const list = async (_req: Request, res: Response) => {
  try {
    const allPipelines = await pipelineQueries.getAllPipelines();
    return res.status(200).json(allPipelines);
  } catch {
    return res.status(500).json({ error: "Internal Server Error" });
  }
};


export const getOne = async (
  req: Request<{ sourcePath: string }>,
  res: Response,
) => {
  try {
    const { sourcePath } = req.params;
    const pipeline = await pipelineQueries.getPipelineByPath(
      sourcePath as string,
      true,
    );

    if (!pipeline) {
      return res.status(404).json({ error: "Pipeline not found" });
    }

    return res.status(200).json(pipeline);
  } catch {
    return res.status(500).json({ error: "Internal Server Error" });
  }
};


export const update = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await pipelineQueries.updatePipeline(id as string, req.body);
    return res.status(200).json(result);
  } catch (err: unknown) {
    const error = err instanceof Error ? err : new Error(String(err));
    return res.status(400).json({ error: error.message });
  }
};

export const remove = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await pipelineQueries.deletePipeline(id as string);
    return res.status(200).json(result);
  } catch (err: unknown) {
    const error = err instanceof Error ? err : new Error(String(err));
    return res.status(404).json({ error: error.message });
  }
};
