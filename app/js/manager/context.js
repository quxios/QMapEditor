import Manager from './'

export function set(args) {
  Manager.emit('SET_CONTEXT', args.items, args.top, args.left);
}

export function close() {
  Manager.emit('CLOSE_CONTEXT');
}
