import os
import json
import numpy as np
import tensorflow as tf
from typing import Dict, Any
from fastapi import HTTPException


MAX_LEN = 86  
MODEL_FILE_NAME = "phishing_1dcnn_model.keras"
TOKENIZER_FILE_NAME = "tokenizer_config.json"

class URLPredictor:
    def __init__(self):
        self.model = None
        self.tokenizer = None
        # Model startup par load ho sake isliye initialize yahan kar rahe hain
        self.load_assets()

    def load_assets(self):
        """
        Loads the operational trained Keras weights and tokenizer mappings
        from the localized dl_inference/models/ package.
        """
        # Package path optimization target: app/dl_inference/models/
        current_dir = os.path.dirname(__file__)
        models_dir = os.path.join(current_dir, "models")
        
        model_path = os.path.join(models_dir, MODEL_FILE_NAME)
        tokenizer_path = os.path.join(models_dir, TOKENIZER_FILE_NAME)
        
        try:
            # 1. Load Tokenizer Setup from exported JSON serialization state
            if os.path.exists(tokenizer_path):
                with open(tokenizer_path, 'r', encoding='utf-8') as f:
                    # Handle raw escaped string or native json dictionary configuration structures
                    raw_data = f.read()
                    if raw_data.startswith('"') and raw_data.endswith('"'):
                        tokenizer_data = json.loads(json.loads(raw_data))
                    else:
                        tokenizer_data = json.loads(raw_data)
                        
                self.tokenizer = tf.keras.preprocessing.text.tokenizer_from_json(json.dumps(tokenizer_data))
                print("📋 [DL Inference] Character Tokenizer loaded successfully.")
            else:
                print(f"⚠️ [DL Inference] Tokenizer not found at: {tokenizer_path}")

            # 2. Load Trained 1D CNN Keras Architecture Vector Layers
            if os.path.exists(model_path):
                # Attempt normal load first
                try:
                    self.model = tf.keras.models.load_model(model_path)
                    print("🚀 [DL Inference] Real 1D CNN Keras Model operational in memory.")
                except Exception as e:
                    # Fallback: Some models saved with newer Keras include
                    # a `quantization_config` entry in layer configs which
                    # older deserializers do not accept as an init kwarg.
                    # To maintain compatibility, temporarily wrap common
                    # layer __init__ methods to ignore that kwarg and retry.
                    try:
                        from tensorflow.keras import layers as _layers

                        def _wrap_ignore_quant(cls):
                            orig_init = cls.__init__

                            def __init__(self, *a, **kw):
                                kw.pop("quantization_config", None)
                                return orig_init(self, *a, **kw)

                            cls.__init__ = __init__

                        for _name in ("Embedding", "Dense", "Conv1D", "Dropout", "GlobalAveragePooling1D"):
                            _cls = getattr(_layers, _name, None)
                            if _cls is not None:
                                _wrap_ignore_quant(_cls)

                        self.model = tf.keras.models.load_model(model_path)
                        print("🚀 [DL Inference] Real 1D CNN Keras Model operational in memory (compatibility patch applied).")
                    except Exception:
                        # Re-raise the original error for visibility
                        raise
            else:
                print(f"⚠️ [DL Inference] Keras model file not found at: {model_path}")
                
        except Exception as e:
            print(f"❌ [DL Inference] Critical Error initializing assets: {str(e)}")

    def analyze_textual_url(self, url: str) -> Dict[str, Any]:
        """
        Processes a raw URL string through the 1D CNN forward pass.
        The BiLSTM tracker remains locked at a zero-state structural placeholder.
        """
        # Safety Gatekeeper Assertion
        if self.model is None or self.tokenizer is None:
            raise HTTPException(
                status_code=500, 
                detail="Deep Learning runtime assets are uninitialized or corrupted."
            )
        
        # Step A: String Preprocessing alignment with Colab training script
        clean_url = url.lower().strip()
        
        # Step B: Mathematical Map Character-to-Integer Translation Vector
        sequences = self.tokenizer.texts_to_sequences([clean_url])
        
        # Step C: Pad Sequence Matrix Arrays ('post' padding and post truncation)
        padded_tokens = tf.keras.preprocessing.sequence.pad_sequences(
            sequences, 
            maxlen=MAX_LEN, 
            padding='post', 
            truncating='post'
        )
        
        # Step D: Deep Learning Forward Pass Execution Execution
        # prediction matrix extracts raw neural network probability (0.0 to 1.0)
        prediction_matrix = self.model.predict(padded_tokens)
        cnn_score = float(prediction_matrix[0][0])
        
        # Step E: Handle Model Trackers and Future-Proof Layout Structures
        lstm_score = 0.0  # Kept as clean structured zero matrix indicator until BiLSTM training
        
        # Since BiLSTM is inactive, overall confidence relies entirely on the operational 1D CNN
        confidence_score = cnn_score
        is_phishing = confidence_score >= 0.50
        
        # Step F: UI Metric Adaptations / Dynamic Character Highlight Matrix Maps
        attention_map = {}
        for idx, char in enumerate(url):
            # Temporary deterministic mapping scale for UI rendering until XAI layer integration
            if char in ['-', '@', '.', '_', '?'] or (is_phishing and char.isalnum()):
                attention_map[f"char_{idx}_{char}"] = round(float(0.70 + (cnn_score * 0.25)), 4)
            else:
                attention_map[f"char_{idx}_{char}"] = round(float(0.05 + (cnn_score * 0.10)), 4)

        # 📊 SERVER DIAGNOSTIC PRINTS FOR LOGGING & TESTING VERIFICATION
        print("\n" + "="*60)
        print(f"🔍 SCAN TARGET   : {url}")
        print(f"📈 1D CNN OUTPUT : {cnn_score:.4f}")
        print(f"📉 BiLSTM OUTPUT : {lstm_score:.4f} (Locked Placeholder)")
        print(f"🛡️ COMBINED CONF : {confidence_score:.4f}")
        print(f"🎯 FINAL DIAGNOSIS: {'PHISHING' if is_phishing else 'SAFE'}")
        print("="*60 + "\n")

        return {
            "is_phishing": is_phishing,
            "confidence_score": round(confidence_score, 4),
            "cnn_score": round(cnn_score, 4),
            "lstm_score": lstm_score,
            "attention_weights": attention_map
        }

# Instantiate a single operational singleton instance to keep memory footprints clean
url_predictor = URLPredictor()