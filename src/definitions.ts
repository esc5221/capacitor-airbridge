export interface AirbridgePlugin {
  /**
   * Initialize the Airbridge SDK
   * @param options Configuration options for SDK initialization
   */
  initialize(options: AirbridgeInitializeOptions): Promise<void>;

  /**
   * Track a user event
   * @param options Event tracking options
   */
  trackEvent(options: AirbridgeTrackEventOptions): Promise<void>;
  /** Start tracking after opt-in */
  startTracking(): Promise<void>;

  /**
   * Set a listener for deep link reception
   * @param options Deep link listener options
   */
  setOnDeeplinkReceived(options: AirbridgeDeeplinkOptions): Promise<void>;

  /**
   * Clear the deep link listener
   */
  clearDeeplinkListener(): Promise<void>;

  /**
   * Set user information
   * @param options User information options
   */
  setUser(options: AirbridgeUserOptions): Promise<void>;

  /**
   * Clear all user data and reset user session
   */
  clearUser(): Promise<void>;

  /**
   * Set user ID
   * @param options User ID options
   */
  setUserID(options: AirbridgeUserIDOptions): Promise<void>;

  /**
   * Set user email
   * @param options User email options
   */
  setUserEmail(options: AirbridgeUserEmailOptions): Promise<void>;

  /**
   * Set user phone number
   * @param options User phone options
   */
  setUserPhone(options: AirbridgeUserPhoneOptions): Promise<void>;

  /**
   * Set user alias
   * @param options User alias options
   */
  setUserAlias(options: AirbridgeUserAliasOptions): Promise<void>;

  /**
   * Set individual user attribute
   * @param options User attribute options
   */
  setUserAttribute(options: AirbridgeUserAttributeOptions): Promise<void>;

  /**
   * Set device alias
   * @param options Device alias options
   */
  setDeviceAlias(options: AirbridgeDeviceAliasOptions): Promise<void>;

  /**
   * Remove specific device alias
   * @param options Device alias removal options
   */
  removeDeviceAlias(options: AirbridgeRemoveDeviceAliasOptions): Promise<void>;

  /**
   * Clear all device aliases
   */
  clearDeviceAlias(): Promise<void>;

  /**
   * Handle deep link manually
   * @param options Deep link handling options
   */
  handleDeeplink(options: AirbridgeHandleDeeplinkOptions): Promise<void>;

  /**
   * Handle deferred deep link
   * @param options Deferred deep link options
   */
  handleDeferredDeeplink(options: AirbridgeDeferredDeeplinkOptions): Promise<void>;

  /**
   * Track deep link
   * @param options Deep link tracking options
   */
  trackDeeplink(options: AirbridgeTrackDeeplinkOptions): Promise<void>;

  /**
   * Create tracking link
   * @param options Tracking link creation options
   */
  createTrackingLink(options: AirbridgeCreateTrackingLinkOptions): Promise<AirbridgeTrackingLinkResult>;

  /**
   * Stop all tracking activities
   */
  stopTracking(): Promise<void>;

  /**
   * Enable SDK functionality
   */
  enableSDK(): Promise<void>;

  /**
   * Disable SDK functionality
   */
  disableSDK(): Promise<void>;

  /**
   * Get SDK-generated UUID
   */
  fetchAirbridgeGeneratedUUID(): Promise<AirbridgeUUIDResult>;
}

export interface AirbridgeInitializeOptions {
  /**
   * App name from Airbridge dashboard
   */
  appName: string;
  /**
   * App SDK token from Airbridge dashboard
   */
  appToken: string;
  /**
   * Auto determine tracking authorization timeout (iOS only)
   */
  autoDetermineTrackingAuthorizationTimeoutInSecond?: number;
  /**
   * Handle only Airbridge deeplinks (default: false)
   */
  isHandleAirbridgeDeeplinkOnly?: boolean;
  /**
   * Android/iOS: Start tracking automatically (default true)
   */
  autoStartTrackingEnabled?: boolean;
  /**
   * Android: Track lifecycle events during session (default false)
   */
  trackInSessionLifecycleEventEnabled?: boolean;
  /**
   * Android: Session timeout seconds (default 300)
   */
  sessionTimeoutSecond?: number;
  /**
   * Android: Event transmit interval in milliseconds (default 0)
   */
  eventTransmitIntervalMs?: number;
  /**
   * Android/iOS: Custom domains for tracking links
   */
  trackingLinkCustomDomains?: string[];
  /**
   * Android: SDK log level (DEBUG|INFO|WARN|ERROR|FAULT)
   */
  logLevel?: 'DEBUG' | 'INFO' | 'WARN' | 'ERROR' | 'FAULT';
  /**
   * Android: Initialize with SDK disabled (default false)
   */
  sdkEnabled?: boolean;
}

export interface AirbridgeTrackEventOptions {
  /**
   * Event category (use AirbridgeCategory enum)
   */
  category: string;
  /**
   * Report-visible action (maps to semantic attribute 'action')
   */
  action?: string;
  /**
   * Report-visible label (maps to semantic attribute 'label')
   */
  label?: string;
  /**
   * Report-visible value (maps to semantic attribute 'value')
   */
  value?: number;
  /**
   * Semantic attributes for the event
   */
  semanticAttributes?: Record<string, any>;
  /**
   * Custom attributes for the event
   */
  customAttributes?: Record<string, any>;
}

export interface AirbridgeDeeplinkOptions {
  /**
   * Callback function name to be called when deeplink is received
   */
  callbackId: string;
}

export interface AirbridgeUserOptions {
  /**
   * User ID
   */
  id?: string;
  /**
   * User email
   */
  email?: string;
  /**
   * User phone
   */
  phone?: string;
  /**
   * Custom user attributes
   */
  attributes?: Record<string, any>;
}

export interface AirbridgeDeviceAliasOptions {
  /**
   * Device alias key
   */
  key: string;
  /**
   * Device alias value
   */
  value: string;
}

/**
 * Airbridge standard event categories
 */
export enum AirbridgeCategory {
  // Lifecycle
  INSTALL = 'airbridge.user.install',
  OPEN = 'airbridge.user.open',
  SIGNUP = 'airbridge.user.signup',
  SIGNIN = 'airbridge.user.signin',
  SIGNOUT = 'airbridge.user.signout',

  // Commerce
  HOME_VIEW = 'airbridge.ecommerce.home.view',
  PRODUCT_LIST_VIEW = 'airbridge.ecommerce.product.list.view',
  PRODUCT_VIEW = 'airbridge.ecommerce.product.view',
  PRODUCT_DETAILS_VIEW = 'airbridge.ecommerce.product.details.view',
  ADD_TO_CART = 'airbridge.ecommerce.product.add_to_cart',
  ORDER_START = 'airbridge.ecommerce.order.start',
  ORDER_COMPLETE = 'airbridge.ecommerce.order.complete',
  ORDER_CANCEL = 'airbridge.ecommerce.order.cancel',

  // Social
  SHARE = 'airbridge.social.share',
  INVITE = 'airbridge.social.invite',

  // Gaming
  LEVEL_COMPLETE = 'airbridge.game.level.complete',
  TUTORIAL_COMPLETE = 'airbridge.game.tutorial.complete',

  // Media
  SEARCH = 'airbridge.search',
  SUBSCRIBE = 'airbridge.subscribe',
  UNSUBSCRIBE = 'airbridge.unsubscribe',

  // App Specific
  ACHIEVE_LEVEL = 'airbridge.achieve_level',
  UNLOCK_ACHIEVEMENT = 'airbridge.unlock_achievement',

  // Custom
  CUSTOM = 'custom'
}

/**
 * Airbridge standard attributes
 */
export enum AirbridgeAttribute {
  // Transaction
  VALUE = 'value',
  CURRENCY = 'currency',
  TRANSACTION_ID = 'transactionID',

  // Product
  PRODUCTS = 'products',
  PRODUCT_ID = 'productID',
  PRODUCT_NAME = 'productName',
  PRODUCT_PRICE = 'productPrice',
  PRODUCT_QUANTITY = 'productQuantity',
  PRODUCT_CURRENCY = 'productCurrency',

  // Commerce
  CART_ID = 'cartID',
  TOTAL_QUANTITY = 'totalQuantity',
  TOTAL_PRICE = 'totalPrice',
  SHIPPING = 'shipping',
  TAX = 'tax',
  DISCOUNT = 'discount',

  // Purchase
  IN_APP_PURCHASED = 'inAppPurchased',
  PERIOD = 'period',
  CONTRIBUTING_FACTOR = 'contributingFactor',

  // Content
  CONTENT_ID = 'contentID',
  CONTENT_NAME = 'contentName',
  CONTENT_CATEGORY = 'contentCategory',

  // Search
  QUERY = 'query',

  // Game
  LEVEL = 'level',
  SCORE = 'score',
  ACHIEVEMENT_ID = 'achievementID',

  // Social
  SHARE_CHANNEL = 'shareChannel',

  // Subscription
  SUBSCRIPTION_ID = 'subscriptionID',
  IS_RENEWAL = 'isRenewal'
}

// New interfaces for extended functionality

export interface AirbridgeUserIDOptions {
  /**
   * User ID to set
   */
  id: string;
}

export interface AirbridgeUserEmailOptions {
  /**
   * User email to set
   */
  email: string;
}

export interface AirbridgeUserPhoneOptions {
  /**
   * User phone number to set
   */
  phone: string;
}

export interface AirbridgeUserAliasOptions {
  /**
   * Alias key
   */
  key: string;
  /**
   * Alias value
   */
  value: string;
}

export interface AirbridgeUserAttributeOptions {
  /**
   * Attribute key
   */
  key: string;
  /**
   * Attribute value
   */
  value: any;
}

export interface AirbridgeRemoveDeviceAliasOptions {
  /**
   * Device alias key to remove
   */
  key: string;
}

export interface AirbridgeHandleDeeplinkOptions {
  /**
   * Deep link URL to handle
   */
  url: string;
}

export interface AirbridgeDeferredDeeplinkOptions {
  /**
   * Callback ID for deferred deep link
   */
  callbackId: string;
  /**
   * Timeout in milliseconds (optional)
   */
  timeoutMillis?: number;
}

export interface AirbridgeTrackDeeplinkOptions {
  /**
   * Deep link URL to track
   */
  url: string;
  /**
   * Additional tracking parameters (optional)
   */
  parameters?: Record<string, any>;
}

export interface AirbridgeCreateTrackingLinkOptions {
  /**
   * Channel for the tracking link
   */
  channel: string;
  /**
   * Campaign name (optional)
   */
  campaign?: string;
  /**
   * Deep link URL (optional)
   */
  deeplink?: string;
  /**
   * Fallback URL (optional)
   */
  fallback?: string;
  /**
   * Additional parameters (optional)
   */
  parameters?: Record<string, any>;
}

export interface AirbridgeTrackingLinkResult {
  /**
   * Generated tracking link URL
   */
  url: string;
}

export interface AirbridgeUUIDResult {
  /**
   * SDK-generated UUID
   */
  uuid: string;
}

/**
 * Deep link result interface
 */
export interface AirbridgeDeeplinkResult {
  url: string;
}
