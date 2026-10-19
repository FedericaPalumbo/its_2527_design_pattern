# vendor

SDK dei fornitori esterni, così come ce li consegnano. Questa cartella non si modifica: se un SDK non fa quello che serve, si scrive codice nostro attorno.

| Cartella | Fornitore | Cosa fa |
|---|---|---|
| `alpha-pay/` | AlphaPay | Pagamenti con carta, rimborsi, webhook firmati. Importi in centesimi |
| `beta-pay/` | BetaPayments | Pagamenti con token carta, storni, notifiche firmate. Importi come stringhe decimali |
| `gatekeeper/` | Gatekeeper | Varchi dell'Arena Nord. Callback a ogni lettura, codici di rifiuto numerici |
| `turnstile-pro/` | TurnstilePro | Tornelli a corsie numerate, contenuto letto in base64, API asincrona |
| `tiny-xml/` | open source | Parser XML minimale |
| `pdf-lite/` | open source | Generatore di PDF di una pagina con righe di testo |
| `promoter-feeds/` | promoter | File di esempio dei feed degli eventi dei promoter A, B e C |
