import Moment from 'types/moment';
import { Box, Text, Highlight } from '@chakra-ui/react';
import * as Constant from 'types/constants';
import SolarClock from 'components/solar_clock';
import { useAstrolabeContext } from 'context/astrolabeProvider';

const DEGREES_PER_MINUTE = 360 / Constant.MINUTES_PER_DAY;

export default function Clock() {
    const astrolabe = useAstrolabeContext();
    const civilTimeMinutes = astrolabe.civilTimeMinutes();
    const civilTimeOffsetMinutes = astrolabe.civilTimeOffsetMinutes();
    const daylightMinutes = astrolabe.daylightMinutes();
    const solsticeDaylightMinutes = astrolabe.solsticeDaylightMinutes();

    const civilTimeHourAngleDeg = ((civilTimeMinutes + civilTimeOffsetMinutes) / Constant.MINUTES_PER_DAY - 0.5) * 360;
    const sunriseHourAngleDeg = (daylightMinutes / Constant.MINUTES_PER_DAY) * -180;
    const solsticeSunriseHourAngleDeg = (solsticeDaylightMinutes / Constant.MINUTES_PER_DAY) * -180;
    const civilTimeOffsetAngleDeg = civilTimeOffsetMinutes * DEGREES_PER_MINUTE;

    let trueSolarTime = civilTimeMinutes + civilTimeOffsetMinutes;
    if (trueSolarTime < 0) {
        trueSolarTime += Constant.MINUTES_PER_DAY;
    } else if (trueSolarTime >= Constant.MINUTES_PER_DAY) {
        trueSolarTime -= Constant.MINUTES_PER_DAY;
    }
    const moment = new Moment({ daylightMinutes: daylightMinutes, solarTimeMinutes: trueSolarTime });
    const stageHandAngleDeg = (1 - (moment.currentStageMinutesTotal() - moment.currentStageMinutesElapsed()) / 60) * 360;

    return (
        <Box width='100%' maxWidth='800px'>
            <SolarClock civilTimeOffsetAngleDeg={civilTimeOffsetAngleDeg} solsticeSunriseHourAngleDeg={solsticeSunriseHourAngleDeg} sunriseHourAngleDeg={sunriseHourAngleDeg} solarHourAngleDeg={civilTimeHourAngleDeg} stageHandAngleDeg={stageHandAngleDeg}/>
            <Text textAlign='center' fontSize='1.5em' marginTop='-9%'><Highlight query={moment.momentName()} styles={{ fontWeight: 'bold' }}>{'The current moment is ' + moment.momentName()}</Highlight></Text>
            <Text textAlign='center' fontSize='1.125em' marginTop='2'>The current civil time is: {String(Math.floor(civilTimeMinutes/60)).padStart(2, '0')}:{String(civilTimeMinutes%60).padStart(2, '0')}</Text>
        </Box>
    );
}