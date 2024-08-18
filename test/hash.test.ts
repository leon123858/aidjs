import {AidCert, AidCertHash, AidType} from "../src"


describe('hash', () => {
    it('2str', async () => {
        const cert:AidCert = {
            Aid: '10db9410-4bcd-4056-bad0-3142c643e9ee',
            ContractAddress: 'test',
            BlockChainUrl: 'test',
            ServerAddress: 'test',
            Sign: 'test',
            CertType: AidType.P2p,
            Claims: {
                test: 'test',
            },
            Setting: {
                test: 'test',
            },
            VerifyOptions: {
                test: 'test',
            },
        };
        console.log('hash', await AidCertHash.Hash(cert));
    });
});