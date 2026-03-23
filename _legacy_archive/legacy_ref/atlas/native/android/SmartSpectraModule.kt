/**
 * Presage SmartSpectra SDK - Native Android Module
 * 
 * This Kotlin file needs to be added to your Android project when you eject from Expo.
 * It bridges the SmartSpectraSdk to React Native.
 * 
 * SETUP INSTRUCTIONS:
 * 1. Eject from Expo: npx expo prebuild
 * 2. Add to settings.gradle.kts:
 *    dependencyResolutionManagement {
 *        repositories {
 *            google()
 *            mavenCentral()
 *            maven { url = uri("https://jitpack.io") }
 *        }
 *    }
 * 3. Add to app/build.gradle.kts:
 *    dependencies {
 *        implementation("com.presagetech:smartspectra:1.0.26")
 *    }
 * 4. Update minSdk to 26 in build.gradle.kts
 * 5. Copy this file to android/app/src/main/java/com/aac/SmartSpectraModule.kt
 * 6. Register the module in MainApplication.kt
 * 7. Build and run
 */

/*
package com.aac

import android.util.Log
import androidx.camera.core.CameraSelector
import com.facebook.react.bridge.*
import com.facebook.react.modules.core.DeviceEventManagerModule
import com.presage.physiology.proto.MetricsProto.MetricsBuffer
import com.presage.physiology.proto.MetricsProto.Metrics
import com.presagetech.smartspectra.SmartSpectraMode
import com.presagetech.smartspectra.SmartSpectraSdk

class SmartSpectraModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    private val TAG = "SmartSpectraModule"
    private var sdk: SmartSpectraSdk = SmartSpectraSdk.getInstance()
    private var isInitialized = false

    override fun getName(): String = "SmartSpectraModule"

    private fun sendEvent(eventName: String, params: WritableMap?) {
        reactApplicationContext
            .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
            .emit(eventName, params)
    }

    @ReactMethod
    fun initialize(apiKey: String, promise: Promise) {
        try {
            sdk.setApiKey(apiKey)
            
            // Set up metrics observer
            sdk.setMetricsBufferObserver { metricsBuffer ->
                sendMetricsToJS(metricsBuffer)
            }
            
            // Set up edge metrics observer for face landmarks
            sdk.setEdgeMetricsObserver { edgeMetrics ->
                sendEdgeMetricsToJS(edgeMetrics)
            }
            
            isInitialized = true
            promise.resolve(null)
        } catch (e: Exception) {
            Log.e(TAG, "Failed to initialize: ${e.message}")
            promise.reject("INIT_ERROR", e.message)
        }
    }

    @ReactMethod
    fun setSmartSpectraMode(mode: String) {
        val spectraMode = if (mode.uppercase() == "SPOT") {
            SmartSpectraMode.SPOT
        } else {
            SmartSpectraMode.CONTINUOUS
        }
        sdk.setSmartSpectraMode(spectraMode)
    }

    @ReactMethod
    fun setCameraPosition(position: String) {
        val pos = if (position.uppercase() == "BACK") {
            CameraSelector.LENS_FACING_BACK
        } else {
            CameraSelector.LENS_FACING_FRONT
        }
        sdk.setCameraPosition(pos)
    }

    @ReactMethod
    fun setMeasurementDuration(duration: Double) {
        sdk.setMeasurementDuration(duration)
    }

    @ReactMethod
    fun setShowFps(show: Boolean) {
        sdk.setShowFps(show)
    }

    @ReactMethod
    fun setRecordingDelay(delay: Int) {
        sdk.setRecordingDelay(delay)
    }

    @ReactMethod
    fun startMeasurement(promise: Promise) {
        try {
            // Note: In Android, measurement is typically controlled via SmartSpectraView
            // This is a simplified version - full implementation would use Activity callbacks
            val params = Arguments.createMap().apply {
                putString("status", "measuring")
            }
            sendEvent("onStatusChange", params)
            promise.resolve(null)
        } catch (e: Exception) {
            promise.reject("START_ERROR", e.message)
        }
    }

    @ReactMethod
    fun stopMeasurement(promise: Promise) {
        try {
            val params = Arguments.createMap().apply {
                putString("status", "ready")
            }
            sendEvent("onStatusChange", params)
            promise.resolve(null)
        } catch (e: Exception) {
            promise.reject("STOP_ERROR", e.message)
        }
    }

    @ReactMethod
    fun cleanup(promise: Promise) {
        try {
            isInitialized = false
            promise.resolve(null)
        } catch (e: Exception) {
            promise.reject("CLEANUP_ERROR", e.message)
        }
    }

    private fun sendMetricsToJS(metrics: MetricsBuffer) {
        val pulseRates = Arguments.createArray()
        metrics.pulse.rateList.forEach { rate ->
            val rateMap = Arguments.createMap().apply {
                putDouble("time", rate.time.toDouble())
                putDouble("value", rate.value.toDouble())
                putBoolean("stable", rate.stable)
                putDouble("confidence", rate.confidence.toDouble())
            }
            pulseRates.pushMap(rateMap)
        }

        val pulseTraces = Arguments.createArray()
        metrics.pulse.traceList.forEach { trace ->
            val traceMap = Arguments.createMap().apply {
                putDouble("time", trace.time.toDouble())
                putDouble("value", trace.value.toDouble())
                putBoolean("stable", trace.stable)
            }
            pulseTraces.pushMap(traceMap)
        }

        val breathingRates = Arguments.createArray()
        metrics.breathing.rateList.forEach { rate ->
            val rateMap = Arguments.createMap().apply {
                putDouble("time", rate.time.toDouble())
                putDouble("value", rate.value.toDouble())
                putBoolean("stable", rate.stable)
                putDouble("confidence", rate.confidence.toDouble())
            }
            breathingRates.pushMap(rateMap)
        }

        val breathingUpperTraces = Arguments.createArray()
        metrics.breathing.upperTraceList.forEach { trace ->
            val traceMap = Arguments.createMap().apply {
                putDouble("time", trace.time.toDouble())
                putDouble("value", trace.value.toDouble())
                putBoolean("stable", trace.stable)
            }
            breathingUpperTraces.pushMap(traceMap)
        }

        val blinkingStatus = Arguments.createArray()
        metrics.face.blinkingList.forEach { status ->
            val statusMap = Arguments.createMap().apply {
                putDouble("time", status.time.toDouble())
                putBoolean("detected", status.detected)
                putBoolean("stable", status.stable)
            }
            blinkingStatus.pushMap(statusMap)
        }

        val talkingStatus = Arguments.createArray()
        metrics.face.talkingList.forEach { status ->
            val statusMap = Arguments.createMap().apply {
                putDouble("time", status.time.toDouble())
                putBoolean("detected", status.detected)
                putBoolean("stable", status.stable)
            }
            talkingStatus.pushMap(statusMap)
        }

        val apneaStatus = Arguments.createArray()
        metrics.breathing.apneaList.forEach { status ->
            val statusMap = Arguments.createMap().apply {
                putDouble("time", status.time.toDouble())
                putBoolean("detected", status.detected)
                putBoolean("stable", status.stable)
            }
            apneaStatus.pushMap(statusMap)
        }

        val inhaleExhaleRatios = Arguments.createArray()
        metrics.breathing.inhaleExhaleRatioList.forEach { ratio ->
            val ratioMap = Arguments.createMap().apply {
                putDouble("time", ratio.time.toDouble())
                putDouble("value", ratio.value.toDouble())
                putBoolean("stable", ratio.stable)
            }
            inhaleExhaleRatios.pushMap(ratioMap)
        }

        val pulseMap = Arguments.createMap().apply {
            putArray("rate", pulseRates)
            putArray("trace", pulseTraces)
        }

        val breathingMap = Arguments.createMap().apply {
            putArray("rate", breathingRates)
            putArray("upperTrace", breathingUpperTraces)
            putArray("lowerTrace", Arguments.createArray())
            putArray("amplitude", Arguments.createArray())
            putArray("apnea", apneaStatus)
            putArray("respiratoryLineLength", Arguments.createArray())
            putArray("inhaleExhaleRatio", inhaleExhaleRatios)
        }

        val faceMap = Arguments.createMap().apply {
            putArray("blinking", blinkingStatus)
            putArray("talking", talkingStatus)
        }

        val metadataMap = Arguments.createMap().apply {
            putString("id", metrics.metadata.id)
            putString("uploadTimestamp", metrics.metadata.uploadTimestamp)
            putString("apiVersion", metrics.metadata.apiVersion)
        }

        val metricsData = Arguments.createMap().apply {
            putMap("pulse", pulseMap)
            putMap("breathing", breathingMap)
            putMap("bloodPressure", Arguments.createMap().apply {
                putArray("phasic", Arguments.createArray())
            })
            putMap("face", faceMap)
            putMap("metadata", metadataMap)
        }

        sendEvent("onMetricsUpdate", metricsData)
    }

    private fun sendEdgeMetricsToJS(edgeMetrics: Metrics) {
        if (!edgeMetrics.hasFace() || edgeMetrics.face.landmarksCount == 0) return

        val landmarks = Arguments.createArray()
        edgeMetrics.face.landmarksList.lastOrNull()?.let { latestLandmarks ->
            latestLandmarks.valueList.forEach { landmark ->
                val landmarkMap = Arguments.createMap().apply {
                    putDouble("x", landmark.x.toDouble())
                    putDouble("y", landmark.y.toDouble())
                }
                landmarks.pushMap(landmarkMap)
            }
        }

        val faceMap = Arguments.createMap().apply {
            putArray("landmarks", landmarks)
        }

        val edgeData = Arguments.createMap().apply {
            putMap("face", faceMap)
        }

        sendEvent("onEdgeMetricsUpdate", edgeData)
    }

    @ReactMethod
    fun addListener(eventName: String) {
        // Required for RN event emitter
    }

    @ReactMethod
    fun removeListeners(count: Int) {
        // Required for RN event emitter
    }
}
*/

// Placeholder - this file contains the Kotlin implementation as a comment
// The actual setup requires native Android project configuration
 
