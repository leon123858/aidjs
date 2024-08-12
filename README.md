# aidjs

the user client SDK for aid system

## Core Components

### AidType

An enumeration defining the types of assistance:

```typescript
enum AidType {
    P2p = "p2p",
    Server = "server",
    Blockchain = "blockchain",
    Full = "full"
}
```

### Interfaces

1. **ContractInfo**
    - ContractAddress: string
    - BlockChainUrl: string

2. **ServerInfo**
    - ServerAddress: string

3. **AidCert** (extends ContractInfo and ServerInfo)
    - Aid: string (UUID)
    - CertType: AidType
    - Claims: Record<string, any>
    - Setting: Record<string, any>
    - VerifyOptions: Record<string, any>

### Classes

#### Aid

Represents a complete assistance instance.

Properties:
- aid: string
- certs: Map<string, AidCert>
- privateMsg: Map<string, Map<string, string>>
- data: Map<string, string>

Methods:
- constructor(aid: string, certs: Map<string, AidCert>, privateMsg: Map<string, Map<string, string>>, data: Map<string, string>)
- static fromStr(str: string): Aid
- toStr(): string
- addCert(cert: AidCert, privateMsg: Map<string, string>)
- removeCert(timestamp: string)
- listCerts(): { timestamp: string, cert: AidCert, privateMsg: Map<string, string> }[]
- getData(key: string): string
- setData(key: string, value: string)

#### AidPreview

Provides a preview of an Aid instance.

Properties:
- aid: string
- descriptions: Map<string, string>

Methods:
- constructor(aid: string, descriptions: Map<string, string>)
- static fromStr(str: string): AidPreview
- toStr(): string

#### AidList

Manages a collection of AidPreviews and default user information.

Properties:
- defaultUserInfos: Map<string, string>
- aids: AidPreview[]

Methods:
- Constructor(defaultUserInfosZip: string, aidsZip: string)
- export(): { defaultUserInfosZip: string, aidsZip: string }
- addAid(aid: AidPreview)
- removeAid(aid: string)
- listAids(): AidPreview[]
- findAid(aid: string): AidPreview

## Usage Examples

1. Creating an Aid instance:
   ```typescript
   const certs = new Map<string, AidCert>();
   const privateMsg = new Map<string, Map<string, string>>();
   const data = new Map<string, string>();
   const aid = new Aid("uniqueAidString", certs, privateMsg, data);
   ```

2. Adding a certificate to an Aid:
   ```typescript
   const cert: AidCert = {
     Aid: "certAidString",
     CertType: AidType.P2p,
     Claims: {},
     Setting: {},
     VerifyOptions: {},
     ContractAddress: "0x...",
     BlockChainUrl: "https://...",
     ServerAddress: "https://..."
   };
   const certPrivateMsg = new Map<string, string>();
   aid.addCert(cert, certPrivateMsg);
   ```

3. Listing certificates of an Aid:
   ```typescript
   const certList = aid.listCerts();
   ```

4. Creating an AidList:
   ```typescript
   const defaultUserInfosZip = JSON.stringify([["key1", "value1"], ["key2", "value2"]]);
   const aidsZip = JSON.stringify([new AidPreview("aid1", new Map([["desc1", "value1"]]))]);
   const aidList = new AidList(defaultUserInfosZip, aidsZip);
   ```

5. Managing AidList:
   ```typescript
   const newAidPreview = new AidPreview("aid2", new Map([["desc2", "value2"]]));
   aidList.addAid(newAidPreview);
   const foundAid = aidList.findAid("aid1");
   aidList.removeAid("aid2");
   const allAids = aidList.listAids();
   ```

## Notes and Considerations

1. The system uses string timestamps as keys for certificates and their associated private messages within an Aid instance.

2. The `AidCert` interface combines blockchain and server information, suggesting it can be used in various contexts.

3. The `Aid` class allows for storing and retrieving arbitrary string data through its `data` property.

4. The system provides serialization and deserialization methods (`toStr` and `fromStr`) for Aid and AidPreview instances, facilitating data persistence and transfer.

5. The AidList class uses compressed JSON strings for initialization, which may be useful for efficient data transfer or storage.

6. Error handling is not explicitly implemented in the provided code. Consider adding appropriate error checks and exception handling in a production environment.

7. The system doesn't include any authentication or authorization mechanisms. Implement these as needed for your specific use case.

8. Be cautious when using `Record<string, any>` for Claims, Setting, and VerifyOptions in AidCert. Consider using more specific types if the structure of these objects is known.