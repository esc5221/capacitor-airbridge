import { AirbridgeWeb } from '../src/web';

describe('Extended AirbridgeWeb Implementation', () => {
  let plugin: AirbridgeWeb;
  let consoleSpy: jest.SpyInstance;

  beforeEach(() => {
    plugin = new AirbridgeWeb();
    consoleSpy = jest.spyOn(console, 'log').mockImplementation();
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  describe('Extended User Management', () => {
    it('should log clearUser call', async () => {
      await plugin.clearUser();

      expect(consoleSpy).toHaveBeenCalledWith('Airbridge Web: clearUser called');
    });

    it('should log setUserID call', async () => {
      const options = { id: 'user-123' };

      await plugin.setUserID(options);

      expect(consoleSpy).toHaveBeenCalledWith(
        'Airbridge Web: setUserID called with options:',
        options
      );
    });

    it('should log setUserEmail call', async () => {
      const options = { email: 'test@example.com' };

      await plugin.setUserEmail(options);

      expect(consoleSpy).toHaveBeenCalledWith(
        'Airbridge Web: setUserEmail called with options:',
        options
      );
    });

    it('should log setUserPhone call', async () => {
      const options = { phone: '+1234567890' };

      await plugin.setUserPhone(options);

      expect(consoleSpy).toHaveBeenCalledWith(
        'Airbridge Web: setUserPhone called with options:',
        options
      );
    });

    it('should log setUserAlias call', async () => {
      const options = { key: 'facebook_id', value: 'fb123' };

      await plugin.setUserAlias(options);

      expect(consoleSpy).toHaveBeenCalledWith(
        'Airbridge Web: setUserAlias called with options:',
        options
      );
    });

    it('should log setUserAttribute call', async () => {
      const options = { key: 'plan', value: 'premium' };

      await plugin.setUserAttribute(options);

      expect(consoleSpy).toHaveBeenCalledWith(
        'Airbridge Web: setUserAttribute called with options:',
        options
      );
    });
  });

  describe('Extended Device Management', () => {
    it('should log removeDeviceAlias call', async () => {
      const options = { key: 'custom_device' };

      await plugin.removeDeviceAlias(options);

      expect(consoleSpy).toHaveBeenCalledWith(
        'Airbridge Web: removeDeviceAlias called with options:',
        options
      );
    });

    it('should log clearDeviceAlias call', async () => {
      await plugin.clearDeviceAlias();

      expect(consoleSpy).toHaveBeenCalledWith('Airbridge Web: clearDeviceAlias called');
    });
  });

  describe('Advanced Deep Link Methods', () => {
    it('should log handleDeeplink call', async () => {
      const options = { url: 'https://example.com/deep' };

      await plugin.handleDeeplink(options);

      expect(consoleSpy).toHaveBeenCalledWith(
        'Airbridge Web: handleDeeplink called with options:',
        options
      );
    });

    it('should log handleDeferredDeeplink call', async () => {
      const options = { callbackId: 'deferred-cb', timeoutMillis: 3000 };

      await plugin.handleDeferredDeeplink(options);

      expect(consoleSpy).toHaveBeenCalledWith(
        'Airbridge Web: handleDeferredDeeplink called with options:',
        options
      );
    });

    it('should log trackDeeplink call', async () => {
      const options = {
        url: 'https://example.com/track',
        parameters: { source: 'email' }
      };

      await plugin.trackDeeplink(options);

      expect(consoleSpy).toHaveBeenCalledWith(
        'Airbridge Web: trackDeeplink called with options:',
        options
      );
    });
  });

  describe('SDK Control Methods', () => {
    it('should log stopTracking call', async () => {
      await plugin.stopTracking();

      expect(consoleSpy).toHaveBeenCalledWith('Airbridge Web: stopTracking called');
    });

    it('should log enableSDK call', async () => {
      await plugin.enableSDK();

      expect(consoleSpy).toHaveBeenCalledWith('Airbridge Web: enableSDK called');
    });

    it('should log disableSDK call', async () => {
      await plugin.disableSDK();

      expect(consoleSpy).toHaveBeenCalledWith('Airbridge Web: disableSDK called');
    });
  });

  describe('Utility Methods', () => {
    it('should create tracking link and return URL', async () => {
      const options = {
        channel: 'facebook',
        campaign: 'summer-2024',
        parameters: { utm_source: 'fb' }
      };

      const result = await plugin.createTrackingLink(options);

      expect(consoleSpy).toHaveBeenCalledWith(
        'Airbridge Web: createTrackingLink called with options:',
        options
      );
      expect(result.url).toBe('https://web-tracking-link.com/facebook');
    });

    it('should fetch UUID and return timestamp-based UUID', async () => {
      const result = await plugin.fetchAirbridgeGeneratedUUID();

      expect(consoleSpy).toHaveBeenCalledWith('Airbridge Web: fetchAirbridgeGeneratedUUID called');
      expect(result.uuid).toMatch(/^web-uuid-\d+$/);
      expect(typeof result.uuid).toBe('string');
    });

    it('should return different UUIDs on subsequent calls', async () => {
      const result1 = await plugin.fetchAirbridgeGeneratedUUID();

      // Small delay to ensure different timestamp
      await new Promise(resolve => setTimeout(resolve, 2));

      const result2 = await plugin.fetchAirbridgeGeneratedUUID();

      expect(result1.uuid).not.toBe(result2.uuid);
      expect(result1.uuid).toMatch(/^web-uuid-\d+$/);
      expect(result2.uuid).toMatch(/^web-uuid-\d+$/);
    });
  });
});