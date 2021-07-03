import React, {useState, useEffect, useCallback} from 'react';
import { Stack, ThemeProvider, Toggle, Text, TextField, PrimaryButton } from '@fluentui/react';
import './App.css';
import { darkTheme, lightTheme } from '../themes';
import { BloomFilter, IBloomFilter } from '../bloom/BloomFilter';
import { BloomFilterStats } from './BloomFilterStats';
import { boldStyle, stackStyles, stackTokens } from './CommonFluentStyles';
import testDictionary from '../test_data/wordlist.json'


export const App = () => {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);
  const [dictionary, setDictionary] = useState<string[]>([]);
  const [percentLoaded, setPercentLoaded] = useState<number>(0);
  const [testWord, setTestWord] = useState<string>("");
  const [knownWord, setKnownWord] = useState<boolean>(false);
  const [bloomFilter, setBloomFilter] = useState<IBloomFilter<string>>(new BloomFilter<string>(2, []));
  // copy of internal representation of filter. Made public for statistics.
  const [filterState, setFilterState] = useState<Uint16Array>(new Uint16Array());

  
  // set default dictionary to content of file
  useEffect(() => {
    setDictionary(testDictionary as string[]);
    // TODO: set up (fetch?) default dict
  }, []);

  const loader = useCallback((percentLoaded: number) => {
    setPercentLoaded(percentLoaded);
    if (percentLoaded == 1) {
      setFilterState(bloomFilter.peekFilter());
    }
  }, [bloomFilter])

  // create bloom filter from dictionary
  useEffect(()=>{
    // abort any async init of existing filter
    bloomFilter.abortInitialization();
    let newBloomFilter = new BloomFilter<string>(5000000, dictionary, undefined, loader);
    setBloomFilter(newBloomFilter);
  }, [dictionary]);

  useEffect(() => {
    let known = bloomFilter.contains(testWord);
    setKnownWord(known);
  }, [testWord, bloomFilter])

  const onChangeTestWord = useCallback(
    (_, newValue?: string) => {
      setTestWord(newValue || '');
  }, []);

  const addWord = useCallback(
    (word) => { 
      bloomFilter.add(word);
      setTestWord('');
      setFilterState(bloomFilter.peekFilter());
  }, [bloomFilter]);

  return (
    <ThemeProvider
      applyTo="body"
      theme={isDarkMode ? darkTheme : lightTheme}
    >
      <Toggle
        label="Change themes"
        onText="Light mode"
        offText="Dark mode"
        onChange={() => setIsDarkMode(!isDarkMode)}
      ></Toggle>
      <Stack horizontalAlign="center" verticalAlign="center" verticalFill styles={stackStyles} tokens={stackTokens}>
        <Text variant="xxLarge" styles={boldStyle}>
          Bloom Filter Explorer:  
        </Text>
        <Text variant="large">
          Ask me if I've seen a word before! No false negatives! Chance of false positive...
        </Text>
        {percentLoaded == 1 ? <>
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
          <BloomFilterStats filterState={filterState} numHashes={bloomFilter.numHashes}/>
          </> :
          <Text>Loading... {(100 * percentLoaded).toFixed(0) + "%"}</Text>
        }
        </Stack>
    </ThemeProvider>
  );
}
