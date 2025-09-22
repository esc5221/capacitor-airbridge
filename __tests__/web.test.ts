import { AirbridgeWeb } from '../src/web';
import { AirbridgeCategory, AirbridgeAttribute } from '../src/definitions';

describe('AirbridgeWeb', () => {
  let plugin: AirbridgeWeb;
  let consoleSpy: jest.SpyInstance;

  beforeEach(() => {
    plugin = new AirbridgeWeb();
    consoleSpy = jest.spyOn(console, 'log').mockImplementation();
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  describe('initialize', () => {
    it('should log initialization with options', async () => {
      const options = {
        appName: 'test-app',
        appToken: 'test-token'
      };

      await plugin.initialize(options);

      expect(consoleSpy).toHaveBeenCalledWith(
        'Airbridge Web: initialize called with options:',
        options
      );
    });
  });

  describe('trackEvent', () => {
    it('should log event tracking', async () => {
      const options = {
        category: AirbridgeCategory.SIGNIN,
        customAttributes: { source: 'web' }
      };

      await plugin.trackEvent(options);

      expect(consoleSpy).toHaveBeenCalledWith(
        'Airbridge Web: trackEvent called with options:',
        options
      );
    });
  });

  describe('setUser', () => {
    it('should log user setting', async () => {
      const options = {
        id: 'user-123',
        email: 'test@example.com'
      };

      await plugin.setUser(options);

      expect(consoleSpy).toHaveBeenCalledWith(
        'Airbridge Web: setUser called with options:',
        options
      );
    });
  });

  describe('deeplink methods', () => {
    it('should log deeplink listener setup', async () => {
      const options = { callbackId: 'test-callback' };

      await plugin.setOnDeeplinkReceived(options);

      expect(consoleSpy).toHaveBeenCalledWith(
        'Airbridge Web: setOnDeeplinkReceived called with options:',
        options
      );
    });

    it('should log deeplink listener clearing', async () => {
      await plugin.clearDeeplinkListener();

      expect(consoleSpy).toHaveBeenCalledWith(
        'Airbridge Web: clearDeeplinkListener called'
      );
    });
  });

  describe('setDeviceAlias', () => {
    it('should log device alias setting', async () => {
      const options = {
        key: 'custom_id',
        value: 'custom-value-123'
      };

      await plugin.setDeviceAlias(options);

      expect(consoleSpy).toHaveBeenCalledWith(
        'Airbridge Web: setDeviceAlias called with options:',
        options
      );
    });
  });
});