import { scrypt, randomBytes} from 'crypto';

export class Password {
  static async toHash(password: string) {
    return new Promise((resolve, reject) => {
      const salt = randomBytes(32).toString("hex");

      scrypt(password, salt, 128, (err, derivedKey) => {
          if (err) reject(err);
          resolve(salt + ":" + derivedKey.toString('hex'));
      });
    });
  }

  static async compare(hash: string, password: string){
    return new Promise((resolve, reject) => {
      const [salt, key] = hash.split(":");
      scrypt(password, salt, 128, (err, derivedKey) => {
          if (err) reject(err);
          resolve(key == derivedKey.toString('hex'));
      });
    });
  }
}