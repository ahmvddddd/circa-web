export type LedgerType = "CREDIT" | "DEBIT";

export type Ledger = {
  id: string;
  group: string;
  groupName: string;
  account: string;
  type: LedgerType;
  source: string;
  amount: number;
  currency: string;
  reference: string;
  date: string;
};

export const ledgers: Ledger[] = [
  {
    id: "001",
    group: "001",
    groupName: "EOY Party",
    account: "ACC-987",
    type: "CREDIT",
    source: "Deposit",
    amount: 150,
    currency: "NGN",
    reference: "**** **** **** 1234",
    date: "2023-10-27",
  },
  {
    id: "002",
    group: "002",
    groupName: "Pacific Fund",
    account: "ACC-988",
    type: "DEBIT",
    source: "Withdrawal",
    amount: 75.5,
    currency: "NGN",
    reference: "**** **** **** 5678",
    date: "2023-10-26",
  },
  {
    id: "003",
    group: "001",
    groupName: "EOY Party",
    account: "ACC-987",
    type: "CREDIT",
    source: "Deposit",
    amount: 200,
    currency: "NGN",
    reference: "**** **** **** 1234",
    date: "2023-10-25",
  },
  {
    id: "004",
    group: "003",
    groupName: "Marketing Squad",
    account: "ACC-989",
    type: "DEBIT",
    source: "Withdrawal",
    amount: 300,
    currency: "NGN",
    reference: "**** **** **** 9012",
    date: "2023-10-24",
  },
  {
    id: "005",
    group: "002",
    groupName: "Pacific Fund",
    account: "ACC-988",
    type: "CREDIT",
    source: "Deposit",
    amount: 50,
    currency: "NGN",
    reference: "**** **** **** 5678",
    date: "2023-10-23",
  },
];
