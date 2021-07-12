import React, {useState} from 'react';
import { Stack, ThemeProvider, Toggle} from '@fluentui/react';
import './App.css';
import { darkTheme, lightTheme } from '../themes';
import { BloomViewContainer } from './BloomViewContainer';


export const App = () => {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);

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
        <BloomViewContainer />
        </Stack>
    </ThemeProvider>
  );
}
