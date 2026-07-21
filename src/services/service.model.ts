import type { Decimal } from "@prisma/client/runtime/client";
import type {
  service_prices_category,
  service_prices_pricing_type,
} from "../../prisma/generated/client";

export type ServiceResponse = {
  id: string;
  name: string;
  category: service_prices_category;
  pricing_type: service_prices_pricing_type;
  price_min: Decimal;
  price_max: Decimal | null;
  unit_label: string;
  default_turnaround_hours: number | null;
  is_active: boolean | null;
  updated_at: Date | null;
};
