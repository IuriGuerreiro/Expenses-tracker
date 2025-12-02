// Extend Express Request type to include authenticated user
declare namespace Express {
  export interface Request {
    user?: {
      userId: string;
    };
  }
}
