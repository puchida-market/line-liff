// https://mariusschulz.com/blog/declaring-global-variables-in-typescript
// https://www.typescriptlang.org/docs/handbook/declaration-merging.html#merging-interfaces

interface Window {
  Cypress: any
  firebase: any
  liff: any
}

declare module '*.gql' {
  import { DocumentNode } from 'graphql'
  const Schema: DocumentNode
  export = Schema
}
declare module '*.pdf' {
  const src: string
  export default src
}

declare module '*.png'
declare module '*.jpg'
declare module '*.json'
declare module '*.svg'
