export interface IHasher<T> {
    getHashes(item: T): Array<number>
}