import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor
} from '@nestjs/common'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'

@Injectable()
export class WrapResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    console.log('Before...')
    // return next.handle().pipe(tap(data => console.log('After...', data)))
    return next.handle().pipe(map(data => ({ data }))) // 将返回值存放在`data`对象中
  }
}
