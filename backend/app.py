from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import numpy as np
import librosa
import tempfile
import logging

app = Flask(__name__)
CORS(app)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def extract_features(audio_path):
    """Extract audio features using librosa for heuristic detection"""
    try:
        # Load audio file
        y, sr = librosa.load(audio_path, sr=16000, duration=1.0)
        
        # Ensure audio is mono
        if len(y.shape) > 1:
            y = np.mean(y, axis=1)
        
        # Extract basic features for heuristic detection
        features = {}
        
        # RMS energy (loudness)
        rms = librosa.feature.rms(y=y)
        features['rms_mean'] = np.mean(rms)
        features['rms_std'] = np.std(rms)
        
        # Zero-crossing rate (noisiness)
        zcr = librosa.feature.zero_crossing_rate(y)
        features['zcr_mean'] = np.mean(zcr)
        features['zcr_std'] = np.std(zcr)
        
        # Peak amplitude (maximum volume)
        peak_db = librosa.amplitude_to_db(np.max(np.abs(y)))
        features['peak_db'] = peak_db
        
        # Spectral centroid (brightness)
        spectral_centroids = librosa.feature.spectral_centroid(y=y, sr=sr)
        features['spectral_centroid_mean'] = np.mean(spectral_centroids)
        
        # Spectral bandwidth (frequency spread)
        spectral_bandwidth = librosa.feature.spectral_bandwidth(y=y, sr=sr)
        features['spectral_bandwidth_mean'] = np.mean(spectral_bandwidth)
        
        return features
        
    except Exception as e:
        logger.error(f"Error extracting features: {e}")
        return None

def heuristic_clap_detection(features):
    """Heuristic clap detection based on audio characteristics"""
    try:
        # Clap characteristics:
        # - High energy (loud)
        # - Moderate zero-crossing rate (not too noisy, not too clean)
        # - High peak amplitude
        # - Moderate spectral centroid (not too high frequency)
        # - Moderate spectral bandwidth
        
        # Thresholds (can be tuned)
        rms_threshold = 0.08
        zcr_min = 0.03
        zcr_max = 0.15
        peak_threshold = -25
        centroid_min = 1000
        centroid_max = 4000
        bandwidth_min = 500
        bandwidth_max = 2000
        
        # Check each condition
        conditions = []
        
        # Energy check
        if features['rms_mean'] > rms_threshold:
            conditions.append(True)
            energy_score = min(features['rms_mean'] / 0.3, 1.0)
        else:
            conditions.append(False)
            energy_score = 0.0
        
        # Zero-crossing rate check (claps have moderate ZCR)
        if zcr_min <= features['zcr_mean'] <= zcr_max:
            conditions.append(True)
            zcr_score = 1.0 - abs(features['zcr_mean'] - (zcr_min + zcr_max) / 2) / ((zcr_max - zcr_min) / 2)
        else:
            conditions.append(False)
            zcr_score = 0.0
        
        # Peak amplitude check
        if features['peak_db'] > peak_threshold:
            conditions.append(True)
            peak_score = min((features['peak_db'] + 60) / 40, 1.0)
        else:
            conditions.append(False)
            peak_score = 0.0
        
        # Spectral centroid check (claps have moderate brightness)
        if centroid_min <= features['spectral_centroid_mean'] <= centroid_max:
            conditions.append(True)
            centroid_score = 1.0 - abs(features['spectral_centroid_mean'] - (centroid_min + centroid_max) / 2) / ((centroid_max - centroid_min) / 2)
        else:
            conditions.append(False)
            centroid_score = 0.0
        
        # Spectral bandwidth check (claps have moderate frequency spread)
        if bandwidth_min <= features['spectral_bandwidth_mean'] <= bandwidth_max:
            conditions.append(True)
            bandwidth_score = 1.0 - abs(features['spectral_bandwidth_mean'] - (bandwidth_min + bandwidth_max) / 2) / ((bandwidth_max - bandwidth_min) / 2)
        else:
            conditions.append(False)
            bandwidth_score = 0.0
        
        # Determine if it's a clap
        is_clap = sum(conditions) >= 3  # At least 3 out of 5 conditions must be met
        
        # Calculate confidence score
        scores = [energy_score, zcr_score, peak_score, centroid_score, bandwidth_score]
        confidence = np.mean(scores)
        
        # Boost confidence if more conditions are met
        condition_boost = sum(conditions) / 5
        confidence = (confidence + condition_boost) / 2
        
        return is_clap, confidence
        
    except Exception as e:
        logger.error(f"Error in heuristic detection: {e}")
        return False, 0.0

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "ok", 
        "method": "heuristic",
        "description": "Rule-based clap detection using audio features"
    })

@app.route('/api/detect', methods=['POST'])
def detect_clap():
    """Detect clap from uploaded audio using heuristic rules"""
    try:
        if 'audio' not in request.files:
            return jsonify({"error": "No audio file provided"}), 400
        
        audio_file = request.files['audio']
        if audio_file.filename == '':
            return jsonify({"error": "No audio file selected"}), 400
        
        # Create temporary file
        with tempfile.NamedTemporaryFile(delete=False, suffix='.wav') as temp_file:
            audio_file.save(temp_file.name)
            temp_path = temp_file.name
        
        try:
            # Extract features
            features = extract_features(temp_path)
            if features is None:
                return jsonify({"error": "Failed to extract audio features"}), 500
            
            # Detect clap using heuristic rules
            is_clap, confidence = heuristic_clap_detection(features)
            
            logger.info(f"Heuristic detection: {is_clap}, confidence: {confidence:.3f}")
            logger.info(f"Features: RMS={features['rms_mean']:.3f}, ZCR={features['zcr_mean']:.3f}, "
                       f"Peak={features['peak_db']:.1f}dB, Centroid={features['spectral_centroid_mean']:.0f}Hz, "
                       f"Bandwidth={features['spectral_bandwidth_mean']:.0f}Hz")
            
            return jsonify({
                "clapDetected": is_clap,
                "score": float(confidence),
                "method": "heuristic",
                "features": {
                    "rms_energy": float(features['rms_mean']),
                    "zero_crossing_rate": float(features['zcr_mean']),
                    "peak_amplitude_db": float(features['peak_db']),
                    "spectral_centroid": float(features['spectral_centroid_mean']),
                    "spectral_bandwidth": float(features['spectral_bandwidth_mean'])
                }
            })
            
        finally:
            # Clean up temporary file
            os.unlink(temp_path)
            
    except Exception as e:
        logger.error(f"Error in clap detection: {e}")
        return jsonify({"error": "Internal server error"}), 500

@app.route('/api/features', methods=['POST'])
def analyze_features():
    """Analyze audio features without making clap detection"""
    try:
        if 'audio' not in request.files:
            return jsonify({"error": "No audio file provided"}), 400
        
        audio_file = request.files['audio']
        if audio_file.filename == '':
            return jsonify({"error": "No audio file selected"}), 400
        
        # Create temporary file
        with tempfile.NamedTemporaryFile(delete=False, suffix='.wav') as temp_file:
            audio_file.save(temp_file.name)
            temp_path = temp_file.name
        
        try:
            # Extract features
            features = extract_features(temp_path)
            if features is None:
                return jsonify({"error": "Failed to extract audio features"}), 500
            
            return jsonify({
                "features": {
                    "rms_energy": float(features['rms_mean']),
                    "rms_std": float(features['rms_std']),
                    "zero_crossing_rate": float(features['zcr_mean']),
                    "zcr_std": float(features['zcr_std']),
                    "peak_amplitude_db": float(features['peak_db']),
                    "spectral_centroid": float(features['spectral_centroid_mean']),
                    "spectral_bandwidth": float(features['spectral_bandwidth_mean'])
                },
                "analysis": {
                    "energy_level": "high" if features['rms_mean'] > 0.1 else "medium" if features['rms_mean'] > 0.05 else "low",
                    "noise_level": "high" if features['zcr_mean'] > 0.1 else "medium" if features['zcr_mean'] > 0.05 else "low",
                    "brightness": "high" if features['spectral_centroid_mean'] > 3000 else "medium" if features['spectral_centroid_mean'] > 1500 else "low"
                }
            })
            
        finally:
            # Clean up temporary file
            os.unlink(temp_path)
            
    except Exception as e:
        logger.error(f"Error in feature analysis: {e}")
        return jsonify({"error": "Internal server error"}), 500

if __name__ == '__main__':
    logger.info("Starting Clap Recognition Server (Heuristic Mode)")
    logger.info("Using rule-based detection with audio feature analysis")
    
    # Run the app
    app.run(host='0.0.0.0', port=8000, debug=True)
