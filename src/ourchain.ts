interface Contract {
    action: number;
    code: string;
    address: string;
    args: string[];
}

interface UTXO {
    txid: string;
    vout: number;
    amount: number;
    address: string;
}

class OurChainService {
    private BASE_URL: string;
    private readonly privateKey: string;
    private readonly ownerAddress: string;

    constructor(privateKey: string, ownerAddress: string, baseUrl: string) {
        this.BASE_URL = baseUrl;
        this.privateKey = privateKey;
        this.ownerAddress = ownerAddress
    }

    setBaseUrl(baseUrl: string) {
        this.BASE_URL = baseUrl;
    }

    private async fetchJson(url: string, options: RequestInit = {}): Promise<any> {
        const response = await fetch(url, options);
        const json = await response.json();
        if (json.result !== 'success') {
            console.error('Error: ', json);
            throw new Error(json.message || 'Request failed');
        }
        return json.data;
    }

    async getUtxoList(fee: number = 0.0001, targetAddress: string = '', amount: number = 0): Promise<{ inputs: UTXO[], outputs: { address: string, amount: number }[] }> {
        const utxoList: UTXO[] = await this.fetchJson(`${this.BASE_URL}get/utxo?address=${this.ownerAddress}`);
        utxoList.sort(() => Math.random() - 0.5);

        let totalAmount = amount + fee;
        const inputList: UTXO[] = [];
        for (const utxo of utxoList) {
            inputList.push(utxo);
            totalAmount -= utxo.amount;
            if (totalAmount <= 0) break;
        }

        if (totalAmount > 0) {
            throw new Error('Error: not enough money');
        }

        const outputList = [];
        const currentAmount = inputList.reduce((acc, cur) => acc + cur.amount, 0);
        const charge = currentAmount - amount - fee;
        if (charge > 0) {
            outputList.push({ address: this.ownerAddress, amount: charge });
        }
        outputList.push({ address: targetAddress, amount: amount });

        return { inputs: inputList, outputs: outputList };
    }

    async getUtxo(fee: number = 0.0001, targetAddress: string = ''): Promise<{ input: { txid: string, vout: number }, output: { address: string, amount: number } }> {
        const utxoList: UTXO[] = await this.fetchJson(`${this.BASE_URL}get/utxo?address=${this.ownerAddress}`);
        utxoList.sort(() => Math.random() - 0.5);

        const targetUtxo = utxoList.find(utxo => utxo.amount > fee);
        if (!targetUtxo) {
            throw new Error('Error: no utxo available');
        }

        return {
            input: { txid: targetUtxo.txid, vout: targetUtxo.vout },
            output: {
                address: targetAddress || targetUtxo.address,
                amount: targetUtxo.amount - fee,
            },
        };
    }

    async createTx(fee: number = 0.0001, targetAddress: string = '', contract: Contract): Promise<{ hex: string, contractAddress: string }> {
        const utxo = await this.getUtxo(fee, targetAddress);
        return this.fetchJson(`${this.BASE_URL}rawtransaction/create`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                inputs: [utxo.input],
                outputs: [utxo.output],
                contract,
            }),
        });
    }

    async signContract(rawTx: string): Promise<string> {
        const result = await this.fetchJson(`${this.BASE_URL}rawtransaction/sign`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ rawTransaction: rawTx, privateKey: this.privateKey }),
        });
        if (!result.complete) {
            throw new Error('Signing incomplete');
        }
        return result.hex;
    }

    async sendTx(signedTx: string): Promise<string> {
        return this.fetchJson(`${this.BASE_URL}rawtransaction/send`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ rawTransaction: signedTx }),
        });
    }

    async sendMoney(fee: number = 0.0001, targetAddress: string, amount: number): Promise<string> {
        const utxoList = await this.getUtxoList(fee, targetAddress, amount);
        const createTxResult = await this.fetchJson(`${this.BASE_URL}rawtransaction/create`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                inputs: utxoList.inputs,
                outputs: utxoList.outputs,
                contract: { action: 0, code: '', address: '', args: [] },
            }),
        });
        const signedTx = await this.signContract(createTxResult.hex);
        return this.sendTx(signedTx);
    }

    async deployContract(fee: number = 0.0001, targetAddress: string, code: string, args: string[] = ['']): Promise<{ txid: string, contractAddress: string }> {
        const rawTx = await this.createTx(fee, '', {
            action: 1,
            code,
            address: targetAddress,
            args,
        });
        const signedTx = await this.signContract(rawTx.hex);
        const txid = await this.sendTx(signedTx);
        return { txid, contractAddress: rawTx.contractAddress };
    }

    async callContract(fee: number = 0.0001, targetAddress: string, code: string, args: string[] = ['']): Promise<string> {
        const rawTx = await this.createTx(fee, '', {
            action: 2,
            code,
            address: targetAddress,
            args,
        });
        const signedTx = await this.signContract(rawTx.hex);
        return this.sendTx(signedTx);
    }

    async getContractMessage(targetAddress: string, args: string[] = ['']): Promise<string> {
        return this.fetchJson(`${this.BASE_URL}get/contractmessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ address: targetAddress, arguments: args }),
        });
    }
}

export { OurChainService, Contract, UTXO };