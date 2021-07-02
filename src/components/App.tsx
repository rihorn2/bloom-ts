import React, {useState, useEffect, useCallback} from 'react';
import { FontWeights, IStackStyles, IStackTokens, ITextStyles, Stack, ThemeProvider, Toggle, Text, ITextFieldStyles, TextField } from '@fluentui/react';
import './App.css';
import { darkTheme, lightTheme } from '../themes';
import { BloomFilter, IBloomFilter } from '../bloom/BloomFilter';

// basic fluent styles
const boldStyle: Partial<ITextStyles> = { root: { fontWeight: FontWeights.semibold } };
const stackTokens: IStackTokens = { childrenGap: 15 };
const textFieldStyles: Partial<ITextFieldStyles> = { fieldGroup: { width: 300 } };
const stackStyles: Partial<IStackStyles> = {
  root: {
    width: '960px',
    margin: '0 auto',
    textAlign: 'center',
    color: '#605e5c',
  },
};

export const App = () => {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);
  const [dictionary, setDictionary] = useState<string[]>([]);
  const [testWord, setTestWord] = useState<string>("");
  const [knownWord, setKnownWord] = useState<boolean>(false);
  const [bloomFilter, setBloomFilter] = useState<IBloomFilter<string>>(new BloomFilter<string>(2, 1))

  
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
    setBloomFilter(newBloomFilter)
  }, [dictionary]);

  useEffect(() => {
    let known = bloomFilter.contains(testWord);
    console.log(known)
    console.log(testWord)
    setKnownWord(known);
  }, [testWord, bloomFilter])

  const onChangeTestWord = useCallback(
    (_, newValue?: string) => {
      setTestWord(newValue || '');
  }, []);

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
        {knownWord ?
          <Text> I know that word! ...I think?</Text> :
          <Text> Never heard of it. Should I learn it?</Text>
        }
      </Stack>
    </ThemeProvider>
  );
}
