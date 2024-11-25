export type PartialWithId<Data, Identifier = string> = Partial<Data> & {
  id: Identifier;
};
