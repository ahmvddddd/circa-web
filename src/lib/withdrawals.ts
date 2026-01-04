//src/lib/withdrawals.ts
export type ApprovalStatus = "approved" | "rejected" | "pending";

export type WithdrawalStatus =
  | "approval_required"
  | "pending"
  | "approved"
  | "declined"
  | "paid";

export type Withdrawal = {
  id: string;
  groupId: string;
  groupName: string;
  amount: number;
  beneficiary: string;
  title: string;
  requestedBy: string;
  requestedAt: string;
  status: WithdrawalStatus;
  approvals: {
    current: number;
    total: number;
        history: {
          name: string;
          status: ApprovalStatus;
          date?: string;
        }[];
  };
};

export const withdrawals: Withdrawal[] = [
  {
    id: "w001",
    groupId: "001",
    groupName: "EOY Party",
    amount: 1250,
    beneficiary: "Olivia Martin",
    title: "Team Offsite Catering",
    requestedBy: "Liam Johnson",
    requestedAt: "2023-10-26",
    status: "approval_required",
    approvals: { current: 2, total: 5,
          history: [
            { name: "Emily Davis", status: "approved", date: "2023-10-27" },
            { name: "John Smith", status: "approved", date: "2023-10-28" },
          ], },
  },
  {
    id: "w002",
    groupId: "001",
    groupName: "EOY Party",
    amount: 800,
    beneficiary: "Innovate Inc.",
    title: "DJ Equipment Deposit",
    requestedBy: "Ava Williams",
    requestedAt: "2023-10-25",
    status: "approved",
    approvals: { current: 5, total: 5,
          history: [
            { name: "Emily Davis", status: "approved", date: "2023-10-27" },
            { name: "John Smith", status: "approved", date: "2023-10-28" },
          ], },
  },
  {
    id: "w003",
    groupId: "002",
    groupName: "Pacific Fund",
    amount: 3500,
    beneficiary: "Marketing Solutions",
    title: "Q4 Campaign Budget",
    requestedBy: "Noah Brown",
    requestedAt: "2023-10-22",
    status: "paid",
    approvals: { current: 5, total: 5,
          history: [
            { name: "Emily Davis", status: "approved", date: "2023-10-27" },
            { name: "John Smith", status: "approved", date: "2023-10-28" },
          ], },
  },
  {
    id: "w004",
    groupId: "003",
    groupName: "Marketing Squad",
    amount: 200,
    beneficiary: "John Doe",
    title: "Expense Reimbursement",
    requestedBy: "Sophia Garcia",
    requestedAt: "2023-10-21",
    status: "declined",
    approvals: { current: 0, total: 5,
          history: [
            { name: "Emily Davis", status: "approved", date: "2023-10-27" },
            { name: "John Smith", status: "approved", date: "2023-10-28" },
          ], },
  },
  {
    id: "w005",
    groupId: "004",
    groupName: "Weekly Book Club",
    amount: 5000,
    beneficiary: "Cloud Services",
    title: "Event Venue Booking",
    requestedBy: "Mason Jones",
    requestedAt: "2023-10-20",
    status: "pending",
    approvals: { current: 4, total: 5,
          history: [
            { name: "Emily Davis", status: "approved", date: "2023-10-27" },
            { name: "John Smith", status: "approved", date: "2023-10-28" },
          ], },
  },
];
