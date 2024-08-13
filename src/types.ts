enum AidType {
    P2p = "p2p",
    Server = "server",
    Blockchain = "blockchain",
    Full = "full"
}

interface ContractInfo {
    ContractAddress: string;
    BlockChainUrl: string;
}

interface ServerInfo {
    ServerAddress: string;
}

interface AidCert extends ContractInfo, ServerInfo {
    Aid: string; // Assuming UUID is represented as a string in TypeScript
    CertType: AidType;
    Claims: Record<string, any>;
    Setting: Record<string, any>;
    VerifyOptions: Record<string, any>;
}

class Aid {
    aid: string;
    certs: Map<string, AidCert>;
    privateMsg: Map<string, Map<string, string>>;
    data: Map<string, string>;

    constructor(aid: string, certs: Map<string, AidCert>, privateMsg: Map<string, Map<string, string>>, data: Map<string, string>) {
        this.aid = aid;
        this.certs = certs;
        this.privateMsg = privateMsg;
        this.data = data;
    }

    static fromStr(str: string): Aid {
        const obj = JSON.parse(str);
        return new Aid(obj.aid, obj.certs, obj.privateMsg, obj.data);
    }

    toStr(): string {
        return JSON.stringify(this);
    }

    addCert(cert: AidCert, privateMsg: Map<string, string>) {
        let timestamp = new Date().getTime().toString();
        this.certs.set(timestamp, cert);
        this.privateMsg.set(timestamp, privateMsg);
    }

    removeCert(timestamp: string) {
        this.certs.delete(timestamp);
        this.privateMsg.delete(timestamp);
    }

    listCerts(): {
        timestamp: string,
        cert: AidCert | undefined,
        privateMsg: Map<string, string> | undefined
    }[] {
        return Object.keys(this.certs).map(timestamp => {
            return {
                timestamp: timestamp,
                cert: this.certs.get(timestamp),
                privateMsg: this.privateMsg.get(timestamp)
            };
        });
    }

    getData(key: string): string | undefined {
        return this.data.get(key);
    }

    setData(key: string, value: string) {
        this.data.set(key, value);
    }
}

class AidPreview {
    aid: string;
    descriptions: Map<string, string>

    constructor(aid: string, descriptions: Map<string, string>) {
        this.aid = aid;
        this.descriptions = descriptions;
    }

    static fromStr(str: string): AidPreview {
        const obj = JSON.parse(str);
        return new AidPreview(obj.aid, obj.descriptions);
    }

    toStr(): string {
        return JSON.stringify(this);
    }
}

class AidList {
    defaultUserInfos: Map<string, string> = new Map<string, string>();
    aids: AidPreview[] = [];

    Constructor(defaultUserInfosZip: string, aidsZip: string) {
        this.defaultUserInfos = new Map<string, string>(JSON.parse(defaultUserInfosZip));
        this.aids = JSON.parse(aidsZip);
    }

    export(): { defaultUserInfosZip: string, aidsZip: string } {
        return {
            defaultUserInfosZip: JSON.stringify(Array.from(this.defaultUserInfos.entries())),
            aidsZip: JSON.stringify(this.aids)
        };
    }

    addAid(aid: AidPreview) {
        this.aids.push(aid);
    }

    removeAid(aid: string) {
        this.aids = this.aids.filter(a => a.aid !== aid);
    }

    listAids(): AidPreview[] {
        return this.aids;
    }

    findAid(aid: string): AidPreview | undefined {
        return this.aids.find(a => a.aid === aid);
    }
}

export {AidType, ContractInfo, ServerInfo, AidCert, Aid, AidPreview, AidList};