import { Dropdown, IDropdownOption, PrimaryButton, Stack, Text, TextField } from "@fluentui/react";
import { FormEvent } from "react";
import { boldStyle, stackStyles, stackTokens } from "./CommonFluentStyles";
import { BloomFilterStats } from "./BloomFilterStats";


export interface IBloomViewProps {
    filterInitialized: boolean;
    percentLoaded: number;
    testWord: string;
    onChangeTestWord: (_: FormEvent<HTMLInputElement | HTMLTextAreaElement>, word: string | undefined) => void;
    dictionary: IDropdownOption<string[]>;
    onDictionarySelect: (_: FormEvent<HTMLDivElement>, option?: IDropdownOption<string[]> | undefined) => void;
    dictionaryOptions: IDropdownOption<string[]>[];
    isKnownWord: boolean;
    addWord: (word: string) => void;
    // Consider passing in child elements to render if bloom stats is not the only view
    filterState: Uint16Array;
    numHashes: number;
}

export const BloomView = (props : IBloomViewProps): JSX.Element => {
    return (
        <>
        <Stack horizontal tokens={{childrenGap: 15}}>
            <Dropdown
            label="Sample Dictionary"
            selectedKey={props.dictionary.key}
            onChange={props.onDictionarySelect}
            options={props.dictionaryOptions}
            />
        </Stack>
      <Stack horizontalAlign="center" verticalAlign="center" verticalFill styles={stackStyles} tokens={stackTokens}>
        <Text variant="xxLarge" styles={boldStyle}>
          Bloom Filter Explorer:  
        </Text>
        <Text variant="large">
          Ask me if I've seen a word before! No false negatives! Chance of false positive...
        </Text>
        { props.filterInitialized ? <>
          <TextField 
            label="Word to evaluate"
            value={props.testWord}
            onChange={props.onChangeTestWord}
          />
          {props.testWord && 
            <>
            {props.isKnownWord ?
              <Text> I know that word! ...I think?</Text> :
              <Stack>
                <Text> Never heard of it. Should I learn it?</Text>
                <PrimaryButton onClick={() => props.addWord(props.testWord)}>Yes!</PrimaryButton>
              </Stack>
            }
            </>
          }
          <BloomFilterStats filterState={props.filterState} numHashes={props.numHashes}/>
          </> :
          <Text>Loading... {(100 * props.percentLoaded).toFixed(0) + "%"}</Text>
        }
        </Stack>
    </>
    );
}