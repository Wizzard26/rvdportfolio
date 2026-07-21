// Minimaler ZIP-Builder (Store-Methode, ohne Kompression) — ohne externe
// Abhängigkeit. PDFs sind bereits komprimiert, daher ist „Store" hier ideal.
// Läuft nur serverseitig (Buffer).

let crcTable;
function getCrcTable() {
    if (crcTable) return crcTable;
    crcTable = new Uint32Array(256);
    for (let n = 0; n < 256; n++) {
        let c = n;
        for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1;
        crcTable[n] = c >>> 0;
    }
    return crcTable;
}

function crc32(buf) {
    const t = getCrcTable();
    let c = 0xFFFFFFFF;
    for (let i = 0; i < buf.length; i++) c = (c >>> 8) ^ t[(c ^ buf[i]) & 0xFF];
    return (c ^ 0xFFFFFFFF) >>> 0;
}

// entries: [{ name: string, data: Buffer }] → Buffer eines gültigen ZIP-Archivs.
export function createZip(entries) {
    const parts = [];
    const central = [];
    let offset = 0;
    const DOS_DATE = 0x0021; // 1980-01-01
    const DOS_TIME = 0x0000;

    for (const e of entries) {
        const nameBuf = Buffer.from(e.name, 'utf8');
        const data = e.data;
        const crc = crc32(data);
        const size = data.length;

        const local = Buffer.alloc(30);
        local.writeUInt32LE(0x04034b50, 0);   // local file header signature
        local.writeUInt16LE(20, 4);           // version needed
        local.writeUInt16LE(0x0800, 6);       // flags: UTF-8 filename
        local.writeUInt16LE(0, 8);            // compression: store
        local.writeUInt16LE(DOS_TIME, 10);
        local.writeUInt16LE(DOS_DATE, 12);
        local.writeUInt32LE(crc, 14);
        local.writeUInt32LE(size, 18);        // compressed size
        local.writeUInt32LE(size, 22);        // uncompressed size
        local.writeUInt16LE(nameBuf.length, 26);
        local.writeUInt16LE(0, 28);           // extra length
        parts.push(local, nameBuf, data);

        const cd = Buffer.alloc(46);
        cd.writeUInt32LE(0x02014b50, 0);      // central dir signature
        cd.writeUInt16LE(20, 4);              // version made by
        cd.writeUInt16LE(20, 6);              // version needed
        cd.writeUInt16LE(0x0800, 8);          // flags
        cd.writeUInt16LE(0, 10);              // compression
        cd.writeUInt16LE(DOS_TIME, 12);
        cd.writeUInt16LE(DOS_DATE, 14);
        cd.writeUInt32LE(crc, 16);
        cd.writeUInt32LE(size, 20);
        cd.writeUInt32LE(size, 24);
        cd.writeUInt16LE(nameBuf.length, 28);
        cd.writeUInt16LE(0, 30);              // extra length
        cd.writeUInt16LE(0, 32);              // comment length
        cd.writeUInt16LE(0, 34);              // disk number
        cd.writeUInt16LE(0, 36);              // internal attrs
        cd.writeUInt32LE(0, 38);              // external attrs
        cd.writeUInt32LE(offset, 42);         // offset of local header
        central.push(cd, nameBuf);

        offset += local.length + nameBuf.length + size;
    }

    const centralBuf = Buffer.concat(central);
    const eocd = Buffer.alloc(22);
    eocd.writeUInt32LE(0x06054b50, 0);        // end of central dir signature
    eocd.writeUInt16LE(0, 4);                 // disk number
    eocd.writeUInt16LE(0, 6);                 // disk with central dir
    eocd.writeUInt16LE(entries.length, 8);    // entries on this disk
    eocd.writeUInt16LE(entries.length, 10);   // total entries
    eocd.writeUInt32LE(centralBuf.length, 12);
    eocd.writeUInt32LE(offset, 16);           // central dir offset (Bytes 16–19)
    eocd.writeUInt16LE(0, 20);                // comment length (Bytes 20–21)

    return Buffer.concat([...parts, centralBuf, eocd]);
}
