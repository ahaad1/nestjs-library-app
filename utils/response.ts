import { Response } from 'express';

export interface GeneralResponse {
  status: number;
  data: any;
  message: string;
}

export interface GeneralInnerResponse<T> {
  status: number;
  data: T;
  message: string;
}

export function jsonResponse(
  res: Response,
  status: number,
  data: any,
  message?: string,
) {
  return res.status(status).json({ status: true, message, data });
}

export function generalResponse(
  status: number,
  data: any,
  message: string,
): GeneralResponse {
  return {
    status,
    data,
    message,
  };
}
