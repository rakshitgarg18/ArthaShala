/**
 * Presage SmartSpectra SDK - Native iOS Module
 * 
 * This Swift file needs to be added to your iOS project when you eject from Expo.
 * It bridges the SmartSpectraSwiftSDK to React Native.
 * 
 * SETUP INSTRUCTIONS:
 * 1. Eject from Expo: npx expo prebuild
 * 2. Add SmartSpectra Swift Package: 
 *    - In Xcode: File → Add Package Dependencies
 *    - URL: https://github.com/Presage-Security/SmartSpectra
 *    - Branch: main
 * 3. Copy this file to ios/aac/SmartSpectraModule.swift
 * 4. Add camera permission to Info.plist if not already present
 * 5. Build and run
 */

/*
import Foundation
import React
import SmartSpectraSwiftSDK
import Combine

@objc(SmartSpectraModule)
class SmartSpectraModule: RCTEventEmitter {
    
    private var sdk = SmartSpectraSwiftSDK.shared
    private var vitalsProcessor = SmartSpectraVitalsProcessor.shared
    private var cancellables = Set<AnyCancellable>()
    private var isInitialized = false
    
    override static func moduleName() -> String! {
        return "SmartSpectraModule"
    }
    
    override static func requiresMainQueueSetup() -> Bool {
        return true
    }
    
    override func supportedEvents() -> [String]! {
        return ["onMetricsUpdate", "onStatusChange", "onEdgeMetricsUpdate"]
    }
    
    // MARK: - Initialization
    
    @objc
    func initialize(_ apiKey: String, resolver resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        DispatchQueue.main.async { [weak self] in
            guard let self = self else { return }
            
            // Set API key
            self.sdk.setApiKey(apiKey)
            
            // Subscribe to metrics updates
            self.sdk.$metricsBuffer
                .compactMap { $0 }
                .sink { [weak self] metrics in
                    self?.sendMetricsToJS(metrics)
                }
                .store(in: &self.cancellables)
            
            // Subscribe to edge metrics for face landmarks
            self.sdk.$edgeMetrics
                .compactMap { $0 }
                .sink { [weak self] edgeMetrics in
                    self?.sendEdgeMetricsToJS(edgeMetrics)
                }
                .store(in: &self.cancellables)
            
            // Subscribe to status updates
            self.vitalsProcessor.$statusHint
                .sink { [weak self] status in
                    self?.sendEvent(withName: "onStatusChange", body: ["status": status])
                }
                .store(in: &self.cancellables)
            
            self.isInitialized = true
            resolve(nil)
        }
    }
    
    // MARK: - Configuration
    
    @objc
    func setSmartSpectraMode(_ mode: String) {
        DispatchQueue.main.async { [weak self] in
            let spectraMode: SmartSpectraMode = mode.lowercased() == "spot" ? .spot : .continuous
            self?.sdk.setSmartSpectraMode(spectraMode)
        }
    }
    
    @objc
    func setCameraPosition(_ position: String) {
        DispatchQueue.main.async { [weak self] in
            let pos: AVCaptureDevice.Position = position.lowercased() == "back" ? .back : .front
            self?.sdk.setCameraPosition(pos)
        }
    }
    
    @objc
    func setMeasurementDuration(_ duration: Double) {
        DispatchQueue.main.async { [weak self] in
            self?.sdk.setMeasurementDuration(duration)
        }
    }
    
    @objc
    func setShowFps(_ show: Bool) {
        DispatchQueue.main.async { [weak self] in
            self?.sdk.setShowFps(show)
        }
    }
    
    @objc
    func setRecordingDelay(_ delay: Int) {
        DispatchQueue.main.async { [weak self] in
            self?.sdk.setRecordingDelay(delay)
        }
    }
    
    // MARK: - Measurement Control
    
    @objc
    func startMeasurement(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        DispatchQueue.main.async { [weak self] in
            guard let self = self else { return }
            
            self.vitalsProcessor.startProcessing()
            self.vitalsProcessor.startRecording()
            
            self.sendEvent(withName: "onStatusChange", body: ["status": "measuring"])
            resolve(nil)
        }
    }
    
    @objc
    func stopMeasurement(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        DispatchQueue.main.async { [weak self] in
            guard let self = self else { return }
            
            self.vitalsProcessor.stopRecording()
            self.vitalsProcessor.stopProcessing()
            
            self.sendEvent(withName: "onStatusChange", body: ["status": "ready"])
            resolve(nil)
        }
    }
    
    @objc
    func cleanup(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        DispatchQueue.main.async { [weak self] in
            self?.cancellables.removeAll()
            self?.isInitialized = false
            resolve(nil)
        }
    }
    
    // MARK: - Data Conversion
    
    private func sendMetricsToJS(_ metrics: Presage_Physiology_MetricsBuffer) {
        var pulseRates: [[String: Any]] = []
        for rate in metrics.pulse.rate {
            pulseRates.append([
                "time": rate.time,
                "value": rate.value,
                "stable": rate.stable,
                "confidence": rate.confidence
            ])
        }
        
        var pulseTraces: [[String: Any]] = []
        for trace in metrics.pulse.trace {
            pulseTraces.append([
                "time": trace.time,
                "value": trace.value,
                "stable": trace.stable
            ])
        }
        
        var breathingRates: [[String: Any]] = []
        for rate in metrics.breathing.rate {
            breathingRates.append([
                "time": rate.time,
                "value": rate.value,
                "stable": rate.stable,
                "confidence": rate.confidence
            ])
        }
        
        var breathingUpperTraces: [[String: Any]] = []
        for trace in metrics.breathing.upperTrace {
            breathingUpperTraces.append([
                "time": trace.time,
                "value": trace.value,
                "stable": trace.stable
            ])
        }
        
        var blinkingStatus: [[String: Any]] = []
        for status in metrics.face.blinking {
            blinkingStatus.append([
                "time": status.time,
                "detected": status.detected,
                "stable": status.stable
            ])
        }
        
        var talkingStatus: [[String: Any]] = []
        for status in metrics.face.talking {
            talkingStatus.append([
                "time": status.time,
                "detected": status.detected,
                "stable": status.stable
            ])
        }
        
        var apneaStatus: [[String: Any]] = []
        for status in metrics.breathing.apnea {
            apneaStatus.append([
                "time": status.time,
                "detected": status.detected,
                "stable": status.stable
            ])
        }
        
        var inhaleExhaleRatios: [[String: Any]] = []
        for ratio in metrics.breathing.inhaleExhaleRatio {
            inhaleExhaleRatios.append([
                "time": ratio.time,
                "value": ratio.value,
                "stable": ratio.stable
            ])
        }
        
        let metricsData: [String: Any] = [
            "pulse": [
                "rate": pulseRates,
                "trace": pulseTraces
            ],
            "breathing": [
                "rate": breathingRates,
                "upperTrace": breathingUpperTraces,
                "lowerTrace": [],
                "amplitude": [],
                "apnea": apneaStatus,
                "respiratoryLineLength": [],
                "inhaleExhaleRatio": inhaleExhaleRatios
            ],
            "bloodPressure": [
                "phasic": []
            ],
            "face": [
                "blinking": blinkingStatus,
                "talking": talkingStatus
            ],
            "metadata": [
                "id": metrics.metadata.id,
                "uploadTimestamp": metrics.metadata.uploadTimestamp,
                "apiVersion": metrics.metadata.apiVersion
            ]
        ]
        
        sendEvent(withName: "onMetricsUpdate", body: metricsData)
    }
    
    private func sendEdgeMetricsToJS(_ edgeMetrics: Presage_Physiology_Metrics) {
        guard edgeMetrics.hasFace && !edgeMetrics.face.landmarks.isEmpty else { return }
        
        var landmarks: [[String: Any]] = []
        if let latestLandmarks = edgeMetrics.face.landmarks.last {
            for landmark in latestLandmarks.value {
                landmarks.append([
                    "x": landmark.x,
                    "y": landmark.y
                ])
            }
        }
        
        let edgeData: [String: Any] = [
            "face": [
                "landmarks": landmarks
            ]
        ]
        
        sendEvent(withName: "onEdgeMetricsUpdate", body: edgeData)
    }
}
*/

// Placeholder export for TypeScript
// The actual implementation requires native iOS setup
print("SmartSpectraModule.swift - Native iOS implementation for Presage SDK")
print("Follow the setup instructions in this file to integrate with your Expo bare workflow")
 
