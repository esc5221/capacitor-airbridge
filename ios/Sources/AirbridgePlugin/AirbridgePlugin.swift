import Foundation
import Capacitor
import Airbridge

@objc(AirbridgePlugin)
public class AirbridgePlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "AirbridgePlugin"
    public let jsName = "Airbridge"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "initialize", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "trackEvent", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "setOnDeeplinkReceived", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "clearDeeplinkListener", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "setUser", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "setDeviceAlias", returnType: CAPPluginReturnPromise),

        // Extended user management methods
        CAPPluginMethod(name: "clearUser", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "setUserID", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "setUserEmail", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "setUserPhone", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "setUserAlias", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "setUserAttribute", returnType: CAPPluginReturnPromise),

        // Extended device management methods
        CAPPluginMethod(name: "removeDeviceAlias", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "clearDeviceAlias", returnType: CAPPluginReturnPromise),

        // Advanced deep link methods
        CAPPluginMethod(name: "handleDeeplink", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "handleDeferredDeeplink", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "trackDeeplink", returnType: CAPPluginReturnPromise),

        // SDK control methods
        CAPPluginMethod(name: "stopTracking", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "enableSDK", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "disableSDK", returnType: CAPPluginReturnPromise),

        // Utility methods
        CAPPluginMethod(name: "createTrackingLink", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "fetchAirbridgeGeneratedUUID", returnType: CAPPluginReturnPromise)
    ]

    private var deeplinkCallbackId: String?

    @objc func initialize(_ call: CAPPluginCall) {
        guard let appName = call.getString("appName"),
              let appToken = call.getString("appToken") else {
            call.reject("App name and token are required")
            return
        }

        let option = AirBridgeOptionBuilder(name: appName, token: appToken)

        // Optional configuration
        if let timeout = call.getInt("autoDetermineTrackingAuthorizationTimeoutInSecond") {
            option.setAutoStartTrackingAuthorizationTimeoutSeconds(timeout)
        }

        if let handleAirbridgeOnly = call.getBool("isHandleAirbridgeDeeplinkOnly") {
            // Configure deeplink handling
            // Note: This might need adjustment based on actual iOS SDK API
        }

        AirBridge.getInstance().initializeSDK(option.build())
        call.resolve()
    }

    @objc func trackEvent(_ call: CAPPluginCall) {
        guard let category = call.getString("category") else {
            call.reject("Category is required")
            return
        }

        let event = AirBridgeEvent(category: category)

        // Add semantic attributes
        if let semanticAttributes = call.getObject("semanticAttributes") {
            for (key, value) in semanticAttributes {
                event.setSemanticAttribute(key, value: value)
            }
        }

        // Add custom attributes
        if let customAttributes = call.getObject("customAttributes") {
            for (key, value) in customAttributes {
                event.setCustomAttribute(key, value: value)
            }
        }

        AirBridge.getInstance().trackEvent(event)
        call.resolve()
    }

    @objc func setOnDeeplinkReceived(_ call: CAPPluginCall) {
        guard let callbackId = call.getString("callbackId") else {
            call.reject("Callback ID is required")
            return
        }

        self.deeplinkCallbackId = callbackId

        AirBridge.getInstance().setOnDeeplinkReceiveListener { [weak self] deeplink in
            guard let self = self,
                  let callbackId = self.deeplinkCallbackId else { return }

            self.notifyListeners(callbackId, data: [
                "url": deeplink.rawValue
            ])
        }

        call.resolve()
    }

    @objc func clearDeeplinkListener(_ call: CAPPluginCall) {
        self.deeplinkCallbackId = nil
        AirBridge.getInstance().setOnDeeplinkReceiveListener(nil)
        call.resolve()
    }

    @objc func setUser(_ call: CAPPluginCall) {
        let user = AirBridgeUser()

        if let userId = call.getString("id") {
            user.setID(userId)
        }

        if let email = call.getString("email") {
            user.setEmail(email)
        }

        if let phone = call.getString("phone") {
            user.setPhoneNumber(phone)
        }

        if let attributes = call.getObject("attributes") {
            for (key, value) in attributes {
                user.setAttribute(key, value: value)
            }
        }

        AirBridge.getInstance().setUser(user)
        call.resolve()
    }

    @objc func setDeviceAlias(_ call: CAPPluginCall) {
        guard let key = call.getString("key"),
              let value = call.getString("value") else {
            call.reject("Key and value are required")
            return
        }

        AirBridge.getInstance().setDeviceAlias(key, value: value)
        call.resolve()
    }

    // MARK: - Extended User Management Methods

    @objc func clearUser(_ call: CAPPluginCall) {
        AirBridge.getInstance().clearUser()
        call.resolve()
    }

    @objc func setUserID(_ call: CAPPluginCall) {
        guard let id = call.getString("id") else {
            call.reject("User ID is required")
            return
        }

        AirBridge.getInstance().setUserID(id)
        call.resolve()
    }

    @objc func setUserEmail(_ call: CAPPluginCall) {
        guard let email = call.getString("email") else {
            call.reject("Email is required")
            return
        }

        AirBridge.getInstance().setUserEmail(email)
        call.resolve()
    }

    @objc func setUserPhone(_ call: CAPPluginCall) {
        guard let phone = call.getString("phone") else {
            call.reject("Phone is required")
            return
        }

        AirBridge.getInstance().setUserPhone(phone)
        call.resolve()
    }

    @objc func setUserAlias(_ call: CAPPluginCall) {
        guard let key = call.getString("key"),
              let value = call.getString("value") else {
            call.reject("Key and value are required")
            return
        }

        AirBridge.getInstance().setUserAlias(key, value: value)
        call.resolve()
    }

    @objc func setUserAttribute(_ call: CAPPluginCall) {
        guard let key = call.getString("key") else {
            call.reject("Key is required")
            return
        }

        let value = call.getValue("value")
        AirBridge.getInstance().setUserAttribute(key, value: value)
        call.resolve()
    }

    // MARK: - Extended Device Management Methods

    @objc func removeDeviceAlias(_ call: CAPPluginCall) {
        guard let key = call.getString("key") else {
            call.reject("Key is required")
            return
        }

        AirBridge.getInstance().removeDeviceAlias(key)
        call.resolve()
    }

    @objc func clearDeviceAlias(_ call: CAPPluginCall) {
        AirBridge.getInstance().clearDeviceAlias()
        call.resolve()
    }

    // MARK: - Advanced Deep Link Methods

    @objc func handleDeeplink(_ call: CAPPluginCall) {
        guard let urlString = call.getString("url"),
              let url = URL(string: urlString) else {
            call.reject("Valid URL is required")
            return
        }

        AirBridge.getInstance().handleDeeplink(url)
        call.resolve()
    }

    @objc func handleDeferredDeeplink(_ call: CAPPluginCall) {
        guard let callbackId = call.getString("callbackId") else {
            call.reject("Callback ID is required")
            return
        }

        let timeoutMillis = call.getInt("timeoutMillis")

        AirBridge.getInstance().handleDeferredDeeplink { [weak self] deeplink in
            guard let self = self else { return }

            let result: [String: Any] = [
                "url": deeplink?.rawValue ?? "",
                "success": deeplink != nil
            ]

            self.notifyListeners(callbackId, data: result)
        }

        call.resolve()
    }

    @objc func trackDeeplink(_ call: CAPPluginCall) {
        guard let urlString = call.getString("url"),
              let url = URL(string: urlString) else {
            call.reject("Valid URL is required")
            return
        }

        // Track deeplink with optional parameters
        if let parameters = call.getObject("parameters") {
            // Create event with deeplink tracking
            let event = AirBridgeEvent(category: "deeplink_tracked")
            for (key, value) in parameters {
                event.setCustomAttribute(key, value: value)
            }
            event.setCustomAttribute("deeplink_url", value: urlString)
            AirBridge.getInstance().trackEvent(event)
        } else {
            let event = AirBridgeEvent(category: "deeplink_tracked")
            event.setCustomAttribute("deeplink_url", value: urlString)
            AirBridge.getInstance().trackEvent(event)
        }

        call.resolve()
    }

    // MARK: - SDK Control Methods

    @objc func stopTracking(_ call: CAPPluginCall) {
        AirBridge.getInstance().stopTracking()
        call.resolve()
    }

    @objc func enableSDK(_ call: CAPPluginCall) {
        AirBridge.getInstance().enableSDK()
        call.resolve()
    }

    @objc func disableSDK(_ call: CAPPluginCall) {
        AirBridge.getInstance().disableSDK()
        call.resolve()
    }

    // MARK: - Utility Methods

    @objc func createTrackingLink(_ call: CAPPluginCall) {
        guard let channel = call.getString("channel") else {
            call.reject("Channel is required")
            return
        }

        let campaign = call.getString("campaign")
        let deeplink = call.getString("deeplink")
        let fallback = call.getString("fallback")
        let parameters = call.getObject("parameters")

        // Create tracking link options
        let option = AirBridgeTrackingLinkOption()
        if let campaign = campaign {
            option.setCampaign(campaign)
        }
        if let deeplink = deeplink {
            option.setDeeplink(deeplink)
        }
        if let fallback = fallback {
            option.setFallback(fallback)
        }
        if let parameters = parameters {
            for (key, value) in parameters {
                option.setCustomAttribute(key, value: value)
            }
        }

        AirBridge.getInstance().createTrackingLink(channel, option: option) { url, error in
            if let error = error {
                call.reject("Failed to create tracking link: \(error.localizedDescription)")
            } else if let url = url {
                call.resolve(["url": url.absoluteString])
            } else {
                call.reject("Unknown error creating tracking link")
            }
        }
    }

    @objc func fetchAirbridgeGeneratedUUID(_ call: CAPPluginCall) {
        let uuid = AirBridge.getInstance().fetchAirbridgeGeneratedUUID()
        call.resolve(["uuid": uuid])
    }
}