export type DnsRecordType = "A" | "AAAA" | "CNAME";

export type DnsAnswer = {
  name: string;
  type: number;
  TTL?: number;
  data: string;
};

export type DnsJsonResponse = {
  Status: number;
  TC?: boolean;
  RD?: boolean;
  RA?: boolean;
  AD?: boolean;
  CD?: boolean;
  Question?: Array<{ name: string; type: number }>;
  Answer?: DnsAnswer[];
  Authority?: DnsAnswer[];
  Comment?: string;
};

export type ExpectedRecord = {
  type: DnsRecordType;
  host: "@" | "www";
  value: string;
};

export type ObservedRecordSet = Partial<Record<DnsRecordType, string[]>>;

export type CheckResult = {
  ok: boolean;
  domain: string;
  provider: string;
  expected: ExpectedRecord[];
  observed: {
    apex: ObservedRecordSet;
    www: ObservedRecordSet;
  };
  issues: string[];
  fix: string[];
};

