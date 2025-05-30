interface User {
  id: number;
  name: string;
  surname: string;
  username: string;
  email: string;
  is_active: boolean;
  country: null;
  enterprise: number;
  number: string;
  user_type: 'admin' | 'manager' | 'employee';
  created_at: Date;
  last_update: Date;
  img: null;
  sales_point: number;
  sales_point_details: SalesPoint;
  enterprise_details: EnterpriseDetails;
  permissions: Permission[];
  action_permissions: ActionPermission[];
}

interface MenuItem {
  text: string;
  link: string;
  icon?: React.Component | null;
}

interface Menu {
  name: string;
  link: string | null;
  icon?: React.ElementType | null;
  menu: MenuItem[] | null;
  onClick?: () => void;
}

interface Plan {
  id: number;
  last_subscription_price: SubscriptionPrice | null;
  name: string;
  description: string;
  price: string;
  duration: number;
  created_at: Date;
  currency: string;
  interval: 'month' | 'year'
}

interface SubscriptionPrice {
  stripe_price_id: string;
  amount: string;
  currency: string;
  interval: string;
  product_name: string;
}


interface Notification {
  title: string;
  description: string;
  time: string;
}

interface DropdownMenuProps {
  title: string;
  menu: Menu[];
}

interface Product {
  id: number;
  name: string;
  enterprise: number;
  total_quantity: number;
  sales_point: number;
  sales_point_details: SalesPoint;
  category_details: Category;
  quantity: number;
  created_at: Date;
  with_variant: boolean;
  last_update: Date;
  category: Category;
  supplier: Category;
  product_code: null;
  sell_prices: SellPrice[];
  price: string;
  is_beer: boolean;
  variants: Variant[];
  package_details: Packaging | null;
}

interface Variant {
  id: number;
  name: string;
  quantity: number;
  product: number;
  created_at: Date;
}

interface Category {
  id: number;
  name: string;
  created_at: Date;
  enterprise: number;
  ab_name: string;
  sales_point_details: SalesPoint;
  sales_point: number;
  email?: null;
  contact?: null;
}

interface SellPrice {
  id: number;
  product: number;
  price: number;
  created_at: Date;
  last_update: Date;
}

interface Supplier {
  id: number;
  name: string;
  email: string;
  created_at: Date;
  last_update: Date;
  enterprise: number;
  contact: string;
  ab_name: string;
  sales_point_details: SalesPoint;
}

interface Payment {
  package_price: Payment;
  package: Payment;
  is_beer: any;
  id: string;
  sellPrice: number;
  sell_price: SellPrice;
  price: number;
  code: string;
  number: number;
  article: string;
  total: number;
  quantity: number;
}
interface InvoiceProduct {
  package_price: number;
  package: number;
  variant_id: number;
  id: number;
  number: number;
  sell_price: number;
  sellPrice: number;
  code: string;
  article: string;
  quantity: number;
  total: number;
  variant_id: number;
  price: number;
  is_variant: boolean;
  is_beer: boolean;
}

interface Customer {
  id: number;
  name: string;
  surname: string | null;
  number: string | null;
  email: string | null;
  client_category_details: Details;
  sales_point: number;
  sales_point_details: SalesPoint;
  created_at: Date;
  last_update: Date;
  code: string;
  client_category: number;
  enterprise: number;
  address: string | null;
}

interface Bill {
  id: number;
  bill_number: string;
  customer: number;
  sales_point: number;
  operator: number;
  cashed: null;
  cashed_at: Date;
  sales_point_details: SalesPoint;
  customer_details: Customer | null;
  paid: null;
  operator_details: OperatorDetails;
  cashed_details: null;
  customer_name: string;
  created_at: Date;
  delivery_date: Date;
  state: 'created' | "pending" | "success";
  product_bills: ProductBill[];
  total_amount: number;
  deliverer: null;
  deliverer_details: null | Employee;
  last_operation: LastOperation;
  taxes: BillTax[];
  additional_fees: AdditionalFee[];
  total_amount_with_taxes_fees: number;
}

interface BillTax {
  name: string;
  rate: string;
  type: string;
  amount: number;
}

interface AdditionalFee {
  name: string;
  amount: string;
  fee_type: string;
  total: number;
  application_order: string;
}

interface LastOperation {
  action: string;
  description: string;
  performed_by: string;
  timestamp: Date;
}

interface ProductBill {
  id: number;
  product: number;
  variant_id: number | null;
  sell_price: number;
  quantity: number;
  created_at: string;
  price: number;
  is_variant: boolean;
  product_details: ProductDetails;
  total_amount: number;
  record_package: number;
  benefit: number;
  package_product_bill: null | PackageProductBill;
}

interface ProductDetails {
  id: number;
  name: string;
  product_code: string;
  quantity: number;
  created_at: string;
  last_update: string;
  category: string;
  supplier: string;
  price: number;
  is_beer: boolean;
  enterprise: string;
}

interface SalesPoint {
  id: number;
  name: string;
  enterprise: number;
  cash_register: CashRegister;
  address: string;
  created_at: string;
  last_update: string;
  email: string | null;
  number: string | null;
  nc: string;
}

interface CashRegister {
  id: number;
  sales_point: number;
  balance: string;
  last_update: Date;
}


interface clientCat {
  id: number;
  name: string;
  enterprise: number;
  address: string;
  created_at: Date;
  last_update: Date;
}

interface Details {
  id: number;
  name: string;
  enterprise: number | null;
  address: null | string;
  created_at: Date;
  last_update: Date;
}

interface Employee {
  id: number;
  name: string;
  surname: null;
  salary: string;
  monthly_salary: string;
  role: string;
  enterprise: null;
  sales_point: number;
  sales_point_details: SalesPoint;
  is_deliverer: boolean;
  is_active: boolean;
}

interface Packaging {
  id: number;
  name: string;
  price: string;
  supplier: number;
  sales_point_details: SalesPoint;
  supplier_details: Supplier;
  full_quantity: number;
  empty_quantity: number;
  created_at: Date;
  updated_at: Date;
  sales_point: number;
  enterprise: number;
}
interface PackageProductBill {
  id: number;
  packaging: number;
  packaging_details: Packaging;
  name: string;
  quantity: number;
  record: number;
  price: number;
  total_amount: number;
}

interface ClientProductPrice {
  id: number;
  client: number;
  client_name: string;
  article: number;
  article_name: string;
  price: number;
  price_details: SellPrice;
}

interface OrganizedRoute {
  [customer: number]: {
    customer_name: string;
    total_amount: number;
    total_package: number;
    total_package_recorded: number;
    [product: number]: {
      total_sales: number;
      total_amount: number;
    };
  };
}
interface Supply {
  id: number;
  supply_products: SupplyProduct[];
  supply_number: string;
  sales_point_details: SalesPoint;
  operator_details: OperatorDetails;
  receiver_details: null;
  status: "pending" | "receipt";
  created_at: Date;
  received_at: null | Date;
  total_cost: number;
  supplier: number;
  sales_point: number;
  supplier_details: Supplier;
  created_by: number;
  received_by: null;
  invoice_history: InvoiceHistory[];
}

interface InvoiceHistory {
  packaging_details: PackagingDetails;
  tax_details: TaxDetails;
  fee_details: FeeDetails;
  created_at: Date;
}

interface FeeDetails {
  total_fee_amount: number;
  breakdown: FeeDetailsBreakdown[];
}

interface FeeDetailsBreakdown {
  fee_name: string;
  rate: number;
  fee_amount: number;
  fee_type: string;
}

interface PackagingDetails { }

interface TaxDetails {
  total_tax_amount: number;
  breakdown: TaxDetailsBreakdown[];
}

interface Tax {
  id: number;
  tax_name: string;
  tax_type: 'percentage' | 'flat';
  tax_application: 'supply' | 'bill';
  value: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
  sales_point: number;
}


interface TaxDetailsBreakdown {
  tax_name: string;
  rate: number;
  tax_amount: number;
  tax_type: string;
}

interface OperatorDetails {
  id: number;
  name: string;
  surname: string;
  username: string;
  email: string;
  enterprise: number;
  number: null;
  user_type: string;
  created_at: Date;
  last_update: Date;
}

interface SupplyProduct {
  id: number;
  supply: number;
  product: number;
  variant: number;
  quantity: number;
  price: string;
  product_details: ProductDetails;
}

interface ProductDetails {
  id: number;
  name: string;
  product_code: string;
  quantity: number;
  created_at: Date;
  last_update: Date;
  category: number;
  category_name: string;
  supplier: string;
}

interface DateRange {
  from: string | null;
  to: string | null;
}

interface Main {
  warnings: Warning[];
}

interface Warning {
  packaging?: string;
  balance?: string;
  time?: string;
}

interface Country {
  name: string;
  flag: string;
  code: string;
  dialCode: string;
  suffixes?: string[];
}

interface User {
  id: number;
  name: string;
  surname: string;
  username: string;
  email: string;
  enterprise: number;
  country: string;
  number: null;
  user_type: string;
  created_at: Date;
  last_update: Date;
  img: string | null;
  enterprise_details: EnterpriseDetails;
}

interface EnterpriseDetails {
  id: number;
  name: string;
  address: string;
  phone: string;
  email: string;
  currency: string;
  nc: string | null;
  created_at: Date;
  last_update: Date;
  plan: Plan;
  last_payment: LastPayment;
}

interface LastPayment {
  id: number;
  plan: Plan;
  amount: string;
  payment_date: Date;
  next_due_date: Date;
  payment_method: string;
  created_at: Date;
  enterprise: number;
}

interface Inventory {
  id: number;
  sales_point: number;
  created_by: number;
  created_by_name: string;
  validated_by: number;
  validated_by_name: string;
  inventory_number: string;
  sales_point_details: SalesPoint;
  created_at: Date;
  validated_at: Date;
  is_validated: boolean;
  inventory_products: InventoryProduct[];
}

interface InventoryProduct {
  id: number;
  product: number;
  variant: number | null;
  old_quantity: number;
  new_quantity: number;
  product_details: InventoryProductDetails;
}

interface InventoryProductDetails {
  id: number;
  name: string;
  product_code: string;
  created_at: Date;
  last_update: Date;
  is_beer: boolean;
  package: null;
  category: number;
  category_name: string;
  supplier: string;
}
interface ProductVariant {
  id: number;
  variant_id: number;
  product_id: number;
  name: string;
  product_code: string;
  quantity: number;
  created_at: string;
  last_update: string;
  category: string;
  supplier: string;
  sell_prices: number[];
  price: number;
  is_beer: boolean;
  enterprise: string;
  is_variant: true;
}

interface Loss {
  id: number;
  created_by_name: string;
  validated_by_name: null | string;
  quantity: number;
  reason: string;
  is_validated: boolean;
  created_at: Date;
  validated_at: Date | null;
  product: number;
  variant: number | null;
  sales_point_details: SalesPoint;
  sales_point: number;
  created_by: number;
  validated_by: number | null;
  product_name: string | null;
  variant_name: string | null;
}

interface InventoryPackage {
  created_by_full_name: string;
  validated_by_full_name: string;
  id: number;
  sales_point: number;
  created_by: number;
  validated_by: number | null;
  inventory_number: string;
  sales_point_details: SalesPointDetails;
  is_validated: boolean;
  created_at: Date;
  validated_at: Date | null;
  items: Item[];
}

interface Item {
  id: number;
  packaging: number;
  packaging_name: string;
  old_quantity: number;
  new_quantity: number;
}

interface Main {
  id: number;
  name: string;
  email: string;
  subject: string;
  message: string;
  created_at: Date;
  is_processed: boolean;
}

interface Expense {
  id: number;
  sales_point_details: SalesPointDetails;
  validated_by_name: null | string;
  created_by_name: string;
  description: string;
  amount: string;
  is_validated: boolean;
  created_at: Date;
  validated_at: Date | null;
  remove_from_balance: boolean;
  expense_number: string;
  sales_point: number | null;
  created_by: number;
  validated_by: number | null;
}

interface CashData {
  cash_registers: CashRegister[];
  transactions: Transaction[];
  total_balance: number;
  total_deposits: number;
  total_withdrawals: number;
}

interface Transaction {
  id: number;
  cash_register: number;
  sales_point: string;
  amount: string;
  transaction_type: 'deposit' | 'withdrawal';
  reason: string;
  previous_balance: string;
  new_balance: string;
  created_by: string;
  validated_by?: string;
  created_by_full_name: string;
  validated_by_full_name?: string;
  created_at: Date;
  validated_at: Date | null;
  is_validated: boolean;
  transction_number: string
}

interface Permission {
  id: number;
  number: number;
  name: string;
  path: string;
}

interface PaymentInfo {
  id: number;
  plan: Plan;
  amount: string;
  payment_date: Date;
  next_due_date: Date;
  payment_method: string;
  description: null;
  status: 'pending' | 'completed' | 'failed';
  payment_intent: string;
  payment_id: null;
  created_at: Date;
  enterprise: number;
  invoice_number: string;
}

interface paymentMethod {
  brand: string;
  last4: string;
  exp_month: number;
  exp_year: number;
  id: string;
  type: string;
}
interface ActionPermission {
  id: number;
  name: string;
  label: number;
  created_at: Date;
  last_update: Date;
}

interface Role {
  id: number;
  name: string;
  action_permissions: ActionPermission[];
  created_at: Date;
  last_update: Date;
}


export interface UserConfigurationsDetails {
    id:             number;
    created_at:     Date;
    default_price:  null;
    notifications:  boolean;
    email_verified: boolean;
    number_verifed: boolean;
    code:           null;
    last_update:    Date;
}
