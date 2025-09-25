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
        CAPPluginMethod(name: "startTracking", returnType: CAPPluginReturnPromise),
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

        let option = AirbridgeOptionBuilder(name: appName, token: appToken)

        // Optional configuration
        if let timeout = call.getInt("autoDetermineTrackingAuthorizationTimeoutInSecond") {
            option.setAutoDetermineTrackingAuthorizationTimeout(second: timeout)
        }

        if let handleAirbridgeOnly = call.getBool("isHandleAirbridgeDeeplinkOnly") {
            option.setTrackAirbridgeDeeplinkOnlyEnabled(handleAirbridgeOnly)
        }

        // iOS: autoStartTrackingEnabled 지원
        if let autoStart = call.getBool("autoStartTrackingEnabled") {
            option.setAutoStartTrackingEnabled(autoStart)
        }

        // iOS: trackingLinkCustomDomains 지원
        if let domains = call.getArray("trackingLinkCustomDomains") as? [String], !domains.isEmpty {
            option.setTrackingLinkCustomDomains(domains)
        }

        // iOS: SDK Enabled (initialize in disabled state)
        if let enabled = call.getBool("sdkEnabled") {
            option.setSDKEnabled(enabled)
        }

        // iOS: In-session lifecycle events
        if let trackInSession = call.getBool("trackInSessionLifecycleEventEnabled") {
            option.setTrackInSessionLifecycleEventEnabled(trackInSession)
        }

        // iOS: Log level mapping
        if let logLevel = call.getString("logLevel")?.uppercased() {
            switch logLevel {
            case "DEBUG": option.setLogLevel(.debug)
            case "INFO": option.setLogLevel(.info)
            case "WARN", "WARNING": option.setLogLevel(.warning)
            case "ERROR": option.setLogLevel(.error)
            case "FAULT", "ASSERT": option.setLogLevel(.fault)
            default: break
            }
        }

        Airbridge.initializeSDK(option: option.build())
        call.resolve()
    }

    @objc func startTracking(_ call: CAPPluginCall) {
        Airbridge.startTracking()
        call.resolve()
    }

    @objc func trackEvent(_ call: CAPPluginCall) {
        guard let category = call.getString("category") else {
            call.reject("Category is required")
            return
        }

        // Get semantic attributes and merge top-level action/label/value into it
        var semantic: [String: Any] = call.getObject("semanticAttributes") ?? [:]
        if let action = call.getString("action") { semantic["action"] = action }
        if let label = call.getString("label") { semantic["label"] = label }
        if call.hasOption("value"), let value = call.getNumber("value") { semantic["value"] = value }

        // Get custom attributes
        let customAttributes = call.getObject("customAttributes")

        // Call trackEvent with merged semantic attributes
        if let customAttributes = customAttributes {
            Airbridge.trackEvent(
                category: category,
                semanticAttributes: semantic.isEmpty ? nil : semantic,
                customAttributes: customAttributes
            )
        } else if !semantic.isEmpty {
            Airbridge.trackEvent(
                category: category,
                semanticAttributes: semantic
            )
        } else {
            Airbridge.trackEvent(category: category)
        }
        call.resolve()
    }

    @objc func setOnDeeplinkReceived(_ call: CAPPluginCall) {
        guard let callbackId = call.getString("callbackId") else {
            call.reject("Callback ID is required")
            return
        }

        self.deeplinkCallbackId = callbackId

        Airbridge.setOnDeeplinkReceiveListener { [weak self] url in
            guard let self = self,
                  let callbackId = self.deeplinkCallbackId else { return }

            self.notifyListeners(callbackId, data: [
                "url": url?.absoluteString ?? ""
            ])
        }

        call.resolve()
    }

    @objc func clearDeeplinkListener(_ call: CAPPluginCall) {
        self.deeplinkCallbackId = nil
        Airbridge.setOnDeeplinkReceiveListener(nil)
        call.resolve()
    }

    @objc func setUser(_ call: CAPPluginCall) {
        if let userId = call.getString("id") {
            Airbridge.setUserID(userId)
        }

        if let email = call.getString("email") {
            Airbridge.setUserEmail(email)
        }

        if let phone = call.getString("phone") {
            Airbridge.setUserPhone(phone)
        }

        if let attributes = call.getObject("attributes") {
            for (key, value) in attributes {
                Airbridge.setUserAttribute(key, value: value)
            }
        }

        call.resolve()
    }

    @objc func setDeviceAlias(_ call: CAPPluginCall) {
        guard let key = call.getString("key"),
              let value = call.getString("value") else {
            call.reject("Key and value are required")
            return
        }

        Airbridge.setDeviceAlias(key, value: value)
        call.resolve()
    }

    // MARK: - Extended User Management Methods

    @objc func clearUser(_ call: CAPPluginCall) {
        Airbridge.clearUser()
        call.resolve()
    }

    @objc func setUserID(_ call: CAPPluginCall) {
        guard let id = call.getString("id") else {
            call.reject("User ID is required")
            return
        }

        Airbridge.setUserID(id)
        call.resolve()
    }

    @objc func setUserEmail(_ call: CAPPluginCall) {
        guard let email = call.getString("email") else {
            call.reject("Email is required")
            return
        }

        Airbridge.setUserEmail(email)
        call.resolve()
    }

    @objc func setUserPhone(_ call: CAPPluginCall) {
        guard let phone = call.getString("phone") else {
            call.reject("Phone is required")
            return
        }

        Airbridge.setUserPhone(phone)
        call.resolve()
    }

    @objc func setUserAlias(_ call: CAPPluginCall) {
        guard let key = call.getString("key"),
              let value = call.getString("value") else {
            call.reject("Key and value are required")
            return
        }

        Airbridge.setUserAlias(key, value: value)
        call.resolve()
    }

    @objc func setUserAttribute(_ call: CAPPluginCall) {
        guard let key = call.getString("key") else {
            call.reject("Key is required")
            return
        }

        let value = call.getValue("value")
        Airbridge.setUserAttribute(key, value: value)
        call.resolve()
    }

    // MARK: - Extended Device Management Methods

    @objc func removeDeviceAlias(_ call: CAPPluginCall) {
        guard let key = call.getString("key") else {
            call.reject("Key is required")
            return
        }

        Airbridge.removeDeviceAlias(key)
        call.resolve()
    }

    @objc func clearDeviceAlias(_ call: CAPPluginCall) {
        Airbridge.clearDeviceAlias()
        call.resolve()
    }

    // MARK: - Advanced Deep Link Methods

    @objc func handleDeeplink(_ call: CAPPluginCall) {
        guard let urlString = call.getString("url"),
              let url = URL(string: urlString) else {
            call.reject("Valid URL is required")
            return
        }

        let _ = Airbridge.handleDeeplink(url: url) { [weak self] resultUrl in
            // Notify deeplink callback if registered
            self?.deeplinkCallbackId.flatMap { callbackId in
                self?.notifyListeners(callbackId, data: [
                    "url": resultUrl?.absoluteString ?? url.absoluteString
                ])
            }
        }
        call.resolve()
    }

    @objc func handleDeferredDeeplink(_ call: CAPPluginCall) {
        guard let callbackId = call.getString("callbackId") else {
            call.reject("Callback ID is required")
            return
        }

        let timeoutMillis = call.getInt("timeoutMillis")

        let _ = Airbridge.handleDeferredDeeplink { [weak self] url in
            guard let self = self else { return }

            let result: [String: Any] = [
                "url": url?.absoluteString ?? "",
                "success": url != nil
            ]

            self.notifyListeners(callbackId, data: result)

            // Also update registered deeplink callback if exists
            if let url = url {
                self.deeplinkCallbackId.flatMap { id in
                    self.notifyListeners(id, data: [
                        "url": url.absoluteString
                    ])
                }
            }
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
        var customAttributes: [String: Any] = ["deeplink_url": urlString]

        if let parameters = call.getObject("parameters") {
            for (key, value) in parameters {
                customAttributes[key] = value
            }
        }

        Airbridge.trackEvent(
            category: "deeplink_tracked",
            semanticAttributes: nil,
            customAttributes: customAttributes
        )

        call.resolve()
    }

    // MARK: - SDK Control Methods

    @objc func stopTracking(_ call: CAPPluginCall) {
        Airbridge.stopTracking()
        call.resolve()
    }

    @objc func enableSDK(_ call: CAPPluginCall) {
        Airbridge.enableSDK()
        call.resolve()
    }

    @objc func disableSDK(_ call: CAPPluginCall) {
        Airbridge.disableSDK()
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

        // Create tracking link options map
        var option: [String: Any] = [:]
        if let campaign = campaign {
            option["campaign"] = campaign
        }
        if let deeplink = deeplink {
            option["deeplink"] = deeplink
        }
        if let fallback = fallback {
            option["fallback"] = fallback
        }
        if let parameters = parameters {
            for (key, value) in parameters {
                option[key] = value
            }
        }

        Airbridge.createTrackingLink(
            channel: channel,
            option: option,
            onSuccess: { trackingLink in
                call.resolve(["url": trackingLink.shortURL.absoluteString])
            },
            onFailure: { error in
                call.reject("Failed to create tracking link: \(error?.localizedDescription ?? "Unknown error")")
            }
        )
    }

    @objc func fetchAirbridgeGeneratedUUID(_ call: CAPPluginCall) {
        let uuid = Airbridge.fetchAirbridgeGeneratedUUID()
        call.resolve(["uuid": uuid])
    }
}
