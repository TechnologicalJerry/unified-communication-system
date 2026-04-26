import { ResolveFn } from '@angular/router';

export const productResolver: ResolveFn<boolean> = (route, state) => {
  return true;
};
