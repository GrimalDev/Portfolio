export type Contact = {
  id?: number;
  firstname: string;
  lastname: string;
  email: string;
  message: string;
  created_at?: Date|string;
}