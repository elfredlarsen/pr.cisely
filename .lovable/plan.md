## Ændringer

### `src/components/indstillinger/ChangePasswordForm.tsx`
- Wrap "Gem adgangskode"-knappen i `<div className="flex justify-center">`, så den centreres i bunden af formularen.

### `src/components/indstillinger/DataManagementSection.tsx`
- Wrap "Slet al historik"-AlertDialog-triggeren i `<div className="flex justify-center">`, så knappen centreres på samme måde.

## Verifikation
- `/indstillinger`: begge knapper står centreret under deres respektive formularblok i `max-w-md`-containeren.