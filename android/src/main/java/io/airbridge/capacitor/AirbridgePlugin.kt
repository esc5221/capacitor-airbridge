package io.airbridge.capacitor

import co.ab180.airbridge.Airbridge
import co.ab180.airbridge.AirbridgeConfig
import co.ab180.airbridge.AirbridgeDeeplink
import co.ab180.airbridge.event.AirbridgeEvent
import co.ab180.airbridge.event.model.AirbridgeUser
import com.getcapacitor.JSObject
import com.getcapacitor.Plugin
import com.getcapacitor.PluginCall
import com.getcapacitor.PluginMethod
import com.getcapacitor.annotation.CapacitorPlugin
import org.json.JSONObject

@CapacitorPlugin(name = "Airbridge")
class AirbridgePlugin : Plugin() {

    private var deeplinkCallbackId: String? = null

    @PluginMethod
    fun initialize(call: PluginCall) {
        val appName = call.getString("appName")
        val appToken = call.getString("appToken")

        if (appName.isNullOrEmpty() || appToken.isNullOrEmpty()) {
            call.reject("App name and token are required")
            return
        }

        val config = AirbridgeConfig.Builder(appName, appToken)

        // Optional configuration
        val timeout = call.getInt("autoDetermineTrackingAuthorizationTimeoutInSecond")
        timeout?.let {
            // Note: This configuration might be iOS specific
            // Android implementation may differ
        }

        val handleAirbridgeOnly = call.getBoolean("isHandleAirbridgeDeeplinkOnly", false)
        config.setOnlyAirbridgeAttribution(handleAirbridgeOnly!!)

        Airbridge.initializeSDK(activity.application, config.build())
        call.resolve()
    }

    @PluginMethod
    fun trackEvent(call: PluginCall) {
        val category = call.getString("category")
        if (category.isNullOrEmpty()) {
            call.reject("Category is required")
            return
        }

        val event = AirbridgeEvent.Builder(category)

        // Add semantic attributes
        val semanticAttributes = call.getObject("semanticAttributes")
        semanticAttributes?.let { attrs ->
            val keys = attrs.keys()
            while (keys.hasNext()) {
                val key = keys.next()
                val value = attrs.get(key)
                event.setSemanticAttribute(key, value)
            }
        }

        // Add custom attributes
        val customAttributes = call.getObject("customAttributes")
        customAttributes?.let { attrs ->
            val keys = attrs.keys()
            while (keys.hasNext()) {
                val key = keys.next()
                val value = attrs.get(key)
                event.setCustomAttribute(key, value)
            }
        }

        Airbridge.trackEvent(event.build())
        call.resolve()
    }

    @PluginMethod
    fun setOnDeeplinkReceived(call: PluginCall) {
        val callbackId = call.getString("callbackId")
        if (callbackId.isNullOrEmpty()) {
            call.reject("Callback ID is required")
            return
        }

        this.deeplinkCallbackId = callbackId

        Airbridge.setOnDeeplinkReceiveListener { deeplink ->
            deeplinkCallbackId?.let { id ->
                val result = JSObject()
                result.put("url", deeplink.rawValue)
                notifyListeners(id, result)
            }
        }

        call.resolve()
    }

    @PluginMethod
    fun clearDeeplinkListener(call: PluginCall) {
        this.deeplinkCallbackId = null
        Airbridge.setOnDeeplinkReceiveListener(null)
        call.resolve()
    }

    @PluginMethod
    fun setUser(call: PluginCall) {
        val user = AirbridgeUser.Builder()

        val userId = call.getString("id")
        userId?.let { user.setID(it) }

        val email = call.getString("email")
        email?.let { user.setEmail(it) }

        val phone = call.getString("phone")
        phone?.let { user.setPhoneNumber(it) }

        val attributes = call.getObject("attributes")
        attributes?.let { attrs ->
            val keys = attrs.keys()
            while (keys.hasNext()) {
                val key = keys.next()
                val value = attrs.get(key)
                user.setAttribute(key, value)
            }
        }

        Airbridge.setUser(user.build())
        call.resolve()
    }

    @PluginMethod
    fun setDeviceAlias(call: PluginCall) {
        val key = call.getString("key")
        val value = call.getString("value")

        if (key.isNullOrEmpty() || value.isNullOrEmpty()) {
            call.reject("Key and value are required")
            return
        }

        Airbridge.setDeviceAlias(key, value)
        call.resolve()
    }

    // MARK: - Extended User Management Methods

    @PluginMethod
    fun clearUser(call: PluginCall) {
        Airbridge.clearUser()
        call.resolve()
    }

    @PluginMethod
    fun setUserID(call: PluginCall) {
        val id = call.getString("id")
        if (id.isNullOrEmpty()) {
            call.reject("User ID is required")
            return
        }

        Airbridge.setUserID(id)
        call.resolve()
    }

    @PluginMethod
    fun setUserEmail(call: PluginCall) {
        val email = call.getString("email")
        if (email.isNullOrEmpty()) {
            call.reject("Email is required")
            return
        }

        Airbridge.setUserEmail(email)
        call.resolve()
    }

    @PluginMethod
    fun setUserPhone(call: PluginCall) {
        val phone = call.getString("phone")
        if (phone.isNullOrEmpty()) {
            call.reject("Phone is required")
            return
        }

        Airbridge.setUserPhone(phone)
        call.resolve()
    }

    @PluginMethod
    fun setUserAlias(call: PluginCall) {
        val key = call.getString("key")
        val value = call.getString("value")

        if (key.isNullOrEmpty() || value.isNullOrEmpty()) {
            call.reject("Key and value are required")
            return
        }

        Airbridge.setUserAlias(key, value)
        call.resolve()
    }

    @PluginMethod
    fun setUserAttribute(call: PluginCall) {
        val key = call.getString("key")
        if (key.isNullOrEmpty()) {
            call.reject("Key is required")
            return
        }

        val value = call.getData().opt(key)
        Airbridge.setUserAttribute(key, value)
        call.resolve()
    }

    // MARK: - Extended Device Management Methods

    @PluginMethod
    fun removeDeviceAlias(call: PluginCall) {
        val key = call.getString("key")
        if (key.isNullOrEmpty()) {
            call.reject("Key is required")
            return
        }

        Airbridge.removeDeviceAlias(key)
        call.resolve()
    }

    @PluginMethod
    fun clearDeviceAlias(call: PluginCall) {
        Airbridge.clearDeviceAlias()
        call.resolve()
    }

    // MARK: - Advanced Deep Link Methods

    @PluginMethod
    fun handleDeeplink(call: PluginCall) {
        val urlString = call.getString("url")
        if (urlString.isNullOrEmpty()) {
            call.reject("URL is required")
            return
        }

        try {
            val uri = android.net.Uri.parse(urlString)
            val intent = android.content.Intent(android.content.Intent.ACTION_VIEW, uri)
            Airbridge.handleDeeplink(intent)
            call.resolve()
        } catch (e: Exception) {
            call.reject("Invalid URL: ${e.message}")
        }
    }

    @PluginMethod
    fun handleDeferredDeeplink(call: PluginCall) {
        val callbackId = call.getString("callbackId")
        if (callbackId.isNullOrEmpty()) {
            call.reject("Callback ID is required")
            return
        }

        val timeoutMillis = call.getInt("timeoutMillis")

        Airbridge.handleDeferredDeeplink { deeplink ->
            val result = JSObject()
            result.put("url", deeplink?.rawValue ?: "")
            result.put("success", deeplink != null)
            notifyListeners(callbackId, result)
        }

        call.resolve()
    }

    @PluginMethod
    fun trackDeeplink(call: PluginCall) {
        val urlString = call.getString("url")
        if (urlString.isNullOrEmpty()) {
            call.reject("URL is required")
            return
        }

        val parameters = call.getObject("parameters")

        // Track deeplink as custom event
        val event = AirbridgeEvent.Builder("deeplink_tracked")
        event.setCustomAttribute("deeplink_url", urlString)

        parameters?.let { params ->
            val keys = params.keys()
            while (keys.hasNext()) {
                val key = keys.next()
                val value = params.get(key)
                event.setCustomAttribute(key, value)
            }
        }

        Airbridge.trackEvent(event.build())
        call.resolve()
    }

    // MARK: - SDK Control Methods

    @PluginMethod
    fun stopTracking(call: PluginCall) {
        Airbridge.stopTracking()
        call.resolve()
    }

    @PluginMethod
    fun enableSDK(call: PluginCall) {
        Airbridge.enableSDK()
        call.resolve()
    }

    @PluginMethod
    fun disableSDK(call: PluginCall) {
        Airbridge.disableSDK()
        call.resolve()
    }

    // MARK: - Utility Methods

    @PluginMethod
    fun createTrackingLink(call: PluginCall) {
        val channel = call.getString("channel")
        if (channel.isNullOrEmpty()) {
            call.reject("Channel is required")
            return
        }

        val campaign = call.getString("campaign")
        val deeplink = call.getString("deeplink")
        val fallback = call.getString("fallback")
        val parameters = call.getObject("parameters")

        // Create tracking link option
        val option = AirbridgeTrackingLinkOption()
        campaign?.let { option.setCampaign(it) }
        deeplink?.let { option.setDeeplink(it) }
        fallback?.let { option.setFallback(it) }

        parameters?.let { params ->
            val keys = params.keys()
            while (keys.hasNext()) {
                val key = keys.next()
                val value = params.get(key)
                option.setCustomAttribute(key, value)
            }
        }

        Airbridge.createTrackingLink(channel, option) { url, error ->
            if (error != null) {
                call.reject("Failed to create tracking link: ${error.message}")
            } else if (url != null) {
                val result = JSObject()
                result.put("url", url.toString())
                call.resolve(result)
            } else {
                call.reject("Unknown error creating tracking link")
            }
        }
    }

    @PluginMethod
    fun fetchAirbridgeGeneratedUUID(call: PluginCall) {
        val uuid = Airbridge.fetchAirbridgeGeneratedUUID()
        val result = JSObject()
        result.put("uuid", uuid)
        call.resolve(result)
    }
}