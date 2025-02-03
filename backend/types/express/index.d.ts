declare namespace Express {
  export interface Request {
    user: {
      id: string;
      email: string;
      // Add any other properties you need for the user object
    };
  }
}
