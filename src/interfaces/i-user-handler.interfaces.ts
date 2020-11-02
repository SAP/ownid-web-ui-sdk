export interface IUserHandler {
  isUserExists(userId: string): Promise<boolean>;
}
