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
        const encoder = new TextEncoder();
        const data = encoder.encode(str);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }
}

export  {AidCertHash};