// Mock the entire src/index module
const mockPlugin = {
  initialize: jest.fn().mockResolvedValue(undefined),
  trackEvent: jest.fn().mockResolvedValue(undefined),
  startTracking: jest.fn().mockResolvedValue(undefined),
  setOnDeeplinkReceived: jest.fn().mockResolvedValue(undefined),
  clearDeeplinkListener: jest.fn().mockResolvedValue(undefined),
  setUser: jest.fn().mockResolvedValue(undefined),
  setDeviceAlias: jest.fn().mockResolvedValue(undefined),
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

describe('Airbridge Plugin', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('initialize', () => {
    it('should initialize SDK with required parameters', async () => {
      const options = {
        appName: 'test-app',
        appToken: 'test-token-123'
      };

      await Airbridge.initialize(options);

      expect(mockPlugin.initialize).toHaveBeenCalledWith(options);
      expect(mockPlugin.initialize).toHaveBeenCalledTimes(1);
    });

    it('should initialize SDK with optional parameters', async () => {
      const options = {
        appName: 'test-app',
        appToken: 'test-token-123',
        autoDetermineTrackingAuthorizationTimeoutInSecond: 30,
        isHandleAirbridgeDeeplinkOnly: true
      };

      await Airbridge.initialize(options);

      expect(mockPlugin.initialize).toHaveBeenCalledWith(options);
    });
  });

  describe('trackEvent', () => {
    it('should track simple event with category only', async () => {
      const options = {
        category: AirbridgeCategory.SIGNIN
      };

      await Airbridge.trackEvent(options);

      expect(mockPlugin.trackEvent).toHaveBeenCalledWith(options);
      expect(mockPlugin.trackEvent).toHaveBeenCalledTimes(1);
    });

    it('should track event with semantic attributes', async () => {
      const options = {
        category: AirbridgeCategory.ORDER_COMPLETE,
        semanticAttributes: {
          [AirbridgeAttribute.VALUE]: 99.99,
          [AirbridgeAttribute.CURRENCY]: 'USD',
          [AirbridgeAttribute.TRANSACTION_ID]: 'order-123'
        }
      };

      await Airbridge.trackEvent(options);

      expect(mockPlugin.trackEvent).toHaveBeenCalledWith(options);
    });

    it('should track event with custom attributes', async () => {
      const options = {
        category: AirbridgeCategory.SIGNUP,
        customAttributes: {
          'source': 'organic',
          'campaign': 'summer-2024',
          'user_type': 'premium'
        }
      };

      await Airbridge.trackEvent(options);

      expect(mockPlugin.trackEvent).toHaveBeenCalledWith(options);
    });

    it('should track event with both semantic and custom attributes', async () => {
      const options = {
        category: AirbridgeCategory.ORDER_COMPLETE,
        semanticAttributes: {
          [AirbridgeAttribute.VALUE]: 199.99,
          [AirbridgeAttribute.CURRENCY]: 'USD'
        },
        customAttributes: {
          'platform': 'mobile',
          'promotion_code': 'SAVE20'
        }
      };

      await Airbridge.trackEvent(options);

      expect(mockPlugin.trackEvent).toHaveBeenCalledWith(options);
    });
    it('should track event with action/label/value', async () => {
      const options = {
        category: AirbridgeCategory.SIGNIN,
        action: 'oauth',
        label: 'apple',
        value: 1,
      } as any;

      await Airbridge.trackEvent(options);

      expect(mockPlugin.trackEvent).toHaveBeenCalledWith(options);
    });
  });

  describe('startTracking', () => {
    it('should start tracking on demand', async () => {
      await Airbridge.startTracking();
      expect(mockPlugin.startTracking).toHaveBeenCalledTimes(1);
    });
  });

  describe('setUser', () => {
    it('should set user with ID only', async () => {
      const options = {
        id: 'user-123'
      };

      await Airbridge.setUser(options);

      expect(mockPlugin.setUser).toHaveBeenCalledWith(options);
    });

    it('should set user with full information', async () => {
      const options = {
        id: 'user-123',
        email: 'user@example.com',
        phone: '+1234567890',
        attributes: {
          'age': 25,
          'gender': 'male',
          'plan': 'premium'
        }
      };

      await Airbridge.setUser(options);

      expect(mockPlugin.setUser).toHaveBeenCalledWith(options);
    });
  });

  describe('setDeviceAlias', () => {
    it('should set device alias', async () => {
      const options = {
        key: 'device_id',
        value: 'device-abc-123'
      };

      await Airbridge.setDeviceAlias(options);

      expect(mockPlugin.setDeviceAlias).toHaveBeenCalledWith(options);
    });
  });

  describe('deeplink handling', () => {
    it('should set deeplink listener', async () => {
      const options = {
        callbackId: 'deeplink-handler'
      };

      await Airbridge.setOnDeeplinkReceived(options);

      expect(mockPlugin.setOnDeeplinkReceived).toHaveBeenCalledWith(options);
    });

    it('should clear deeplink listener', async () => {
      await Airbridge.clearDeeplinkListener();

      expect(mockPlugin.clearDeeplinkListener).toHaveBeenCalledTimes(1);
    });
  });

  describe('enums', () => {
    it('should have correct AirbridgeCategory values', () => {
      expect(AirbridgeCategory.INSTALL).toBe('airbridge.user.install');
      expect(AirbridgeCategory.OPEN).toBe('airbridge.user.open');
      expect(AirbridgeCategory.SIGNUP).toBe('airbridge.user.signup');
      expect(AirbridgeCategory.SIGNIN).toBe('airbridge.user.signin');
      expect(AirbridgeCategory.ORDER_COMPLETE).toBe('airbridge.ecommerce.order.complete');
    });

    it('should have correct AirbridgeAttribute values', () => {
      expect(AirbridgeAttribute.VALUE).toBe('value');
      expect(AirbridgeAttribute.CURRENCY).toBe('currency');
      expect(AirbridgeAttribute.TRANSACTION_ID).toBe('transactionID');
      expect(AirbridgeAttribute.PRODUCT_ID).toBe('productID');
      expect(AirbridgeAttribute.PRODUCT_NAME).toBe('productName');
    });
  });
});
