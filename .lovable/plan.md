I filen `src/components/stopwatch/MeasurementsTable.tsx` ændres kategori-kolonnens SelectTrigger-klasse fra:

```
text-xs text-muted-foreground/80
```

Til:

```
text-xs font-medium text-foreground
```

Dette gør kategori-teksten (f.eks. "Biometri") tykkere (`font-medium`) og fjerner den ekstra opacitetsreduktion (`/80`), så den står lige så tydeligt som starttid, sluttid og varighed.