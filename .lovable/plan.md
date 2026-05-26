## Neutral bekræftelsestoast + luk-kryds i højre side

### Baggrund
Bekræftelsestoasten ("Registrering gemt") blev grøn pga. sonners standard `success`-stil. Luk-krydset skal placeres i højre side af meddelelsen.

### Ændringer

**1. `src/components/ui/sonner.tsx`**
Tilføj `success` i `toastOptions.classNames` som overskriver sonners grønne success-stil med neutrale farver (`bg-background`, `text-foreground`, `border-border`), så bekræftelsestoasten ser ud som en almindelig toast.

**2. `src/styles.css`**
Tilføj en global CSS-regel der overskriver sonners interne placering af luk-knappen:
```css
[data-sonner-toast] [data-close-button] {
  right: 8px !important;
  left: auto !important;
}
```

### Verifikation
- Kald `toast.success("Registrering gemt")` → toast vises uden grøn accent/ikon.
- Luk-krydset (X) sidder i højre side af toasten.