declare module '@graphql-typed-document-node/core' {
  import type { DocumentNode } from 'graphql';

  export interface DocumentTypeDecoration<TResult, TVariables> {
    readonly __apiType?: (variables: TVariables) => TResult;
  }

  export interface TypedDocumentNode<
    TResult = unknown,
    TVariables = Record<string, unknown>,
  >
    extends DocumentNode, DocumentTypeDecoration<TResult, TVariables> {}

  export type ResultOf<T> =
    T extends DocumentTypeDecoration<infer TResult, Record<string, unknown>>
      ? TResult
      : never;
}
