// https://mariusschulz.com/blog/declaring-global-variables-in-typescript
// https://www.typescriptlang.org/docs/handbook/declaration-merging.html#merging-interfaces

interface Window {
  _laq: any
  Cypress: any
  nookies: any
}

declare module '*.gql' {
  import { DocumentNode } from 'graphql'
  const Schema: DocumentNode
  export = Schema
}
declare module '*.png' {
  const resource: string
  export = resource
}
declare module '*.svg' {
  const resource: string
  export = resource
}
declare module '*.css' {
  const resource: any
  export = resource
}
declare module '*.pcss' {
  const resource: string
  export = resource
}
declare module '*.json' {
  const resource: any
  export = resource
}
