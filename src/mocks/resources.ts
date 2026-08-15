export interface Resource {
  id: string;
  name: string;
  region: string;
  status: "active" | "inactive";
}

export const MOCK_RESOURCES: readonly Resource[] = [
  { id: "r_1", name: "us-east-gateway", region: "us-east-1", status: "active" },
  { id: "r_2", name: "eu-west-gateway", region: "eu-west-1", status: "active" },
  {
    id: "r_3",
    name: "ap-south-gateway",
    region: "ap-south-1",
    status: "inactive",
  },
];
