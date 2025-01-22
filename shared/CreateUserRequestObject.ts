export type CreateUserRequestObject = {
    name: string;
    mail: string;
    role: number;
    tenantId: string;
    tenantType: string;
    password: string;
  }