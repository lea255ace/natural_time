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
    const dstStartDay = astrolabe.dayOfYear(astrolabe.daylightSavingsStartDate());
    const dstEndDay = astrolabe.dayOfYear(astrolabe.daylightSavingsEndDate());

    return (
        <VStack width='150px' px='5px'>
            <Grid templateRows='1' templateColumns='1' width='100%'>
                <GridItem rowStart={1} colStart={1}>
                    <Slider.Root colorPalette='blue' size='sm' value={[dstStartDay,dstEndDay]} min={0} max={364} step={1}>
                        <Slider.Control>
                            <Slider.Track>
                                <Slider.Range />
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
