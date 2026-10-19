import { useAstrolabeContext } from 'context/astrolabeProvider';
import {
    VStack,
    Switch,
    Slider,
    Grid,
    GridItem,
} from '@chakra-ui/react';

export const Title = 'DST';
export function Display() {
    const astrolabe = useAstrolabeContext();
    const dayOfYear = astrolabe.dayOfYear();
    const dstStart = astrolabe.daylightSavingsStartDate();
    const dstEnd = astrolabe.daylightSavingsEndDate();
    const dstStartDay = dstStart ? astrolabe.dayOfYear(dstStart) : 0;
    const dstEndDay = dstEnd ? astrolabe.dayOfYear(dstEnd) : 0;
    // In the Southern Hemisphere, DST spans the new year, so the range between the dates is standard time instead.
    const wrapsYear = dstStartDay > dstEndDay;
    const observesDst = dstStart !== null;

    return (
        <VStack width='150px' px='5px'>
            <Grid templateRows='1' templateColumns='1' width='100%'>
                <GridItem rowStart={1} colStart={1}>
                    <Slider.Root colorPalette='blue' size='sm' min={0} max={364} step={1}
                        value={wrapsYear ? [dstEndDay, dstStartDay] : [dstStartDay, dstEndDay]}>
                        <Slider.Control>
                            <Slider.Track bg={wrapsYear ? 'colorPalette.solid' : undefined}>
                                <Slider.Range bg={wrapsYear ? 'gray.200' : undefined}
                                    visibility={observesDst ? undefined : 'hidden'} />
                            </Slider.Track>
                            <Slider.Thumb index={0} opacity='0' pointerEvents='none' />
                            <Slider.Thumb index={1} opacity='0' pointerEvents='none' />
                        </Slider.Control>
                    </Slider.Root>
                </GridItem>
                <GridItem rowStart={1} colStart={1}>
                    <Slider.Root colorPalette='blue' size='sm' value={[0,dayOfYear]} min={0} max={364} step={1}>
                        <Slider.Control>
                            <Slider.Track visibility='hidden'>
                                <Slider.Range visibility='hidden' />
                            </Slider.Track>
                            <Slider.Thumb index={0} opacity='0' pointerEvents='none' />
                            <Slider.Thumb index={1} boxSize={2.5}/>
                        </Slider.Control>
                    </Slider.Root>
                </GridItem>
            </Grid>
            <Switch.Root colorPalette='blue' checked={astrolabe.isDaylightSavings()}>
                <Switch.HiddenInput />
                <Switch.Control>
                    <Switch.Thumb />
                </Switch.Control>
            </Switch.Root>
        </VStack>
    );
}
