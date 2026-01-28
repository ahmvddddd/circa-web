// src/lib/groupAccounts.ts

export type GroupAccount = {
  id: string;
  groupId: string;
  accountNumber: string;
  accountName: string;
  bankName: string;
};

export const groupAccounts: GroupAccount[] = [
  {
    id: "GA-001",
    groupId: "001",
    accountNumber: "0123456789",
    accountName: "EOY Party Account",
    bankName: "Access Bank",
  },
  {
    id: "GA-002",
    groupId: "002",
    accountNumber: "2234567890",
    accountName: "Pacific Fund Pool",
    bankName: "Guaranty Trust Bank",
  },
  {
    id: "GA-003",
    groupId: "003",
    accountNumber: "3345678901",
    accountName: "Marketing Squad Wallet",
    bankName: "First Bank of Nigeria",
  },
  {
    id: "GA-004",
    groupId: "004",
    accountNumber: "4456789012",
    accountName: "Weekly Book Club",
    bankName: "Zenith Bank",
  },
  {
    id: "GA-005",
    groupId: "005",
    accountNumber: "5567890123",
    accountName: "Final Year Dinner Fund",
    bankName: "United Bank for Africa",
  },
  {
    id: "GA-006",
    groupId: "006",
    accountNumber: "6678901234",
    accountName: "Gaming Nights Wallet",
    bankName: "Sterling Bank",
  },
];
