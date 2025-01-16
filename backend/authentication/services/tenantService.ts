import { auth } from "firebase-admin";
import { CreateTenantRequestObject } from "../../../shared/CreateTenantRequestObject";
import { CreateTenantInfrastructureRequestObject } from "../../../shared/CreateTenantInfrastructureRequestObject";
import { Repository } from "../repositories/repository";
import axios from "axios";
import { getIdToken } from "../middleware/serviceCommunication";

const INFRASTRUCTURE_SERVICE_URL = process.env.INFRASTRUCTURE_SERVICE_URL;

export class TenantService {
  private static instance: TenantService;
  private userRepo: Repository;
  private tenantManager = auth().tenantManager();

  private constructor(repository: Repository) {
    this.userRepo = repository;
  }
  
  /**
   * Gets the single instance of the TenantService.
   * @param {Repository} repository The repository to use for interactions with the user data.
   * @returns {TenantService} The single instance of the TenantService.
   */
  public static getInstance(repository: Repository): TenantService {
    if (!TenantService.instance) {
      TenantService.instance = new TenantService(repository);
    }
    return TenantService.instance;
  }

  async createTenant(tenantRequest: CreateTenantRequestObject): Promise<void> {
    const tenant = await this.tenantManager.createTenant({
      displayName: String(tenantRequest.name).toLowerCase(),
      emailSignInConfig: {
        enabled: true,
        passwordRequired: true
      }
    });

    const userRequestObject = {
      mail: tenantRequest.adminMail,
      name: tenantRequest.adminName,
      password: tenantRequest.adminPassword,
      tenantId: tenant.tenantId,
      tenantType: tenantRequest.type,
      role: 400
    };

    this.userRepo.createUser(userRequestObject);

    const infrastructureRequestObject: CreateTenantInfrastructureRequestObject = {
      tenantId: tenant.tenantId,
      type: tenantRequest.type,
      subdomain: tenantRequest.subdomain
    }
    const token = await getIdToken();
    await axios.post(
      `${INFRASTRUCTURE_SERVICE_URL}/tenants/add`, 
      infrastructureRequestObject,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
  }
}