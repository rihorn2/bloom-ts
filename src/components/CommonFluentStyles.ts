import { ITextStyles, FontWeights, IStackTokens, ITextFieldStyles, IStackStyles } from "@fluentui/react";

// basic fluent styles
export const boldStyle: Partial<ITextStyles> = { root: { fontWeight: FontWeights.semibold } };
export const stackTokens: IStackTokens = { childrenGap: 15 };
export const textFieldStyles: Partial<ITextFieldStyles> = { fieldGroup: { width: 300 } };
export const stackStyles: Partial<IStackStyles> = {
  root: {
    width: '960px',
    margin: '0 auto',
    textAlign: 'center',
    color: '#605e5c',
  },
};