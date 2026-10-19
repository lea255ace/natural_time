import { Box } from '@chakra-ui/react';
import { useAstrolabeContext } from 'context/astrolabeProvider';

import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    ChartData,
    ChartOptions,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
);

export const Title = 'Equation of Time';
export function Display() {

    const astrolabe = useAstrolabeContext();
    const eqTimeRange = Array.from({length: 365}, (x, i) => i);
    const eqTimeData = eqTimeRange.map((x, i) => {
        return astrolabe.eqTime(astrolabe.dateAt(i, 12 * 60));
    });

    const currentDayOfYear = astrolabe.dayOfYear();
    const currentEqTime = astrolabe.eqTime();

    const axisColor = '#222222';
    const gridColor = '#CCCCCC';
    const options: ChartOptions<'line'> = {
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false,
            },
        },
        animation: false,
        scales: {
            x: {
                grid: {
                    drawTicks: false,
                },
                ticks: {
                    display: false,
                    maxTicksLimit: 20,
                },
            },
            y: {
                grid: {
                    drawTicks: false,
                    color: [gridColor, gridColor, gridColor, gridColor, axisColor],
                },
                ticks: {
                    display: false,
                    maxTicksLimit: 10,
                },
                min: -20,
                max: 20,
            },
        },
    };
    const data: ChartData<'line'> = {
        labels: eqTimeRange,
        datasets: [
            {
                label: 'Dataset 1',
                data: eqTimeData,
                order: 2,
                pointRadius: 0,
                pointHitRadius: 0,
                tension: 0.25,
                borderColor: 'rgb(255, 99, 132)',
                backgroundColor: 'rgba(255, 99, 132, 0.5)',
            },
            {
                label: 'Dataset 2',
                data: [{x: currentDayOfYear, y: currentEqTime}],
                parsing: false,
                order: 1,
                pointRadius: 5,
                pointHitRadius: 0,
                borderColor: 'rgb(53, 162, 235)',
                backgroundColor: 'rgba(53, 162, 235, 0.5)',
            },
        ],
    };
    return (
        <Box width='200px' height='100%'>
            <Line options={options} data={data} />
        </Box>
    );
}