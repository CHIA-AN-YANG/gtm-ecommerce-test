import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private router: Router) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // Clone request to include credentials (cookies) with all requests
    const authReq = request.clone({
      withCredentials: true,
    });
    return next.handle(authReq);

    // return next.handle(authReq).pipe(
    //   catchError((error: HttpErrorResponse) => {
    //     if (error.status === 401) {
    //       console.warn(request.url, 'returned 401 Unauthorized - redirecting to login');
    //       this.router.navigate(['/login']);
    //     }
    //     return throwError(() => error);
    //   })
    // );
  }
}
