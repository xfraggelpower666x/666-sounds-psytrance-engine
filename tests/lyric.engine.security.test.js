const fs = require('fs');
const path = require('path');
const vm = require('vm');

describe('LyricKeyManager', () => {
  beforeEach(() => {
    const localStore = {};
    const sessionStore = {};
    const makeStorage = (store) => ({
      getItem: (key) => (Object.prototype.hasOwnProperty.call(store, key) ? store[key] : null),
      setItem: (key, value) => { store[key] = String(value); },
      removeItem: (key) => { delete store[key]; },
      clear: () => { Object.keys(store).forEach((key) => delete store[key]); }
    });

    global.window = global;
    global.document = { addEventListener: jest.fn() };
    global.localStorage = makeStorage(localStore);
    global.sessionStorage = makeStorage(sessionStore);
  });

  afterEach(() => {
    delete global.window;
    delete global.document;
    delete global.localStorage;
    delete global.sessionStorage;
    jest.resetModules();
  });

  test('stores the OpenAI key in session storage instead of persistent localStorage', () => {
    const scriptPath = path.join(__dirname, '..', 'lyric.engine.js');
    const source = fs.readFileSync(scriptPath, 'utf8');
    vm.runInNewContext(`${source}\n;globalThis.__keyManager = LyricKeyManager;`, global);

    const manager = global.__keyManager;
    expect(manager.get()).toBe('');
    manager.set('sk-test-key');

    expect(global.sessionStorage.getItem('666sounds_openai_key')).toBe('sk-test-key');
    expect(global.localStorage.getItem('666sounds_openai_key')).toBeNull();
  });
});
