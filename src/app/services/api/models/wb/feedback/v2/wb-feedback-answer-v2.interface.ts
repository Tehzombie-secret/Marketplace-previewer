export interface WBFeedbackAnswerV2 {
  state: string;
  lastUpdate: string;
  createDate: string;
  text: string;
  supplierId: number;
  employeeId?: number;
  editable: boolean;
}
