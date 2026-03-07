// export type Category = {
//   id: string;
//   type: "business" | "personal";
//   seat_throughput: string;
//   project_inflow: string;
//   inventory: string;
//   monthly_dept: string;
//   net_capital: string;
//   compliance_audit: string;
//   asset: number;
//   subsidiaryId: string;
//   createdAt: string;
// };

// export type Subsidiary = {
//   id: string;
//   name: string;
//   description: string;
//   industrial_sector: string;
//   createdAt: string;
//   categories: {
//     business: Category;
//     personal: Category;
//   };
//   managers: any[];
// };
export type Category = {
  id: string;
  type: "business" | "personal";
  seat_throughput: string;
  project_inflow: string;
  inventory: string;
  monthly_dept: string;
  net_capital: string;
  compliance_audit: string;
  asset: number;
  subsidiaryId: string;
  createdAt: string;
};

export type Subsidiary = {
  id: string;
  name: string;
  description: string;
  industrial_sector: string;
  createdAt: string;
  categories: {
    business: Category;
    personal: Category;
  };
  managers: any[];
};