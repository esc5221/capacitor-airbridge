// Mock the entire src/index module for extended API tests
const mockPlugin = {
  // Existing methods
  initialize: jest.fn().mockResolvedValue(undefined),
  trackEvent: jest.fn().mockResolvedValue(undefined),
  setOnDeeplinkReceived: jest.fn().mockResolvedValue(undefined),
  clearDeeplinkListener: jest.fn().mockResolvedValue(undefined),
  setUser: jest.fn().mockResolvedValue(undefined),
  setDeviceAlias: jest.fn().mockResolvedValue(undefined),

  // New user management methods
  clearUser: jest.fn().mockResolvedValue(undefined),
  setUserID: jest.fn().mockResolvedValue(undefined),
  setUserEmail: jest.fn().mockResolvedValue(undefined),
  setUserPhone: jest.fn().mockResolvedValue(undefined),
  setUserAlias: jest.fn().mockResolvedValue(undefined),
  setUserAttribute: jest.fn().mockResolvedValue(undefined),

  // New device management methods
  removeDeviceAlias: jest.fn().mockResolvedValue(undefined),
  clearDeviceAlias: jest.fn().mockResolvedValue(undefined),

  // New deep link methods
  handleDeeplink: jest.fn().mockResolvedValue(undefined),
  handleDeferredDeeplink: jest.fn().mockResolvedValue(undefined),
  trackDeeplink: jest.fn().mockResolvedValue(undefined),

  // SDK control methods
  stopTracking: jest.fn().mockResolvedValue(undefined),
  enableSDK: jest.fn().mockResolvedValue(undefined),
  disableSDK: jest.fn().mockResolvedValue(undefined),

  // Utility methods
  createTrackingLink: jest.fn().mockResolvedValue({ url: 'https://tracking-link.com' }),
  fetchAirbridgeGeneratedUUID: jest.fn().mockResolvedValue({ uuid: 'uuid-12345' }),

  // Event listeners
  addListener: jest.fn(),
  removeAllListeners: jest.fn(),
};

jest.mock('../src/index', () => ({
  Airbridge: mockPlugin,
  AirbridgeCategory: {
    INSTALL: 'airbridge.user.install',
    OPEN: 'airbridge.user.open',
    SIGNUP: 'airbridge.user.signup',
    SIGNIN: 'airbridge.user.signin',
    SIGNOUT: 'airbridge.user.signout',
    ORDER_COMPLETE: 'airbridge.ecommerce.order.complete',
    PRODUCT_VIEW: 'airbridge.ecommerce.product.view',
    ADD_TO_CART: 'airbridge.ecommerce.product.add_to_cart',
  },
  AirbridgeAttribute: {
    VALUE: 'value',
    CURRENCY: 'currency',
    TRANSACTION_ID: 'transactionID',
    PRODUCT_ID: 'productID',
    PRODUCT_NAME: 'productName',
    PRODUCT_PRICE: 'productPrice',
    PRODUCT_QUANTITY: 'productQuantity',
  }
}));

import { Airbridge, AirbridgeCategory, AirbridgeAttribute } from '../src';

describe('Extended Airbridge Plugin API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('User Management Methods', () => {
    it('should clear user data', async () => {
      await Airbridge.clearUser();

      expect(mockPlugin.clearUser).toHaveBeenCalledTimes(1);
      expect(mockPlugin.clearUser).toHaveBeenCalledWith();
    });

    it('should set user ID', async () => {
      const options = { id: 'user-12345' };

      await Airbridge.setUserID(options);

      expect(mockPlugin.setUserID).toHaveBeenCalledWith(options);
      expect(mockPlugin.setUserID).toHaveBeenCalledTimes(1);
    });

    it('should set user email', async () => {
      const options = { email: 'test@example.com' };

      await Airbridge.setUserEmail(options);

      expect(mockPlugin.setUserEmail).toHaveBeenCalledWith(options);
      expect(mockPlugin.setUserEmail).toHaveBeenCalledTimes(1);
    });

    it('should set user phone', async () => {
      const options = { phone: '+1234567890' };

      await Airbridge.setUserPhone(options);

      expect(mockPlugin.setUserPhone).toHaveBeenCalledWith(options);
      expect(mockPlugin.setUserPhone).toHaveBeenCalledTimes(1);
    });

    it('should set user alias', async () => {
      const options = {
        key: 'facebook_id',
        value: 'fb_user_123'
      };

      await Airbridge.setUserAlias(options);

      expect(mockPlugin.setUserAlias).toHaveBeenCalledWith(options);
      expect(mockPlugin.setUserAlias).toHaveBeenCalledTimes(1);
    });

    it('should set individual user attribute', async () => {
      const options = {
        key: 'subscription_tier',
        value: 'premium'
      };

      await Airbridge.setUserAttribute(options);

      expect(mockPlugin.setUserAttribute).toHaveBeenCalledWith(options);
      expect(mockPlugin.setUserAttribute).toHaveBeenCalledTimes(1);
    });

    it('should set user attribute with complex value', async () => {
      const options = {
        key: 'preferences',
        value: { notifications: true, theme: 'dark', language: 'en' }
      };

      await Airbridge.setUserAttribute(options);

      expect(mockPlugin.setUserAttribute).toHaveBeenCalledWith(options);
    });
  });

  describe('Device Management Methods', () => {
    it('should remove specific device alias', async () => {
      const options = { key: 'custom_device_id' };

      await Airbridge.removeDeviceAlias(options);

      expect(mockPlugin.removeDeviceAlias).toHaveBeenCalledWith(options);
      expect(mockPlugin.removeDeviceAlias).toHaveBeenCalledTimes(1);
    });

    it('should clear all device aliases', async () => {
      await Airbridge.clearDeviceAlias();

      expect(mockPlugin.clearDeviceAlias).toHaveBeenCalledTimes(1);
      expect(mockPlugin.clearDeviceAlias).toHaveBeenCalledWith();
    });
  });

  describe('Advanced Deep Link Methods', () => {
    it('should handle deep link manually', async () => {
      const options = { url: 'https://example.com/deep?param=value' };

      await Airbridge.handleDeeplink(options);

      expect(mockPlugin.handleDeeplink).toHaveBeenCalledWith(options);
      expect(mockPlugin.handleDeeplink).toHaveBeenCalledTimes(1);
    });

    it('should handle deferred deep link', async () => {
      const options = {
        callbackId: 'deferred-callback',
        timeoutMillis: 5000
      };

      await Airbridge.handleDeferredDeeplink(options);

      expect(mockPlugin.handleDeferredDeeplink).toHaveBeenCalledWith(options);
      expect(mockPlugin.handleDeferredDeeplink).toHaveBeenCalledTimes(1);
    });

    it('should handle deferred deep link without timeout', async () => {
      const options = { callbackId: 'deferred-callback-2' };

      await Airbridge.handleDeferredDeeplink(options);

      expect(mockPlugin.handleDeferredDeeplink).toHaveBeenCalledWith(options);
    });

    it('should track deep link', async () => {
      const options = {
        url: 'https://example.com/track',
        parameters: {
          campaign: 'summer-sale',
          medium: 'email'
        }
      };

      await Airbridge.trackDeeplink(options);

      expect(mockPlugin.trackDeeplink).toHaveBeenCalledWith(options);
      expect(mockPlugin.trackDeeplink).toHaveBeenCalledTimes(1);
    });

    it('should track deep link without parameters', async () => {
      const options = { url: 'https://example.com/simple' };

      await Airbridge.trackDeeplink(options);

      expect(mockPlugin.trackDeeplink).toHaveBeenCalledWith(options);
    });
  });

  describe('SDK Control Methods', () => {
    it('should stop tracking', async () => {
      await Airbridge.stopTracking();

      expect(mockPlugin.stopTracking).toHaveBeenCalledTimes(1);
      expect(mockPlugin.stopTracking).toHaveBeenCalledWith();
    });

    it('should enable SDK', async () => {
      await Airbridge.enableSDK();

      expect(mockPlugin.enableSDK).toHaveBeenCalledTimes(1);
      expect(mockPlugin.enableSDK).toHaveBeenCalledWith();
    });

    it('should disable SDK', async () => {
      await Airbridge.disableSDK();

      expect(mockPlugin.disableSDK).toHaveBeenCalledTimes(1);
      expect(mockPlugin.disableSDK).toHaveBeenCalledWith();
    });
  });

  describe('Tracking Link Creation', () => {
    it('should create tracking link with minimal options', async () => {
      const options = { channel: 'facebook' };

      const result = await Airbridge.createTrackingLink(options);

      expect(mockPlugin.createTrackingLink).toHaveBeenCalledWith(options);
      expect(mockPlugin.createTrackingLink).toHaveBeenCalledTimes(1);
      expect(result).toEqual({ url: 'https://tracking-link.com' });
    });

    it('should create tracking link with full options', async () => {
      const options = {
        channel: 'email',
        campaign: 'black-friday-2024',
        deeplink: 'myapp://product/123',
        fallback: 'https://mystore.com/product/123',
        parameters: {
          utm_source: 'newsletter',
          utm_medium: 'email',
          custom_param: 'value123'
        }
      };

      const result = await Airbridge.createTrackingLink(options);

      expect(mockPlugin.createTrackingLink).toHaveBeenCalledWith(options);
      expect(result).toEqual({ url: 'https://tracking-link.com' });
    });

    it('should handle tracking link creation failure', async () => {
      mockPlugin.createTrackingLink.mockRejectedValueOnce(new Error('Failed to create link'));

      const options = { channel: 'test' };

      await expect(Airbridge.createTrackingLink(options))
        .rejects.toThrow('Failed to create link');
    });
  });

  describe('Utility Methods', () => {
    it('should fetch Airbridge generated UUID', async () => {
      const result = await Airbridge.fetchAirbridgeGeneratedUUID();

      expect(mockPlugin.fetchAirbridgeGeneratedUUID).toHaveBeenCalledTimes(1);
      expect(mockPlugin.fetchAirbridgeGeneratedUUID).toHaveBeenCalledWith();
      expect(result).toEqual({ uuid: 'uuid-12345' });
    });

    it('should handle UUID fetch failure', async () => {
      mockPlugin.fetchAirbridgeGeneratedUUID.mockRejectedValueOnce(new Error('UUID not available'));

      await expect(Airbridge.fetchAirbridgeGeneratedUUID())
        .rejects.toThrow('UUID not available');
    });
  });
});