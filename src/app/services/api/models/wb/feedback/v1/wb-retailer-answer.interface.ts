export interface WBRetailerAnswer {
  text: string;
  supplierId: number;
  state: string;
  editable: boolean;
  /** ISO date string */
  lastUpdate: string;
  /** ISO date string */
  createDate: string;

  // TBD
  employeeId?: any;
  metadata?: any;
}
