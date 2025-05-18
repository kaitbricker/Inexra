import { AnyZodObject } from 'zod';
import { RequestHandler } from 'express';

export declare function validate(schema: AnyZodObject): RequestHandler; 