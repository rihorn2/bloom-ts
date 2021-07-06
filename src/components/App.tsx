import React, {useState, useEffect, useCallback, useRef} from 'react';
import { Stack, ThemeProvider, Toggle, Text, TextField, PrimaryButton, IDropdownOption, Dropdown } from '@fluentui/react';
import './App.css';
import { darkTheme, lightTheme } from '../themes';
import { BloomFilter, IBloomFilter } from '../bloom/BloomFilter';
import { BloomFilterStats } from './BloomFilterStats';
import { boldStyle, stackStyles, stackTokens } from './CommonFluentStyles';
import testDictionaryJson from '../test_data/wordlist.json'

// move to module declaration as needed
const testDict: string[] = testDictionaryJson as string[];

const dictionaryOptions: IDropdownOption<string[]>[] = [
  { key: "empty", text: "Empty list", data: []},
  { key: "fullList", text: "Full Dictionary", data: testDict},
  { key: "firstHalf", text: "First Half", data: testDict.slice(0, Math.floor(testDict.length / 2))},
  { key: "secondHalf", text: "Second Half", data: testDict.slice(Math.floor(testDict.length / 2))}
];

export const App = () => {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);
  const [dictionary, setDictionary] = useState<IDropdownOption<string[]>>(dictionaryOptions[1]);
  const [percentLoaded, setPercentLoaded] = useState<number>(0);
  const [testWord, setTestWord] = useState<string>("");
  const [knownWord, setKnownWord] = useState<boolean>(false);
  const bloomFilter = useRef<IBloomFilter<string>>(new BloomFilter<string>(3, []));
  // copy of internal representation of filter. Made public for statistics.
  const [filterState, setFilterState] = useState<Uint16Array>(new Uint16Array());

  // create bloom filter from dictionary
  useEffect(()=>{
    // abort any async init of existing filter
    bloomFilter.current.abortInitialization();

    const callback = (percentLoaded: number) => {
      setPercentLoaded(percentLoaded);
      if (percentLoaded === 1) {
        // Used in debug mode
        setFilterState(bloomFilter.current.peekFilter());
      }
    };
    bloomFilter.current = new BloomFilter<string>(5000000, dictionary.data || [], undefined, callback);
    setPercentLoaded(0);
  }, [dictionary]);

  useEffect(() => {
    let known = bloomFilter.current.contains(testWord);
    setKnownWord(known);
  }, [testWord, percentLoaded])

  const onChangeTestWord = useCallback(
    (_, newValue?: string) => {
      setTestWord(newValue || '');
  }, []);

  const addWord = useCallback(
    (word) => { 
      bloomFilter.current.add(word);
      setTestWord('');
      setFilterState(bloomFilter.current.peekFilter());
  }, [bloomFilter]);

  const onDictionarySelect = (_: React.FormEvent<HTMLDivElement>, item?: IDropdownOption): void => {
    if (item) {
      setDictionary(item);
    }
    else {
      // if option is undefined, set to first option
      setDictionary(dictionaryOptions[0])
    }
  };

  return (
    <ThemeProvider
      applyTo="body"
      theme={isDarkMode ? darkTheme : lightTheme}
    >
      <Stack horizontal tokens={{childrenGap: 15}}>
        <Toggle
          label="Change themes"
          onText="Light mode"
          offText="Dark mode"
          onChange={() => setIsDarkMode(!isDarkMode)}
        ></Toggle>
        <Dropdown
          label="Sample Dictionary"
          selectedKey={dictionary.key}
          onChange={onDictionarySelect}
          options={dictionaryOptions}
        />
      </Stack>
      <Stack horizontalAlign="center" verticalAlign="center" verticalFill styles={stackStyles} tokens={stackTokens}>
        <Text variant="xxLarge" styles={boldStyle}>
          Bloom Filter Explorer:  
        </Text>
        <Text variant="large">
          Ask me if I've seen a word before! No false negatives! Chance of false positive...
        </Text>
        {percentLoaded === 1 ? <>
          <TextField 
            label="Word to evaluate"
            value={testWord}
            onChange={onChangeTestWord}
          />
          {testWord && 
            <>
            {knownWord ?
              <Text> I know that word! ...I think?</Text> :
              <Stack>
                <Text> Never heard of it. Should I learn it?</Text>
                <PrimaryButton onClick={() => addWord(testWord)}>Yes!</PrimaryButton>
              </Stack>
            }
            </>
          }
          <BloomFilterStats filterState={filterState} numHashes={bloomFilter.current.numHashes}/>
          </> :
          <Text>Loading... {(100 * percentLoaded).toFixed(0) + "%"}</Text>
        }
        </Stack>
    </ThemeProvider>
  );
}
