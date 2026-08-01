import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let errors: any[] = [];

    // ১. NestJS-এর নিজস্ব HTTP Exception (যেমন: BadRequest, NotFound, Unauthorized)
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse() as any;

      if (typeof res === 'object' && res !== null) {
        message = res.message || exception.message;
        
        // ValidationPipe থেকে আসা একাধিক এরর অ্যারেই (array) থাকলে তা এক্সট্র্যাক্ট করা
        if (Array.isArray(res.message)) {
          errors = res.message;
          message = 'Validation failed';
        } else if (res.errors) {
          errors = Array.isArray(res.errors) ? res.errors : [res.errors];
        }
      } else {
        message = res;
      }
    } 
    // ২. Database Error বা অন্যান্য Uncaught Internal Error
    else {
      // প্রোডাকশনে কোনো Database Connection string বা Stack trace যাতে লিক না হয়
      message = 'An unexpected error occurred. Please try again later.';
      
      // ব্যাকএন্ড কনসোলে লগ রাখুন যাতে ডেভেলপার সমস্যাটি বুঝতে পারে
      console.error('Unhandled Exception:', exception);
    }

    // ৩. নির্দিষ্ট ফরম্যাটে Error Response পাঠানো
    response.status(status).json({
      success: false,
      message: message,
      errors: errors,
    });
  }
}