import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JobCard } from './job-card';

const mockJob = {
  id: 1,
  title: 'Full Stack Developer',
  description: 'Work on both frontend and backend.',
  minSalary: '60000',
  maxSalary: '150000',
  location: 'Remote',
  company: null,
};

describe('JobCard', () => {
  let component: JobCard;
  let fixture: ComponentFixture<JobCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JobCard],
    }).compileComponents();

    fixture = TestBed.createComponent(JobCard);
    component = fixture.componentInstance;
    component.job = mockJob;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
