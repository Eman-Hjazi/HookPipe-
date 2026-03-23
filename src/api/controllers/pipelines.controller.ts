import { Request, Response, NextFunction } from "express";
import * as pipelineQueries from "../../db/queries/pipelines.js";
import {
  CreatePipelineInput,
  UpdatePipelineInput,
} from "../validations/pipeline.schema.js";

export const create = async (
  req: Request<
    Record<string, never>,
    Record<string, never>,
    CreatePipelineInput
  >,
  res: Response,
  next: NextFunction,
) => {
  try {
    const newPipeline = await pipelineQueries.createPipeline(req.body);
    return res.status(201).json(newPipeline);
  } catch (err) {
    next(err);
  }
};

export const list = async (
  _req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const allPipelines = await pipelineQueries.getAllPipelines();
    return res.status(200).json(allPipelines);
  } catch (err) {
    next(err);
  }
};

export const update = async (
  req: Request<{ id: string }, Record<string, never>, UpdatePipelineInput>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    const result = await pipelineQueries.updatePipeline(id, req.body);
    return res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

export const getOne = async (
  req: Request<{ sourcePath: string }>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const pipeline = await pipelineQueries.getPipelineByPath(
      req.params.sourcePath,
      true,
    );
    if (!pipeline) throw new Error("Pipeline not found");
    return res.status(200).json(pipeline);
  } catch (err) {
    next(err);
  }
};

export const remove = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await pipelineQueries.deletePipeline(req.params.id);
    return res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};
