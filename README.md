# aidjs

the user client SDK for aid system

## installation

```bash
yarn add aid-js-sdk
```

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
- privateMsg: Map<string, string>
- data: Map<string, string>

Methods:
- constructor(aid: string, certs: Map<string, AidCert>, privateMsg: Map<string, string>, data: Map<string, string>)
- static fromStr(str: string): Aid
- toStr(): string
- addCert(cert: AidCert, privateMsg: string)
- removeCert(timestamp: string)
- listCerts(): { timestamp: string, cert: AidCert, privateMsg: string }[]
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

## Notes and Considerations

1. The system uses string timestamps as keys for certificates and their associated private messages within an Aid instance.

2. The `AidCert` interface combines blockchain and server information, suggesting it can be used in various contexts.

3. The `Aid` class allows for storing and retrieving arbitrary string data through its `data` property.

4. The system provides serialization and deserialization methods (`toStr` and `fromStr`) for Aid and AidPreview instances, facilitating data persistence and transfer.

5. The AidList class uses compressed JSON strings for initialization, which may be useful for efficient data transfer or storage.

6. Error handling is not explicitly implemented in the provided code. Consider adding appropriate error checks and exception handling in a production environment.

7. The system doesn't include any authentication or authorization mechanisms. Implement these as needed for your specific use case.

8. Be cautious when using `Record<string, any>` for Claims, Setting, and VerifyOptions in AidCert. Consider using more specific types if the structure of these objects is known.