import { IHasher } from "../IHasher";
import * as crypto from 'crypto'

// build off this https://www.eecs.harvard.edu/~michaelm/postscripts/tr-02-05.pdf
export class KMHasher<T> implements IHasher<T> {
    constructor(private _size: number, private _numHashes: number) {

    }

    // Return index of bits to add in filter
    public getHashes(item: T): Array<number> {
        let result = new Array<number>(this._numHashes);
        const md5 = this.getHash(item)

        // slice the hash, taking 32 bit 
        const slice_1 = parseInt(md5.slice(0,8), 16);
        const slice_2 = parseInt(md5.slice(8,16), 16);

        for (let i=0; i < this._numHashes; i++) {
            // try out the extended double hash
            result[i] = slice_1 + i * slice_2 + i*i % this._size;
        }

        return result;
    }

    // return hex encoded hash
    private getHash(item: T): string {
        if (typeof item == "string") {
            return crypto.createHash('md5').update(item).digest("hex"); 
        }
        else{
            throw `Unimplemented hashing of type ${typeof item}.`;
        }
    }
}