import { Employee } from "@/types/employee";
import { Table } from "@/components/ui/Table";

interface EmployeeListProps {
  employees: Employee[];
}

const columns = [
  { key: "name" as const, header: "Name" },
  { key: "role" as const, header: "Role" },
  { key: "hoursPerWeek" as const, header: "Hours/Week" },
];

export function EmployeeList({ employees }: EmployeeListProps) {
  return <Table columns={columns} data={employees} rowKey="id" />;
}
