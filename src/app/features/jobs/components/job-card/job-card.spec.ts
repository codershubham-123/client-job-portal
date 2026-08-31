import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JobCard } from './job-card';

const testJob = {
  id: 1,
  title: 'Full Stack Developer',
  description: 'Work on both frontend and backend.',
  location: 'Remote',
  jobType: 'Remote',
  employmentType: 'Full-time',
  minExperience: 3,
  maxExperience: 5,
  postedAt: 'Today',
  skills: ['Angular'],
  company: null,
  salary: '₹60,000 - ₹150,000',
  isNew: true,
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
    fixture.componentRef.setInput('job', testJob);
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
