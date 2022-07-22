/** Generates an app-unique number */
export function getNextId(): number {
  return ID_GENERATOR.next().value;
}

const ID_GENERATOR = generateId();

function* generateId(): Generator<number, number, number> {
  let id = 0;
  while (true) {
    yield id++;
  }
}
