import { ZodError } from "zod";
import { Request, Response, NextFunction } from "express";

export const errorHandler = (
  err: Error & { status?: number },
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction,
) => {
  let statusCode = err.status || 500;
  let message = err.message || "Internal Server Error";
  let details = undefined;

  if (err instanceof ZodError) {
    statusCode = 400;
    message = "Validation Failed";
    details = err.issues.map((e) => ({
      field: e.path.join("."),
      message: e.message,
    }));
  }

  const errMsg = err.message?.toLowerCase() || "";
  if (errMsg.includes("not found")) statusCode = 404;
  if (errMsg.includes("duplicate key")) {
    statusCode = 409;
    message = "Conflict: Source path already exists.";
  }

  return res.status(statusCode).json({
    success: false,
    error: {
      message,
      ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
    },
    details,
  });
};
