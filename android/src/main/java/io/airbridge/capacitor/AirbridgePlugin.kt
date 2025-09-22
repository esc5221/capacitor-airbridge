package io.airbridge.capacitor

import co.ab180.airbridge.Airbridge
import co.ab180.airbridge.AirbridgeOption
import co.ab180.airbridge.AirbridgeOptionBuilder
import co.ab180.airbridge.common.AirbridgeCategory
import co.ab180.airbridge.common.AirbridgeAttribute
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

        val option = AirbridgeOptionBuilder(appName, appToken)

        // Optional configuration
        val timeout = call.getInt("autoDetermineTrackingAuthorizationTimeoutInSecond")
        timeout?.let {
            // Note: This configuration might be iOS specific
            // Android implementation may differ
        }

        val handleAirbridgeOnly = call.getBoolean("isHandleAirbridgeDeeplinkOnly", false)
        if (handleAirbridgeOnly == true) {
            option.setTrackAirbridgeDeeplinkOnlyEnabled(true)
        }

        Airbridge.initializeSDK(activity.application, option.build())
        call.resolve()
    }

    @PluginMethod
    fun trackEvent(call: PluginCall) {
        val category = call.getString("category")
        if (category.isNullOrEmpty()) {
            call.reject("Category is required")
            return
        }

        // Get semantic attributes
        val semanticAttributes = call.getObject("semanticAttributes")
        val semanticAttrsMap = mutableMapOf<String, Any?>()
        semanticAttributes?.let { attrs ->
            val keys = attrs.keys()
            while (keys.hasNext()) {
                val key = keys.next()
                val value = attrs.get(key)
                semanticAttrsMap[key] = value
            }
        }

        // Get custom attributes
        val customAttributes = call.getObject("customAttributes")
        val customAttrsMap = mutableMapOf<String, Any?>()
        customAttributes?.let { attrs ->
            val keys = attrs.keys()
            while (keys.hasNext()) {
                val key = keys.next()
                val value = attrs.get(key)
                customAttrsMap[key] = value
            }
        }

        Airbridge.trackEvent(category, semanticAttrsMap, customAttrsMap)
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
        call.resolve()
    }

    @PluginMethod
    fun clearDeeplinkListener(call: PluginCall) {
        this.deeplinkCallbackId = null
        call.resolve()
    }

    @PluginMethod
    fun setUser(call: PluginCall) {
        val userId = call.getString("id")
        userId?.let { Airbridge.setUserID(it) }

        val email = call.getString("email")
        email?.let { Airbridge.setUserEmail(it) }

        val phone = call.getString("phone")
        phone?.let { Airbridge.setUserPhone(it) }

        val attributes = call.getObject("attributes")
        attributes?.let { attrs ->
            val keys = attrs.keys()
            while (keys.hasNext()) {
                val key = keys.next()
                val value = attrs.get(key)
                setUserAttributeWithTypeConversion(key, value)
            }
        }

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

        val value = call.getData().opt("value")
        setUserAttributeWithTypeConversion(key, value)
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
            val success = Airbridge.handleDeeplink(intent) { resultUri ->
                // Notify deeplink callback if registered
                deeplinkCallbackId?.let { id ->
                    val result = JSObject()
                    result.put("url", resultUri?.toString() ?: urlString)
                    notifyListeners(id, result)
                }
            }
            if (success) {
                call.resolve()
            } else {
                call.reject("Failed to handle deeplink")
            }
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

        val success = Airbridge.handleDeferredDeeplink { uri ->
            val result = JSObject()
            result.put("url", uri?.toString() ?: "")
            result.put("success", uri != null)
            notifyListeners(callbackId, result)

            // Also update registered deeplink callback if exists
            if (uri != null) {
                deeplinkCallbackId?.let { id ->
                    val deeplinkResult = JSObject()
                    deeplinkResult.put("url", uri.toString())
                    notifyListeners(id, deeplinkResult)
                }
            }
        }

        if (!success) {
            call.reject("Failed to handle deferred deeplink")
            return
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
        val customAttrsMap = mutableMapOf<String, Any?>()
        customAttrsMap["deeplink_url"] = urlString

        parameters?.let { params ->
            val keys = params.keys()
            while (keys.hasNext()) {
                val key = keys.next()
                val value = params.get(key)
                customAttrsMap[key] = value
            }
        }

        Airbridge.trackEvent("deeplink_tracked", null, customAttrsMap)
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

        // Create tracking link option map
        val option = mutableMapOf<String, Any>()
        campaign?.let { option["campaign"] = it }
        deeplink?.let { option["deeplink"] = it }
        fallback?.let { option["fallback"] = it }

        parameters?.let { params ->
            val keys = params.keys()
            while (keys.hasNext()) {
                val key = keys.next()
                val value = params.get(key)
                option[key] = value
            }
        }

        Airbridge.createTrackingLink(channel, option,
            { trackingLink ->
                val result = JSObject()
                result.put("url", trackingLink.shortURL.toString())
                call.resolve(result)
            },
            { error ->
                call.reject("Failed to create tracking link: ${error?.message}")
            }
        )
    }

    @PluginMethod
    fun fetchAirbridgeGeneratedUUID(call: PluginCall) {
        val success = Airbridge.fetchAirbridgeGeneratedUUID { uuid ->
            val result = JSObject()
            result.put("uuid", uuid)
            call.resolve(result)
        }

        if (!success) {
            call.reject("Failed to fetch UUID")
        }
    }

    private fun setUserAttributeWithTypeConversion(key: String, value: Any?) {
        when (value) {
            is String -> Airbridge.setUserAttribute(key, value)
            is Int -> Airbridge.setUserAttribute(key, value)
            is Long -> Airbridge.setUserAttribute(key, value)
            is Float -> Airbridge.setUserAttribute(key, value)
            is Double -> Airbridge.setUserAttribute(key, value)
            is Boolean -> Airbridge.setUserAttribute(key, value)
            null -> return // Skip null values
            else -> Airbridge.setUserAttribute(key, value.toString()) // Convert others to String
        }
    }
}