UI/UX-guideline — pr:cisely

Generelt
	- Tekst, knapper og meddelelser er på dansk.
	- Klikbare elementer har mindst 8px luft mellem sig, så fejlklik undgås (Fitts' lov).
	- Klikbare elementer er minimum 44×44px (Fitts' lov).
	- Alle slet-handlinger bekræftes i en dialogboks med tydelige knapper: "Annuller" og "Slet".
	- Kontrastforhold mindst 4.5:1 mellem tekst og baggrund (WCAG 2.1 AA).
	- Fokus-tilstand er synlig for tastaturnavigation (focus-visible ring).
	- Klikbare elementer ændrer sig visuelt ved hover.
	- Afrundede hjørner på inputfelter og knapper.

Farver

Signaturgradient (ton-i-ton lilla) — kun til dekoration (logo, kolon, favicon).
Må ikke bruges på almindelige knapper eller baggrunde:
	- Indigo:  #6366f1
	- Lilla:   #9333ea (samme som primær accent)
	- Fuchsia: #d946ef
Små accenter (aktiv menulinje, rullebjælke) bruger primærfarven.

Flade (UI):
	- Primær accent (knapper, fokus, aktiv): #9333ea + hvid tekst   — 5,4:1
	- Baggrund:                    #fafafa
	- Overflader (kort/dialoger):  #ffffff
	- Tekst primær:                #1a1a1a
	- Tekst sekundær:              #666666 (på #fafafa)             — 5,5:1
	- Kant/input:                  #e6e6ea

Statusfarver — mørknet så hvid tekst når WCAG AA. Gul kan ikke nå 4,5:1
med hvid tekst og bruger derfor mørk tekst:
	- Bekræftelse (success): #15803d + hvid tekst              — 5,0:1
	- Fejl (destructive):    #c0344d + hvid tekst              — 5,5:1
	- Advarsel (warning):    #ffd23a + mørk tekst (#1a1a1a)    — 11,8:1
	- Info:                  #0e7490 + hvid tekst              — 5,4:1

Typografi
	- Font: Poppins (samme som logoet)
	- Overskrifter: 600 (semibold)
	- Brødtekst: 400 (regular)
	- Tal i timeren: 500 (medium), monospaced (fast-bredde)

Stopur-knapper (hvid tekst og ikon):
	- Start/Pause/Fortsæt (hovedknap): #9333ea (lilla)
	- Afslut: #0f766e (petrolgrøn, flueben-ikon)
	- Nulstil: #64748b (blågrå)

Mørk tilstand (Lyst / Mørkt / Følg systemet i Indstillinger):
	- Baggrund:            #0f0f12
	- Overflader:          #18181c
	- Tekst primær:        #ededf0
	- Tekst sekundær:      #a1a1aa (på #0f0f12)   — 7,8:1
	- Kant:                #2e2e35
	- Primær accent:       #a855f7 + hvid tekst
	- Stopur-knapperne beholder samme farver som i lyst tema.
