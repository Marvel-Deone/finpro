"use client";

import React, { useState } from "react";
// import EmptyState from "../components/empty-state";
// import LoadingState from "../components/loading-state";

interface Org {
  id: string;
  name: string;
}

interface TabContentProps {
  activeTab: string;
  selectedOrg: Org | null;
}

// Reusable section wrapper
const SectionWrapper: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="mb-8">
    <h2 className="text-lg font-bold mb-4">{title}</h2>
    {children}
  </div>
);

// Reusable table component
const DataTable: React.FC<{ columns: string[]; rows: any[] }> = ({ columns, rows }) => {
  if (!rows || rows.length === 0) return 'No data available.'
//   <EmptyState message="No data available." />;

  return (
    <div className="overflow-x-auto border rounded-lg border-slate-200">
      <table className="min-w-full divide-y divide-slate-200">
        <thead className="bg-slate-50">
          <tr>
            {columns.map((col) => (
              <th key={col} className="px-4 py-2 text-left text-xs font-bold uppercase text-slate-500">
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {rows.map((row, idx) => (
            <tr key={idx}>
              {columns.map((col) => (
                <td key={col} className="px-4 py-2 text-sm text-slate-700">
                  {row[col] ?? "-"}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const TabContent: React.FC<TabContentProps> = ({ activeTab, selectedOrg }) => {
  // Example dummy data
  const dummyExamData = [
    { "Exam Name": "Math Test", "Date": "2026-03-10", "Participants": 20 },
    { "Exam Name": "English Test", "Date": "2026-03-12", "Participants": 18 },
  ];

  const dummyInventoryData = [
    { Item: "Laptop", Quantity: 10, "Last Updated": "2026-03-05" },
    { Item: "Projector", Quantity: 2, "Last Updated": "2026-03-01" },
  ];

  const dummyVaultData = [
    { "Document Name": "Invoice #001", "Uploaded On": "2026-03-01", Type: "PDF" },
    { "Document Name": "Contract ABC", "Uploaded On": "2026-03-02", Type: "Word" },
  ];

  const dummyLedgerData = [
    { Date: "2026-03-01", Description: "Sale Income", Amount: "$500" },
    { Date: "2026-03-02", Description: "Purchase", Amount: "-$150" },
  ];

  const dummyLiabilitiesData = [
    { Creditor: "Vendor A", Amount: "$300", Due: "2026-03-15" },
    { Creditor: "Vendor B", Amount: "$450", Due: "2026-03-20" },
  ];

  if (!selectedOrg) return 'Please select an organization to view data.'
//   <EmptyState message="Please select an organization to view data." />;

  switch (activeTab) {
    case "overview":
      return (
        <div>
          <SectionWrapper title="Organization Overview">
            <p className="text-sm text-slate-700">
              Showing data for <strong>{selectedOrg.name}</strong>.
            </p>
          </SectionWrapper>
        </div>
      );

    case "exam":
      return (
        <SectionWrapper title="Exam Sessions">
          <DataTable columns={["Exam Name", "Date", "Participants"]} rows={dummyExamData} />
        </SectionWrapper>
      );

    case "inventory":
      return (
        <SectionWrapper title="Inventory Management">
          <DataTable columns={["Item", "Quantity", "Last Updated"]} rows={dummyInventoryData} />
        </SectionWrapper>
      );

    case "vault":
      return (
        <SectionWrapper title="Document Vault">
          <DataTable columns={["Document Name", "Uploaded On", "Type"]} rows={dummyVaultData} />
        </SectionWrapper>
      );

    case "ledger":
      return (
        <SectionWrapper title="Ledger">
          <DataTable columns={["Date", "Description", "Amount"]} rows={dummyLedgerData} />
        </SectionWrapper>
      );

    case "liabilities":
      return (
        <SectionWrapper title="Liabilities">
          <DataTable columns={["Creditor", "Amount", "Due"]} rows={dummyLiabilitiesData} />
        </SectionWrapper>
      );

    default:
      return 'Loading tab...'
    //   <LoadingState title="Loading tab..." />;
  }
};

export default TabContent;