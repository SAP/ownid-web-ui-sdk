export default interface StatusResponse{
  status: ContextStatus;
  context: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payload: any;
}

export enum ContextStatus {
  Started = 1,
  Processing = 2,
  Finished = 3
}
