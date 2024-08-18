import {AidCert} from "./types";

class AidCertHash {
    static async Hash(cert: AidCert, strategy?: (cert: AidCert) => Promise<string>): Promise<string> {
        if (strategy) {
            return strategy(cert);
        }
        return AidCertHash.DefaultHashStrategy(cert);
    }

    private static async DefaultHashStrategy(cert: AidCert): Promise<string> {
        return AidCertHash.hashString(AidCertHash.cert2String(cert));
    }

    private static cert2String(cert: AidCert): string {
        let str = cert.Aid;
        str += cert.ContractAddress;
        str += cert.BlockChainUrl;
        str += cert.ServerAddress;
        str += AidCertHash.sortedPrintMap(cert.Claims);
        str += AidCertHash.sortedPrintMap(cert.Setting);
        str += AidCertHash.sortedPrintMap(cert.VerifyOptions);
        return str;
    }

    private static sortedPrintMap(m: Record<string, any>): string {
        const keys = Object.keys(m).sort();
        return keys.reduce((str, key) => str + key + JSON.stringify(m[key]), '');
    }

    private static async hashString(str: string): Promise<string> {
        // 將字符串轉換為 Uint8Array
        const msgUint8 = new TextEncoder().encode(str);
        // 使用 SubtleCrypto 接口的 digest 方法計算哈希
        const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
        // 將 ArrayBuffer 轉換為 Uint8Array
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        // 將每個字節轉換為十六進制字符串
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }
}

export  {AidCertHash};