import { User } from "../models/user";
import { Role, getRoleById } from "../models/role";
import { Repository } from "./repository";
import { getFirestore } from "firebase-admin/firestore";
import { initializeApp, applicationDefault } from "firebase-admin/app";
import { Config } from "../config";

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
        doc.data().email
      );
      return userToGet;
    }
  }

  /**
   * @inheritdoc
   */
  async setUserRole(user: User, role: Role): Promise<void> {
    const userRef = this.db.collection(this.USER_COLLECTION_PATH).doc(user.id);
    const doc = await userRef.get();
    if (doc.exists) {
      await userRef.update({
        role: role.valueOf(),
      });
    } else {
      throw new Error("User not found");
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
    } else {
      throw new Error("User not found");
    }
  }

  /**
   * @inheritdoc
   */
  async createUser(user: User): Promise<void> {
    try {
      await this.db
        .collection(this.USER_COLLECTION_PATH)
        .doc(user.id)
        .set(user);
    } catch (err) {
      throw new Error("Error creating user");
    }
  }
}
