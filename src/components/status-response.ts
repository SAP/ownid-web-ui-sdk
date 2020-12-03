export default interface StatusResponse {
  status: ContextStatus;
  context: string;
  metadata: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payload: any;
}

export enum ContextStatus {
  Initiated = 1,
  Started = 2,
  WaitingForApproval = 3,
  Approved = 4,
  Declined = 5,
  Finished = 99,
}
