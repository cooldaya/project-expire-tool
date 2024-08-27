// aesUtil.js + verifyAccess.js
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
(function () {
  document.documentElement.setAttribute("hidden", true);
  let timer = null;
  const interval = 1000 * 60 * 60; // 每隔1小时刷新一次页面
  const setInvisible = () => {
    // 验证码过期，设置不可见 可自己拓展功能
    document.body.innerHTML = ``;
    alert("访问码已过期，请重新设置访问码。");
  };

  // 定时检查访问码
  const checkAccessCode = async () => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      checkAccessCode();
    }, interval); // 每隔6小时检查一次
    if (!window.access_code) {
      return alert("请设置window.access_code 访问码"); // 没有设置访问码
    }
    try {
      const aesUtil = await AesUtil.getAesUtil();
      const decrypted = await aesUtil.decrypt(window.access_code);
      const payload = JSON.parse(decrypted);
      if (!payload.expire || payload.expire < Date.now())
        throw new Error("Access code expired."); // 访问码过期
      console.log(
        `%c K T \n项目名称：${payload.name} \n过期时间：${new Date(
          payload.expire
        ).toLocaleString()} `,
        `background-color: fuchsia ; color: white ; font-weight: bold ; 
                   font-size: 20px ; font-style: italic ; text-decoration: underline; 
                   font-family: 'american typewriter' ; text-shadow: 1px 1px 3px black; `
      );
      document.documentElement.removeAttribute("hidden");
    } catch (e) {
      setInvisible();
      document.documentElement.removeAttribute("hidden");
    }
  };
  window.addEventListener("DOMContentLoaded", checkAccessCode);
})();
