/** Wat de rondleiding zelf uitvoert op de echte tafel, zodat de gebruiker het ziet gebeuren. */
export type Actie =
  | { soort: 'klik'; doel: string }
  | { soort: 'dubbelklik'; doel: string }
  | { soort: 'typ'; doel: string; tekst: string }

export function zoek(doel: string): HTMLElement | null {
  const element = document.querySelector(doel)
  return element instanceof HTMLElement ? element : null
}

/** Geeft terug of het doel er stond; een verdwenen doel laat de rondleiding gewoon doorlopen. */
export function voerUit(actie: Actie): boolean {
  const element = zoek(actie.doel)
  if (!element) return false

  switch (actie.soort) {
    case 'klik':
      element.click()
      return true
    case 'dubbelklik':
      element.dispatchEvent(new MouseEvent('dblclick', { bubbles: true }))
      return true
    case 'typ':
      if (!(element instanceof HTMLInputElement)) return false
      element.value = actie.tekst
      // De velden lezen hun waarde pas bij het verlaten uit; typen alleen bewaart dus niets.
      element.blur()
      return true
  }
}
