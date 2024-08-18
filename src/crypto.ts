async function generateRSAKeyPair() : Promise<{publicKeyPem: string, privateKeyPem: string}> {
    // rsa generate key pair
    const pair = await window.crypto.subtle.generateKey(
        {
            name: "RSASSA-PKCS1-v1_5",
            modulusLength: 2048, //can be 1024, 2048, or 4096
            publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
            hash: {name: "SHA-256"}, //can be "SHA-1", "SHA-256", "SHA-384", or "SHA-512"
        },
        true,
        ["sign", "verify"]
    )
    // use pem format to store key pair
    const [
        publicKeyPem,
        privateKeyPem
    ] = await Promise.all([
        publicKeyToPem(pair.publicKey),
        privateKeyToPem(pair.privateKey)
    ]);

    return { publicKeyPem, privateKeyPem };
}

function arrayBufferToBase64(buffer: ArrayBuffer) {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
}

// Function to convert a public key to PEM format
 async function publicKeyToPem(publicKey: CryptoKey): Promise<string> {
    const exported = await window.crypto.subtle.exportKey(
        "spki",
        publicKey
    );
    const exportedAsBase64 = arrayBufferToBase64(exported);
    return `-----BEGIN PUBLIC KEY-----\n${exportedAsBase64}\n-----END PUBLIC KEY-----`;
}


// Function to convert a private key to PEM format
 async function privateKeyToPem(privateKey: CryptoKey): Promise<string> {
    const exported = await window.crypto.subtle.exportKey(
        "pkcs8",
        privateKey
    );
    const exportedAsBase64 = arrayBufferToBase64(exported);
    return `-----BEGIN PRIVATE KEY-----\n${exportedAsBase64}\n-----END PRIVATE KEY-----`;
}

// Function to convert a PEM format private key to CryptoKey
 async function pemToPrivateKey(pemKey: string): Promise<CryptoKey> {
    // Remove the PEM header and footer
    const pemContents = pemKey.replace(
        /(-----BEGIN PRIVATE KEY-----|-----END PRIVATE KEY-----|\s)/g,
        ''
    );

    // Convert base64 to ArrayBuffer
    const binaryDer = base64ToArrayBuffer(pemContents);

    // Import the key
    return await window.crypto.subtle.importKey(
        "pkcs8",
        binaryDer,
        {
            name: "RSASSA-PKCS1-v1_5",
            hash: {name: "SHA-256"}, //can be "SHA-1", "SHA-256", "SHA-384", or "SHA-512"
        },
        true,
        ["sign"]
    );
}

// Helper function to convert base64 to ArrayBuffer
function base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binaryString = window.atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
}

function uint8ArrayToString(array: Uint8Array): string {
    const chunk = 8192; // 處理大型數組
    let result = '';
    for (let i = 0; i < array.length; i += chunk) {
        result += String.fromCharCode.apply(null, Array.from(array.subarray(i, i + chunk)));
    }
    return result;
}

async function generateSignature(privateKey: CryptoKey, preSign: string): Promise<string> {
    // sign the hashed preSign
    const signature = await window.crypto.subtle.sign(
        {
            name: "RSASSA-PKCS1-v1_5",
            hash: {name: "SHA-256"}, //can be "SHA-1", "SHA-256", "SHA-384", or "SHA-512"
        },
        privateKey,
        new TextEncoder().encode(preSign)
    );
    return btoa(uint8ArrayToString(new Uint8Array(signature)))
}

export {pemToPrivateKey, generateRSAKeyPair, generateSignature}