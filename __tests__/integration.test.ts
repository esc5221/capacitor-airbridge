// Mock the entire src/index module for integration tests
const mockPlugin = {
  initialize: jest.fn().mockResolvedValue(undefined),
  trackEvent: jest.fn().mockResolvedValue(undefined),
  setUser: jest.fn().mockResolvedValue(undefined),
  setOnDeeplinkReceived: jest.fn().mockResolvedValue(undefined),
  clearDeeplinkListener: jest.fn().mockResolvedValue(undefined),
  setDeviceAlias: jest.fn().mockResolvedValue(undefined),
  addListener: jest.fn().mockReturnValue({ remove: jest.fn() }),
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
    PRODUCTS: 'products',
  }
}));

import { Airbridge, AirbridgeCategory, AirbridgeAttribute } from '../src';

describe('Airbridge Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Complete user journey', () => {
    it('should handle complete SDK initialization and usage flow', async () => {
      // 1. Initialize SDK
      await Airbridge.initialize({
        appName: 'integration-test-app',
        appToken: 'integration-token-123',
        isHandleAirbridgeDeeplinkOnly: true
      });

      // 2. Set user information
      await Airbridge.setUser({
        id: 'integration-user-456',
        email: 'integration@test.com',
        attributes: {
          plan: 'premium',
          source: 'organic'
        }
      });

      // 3. Track multiple events
      await Airbridge.trackEvent({
        category: AirbridgeCategory.SIGNUP,
        customAttributes: {
          referrer: 'google',
          campaign: 'integration-test'
        }
      });

      await Airbridge.trackEvent({
        category: AirbridgeCategory.ORDER_COMPLETE,
        semanticAttributes: {
          [AirbridgeAttribute.VALUE]: 299.99,
          [AirbridgeAttribute.CURRENCY]: 'USD',
          [AirbridgeAttribute.TRANSACTION_ID]: 'integration-order-789'
        }
      });

      // Verify all calls were made
      expect(mockPlugin.initialize).toHaveBeenCalledTimes(1);
      expect(mockPlugin.setUser).toHaveBeenCalledTimes(1);
      expect(mockPlugin.trackEvent).toHaveBeenCalledTimes(2);
    });

    it('should handle deeplink setup and event tracking sequence', async () => {
      // 1. Initialize
      await Airbridge.initialize({
        appName: 'deeplink-test',
        appToken: 'deeplink-token'
      });

      // 2. Setup deeplink listener
      await Airbridge.setOnDeeplinkReceived({
        callbackId: 'integration-deeplink-handler'
      });

      // 3. Track app open event
      await Airbridge.trackEvent({
        category: AirbridgeCategory.OPEN,
        customAttributes: {
          session_start: Date.now()
        }
      });

      expect(mockPlugin.initialize).toHaveBeenCalledWith({
        appName: 'deeplink-test',
        appToken: 'deeplink-token'
      });

      expect(mockPlugin.setOnDeeplinkReceived).toHaveBeenCalledWith({
        callbackId: 'integration-deeplink-handler'
      });

      expect(mockPlugin.trackEvent).toHaveBeenCalledWith({
        category: AirbridgeCategory.OPEN,
        customAttributes: {
          session_start: expect.any(Number)
        }
      });
    });

    it('should handle e-commerce tracking flow', async () => {
      // Initialize
      await Airbridge.initialize({
        appName: 'ecommerce-test',
        appToken: 'ecommerce-token'
      });

      // Set customer
      await Airbridge.setUser({
        id: 'customer-123',
        email: 'customer@shop.com',
        attributes: {
          customer_tier: 'gold',
          lifetime_value: 1250.50
        }
      });

      // Track product view
      await Airbridge.trackEvent({
        category: AirbridgeCategory.PRODUCT_VIEW,
        semanticAttributes: {
          [AirbridgeAttribute.PRODUCT_ID]: 'prod-456',
          [AirbridgeAttribute.PRODUCT_NAME]: 'Premium Widget',
          [AirbridgeAttribute.PRODUCT_PRICE]: 99.99
        }
      });

      // Track add to cart
      await Airbridge.trackEvent({
        category: AirbridgeCategory.ADD_TO_CART,
        semanticAttributes: {
          [AirbridgeAttribute.PRODUCT_ID]: 'prod-456',
          [AirbridgeAttribute.PRODUCT_QUANTITY]: 2,
          [AirbridgeAttribute.VALUE]: 199.98
        }
      });

      // Track order completion
      await Airbridge.trackEvent({
        category: AirbridgeCategory.ORDER_COMPLETE,
        semanticAttributes: {
          [AirbridgeAttribute.VALUE]: 219.98, // Including shipping
          [AirbridgeAttribute.CURRENCY]: 'USD',
          [AirbridgeAttribute.TRANSACTION_ID]: 'order-ecom-789',
          [AirbridgeAttribute.PRODUCTS]: [
            {
              [AirbridgeAttribute.PRODUCT_ID]: 'prod-456',
              [AirbridgeAttribute.PRODUCT_NAME]: 'Premium Widget',
              [AirbridgeAttribute.PRODUCT_PRICE]: 99.99,
              [AirbridgeAttribute.PRODUCT_QUANTITY]: 2
            }
          ]
        },
        customAttributes: {
          shipping_method: 'express',
          payment_method: 'credit_card'
        }
      });

      // Verify tracking sequence
      expect(mockPlugin.trackEvent).toHaveBeenCalledTimes(3);

      // Verify final order event
      const orderCall = mockPlugin.trackEvent.mock.calls[2][0];
      expect(orderCall.category).toBe(AirbridgeCategory.ORDER_COMPLETE);
      expect(orderCall.semanticAttributes[AirbridgeAttribute.VALUE]).toBe(219.98);
    });
  });

  describe('Error scenarios', () => {
    it('should handle plugin initialization failure', async () => {
      mockPlugin.initialize.mockRejectedValueOnce(new Error('SDK initialization failed'));

      await expect(Airbridge.initialize({
        appName: 'fail-test',
        appToken: 'fail-token'
      })).rejects.toThrow('SDK initialization failed');
    });

    it('should handle event tracking failure', async () => {
      mockPlugin.trackEvent.mockRejectedValueOnce(new Error('Event tracking failed'));

      await expect(Airbridge.trackEvent({
        category: AirbridgeCategory.SIGNIN
      })).rejects.toThrow('Event tracking failed');
    });
  });
});