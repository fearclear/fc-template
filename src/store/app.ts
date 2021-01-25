import clone from 'clone'
const initialData = {}

export const data = clone(initialData)

export function cc() {
  console.log('cc')
}
