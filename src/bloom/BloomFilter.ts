import { KMHasher } from "./Hashing/KMHasher";
import { IHasher } from "./Hashing/IHasher";

export interface IBloomFilter<T> {
    add(item: T): void;
    contains(item: T): boolean;
}

export class BloomFilter<T> implements IBloomFilter<T> {
    // TODO: determine if uint16 will suport count for delete, switch to 32
    private _filter: Uint16Array;
    private _size: number;
    private _entryCount: number;
    private _hasher: IHasher<T>

    constructor(size: number, numHashes: number) {
        // 
        this._size = size;
        this._filter = new Uint16Array(size).fill(0);
        this._entryCount = 0;
        this._hasher = new KMHasher<T>(size, numHashes)
    }

    // ensure this takes in large objects (strings, buffers)
    // hashing can be expensive 
    public add(item: T): void {
        let newHashes = this._hasher.getHashes(item);
        newHashes.forEach((filterIndex) => {
            // TODO, increment to support delete (after basic tests) (check for overflow)
            this._filter[filterIndex] = 1;
        })
        console.log(item)
        this._entryCount++;
    }

    public contains(item: T): boolean {
        let newHashes = this._hasher.getHashes(item);
        console.log(newHashes)
        console.log(this._filter)
        return newHashes.every((filterIndex) => { return this._filter[filterIndex] !== 0; });
    }
}
