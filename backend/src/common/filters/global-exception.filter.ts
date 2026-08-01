import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'An unexpected error occurred. Please try again later.';
    let errors: any[] = [];

    // ১. NestJS-এর নিজস্ব Exception হলে (400, 401, 403, 404, 409 ইত্যাদি)
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        const res = exceptionResponse as Record<string, any>;

        // ValidationPipe এরর (Array of strings)
        if (Array.isArray(res.message)) {
          message = 'Validation failed';
          errors = res.message;
        } else {
          message = res.message || exception.message;
          errors = res.errors || [];
        }
      } else {
        message = exceptionResponse;
      }
    } 
    // ২. Database (Prisma/TypeORM) বা অন্যান্য Unhandled / Raw Errors
    else {
      // প্রোডাকশনে কোনো Real Stack trace বা DB Query leak হতে দেওয়া যাবে না
      this.logger.error('Unhandled Server Exception:', exception);
      
      // Status কোড থাকবে 500 এবং জেনেরিক মেসেজ রিটার্ন করবে
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = 'Internal server error';
    }

    // ৩. নির্ধারিত Consistent Error Structure-এ রেসপন্স পাঠানো
    response.status(status).json({
      success: false,
      message: message,
      errors: errors,
    });
  }
}