import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { MongooseError } from 'mongoose';

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public details?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export const errorHandler = (error: unknown) => {
  console.error('API Error:', error);

  if (error instanceof ApiError) {
    return NextResponse.json(
      {
        error: error.message,
        details: error.details,
      },
      { status: error.statusCode }
    );
  }

  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        error: 'Validation error',
        details: error.errors,
      },
      { status: 400 }
    );
  }

  if (error instanceof MongooseError) {
    return NextResponse.json(
      {
        error: 'Database error',
        message: error.message,
      },
      { status: 500 }
    );
  }

  // Default error response
  return NextResponse.json(
    {
      error: 'Internal server error',
    },
    { status: 500 }
  );
};
