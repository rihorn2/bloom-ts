import { Stack , Text } from "@fluentui/react";
import React, { useMemo }  from "react";
import { boldStyle, stackStyles, stackTokens } from "./CommonFluentStyles";


interface BloomFilterStatsProps {
    filterState: Uint16Array;
    numHashes: number
}

export const BloomFilterStats = ({filterState, numHashes}: BloomFilterStatsProps): JSX.Element => {
    const ratioZeros = useMemo(()=> {
        if (filterState.length === 0) {
            return NaN;
        }
        const zeros = filterState.reduce((prev, current) => { return current === 0 ? prev + 1 : prev; });
        return  zeros / filterState.length;
    }, [filterState])

    const falsePositiveRate = Number.isNaN(ratioZeros) ? NaN : Math.pow((1 - ratioZeros), numHashes);

    return (
        <Stack horizontalAlign="center" verticalAlign="center" verticalFill styles={stackStyles} tokens={stackTokens}>
            <Stack horizontal tokens={{childrenGap: 3}}>
                <Text styles={boldStyle}>Percent of filter still empty: </Text>
                <Text>{` ${(ratioZeros * 100).toFixed(2)}%`}</Text>
            </Stack>
            <Stack horizontal tokens={{childrenGap: 3}}>
                <Text styles={boldStyle}>Chance of false positive: </Text>
                <Text>{falsePositiveRate}</Text>
            </Stack>
        </Stack>
    );
}