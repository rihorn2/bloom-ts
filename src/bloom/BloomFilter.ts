import { KMHasher } from "./Hashing/KMHasher";
import { IHasher } from "./Hashing/IHasher";

export interface IBloomFilter<T> {
    numHashes: number;
    loadingProgressCallback?: (n: number)=>void;
    add(item: T): void;
    contains(item: T): boolean;
    peekFilter(): Uint16Array;
    currentCount(): number;
    abortInitialization(): void;
}

export class BloomFilter<T> implements IBloomFilter<T> {
    public numHashes: number;
    // TODO: determine if uint16 will suport count for delete, switch to 32
    private _filter: Uint16Array;
    private _size: number;
    private _entryCount: number;
    private _hasher: IHasher<T>
    private _abortInitialization = false;

    constructor(size: number, private _initialList: Array<T>, numHashes?: number, public loadingProgressCallback?: (n: number)=>void) {
        const defaultHashCount = _initialList.length !== 0 ? Math.ceil(Math.log(2) * (size/ _initialList.length)) : 5;
        this.numHashes = numHashes || defaultHashCount;
        this._size = size;
        this._filter = new Uint16Array(size).fill(0);
        this._entryCount = 0;
        this._hasher = new KMHasher<T>(size, this.numHashes)

        this.chunkedInitialization();
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
        return newHashes.every((filterIndex) => { return this._filter[filterIndex] !== 0; });
    }

    public peekFilter(): Uint16Array {
        return new Uint16Array(this._filter);
    }

    public currentCount(): number {
        return this._entryCount
    }

    public abortInitialization(): void {
        this._abortInitialization = true;
    }

    private chunkedInitialization(startLocation: number = 0): void {
        const chunksize = 10000;
        const stopLocation = Math.min(this._initialList.length, startLocation + chunksize);
        for(let i = startLocation; i < stopLocation; i++) {
            this.add(this._initialList[i]);
        }
        if (stopLocation < this._initialList.length && !this._abortInitialization) {
            setTimeout(() => {
                this.chunkedInitialization(stopLocation);
                if (this.loadingProgressCallback)
                {
                    this.loadingProgressCallback(stopLocation/this._initialList.length)
                }
            }, 0);
        }
        else {
            setTimeout(()=>{
            if (this.loadingProgressCallback) {
                this.loadingProgressCallback(1);
            }
            }, 0);
        }
    }
}
