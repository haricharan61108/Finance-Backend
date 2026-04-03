import { z } from 'zod';
import type { Request, Response, NextFunction } from 'express';

export const validate = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          message: "Validation error",
          errors: error
        });
      }
      return res.status(400).json({
        message: "Validation error"
      });
    }
  };
};
