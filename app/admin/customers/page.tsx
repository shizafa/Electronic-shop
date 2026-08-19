import { CustomersView } from "@/components/admin/customers/customers-view";
import { getAllCustomers } from "@/lib/admin/customers";

export default async function AdminCustomersPage() {
  const customers = await getAllCustomers();
  return <CustomersView customers={customers} />;
}
