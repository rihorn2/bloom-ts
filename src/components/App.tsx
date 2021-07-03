import React, {useState, useEffect, useCallback} from 'react';
import { Stack, ThemeProvider, Toggle, Text, TextField, PrimaryButton } from '@fluentui/react';
import './App.css';
import { darkTheme, lightTheme } from '../themes';
import { BloomFilter, IBloomFilter } from '../bloom/BloomFilter';
import { BloomFilterStats } from './BloomFilterStats';
import { boldStyle, stackStyles, stackTokens } from './CommonFluentStyles';



export const App = () => {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);
  const [dictionary, setDictionary] = useState<string[]>([]);
  const [testWord, setTestWord] = useState<string>("");
  const [knownWord, setKnownWord] = useState<boolean>(false);
  const [bloomFilter, setBloomFilter] = useState<IBloomFilter<string>>(new BloomFilter<string>(2, 1));
  // copy of internal representation of filter. Made public for statistics.
  const [filterState, setFilterState] = useState<Uint16Array>(new Uint16Array());

  
  // set default dictionary to content of file
  useEffect(() => {
    setDictionary(["yes", "no", "true"]);
    // TODO: set up (fetch?) default dict
  }, []);
  // create bloom filter from dictionary
  useEffect(()=>{
    let newBloomFilter = new BloomFilter<string>(50, 3);
    dictionary.forEach(word => {
      newBloomFilter.add(word);
    });
    setBloomFilter(newBloomFilter);
    setFilterState(newBloomFilter.peekFilter());
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
        </Stack>
    </ThemeProvider>
  );
}
