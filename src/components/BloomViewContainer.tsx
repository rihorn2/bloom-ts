import { useCallback, useEffect, useRef, useState } from 'react';
import { IDropdownOption } from '@fluentui/react';
import { IBloomFilter, BloomFilter } from "../bloom/BloomFilter";
import testDictionaryJson from '../test_data/wordlist.json'
import { BloomView, IBloomViewProps } from './BloomView';

const testDict: string[] = testDictionaryJson as string[];

const dictionaryOptions: IDropdownOption<string[]>[] = [
  { key: "empty", text: "Empty list", data: []},
  { key: "fullList", text: "Full Dictionary", data: testDict},
  { key: "firstHalf", text: "First Half", data: testDict.slice(0, Math.floor(testDict.length / 2))},
  { key: "secondHalf", text: "Second Half", data: testDict.slice(Math.floor(testDict.length / 2))}
];

export const BloomViewContainer = () => {
    const [dictionary, setDictionary] = useState<IDropdownOption<string[]>>(dictionaryOptions[1]);
    const [testWord, setTestWord] = useState<string>("");
    const [isKnownWord, setIsKnownWord] = useState<boolean>(false);
    const [filterInitialized, setFilterInitialized] = useState<boolean>(false);
    const [percentLoaded, setPercentLoaded] = useState<number>(0);
    const bloomFilter = useRef<IBloomFilter<string>>(new BloomFilter<string>(3, []));
    const [filterState, setFilterState] = useState<Uint16Array>(new Uint16Array());

    useEffect(() => {
        return () => {
            bloomFilter.current.abortInitialization();
        }
    }, []);

    const callback = useCallback((percentComplete: number): void => {
        setPercentLoaded(percentComplete);
        if (percentComplete === 1) {
            setFilterInitialized(true);
            setFilterState(bloomFilter.current.peekFilter());
        }
    }, []);

    useEffect(() => {
        bloomFilter.current.abortInitialization();
        setFilterInitialized(false);
        setPercentLoaded(0);
        bloomFilter.current = new BloomFilter<string>(5000000, dictionary.data || [], undefined, callback);
    }, [dictionary, callback]);

    const addWord = useCallback((word: string) => {
        bloomFilter.current.add(word);
        setTestWord('');
        setFilterState(bloomFilter.current.peekFilter());
    },[]);

    useEffect(() => {
        if (!filterInitialized) {
            setIsKnownWord(false);
            return;
        }
        const known = bloomFilter.current.contains(testWord);
        setIsKnownWord(known);
    }, [testWord, filterInitialized]);

    const onChangeTestWord = useCallback(
        (_, newValue?: string) => {
          setTestWord(newValue || '');
    }, []);

    const onDictionarySelect = (_: React.FormEvent<HTMLDivElement>, item?: IDropdownOption): void => {
        if (item) {
            setDictionary(item);
        }
        else {
            // if option is undefined, set to first option
            setDictionary(dictionaryOptions[0])
        }
    };

    const viewProps: IBloomViewProps = {
        filterInitialized,
        percentLoaded,
        testWord,
        onChangeTestWord,
        dictionary,
        onDictionarySelect,
        dictionaryOptions,
        isKnownWord,
        addWord,
        filterState,
        numHashes: bloomFilter.current.numHashes
    };

    return (
        <BloomView {...viewProps}/>
    );
}