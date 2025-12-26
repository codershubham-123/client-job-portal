export interface Review {
  id: number;
  title: string;
  description: string;
  rating: number;
}

export interface Company {
  id: number;
  name: string;
  description: string;
  reviews: Review[];
}

export interface Job {
  id: number;
  title: string;
  description: string;
  minSalary: string;
  maxSalary: string;
  location: string;
  company: Company | null;
}
