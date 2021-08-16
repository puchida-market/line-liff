import { KeyboardEvent } from 'react'

export function numericCheck(event: KeyboardEvent<HTMLInputElement>, space = false): false | void {
  if (space) {
    return !/^[\d\s]*$/.test(event.key) && event.preventDefault()
  }
  return !/\d/.test(event.key) && event.preventDefault()
}
