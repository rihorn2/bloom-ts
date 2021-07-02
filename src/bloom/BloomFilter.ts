import { KMHasher } from "./Hashing/KMHasher";
import { IHasher } from "./Hashing/IHasher";

export interface IBloomFilter<T> {
    add(item: T): void;
    contains(item: T): boolean;
}

export class BloomFilter<T> implements IBloomFilter<T> {
    // TODO: number takes up many bytes, look into storing bit, or impl delete and actually use number
    // bool doesn't effectively save on memory.
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
        this._entryCount++;
    }

    public contains(item: T): boolean {
        let newHashes = this._hasher.getHashes(item);
        console.log(newHashes)
        return newHashes.every((filterIndex) => { return this._filter[filterIndex] !== 0; });
    }
}