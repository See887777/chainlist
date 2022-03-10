import { useMemo } from 'react';
import { Paper } from '@material-ui/core';
import { getPercentChange, getPrevTvlFromChart, useChain } from '../../utils/utils';
import classes from './index.module.css';
import ParentSize from '@visx/responsive/lib/components/ParentSize';
import dynamic from 'next/dynamic';

const Chart = dynamic(() => import('./Chart'), { ssr: false });

export default function ChainTvl({ chain }) {
  const { data, isLoading, isError } = useChain(chain.name?.split(' ')[0]);

  const { tvl, volumeChange, chart } = useMemo(() => {
    let chart = [];
    let tvl = null;
    let volumeChange = null;

    if (!isLoading && !isError && data?.length > 0) {
      chart = data.map(({ date, totalLiquidityUSD }) => [date, Math.trunc(totalLiquidityUSD)]);

      tvl = getPrevTvlFromChart(chart, 0);
      const tvlPrevDay = getPrevTvlFromChart(chart, 1);
      const volumeChangeUSD = getPercentChange(tvl, tvlPrevDay);

      const percentChange = volumeChangeUSD?.toFixed(2);
      volumeChange = (percentChange > 0 ? '+' : '') + percentChange + '%';
    }

    return { tvl, volumeChange: volumeChangeUSD, chart };
  }, [data]);

  return (
    <Paper elevation={1} className={classes.disclosure}>
      <ParentSize>
        {({ width, height }) => (
          <Chart
            data={chart}
            base={tvl}
            baseChange={volumeChange}
            title={chain.name + ' TVL'}
            field="1"
            width={width}
            type="AREA"
            units="$"
            chainId={chain.chainId}
          />
        )}
      </ParentSize>
    </Paper>
  );
}