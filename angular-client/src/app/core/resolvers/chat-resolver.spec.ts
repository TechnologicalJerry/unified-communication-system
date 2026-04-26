import { TestBed } from '@angular/core/testing';
import { ResolveFn } from '@angular/router';

import { chatResolver } from './chat-resolver';

describe('chatResolver', () => {
  const executeResolver: ResolveFn<boolean> = (...resolverParameters) =>
    TestBed.runInInjectionContext(() => chatResolver(...resolverParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeResolver).toBeTruthy();
  });
});
