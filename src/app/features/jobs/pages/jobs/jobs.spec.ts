import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';

import { JobsApi } from '@core/jobs-api';
import { Jobs } from './jobs';

const jobsApiStub = {
  getJobs: () => of([]),
};

describe('Jobs', () => {
  let component: Jobs;
  let fixture: ComponentFixture<Jobs>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Jobs],
      providers: [provideRouter([]), { provide: JobsApi, useValue: jobsApiStub }],
    }).compileComponents();

    fixture = TestBed.createComponent(Jobs);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
