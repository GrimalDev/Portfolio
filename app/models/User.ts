export type User = {
  id: number,
  username: string,
  hash: string,
  role: string,
  created_at: Date|string,
  modified_at: Date|string,
}