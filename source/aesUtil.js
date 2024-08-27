// 加密解密工具类
class AesUtil {
  static defaultKey = "my-secret-key-123";
  constructor(key) {
    this.key = new TextEncoder().encode(key);
  }

  async importKey() {
    this.key = await window.crypto.subtle.importKey(
      "raw",
      this.key.slice(0, 16), // 截取前16字节作为128位密钥
      {
        name: "AES-GCM",
      },
      false,
      ["encrypt", "decrypt"]
    );
  }

  async encrypt(message) {
    if (!this.key) {
      throw new Error("Key not imported");
    }
    const _msg =
      typeof message === "string" ? message : JSON.stringify(message);
    const encoded = new TextEncoder().encode(_msg);
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const encrypted = await window.crypto.subtle.encrypt(
      {
        name: "AES-GCM",
        iv: iv,
      },
      this.key,
      encoded
    );
    const encryptedArray = new Uint8Array(encrypted);
    const combined = new Uint8Array(iv.length + encryptedArray.length);
    combined.set(iv);
    combined.set(encryptedArray, iv.length);
    return btoa(String.fromCharCode.apply(null, combined));
  }

  async decrypt(encryptedString) {
    if (!this.key) {
      throw new Error("Key not imported");
    }
    const combined = new Uint8Array(
      atob(encryptedString)
        .split("")
        .map((char) => char.charCodeAt(0))
    );
    const iv = combined.slice(0, 12);
    const encryptedData = combined.slice(12);
    const decrypted = await window.crypto.subtle.decrypt(
      {
        name: "AES-GCM",
        iv: iv,
      },
      this.key,
      encryptedData
    );
    return new TextDecoder().decode(decrypted);
  }

  static async getAesUtil(key = AesUtil.defaultKey) {
    const aesUtil = new AesUtil(key);
    await aesUtil.importKey();
    return aesUtil;
  }
}
