import CryptoJS from "crypto-js";

const secretKey =
  "f5a67033d703bd7bb6e073bee497739ejndh9HyhYHijwhjKJAHHI29Iuioo89yo7tB7tg6RV5e54V6d";

const encryptParam = (param) => {
  const res = CryptoJS.AES.encrypt(param, secretKey).toString();
  return res.replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
};

const decryptParam = (encryptedParam) => {
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedParam.replace(/-/g, '+')
      .replace(/_/g, '/'), secretKey);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);
    return decrypted ? decrypted : null;
  } catch (error) {
    console.error("Échec du déchiffrement :", error);
    return null;
  }
};

export { encryptParam, decryptParam };
