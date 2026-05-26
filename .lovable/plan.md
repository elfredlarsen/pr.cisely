Tre mindre justeringer af tooltips i Stopwatch-komponenten:

1. `sideOffset` i ShortcutTooltip: ændr fra `2` til `6` px for lidt mere luft mellem knap og tooltip.
2. `TooltipContent`: gør tooltip endnu mere diskret ved at justere opacity (f.eks. `bg-background/60` i stedet for `/80`), og reducere skygge/padding en anelse.
3. `delayDuration` i TooltipProvider: ændr fra `300` til `1500` ms så tooltips først vises efter 1,5 sekunders hover.