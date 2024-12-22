import { User } from "../models/user";
import { Role, getRoleById } from "../models/role";
import { Repository } from "./repository";
import { getFirestore } from "firebase-admin/firestore";
import { auth } from "firebase-admin";
import { initializeApp, applicationDefault } from "firebase-admin/app";
import { Config } from "../config";
import { CreateUserRequestObject } from "../../../shared/CreateUserRequestObject";

/**
 * Repository that stores user data in Google Cloud Firestore database.
 * @Elsper01
 */
export class FirestoreRepository implements Repository {
  private static instance: FirestoreRepository;
  private db: FirebaseFirestore.Firestore;
  private readonly USER_COLLECTION_PATH: string = "users";

  private constructor() {
    initializeApp({
      credential: applicationDefault(),
    });
    this.db = getFirestore(Config.FIRESTORE_ID);
  }

  /**
   * Updates a user in the Firestore database.
   * @param user The user to update.
   * @returns Returns a promise that resolves when the user is updated.
   */
  async updateUser(user: User): Promise<void> {
    try {
      const tenantAwareAuth = auth().tenantManager().authForTenant(user.tenantId);
      const userRecord = await tenantAwareAuth.updateUser(user.id, {
        email: user.mail,
        displayName: user.name,
      });
    } catch (err) {
      console.error(err);
      throw new Error("Error updating user in identity plattform");
    }
    const userRef = this.db.collection(this.USER_COLLECTION_PATH).doc(user.id);
    const doc = await userRef.get();
    if (doc.exists) {
      await userRef.update(user.toPlainObject());
    } else {
      throw new Error("User not found");
    }
  }

  /**
   * Gets the tenant ID for a given email.
   * @param mail The email of the user.
   * @returns Returns a promise that resolves to the tenant ID.
   */
  async getTenantId(mail: string): Promise<string> {
    const usersSnapshot = await this.db.collection(this.USER_COLLECTION_PATH)
      .where("mail", "==", mail)
      .limit(1)
      .get();
    console.log(usersSnapshot);
    if (!usersSnapshot.empty) {
      const userDoc = usersSnapshot.docs[0];
      return userDoc.data().tenantId;
    }
  }

  /**
   * Gets all users from the Firestore database.
   * @returns Returns a promise that resolves to an array of users.
   */
  async getAllUsers(): Promise<User[]> {
    const usersSnapshot = await this.db.collection(this.USER_COLLECTION_PATH).get();
    const users: User[] = [];
    usersSnapshot.forEach(doc => {
      const user = new User(
        doc.data().id,
        getRoleById(doc.data().role),
        doc.data().tenantId,
        doc.data().mail,
        doc.data().name
      );
      users.push(user);
    });
    return users;
  }

  /**
   * Gets all users for a specific tenant from the Firestore database.
   * @param tenantId The ID of the tenant.
   * @returns Returns a promise that resolves to an array of users.
   */
  async getAllTenantUsers(tenantId: string): Promise<User[]> {
    const usersSnapshot = await this.db.collection(this.USER_COLLECTION_PATH)
      .where("tenantId", "==", tenantId)
      .get();
    const users: User[] = [];
    usersSnapshot.forEach(doc => {
      const user = new User(
        doc.data().id,
        getRoleById(doc.data().role),
        doc.data().tenantId,
        doc.data().mail,
        doc.data().name
      );
      users.push(user);
    });
    return users;
  }

  /**
   * Gets the singleton instance of the repository.
   * @returns Returns the singleton instance.
   */
  public static getInstance(): FirestoreRepository {
    if (!FirestoreRepository.instance) {
      FirestoreRepository.instance = new FirestoreRepository();
    }
    return FirestoreRepository.instance;
  }

  /**
   * @inheritdoc
   */
  async getUser(userId: string): Promise<User> {
    const userRef = this.db.collection(this.USER_COLLECTION_PATH).doc(userId);
    const doc = await userRef.get();
    if (doc.exists) {
      const userToGet = new User(
        doc.data().id,
        getRoleById(doc.data().role),
        doc.data().tenantId,
        doc.data().mail,
        doc.data().name
      );
      return userToGet;
    }
  }

  /**
   * @inheritdoc
   */
  async deleteUser(user: User): Promise<void> {
    const userRef = this.db.collection(this.USER_COLLECTION_PATH).doc(user.id);
    const doc = await userRef.get();
    if (doc.exists) {
      await userRef.delete();
      const tenantAwareAuth = auth().tenantManager().authForTenant(user.tenantId);
      await tenantAwareAuth.deleteUser(user.id);
    } else {
      throw new Error("User not found");
    }
  }

  /**
   * @inheritdoc
   */
  async createUser(user: CreateUserRequestObject): Promise<void> {
    try {
      const tenantAwareAuth = auth().tenantManager().authForTenant(user.tenantId);
      const userRecord = await tenantAwareAuth.createUser({
        email: user.mail,
        emailVerified: false,
        displayName: user.name,
        password: user.password
      });
      const userToCreate: User = new User(
        userRecord.uid,
        user.role,
        user.tenantId,
        user.mail,
        user.name
      );
      await this.db
        .collection(this.USER_COLLECTION_PATH)
        .doc(userToCreate.id)
        .set(userToCreate.toPlainObject());
    } catch (err) {
      console.error(err);
      throw new Error("Error creating user");
    }
  }
}
